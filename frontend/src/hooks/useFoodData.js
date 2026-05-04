import { useEffect, useState } from 'react'

const normalizeFood = (raw, index) => ({
  id: raw.id ?? `${raw.food_name ?? raw.name ?? 'food'}-${index}`,
  name: raw.food_name ?? raw.name ?? 'Unknown',
  category: raw.category ?? 'Other',
  calories: Number(raw.calories ?? raw.kcal ?? 0),
  protein: Number(raw.protein ?? 0),
  fat: Number(raw.fat ?? 0),
  carbs: Number(raw.carbs ?? 0),
  fiber: Number(raw.fiber ?? 0),
  sugar: Number(raw.sugar ?? 0),
  sodium: Number(raw.sodium ?? 0),
  cholesterol: Number(raw.cholesterol ?? 0),
})

export default function useFoodData() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadFoods = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch('/data/foods.json', { signal: controller.signal })
        if (!res.ok) {
          throw new Error('Load failed')
        }
        const data = await res.json()
        const normalized = Array.isArray(data) ? data.map(normalizeFood) : []
        setFoods(normalized)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Load failed, please try again')
          setFoods([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadFoods()

    return () => controller.abort()
  }, [])

  return { foods, loading, error }
}
