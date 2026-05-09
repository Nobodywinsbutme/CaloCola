import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { getFoods } from '../services/foods/foodsApi'
import { login as loginApi, register as registerApi } from '../services/auth/authApi'
import { getUserProfile, updateUserProfile } from '../services/user_profile/userProfileApi'

const AppContext = createContext()

export function AppProvider({ children }) {
  // ================= STATE =================
  const [foods, setFoods] = useState([])
  const [foodsLoading, setFoodsLoading] = useState(true)
  const [foodsError, setFoodsError] = useState(null)

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('jwt') || null)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  const [tdee, setTdee] = useState(2000)
  const [macros, setMacros] = useState({ protein: 120, fat: 70, carbs: 260 })
  const [consumed, setConsumed] = useState({ kcal: 375, protein: 15, fat: 25, carbs: 38 })

  // ================= AUTH METHODS (Moved UP to fix ReferenceError) =================
  
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jwt')
  }, [])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const refreshUserProfile = useCallback(async () => {
    if (token) {
      try {
        const userData = await getUserProfile(token);
        setUser(userData); 
      } catch (err) {
        console.error("Failed to refresh user profile", err);
        // If the refresh fails (e.g., token expired), log them out
        logout();
      }
    }
  }, [token, logout]);

  const register = useCallback(async (email, password, name, height, weight, age, gender, activityLevel, goal) => {
    setAuthLoading(true)
    clearAuthError()
    try {
      await registerApi(email, password, name)
      const data = await loginApi(email, password)
      
      setToken(data.access_token)
      localStorage.setItem('jwt', data.access_token)
      setUser(data.user)

      await updateUserProfile(data.access_token, {
        height, weight, age, gender, activityLevel, goal,
      })
      
      await refreshUserProfile()
      
      return true
    } catch (err) {
      setAuthError(err.message || 'Registration failed')
      return false
    } finally {
      setAuthLoading(false)
    }
  }, [clearAuthError, refreshUserProfile])

  const login = useCallback(async (email, password) => {
    setAuthLoading(true)
    clearAuthError()
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
  }, [clearAuthError])


  // ================= EFFECTS =================

  // 1. Hydrate User on Page Refresh
  useEffect(() => {
    async function loadUser() {
      if (token && !user) {
        try {
          const userData = await getUserProfile(token)
          setUser(userData) 
        } catch (err) {
          console.error('Failed to restore session:', err)
          logout() // This now works because `logout` is defined above!
        }
      }
    }
    loadUser()
  }, [token, user, logout]) 
  
  // 2. Auto-Calculate TDEE & Macros when user data arrives
  useEffect(() => {
    if (user?.profile) {
      const { weight, height, age, gender, activityLevel, goal } = user.profile;
      
      // Ensure we have the minimum data needed to calculate
      if (!weight || !height || !age) return;

      // Calculate BMR (Mifflin-St Jeor Equation)
      let bmr = (10 * weight) + (6.25 * height) - (5 * age);
      bmr += (gender === 'Male' ? 5 : -161);

      // Activity Multiplier
      let multiplier = 1.2; // Sedentary
      if (activityLevel?.includes('Light')) multiplier = 1.375;
      if (activityLevel?.includes('Moderate')) multiplier = 1.55;
      if (activityLevel?.includes('Very')) multiplier = 1.725;

      let calculatedTdee = Math.round(bmr * multiplier);

      // Goal Adjustment
      if (goal === 'Lose') calculatedTdee -= 500;
      if (goal === 'Gain') calculatedTdee += 500;

      // Calculate Macros (Standard 30% Protein, 35% Carbs, 35% Fat split)
      const protein = Math.round((calculatedTdee * 0.30) / 4);
      const carbs = Math.round((calculatedTdee * 0.35) / 4);
      const fat = Math.round((calculatedTdee * 0.35) / 9);

      // Update the global state
      setTdee(calculatedTdee);
      setMacros({ protein, fat, carbs });
    }
  }, [user]);
  
  // 3. Load Foods Database
  useEffect(() => {
    let cancelled = false
    async function loadFoodsData() {
      setFoodsLoading(true)
      try {
        const data = await getFoods()
        if (!cancelled) setFoods(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) setFoodsError(err.message || 'Load failed')
      } finally {
        if (!cancelled) setFoodsLoading(false)
      }
    }
    loadFoodsData()
    return () => { cancelled = true }
  }, [])

  // ================= NUTRITION METHODS =================
  
  const addFood = useCallback((food, grams = 100) => {
    const ratio = grams / 100
    setConsumed(prev => ({
      kcal: Math.round(prev.kcal + food.calories * ratio),
      protein: Math.round(prev.protein + food.protein * ratio),
      fat: Math.round(prev.fat + food.fat * ratio),
      carbs: Math.round(prev.carbs + food.carbs * ratio),
    }))
  }, [])

  const updateTargets = useCallback(({ tdee, protein, fat, carbs }) => {
    setTdee(tdee)
    setMacros({ protein, fat, carbs })
  }, [])


  // ================= UI HELPERS =================
  
  const isLoggedIn = !!token && !!user
  
  const getInitials = useCallback(() => {
    if (!user) return '?'
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }, [user])

  const contextValue = useMemo(() => ({
    // Data
    foods, foodsLoading, foodsError,
    tdee, macros, consumed,
    user, token, authError,
    loading: authLoading, 
    isLoggedIn,
    isAuthenticated: isLoggedIn,
    // Methods
    addFood, updateTargets,
    login, register, logout, clearAuthError, getInitials,
    refreshUserProfile 
  }), [foods, foodsLoading, foodsError, tdee, macros, consumed, user, token, authError, authLoading, isLoggedIn, addFood, updateTargets, login, register, logout, clearAuthError, getInitials, refreshUserProfile])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
export const useAuth = () => useContext(AppContext)