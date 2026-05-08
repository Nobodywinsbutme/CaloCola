import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getFoods } from '../services/foods/foodsApi'
import { login as loginApi, register as registerApi } from '../services/auth/authApi'
import { updateUserProfile, getUserProfile } from '../services/user_profile/userProfileApi'
import { getDailyTotals, getIntakes } from '../services/daily_tracking/dailyTrackingApi'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [foodsError, setFoodsError] = useState(null)

  // Auth state
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('jwt') || null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  // User profile state
  const [userProfile, setUserProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Daily tracking state
  const [tdee, setTdee] = useState(2000)
  const [macros, setMacros] = useState({ protein: 120, fat: 70, carbs: 260 })
  const [consumed, setConsumed] = useState({ kcal: 0, protein: 0, fat: 0, carbs: 0 })
  const [waterTotalMl, setWaterTotalMl] = useState(0)
  const [intakes, setIntakes] = useState([])

  // Global toasts
  const [toasts, setToasts] = useState([])

  const applyProfile = useCallback((profile) => {
    setUserProfile(profile)
    setUser({
      id: profile?.id,
      email: profile?.email,
      name: profile?.name,
    })

    if (profile?.profile) {
      const { tdee: profileTdee, proteinTarget, fatTarget, carbTarget } = profile.profile
      setTdee(profileTdee || 2000)
      setMacros({
        protein: proteinTarget || 120,
        fat: fatTarget || 70,
        carbs: carbTarget || 260,
      })
    }
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(item => item.id !== id))
  }, [])

  const notify = useCallback((payload) => {
    const { type = 'error', title, message, duration = 4000 } = payload || {}
    const id = `${Date.now()}-${Math.round(Math.random() * 10000)}`
    const toast = { id, type, title, message }
    setToasts(prev => [...prev, toast])
    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration)
    }
    return id
  }, [dismissToast])

  const applyWaterDelta = useCallback((delta) => {
    setWaterTotalMl(prev => Math.max(0, Math.round(prev + delta)))
  }, [])

  const applyConsumedDelta = useCallback((delta) => {
    setConsumed(prev => ({
      kcal: Math.round(prev.kcal + (delta.kcal || 0)),
      protein: Math.round(prev.protein + (delta.protein || 0)),
      fat: Math.round(prev.fat + (delta.fat || 0)),
      carbs: Math.round(prev.carbs + (delta.carbs || 0)),
    }))
  }, [])

  const addLocalIntakes = useCallback((items) => {
    if (!items || !items.length) return
    setIntakes(prev => [...items, ...prev])
  }, [])

  const removeLocalIntakes = useCallback((ids) => {
    if (!ids || !ids.length) return
    const idSet = new Set(ids)
    setIntakes(prev => prev.filter(item => !idSet.has(item.id)))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadFoods() {
      setLoading(true)
      setFoodsError(null)

      try {
        const data = await getFoods()
        if (cancelled) return
        setFoods(Array.isArray(data) ? data : [])
      } catch (err) {
        if (cancelled) return
        setFoods([])
        setFoodsError(err instanceof Error ? err.message : 'Load failed')
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    loadFoods()

    return () => { cancelled = true }
  }, [])

  // Load user profile and daily totals when token changes
  useEffect(() => {
    let cancelled = false

    async function loadProfileAndDailyData() {
      if (!token) return

      setProfileLoading(true)

      try {
        // Load user profile
        const profile = await getUserProfile(token)
        if (cancelled) return

        applyProfile(profile)

        // Load today's totals
        const today = new Date().toISOString().split('T')[0]
        const totals = await getDailyTotals(token, today)
        if (cancelled) return

        if (totals) {
          setConsumed({
            kcal: Math.round(totals.totalCalories || 0),
            protein: Math.round(totals.totalProtein || 0),
            fat: Math.round(totals.totalFat || 0),
            carbs: Math.round(totals.totalCarbs || 0),
          })
          setWaterTotalMl(Math.round(totals.totalWaterMl || 0))
        } else {
          setConsumed({ kcal: 0, protein: 0, fat: 0, carbs: 0 })
          setWaterTotalMl(0)
        }

        const intakeData = await getIntakes(token, today)
        if (cancelled) return
        setIntakes(Array.isArray(intakeData) ? intakeData : [])
      } catch (err) {
        console.error('Error loading profile/daily data:', err)
      } finally {
        if (cancelled) return
        setProfileLoading(false)
      }
    }

    loadProfileAndDailyData()

    return () => { cancelled = true }
  }, [token, applyProfile])


  const addFood = (food, grams = 100) => {
    const ratio = grams / 100
    setConsumed(prev => ({
      kcal: Math.round(prev.kcal + food.calories * ratio),
      protein: Math.round(prev.protein + food.protein * ratio),
      fat: Math.round(prev.fat + food.fat * ratio),
      carbs: Math.round(prev.carbs + food.carbs * ratio),
    }))
  }

  const updateTargets = ({ tdee, protein, fat, carbs }) => {
    setTdee(tdee)
    setMacros({ protein, fat, carbs })
  }

  const refreshDailyTotals = useCallback(async (date) => {
    if (!token) return
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]
      const totals = await getDailyTotals(token, targetDate)
      if (totals) {
        setConsumed({
          kcal: Math.round(totals.totalCalories || 0),
          protein: Math.round(totals.totalProtein || 0),
          fat: Math.round(totals.totalFat || 0),
          carbs: Math.round(totals.totalCarbs || 0),
        })
        setWaterTotalMl(Math.round(totals.totalWaterMl || 0))
      }
    } catch (err) {
      console.error('Error refreshing daily totals:', err)
    }
  }, [token])

  const refreshUserProfile = useCallback(async () => {
    if (!token) return
    try {
      const profile = await getUserProfile(token)
      applyProfile(profile)
    } catch (err) {
      console.error('Error refreshing profile:', err)
    }
  }, [token, applyProfile])

  const refreshDailyIntakes = useCallback(async (date) => {
    if (!token) return
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]
      const intakeData = await getIntakes(token, targetDate)
      setIntakes(Array.isArray(intakeData) ? intakeData : [])
    } catch (err) {
      console.error('Error refreshing intakes:', err)
    }
  }, [token])

  // Auth methods
  const register = async (email, password, name, height, weight, age, gender, activityLevel, goal) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      await registerApi(email, password, name)
      
      // Auto-login after register
      const data = await loginApi(email, password)
      setToken(data.access_token)
      localStorage.setItem('jwt', data.access_token)
      setUser(data.user)

      // Update profile with health data
      await updateUserProfile(data.access_token, {
        height,
        weight,
        age,
        gender,
        activityLevel,
        goal,
      })

      return true
    } catch (err) {
      setAuthError(err.message || 'Registration failed')
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  const login = async (email, password) => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const data = await loginApi(email, password)
      setToken(data.access_token)
      localStorage.setItem('jwt', data.access_token)
      setUser(data.user)
      return true
    } catch (err) {
      setAuthError(err.message || 'Login failed')
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jwt')
  }

  const isAuthenticated = !!token && !!user

  return (
    <AppContext.Provider
      value={{
        foods,
        loading,
        foodsError,
        userProfile,
        profileLoading,
        tdee,
        macros, 
        consumed, 
        waterTotalMl,
        intakes,
        toasts,
        notify,
        dismissToast,
        applyWaterDelta,
        applyConsumedDelta,
        addLocalIntakes,
        removeLocalIntakes,
        addFood, 
        updateTargets,
        refreshDailyTotals,
        refreshDailyIntakes,
        refreshUserProfile,
        user,
        token,
        authLoading,
        authError,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)