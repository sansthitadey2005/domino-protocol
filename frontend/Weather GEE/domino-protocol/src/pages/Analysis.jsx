import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { hazardOptions } from '../data/sampleData'
import { api } from '../api/client'
import './Analysis.css'

const TIMEFRAMES = [
  'Current (2026)',
  '2030 Projection',
  '2040 Projection',
  '2050 Projection',
]

const SCENARIOS = [
  'RCP 2.6 (Optimistic)',
  'RCP 4.5 (Moderate)',
  'RCP 8.5 (High Emissions)',
]

const QUICK_LOCATIONS = [
  { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
  { name: 'Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'Kolkata, India', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai, India', lat: 13.0827, lon: 80.2707 },
  { name: 'Bengaluru, India', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad, India', lat: 17.3850, lon: 78.4867 },
]

export default function Analysis() {
  const navigate = useNavigate()
  const routeLocation = useLocation()

  const [form, setForm] = useState({
    locationName: '',
    lat: '',
    lon: '',
    hazards: ['flood', 'rainfall'],
    timeframe: TIMEFRAMES[0],
    scenario: SCENARIOS[1],
    radius: '10',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key, val) => {
    setForm((f) => ({
      ...f,
      [key]: val,
    }))
  }

  const toggleHazard = (val) => {
    set(
      'hazards',
      form.hazards.includes(val)
        ? form.hazards.filter((h) => h !== val)
        : [...form.hazards, val]
    )
  }

  const applyQuick = (loc) => {
    setForm((f) => ({
      ...f,
      locationName: loc.name,
      lat: String(loc.lat),
      lon: String(loc.lon),
    }))
  }

  // If the user arrived here from the map, use the clicked coordinates.
  React.useEffect(() => {
    const selected = routeLocation.state?.mapLocation

    if (!selected) return

    setForm((f) => ({
      ...f,
      lat: String(selected.lat),
      lon: String(selected.lon),
      locationName: selected.name || '',
    }))
  }, [routeLocation.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.lat || !form.lon) {
      setError('Please enter latitude and longitude.')
      return
    }

    if (form.hazards.length === 0) {
      setError('Select at least one hazard type.')
      return
    }

    const latitude = Number(form.lat)
    const longitude = Number(form.lon)

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError('Please enter valid latitude and longitude values.')
      return
    }

    setLoading(true)

    try {
      /*
       * IMPORTANT:
       * FastAPI /analyze expects:
       *   location
       *   latitude
       *   longitude
       *   text
       */
      const location =
        form.locationName ||
        `Location ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`

      const text = [
        `Hazards selected: ${form.hazards.join(', ')}`,
        `Timeframe: ${form.timeframe}`,
        `Emissions scenario: ${form.scenario}`,
        `Analysis radius: ${Number(form.radius)} km`,
        '',
        'Perform a climate and geographic risk assessment for this location using the available GEE data.',
      ].join('\n')

      const payload = {
        location,
        latitude,
        longitude,
        text,
      }

      console.log('Sending analysis request:', payload)

      const result = await api.analyzeRisk(payload)

      navigate('/results', {
        state: {
          analysisInput: form,
          result,
        },
      })
    } catch (err) {
      console.error('Analysis failed:', err)

      setError(
        `Analysis failed: ${
          err?.message || 'Unable to reach the analysis service.'
        }`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container">

        <div className="section-header">
          <div className="badge badge-cyan">
            Risk Analysis
          </div>

          <h2 style={{ marginTop: '0.75rem' }}>
            Configure your analysis
          </h2>

          <p>
            Define a location, select hazards, and run a full climate risk
            assessment.
          </p>
        </div>

        <div className="analysis-layout">

          {/* Form */}
          <form
            className="analysis-form"
            onSubmit={handleSubmit}
          >

            {/* Location */}
            <div className="form-section card">
              <h3 className="form-section__title">
                📍 Location
              </h3>

              <div className="form-group">
                <label>
                  Location Name (optional)
                </label>

                <input
                  className="input"
                  placeholder="e.g. Mumbai, India"
                  value={form.locationName}
                  onChange={(e) =>
                    set('locationName', e.target.value)
                  }
                />
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>
                    Latitude *
                  </label>

                  <input
                    className="input"
                    type="number"
                    step="any"
                    placeholder="19.0760"
                    value={form.lat}
                    onChange={(e) =>
                      set('lat', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Longitude *
                  </label>

                  <input
                    className="input"
                    type="number"
                    step="any"
                    placeholder="72.8777"
                    value={form.lon}
                    onChange={(e) =>
                      set('lon', e.target.value)
                    }
                    required
                  />
                </div>

              </div>

              <div className="form-group">
                <label>
                  Analysis Radius (km)
                </label>

                <input
                  className="input"
                  type="number"
                  min="1"
                  max="200"
                  value={form.radius}
                  onChange={(e) =>
                    set('radius', e.target.value)
                  }
                />
              </div>

              {/* Quick Select */}
              <div className="form-group">
                <label>
                  Quick Select
                </label>

                <div className="quick-locations">
                  {QUICK_LOCATIONS.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      className={`quick-btn btn btn-sm btn-secondary${
                        form.locationName === loc.name
                          ? ' quick-btn--active'
                          : ''
                      }`}
                      onClick={() => applyQuick(loc)}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hazards */}
            <div className="form-section card">
              <h3 className="form-section__title">
                ⚠ Hazard Types
              </h3>

              <p
                style={{
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                }}
              >
                Select all that apply to your region.
              </p>

              <div className="hazard-grid">
                {hazardOptions.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    className={`hazard-btn${
                      form.hazards.includes(h.value)
                        ? ' hazard-btn--active'
                        : ''
                    }`}
                    onClick={() => toggleHazard(h.value)}
                  >
                    {form.hazards.includes(h.value)
                      ? '✓'
                      : '+'}{' '}
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario */}
            <div className="form-section card">
              <h3 className="form-section__title">
                🌡 Climate Scenario
              </h3>

              <div className="form-row">

                <div className="form-group">
                  <label>
                    Timeframe
                  </label>

                  <select
                    className="select"
                    value={form.timeframe}
                    onChange={(e) =>
                      set('timeframe', e.target.value)
                    }
                  >
                    {TIMEFRAMES.map((timeframe) => (
                      <option
                        key={timeframe}
                        value={timeframe}
                      >
                        {timeframe}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Emissions Scenario
                  </label>

                  <select
                    className="select"
                    value={form.scenario}
                    onChange={(e) =>
                      set('scenario', e.target.value)
                    }
                  >
                    {SCENARIOS.map((scenario) => (
                      <option
                        key={scenario}
                        value={scenario}
                      >
                        {scenario}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {error && (
              <p className="analysis-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg analyze-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Analyzing…
                </>
              ) : (
                '⊕ Analyze Risk'
              )}
            </button>

          </form>

          {/* Info panel */}
          <aside className="analysis-info">

            <div className="card">
              <h3>
                How it works
              </h3>

              <ol className="how-list">
                <li>
                  <span>1</span>
                  Enter a location by name or coordinates
                </li>

                <li>
                  <span>2</span>
                  Select the climate hazards to assess
                </li>

                <li>
                  <span>3</span>
                  Choose a future scenario and timeframe
                </li>

                <li>
                  <span>4</span>
                  Run the analysis — results appear on the dashboard
                </li>
              </ol>
            </div>

            <div className="card">
              <h3>
                Data Sources
              </h3>

              <ul className="source-list">
                <li>
                  🛰 NASA MODIS / Landsat satellite imagery
                </li>

                <li>
                  🌊 FATHOM global flood models
                </li>

                <li>
                  🌧 CHIRPS rainfall datasets
                </li>

                <li>
                  🏔 SRTM 30m elevation data
                </li>

                <li>
                  🌀 IBTrACS tropical cyclone tracks
                </li>

                <li>
                  🏘 OpenStreetMap infrastructure
                </li>
              </ul>
            </div>

            <div className="card info-disclaimer">
              <p>
                This platform uses AI models for risk estimation.
                Results should complement, not replace, professional
                hazard assessments and local knowledge.
              </p>
            </div>

          </aside>

        </div>
      </div>
    </div>
  )
}