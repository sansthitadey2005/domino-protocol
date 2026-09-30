/**
 * API client for Domino Protocol
 *
 * Deployed FastAPI backend:
 * https://domino-protocol.onrender.com
 */

const BASE_URL = 'https://domino-protocol.onrender.com'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    let message = `HTTP ${res.status}`

    try {
      const errorData = await res.json()

      if (errorData?.detail) {
        message =
          typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail)
      }
    } catch {
      // Keep the HTTP status message if the response isn't JSON.
    }

    throw new Error(message)
  }

  return res.json()
}

export const api = {
  analyzeRisk: (payload) =>
    request('/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAlerts: () =>
    request('/alerts'),

  getMapLayers: () =>
    request('/map/layers'),

  generateReport: (payload) =>
    request('/report', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}