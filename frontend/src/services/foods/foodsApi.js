/**
 * foodsApi.js
 * Central place for all food-related API calls.
 * Uses the Vite proxy route: /api -> http://localhost:8000
 */

async function fetchJson(url, options) {
  const res = await fetch(url, options)

  // Handle non-2xx responses cleanly
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed ${res.status} ${res.statusText}: ${text}`)
  }

  return res.json()
}

/**
 * Get all foods (optionally filtered by category).
 * Backend supports: GET /foods?category=...
 * Frontend calls:   GET /api/foods?category=...
 */
export async function getFoods({ category } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)

  const url = params.toString() ? `/api/foods?${params}` : `/api/foods`
  return fetchJson(url)
}