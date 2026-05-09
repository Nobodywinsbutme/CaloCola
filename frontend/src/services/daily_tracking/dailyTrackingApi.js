/**
 * dailyTrackingApi.js
 * Central place for daily intake tracking and totals API calls.
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
 * Add a food intake
 * POST /daily-tracking/intake
 * @param {string} token - JWT token
 * @param {Object} intakeData - { foodId, quantity, mealType, intakeDate }
 * @returns {Promise<Object>} Created intake record
 */
export async function addIntake(token, intakeData) {
  return fetchJson(`${API_BASE}/daily-tracking/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(intakeData),
  })
}

/**
 * Update a food intake
 * PUT /daily-tracking/intake/:id
 * @param {string} token - JWT token
 * @param {string} intakeId - ID of intake to update
 * @param {Object} intakeData - Partial update data
 * @returns {Promise<Object>} Updated intake record
 */
export async function updateIntake(token, intakeId, intakeData) {
  return fetchJson(`${API_BASE}/daily-tracking/intake/${intakeId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(intakeData),
  })
}

/**
 * Delete a food intake
 * DELETE /daily-tracking/intake/:id
 * @param {string} token - JWT token
 * @param {string} intakeId - ID of intake to delete
 * @returns {Promise<Object>} Deleted intake record
 */
export async function deleteIntake(token, intakeId) {
  return fetchJson(`${API_BASE}/daily-tracking/intake/${intakeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
}

/**
 * Get daily totals for a specific date
 * GET /daily-tracking/totals?date=YYYY-MM-DD
 * @param {string} token - JWT token
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Daily totals (calories, protein, fat, carbs)
 */
export async function getDailyTotals(token, date) {
  return fetchJson(`${API_BASE}/daily-tracking/totals?date=${date}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
}

/**
 * Get all intakes for a specific date
 * GET /daily-tracking/intakes?date=YYYY-MM-DD
 * @param {string} token - JWT token
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of intake records with food details
 */
export async function getIntakes(token, date) {
  return fetchJson(`${API_BASE}/daily-tracking/intakes?date=${date}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
}
