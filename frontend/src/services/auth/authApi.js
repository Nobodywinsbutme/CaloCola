/**
 * authApi.js
 * Central place for all authentication-related API calls.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function fetchJson(url, options) {
  const res = await fetch(url, options)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed ${res.status} ${res.statusText}: ${text}`)
  }

  return res.json()
}

/**
 * Register a new user
 * POST /auth/register
 * @param {string} email
 * @param {string} password
 * @param {string} name
 * @returns {Promise<Object>} User data
 */
export async function register(email, password, name) {
  return fetchJson(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
}

/**
 * Login a user
 * POST /auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} { access_token, user }
 */
export async function login(email, password) {
  return fetchJson(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}
