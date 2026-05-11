/**
 * foodsApi.js
 * Central place for all food-related API calls.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

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
 */
export async function getFoods({ category } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)

  const url = params.toString() ? `${API_BASE}/foods?${params}` : `${API_BASE}/foods`
  return fetchJson(url)
}