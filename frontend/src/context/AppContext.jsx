import { createContext, useContext, useState } from 'react'
import useFoodData from '../hooks/useFoodData'

const AppContext = createContext()

export function AppProvider({ children }) {
  const { foods, loading, error } = useFoodData()
  const [tdee, setTdee] = useState(2100)
  const [macros, setMacros] = useState({ protein: 120, fat: 70, carbs: 260 })
  const [consumed, setConsumed] = useState({ kcal: 375, protein: 15, fat: 25, carbs: 38 })

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
      value={{ foods, loading, error, tdee, macros, consumed, addFood, updateTargets }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)