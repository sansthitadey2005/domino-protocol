/**
 * API client – swap BASE_URL to point at your FastAPI backend.
 * All functions return promises and fall back to sample data when offline.
 */

const BASE_URL = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  analyzeRisk: (payload) =>
    request('/analyze', { method: 'POST', body: JSON.stringify(payload) }),

  getAlerts: () => request('/alerts'),

  getMapLayers: () => request('/map/layers'),

  generateReport: (payload) =>
    request('/report', { method: 'POST', body: JSON.stringify(payload) }),
}
