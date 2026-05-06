import { createContext, useContext, useState, useEffect } from 'react'
import { getFoods } from '../services/foods/foodsApi'
import { login as loginApi, register as registerApi } from '../services/auth/authApi'
import { updateUserProfile } from '../services/user_profile/userProfileApi'

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

  const [tdee, setTdee] = useState(2000)

  const [macros, setMacros] = useState({ protein: 120, fat: 70, carbs: 260 })
  const [consumed, setConsumed] = useState({ kcal: 375, protein: 15, fat: 25, carbs: 38 })

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
        tdee,
        macros, 
        consumed, 
        addFood, 
        updateTargets,
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