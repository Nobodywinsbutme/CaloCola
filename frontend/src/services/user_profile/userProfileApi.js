/**
 * userProfileApi.js
 * Central place for user profile and health metrics API calls.
 */

const API_BASE = 'http://localhost:8080'

async function fetchJson(url, options) {
  const res = await fetch(url, options)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed ${res.status} ${res.statusText}: ${text}`)
  }

  return res.json()
}

/**
 * Get user profile with all health metrics
 * GET /users/profile
 * @param {string} token - JWT token
 * @returns {Promise<Object>} User profile with health data
 */
export async function getUserProfile(token) {
  return fetchJson(`${API_BASE}/users/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
}

/**
 * Update user profile with health metrics
 * PUT /users/profile
 * @param {string} token - JWT token
 * @param {Object} profileData - Profile update data
 * @returns {Promise<Object>} Updated profile
 */
export async function updateUserProfile(token, profileData) {
  return fetchJson(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  })
}
