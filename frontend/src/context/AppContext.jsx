import { createContext, useContext, useState, useEffect } from 'react'
import { getFoods } from '../services/foodsApi'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [foodsError, setFoodsError] = useState(null)

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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)