import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [foods, setFoods]     = useState([])
  const [loading, setLoading] = useState(true)
  const [tdee, setTdee]       = useState(2000)
  const [macros, setMacros]   = useState({ protein: 150, fat: 67, carbs: 250 })
  const [consumed, setConsumed] = useState({ kcal: 0, protein: 0, fat: 0, carbs: 0 })

  useEffect(() => {
    fetch('/api/foods')
      .then(r => r.json())
      .then(data => { setFoods(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const addFood = (food, grams = 100) => {
    const r = grams / 100
    setConsumed(prev => ({
      kcal:    Math.round(prev.kcal    + food.calories * r),
      protein: Math.round(prev.protein + food.protein  * r),
      fat:     Math.round(prev.fat     + food.fat      * r),
      carbs:   Math.round(prev.carbs   + food.carbs    * r),
    }))
  }

  const updateTargets = ({ tdee, protein, fat, carbs }) => {
    setTdee(tdee)
    setMacros({ protein, fat, carbs })
  }

  return (
    <AppContext.Provider value={{ foods, loading, tdee, macros, consumed, addFood, updateTargets }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)