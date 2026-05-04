import { createContext, useContext, useState, useEffect } from 'react'
import { getFoods } from '../services/foodsApi'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [foodsError, setFoodsError] = useState(null)

  const [tdee, setTdee] = useState(2000)

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


  return (
    <AppContext.Provider
      value={{
        foods,
        loading,
        foodsError,   
        tdee,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)