import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PolarRadiusAxis,
} from 'recharts'

import RiskGauge from '../components/RiskGauge'
import StatCard from '../components/StatCard'
import './Results.css'

const LEVEL_COLOR = {
  Critical: '#ff3d5a',
  High: '#ff6b35',
  Medium: '#ffd700',
  Low: '#00ff9d',
}

function HazardBar({ name, score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0))

  const color =
    safeScore >= 75
      ? '#ff3d5a'
      : safeScore >= 50
        ? '#ff6b35'
        : safeScore >= 30
          ? '#ffd700'
          : '#00ff9d'

  return (
    <div className="hazard-bar-row">
      <span className="hazard-bar-name">{name}</span>

      <div className="hazard-bar-track">
        <div
          className="hazard-bar-fill"
          style={{
            width: `${safeScore}%`,
            background: color,
          }}
        />
      </div>

      <span
        className="hazard-bar-score"
        style={{ color }}
      >
        {Math.round(safeScore)}
      </span>
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()

  const apiResult = location.state?.result
  const analysisInput = location.state?.analysisInput

  const latitude = Number(analysisInput?.lat)
  const longitude = Number(analysisInput?.lon)

  const [geeData, setGeeData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  // ---------------------------------------------------------
  // FETCH LOCATION-SPECIFIC GEE DATA
  // ---------------------------------------------------------

  React.useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setLoading(false)
      setError('Location coordinates are missing.')
      return
    }

    const url =
      `http://127.0.0.1:8000/gee-data` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}`

    setLoading(true)
    setError(null)

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch GEE data.')
        }

        return response.json()
      })
      .then((result) => {
        console.log('Location-specific GEE data:', result)
        setGeeData(result)
      })
      .catch((err) => {
        console.error('GEE data error:', err)
        setError(err.message || 'Unable to load location data.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [latitude, longitude])

  // ---------------------------------------------------------
  // WAITING STATE
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <h2>Loading location data...</h2>

            <p
              style={{
                color: 'var(--text-muted)',
                marginTop: '0.75rem',
              }}
            >
              Fetching GEE hazard data for{' '}
              {Number.isFinite(latitude) ? latitude.toFixed(4) : '—'},
              {' '}
              {Number.isFinite(longitude) ? longitude.toFixed(4) : '—'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------

  if (error || !geeData) {
    return (
      <div className="page">
        <div className="container">
          <div
            className="card"
            style={{
              padding: '3rem',
              textAlign: 'center',
            }}
          >
            <h2>Unable to load location data</h2>

            <p
              style={{
                color: 'var(--text-muted)',
                marginTop: '0.75rem',
              }}
            >
              {error || 'No GEE data was returned for this location.'}
            </p>

            <button
              className="btn btn-secondary"
              style={{ marginTop: '1.5rem' }}
              onClick={() => navigate('/analysis')}
            >
              ← Back to Analysis
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------
  // REAL GEE VALUES
  // ---------------------------------------------------------

  const rainfall = Number(geeData.rainfall_mm) || 0
  const elevation = Number(geeData.elevation_m) || 0
  const riverFlood = Number(geeData.river_flood_depth_m) || 0
  const coastalFlood = Number(geeData.coastal_flood_depth_m) || 0
  const population = Number(geeData.population) || 0
  const builtupArea = Number(geeData.builtup_area_m2) || 0
  const landcover = Number(geeData.landcover) || 0

  // ---------------------------------------------------------
  // LOCATION-SPECIFIC HAZARD SCORES
  // ---------------------------------------------------------

  const rainfallScore = Math.min(
    100,
    Math.round((rainfall / 3000) * 100)
  )

  const coastalFloodScore = Math.min(
    100,
    Math.round((coastalFlood / 6) * 100)
  )

  const riverFloodScore = Math.min(
    100,
    Math.round((riverFlood / 6) * 100)
  )

  const populationScore = Math.min(
    100,
    Math.round((population / 100) * 100)
  )

  const builtupScore = Math.min(
    100,
    Math.round((builtupArea / 1000000) * 100)
  )

  const elevationScore =
    elevation <= 0
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(100 - elevation * 5)
          )
        )

  // ---------------------------------------------------------
  // COMPOSITE LOCATION RISK
  // ---------------------------------------------------------

  const riskScore = Math.round(
    rainfallScore * 0.25 +
    coastalFloodScore * 0.25 +
    riverFloodScore * 0.15 +
    populationScore * 0.15 +
    builtupScore * 0.10 +
    elevationScore * 0.10
  )

  const finalRiskScore = Math.max(
    0,
    Math.min(100, riskScore)
  )

  const riskLevel =
    finalRiskScore >= 75
      ? 'Critical'
      : finalRiskScore >= 50
        ? 'High'
        : finalRiskScore >= 30
          ? 'Medium'
          : 'Low'

  // ---------------------------------------------------------
  // VULNERABILITY PROFILE
  // ---------------------------------------------------------

  const socialScore = populationScore

  const economicScore = Math.min(
    100,
    Math.round(
      builtupScore * 0.6 +
      populationScore * 0.4
    )
  )

  const physicalScore = Math.min(
    100,
    Math.round(
      coastalFloodScore * 0.35 +
      riverFloodScore * 0.35 +
      builtupScore * 0.30
    )
  )

  const adaptiveScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
        (
          coastalFloodScore * 0.35 +
          riverFloodScore * 0.35 +
          rainfallScore * 0.30
        )
      )
    )
  )

  const vulnData = [
    {
      subject: 'Social',
      value: socialScore,
    },
    {
      subject: 'Economic',
      value: economicScore,
    },
    {
      subject: 'Physical',
      value: physicalScore,
    },
    {
      subject: 'Adaptive',
      value: adaptiveScore,
    },
  ]

  // ---------------------------------------------------------
  // RAINFALL DATA
  // ---------------------------------------------------------
  // The current GEE combined-risk dataset provides rainfall_mm,
  // not 12 separate monthly values.
  //
  // Therefore we show the actual location rainfall as a single
  // annual/location measurement instead of displaying fake
  // monthly values from sampleData.

  const rainfallData = [
    {
      label: 'Location',
      mm: rainfall,
    },
  ]

  // ---------------------------------------------------------
  // CURRENT RISK COMPONENT DATA
  // ---------------------------------------------------------
  // This replaces the old hard-coded historical sample data.

  const riskHistory = [
    {
      year: 'Rainfall',
      score: rainfallScore,
    },
    {
      year: 'Coastal',
      score: coastalFloodScore,
    },
    {
      year: 'River',
      score: riverFloodScore,
    },
    {
      year: 'Population',
      score: populationScore,
    },
    {
      year: 'Built-up',
      score: builtupScore,
    },
    {
      year: 'Elevation',
      score: elevationScore,
    },
  ]

  // ---------------------------------------------------------
  // LOCATION DATA
  // ---------------------------------------------------------

  const locationName =
    analysisInput?.locationName ||
    'Selected Location'

  const locationLat =
    Number.isFinite(latitude)
      ? latitude
      : Number(geeData.latitude)

  const locationLon =
    Number.isFinite(longitude)
      ? longitude
      : Number(geeData.longitude)

  const levelColor =
    LEVEL_COLOR[riskLevel] || '#8892a4'

  // ---------------------------------------------------------
  // AI SUMMARY
  // ---------------------------------------------------------

  const aiSummary =
    apiResult?.summary ||
    `Location-specific analysis completed for ${locationName}. ` +
    `The selected location has rainfall of ${rainfall.toFixed(2)} mm, ` +
    `coastal flood depth of ${coastalFlood.toFixed(2)} m, ` +
    `river flood depth of ${riverFlood.toFixed(2)} m, ` +
    `elevation of ${elevation.toFixed(2)} m, ` +
    `population value of ${population.toFixed(2)}, ` +
    `and built-up area of ${builtupArea.toFixed(2)} m².`

  return (
    <div className="page">
      <div className="container">

        {/* -------------------------------------------------
            HEADER
        ------------------------------------------------- */}

        <div className="results-header">
          <div>
            <div
              className="badge badge-cyan"
              style={{ marginBottom: '0.5rem' }}
            >
              Results Dashboard
            </div>

            <h2>{locationName}</h2>

            <p
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem',
              }}
            >
              {Number.isFinite(locationLat)
                ? locationLat.toFixed(4)
                : '—'}
              °N,{' '}
              {Number.isFinite(locationLon)
                ? locationLon.toFixed(4)
                : '—'}
              °E
              &nbsp;·&nbsp;
              Location-specific GEE analysis
            </p>
          </div>

          <div className="results-header__actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/analysis')}
            >
              ← New Analysis
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/alerts')}
            >
              View Alerts ⚑
            </button>
          </div>
        </div>

        {/* -------------------------------------------------
            TOP ROW
        ------------------------------------------------- */}

        <div className="results-top">

          <div className="card gauge-card">

            <RiskGauge
              score={finalRiskScore}
              level={riskLevel}
              size={200}
            />

            <div className="gauge-meta">

              <div
                className="badge"
                style={{
                  background: `${levelColor}22`,
                  color: levelColor,
                  fontSize: '0.8rem',
                }}
              >
                {riskLevel} Risk
              </div>

              <p
                style={{
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  marginTop: '0.5rem',
                }}
              >
                Location-specific composite score
              </p>

            </div>
          </div>

          <div className="exposure-grid">

            <StatCard
              icon="👥"
              label="Population"
              value={population.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              accent
            />

            <StatCard
              icon="🌧"
              label="Rainfall"
              value={rainfall.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              unit=" mm"
            />

            <StatCard
              icon="🌊"
              label="Coastal Flood Depth"
              value={coastalFlood.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              unit=" m"
            />

            <StatCard
              icon="🏗"
              label="Built-up Area"
              value={builtupArea.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              unit=" m²"
            />

          </div>
        </div>

        {/* -------------------------------------------------
            CHARTS
        ------------------------------------------------- */}

        <div className="results-charts">

          {/* Rainfall */}

          <div className="card chart-card">

            <h3 className="chart-title">
              Location Rainfall
            </h3>

            <ResponsiveContainer
              width="100%"
              height={200}
            >
              <BarChart
                data={rainfallData}
                margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2d45"
                />

                <XAxis
                  dataKey="label"
                  tick={{
                    fill: '#8892a4',
                    fontSize: 11,
                  }}
                />

                <YAxis
                  tick={{
                    fill: '#8892a4',
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    background: '#141c2e',
                    border: '1px solid #1e2d45',
                    borderRadius: 8,
                  }}
                  labelStyle={{
                    color: '#e8eaf6',
                  }}
                  itemStyle={{
                    color: '#00d4ff',
                  }}
                />

                <Bar
                  dataKey="mm"
                  fill="#00d4ff"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

          </div>

          {/* Vulnerability */}

          <div className="card chart-card">

            <h3 className="chart-title">
              Vulnerability Profile
            </h3>

            <ResponsiveContainer
              width="100%"
              height={200}
            >
              <RadarChart
                data={vulnData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 10,
                }}
              >

                <PolarGrid
                  stroke="#1e2d45"
                />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: '#8892a4',
                    fontSize: 11,
                  }}
                />

                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />

                <Radar
                  dataKey="value"
                  stroke="#ff6b35"
                  fill="#ff6b35"
                  fillOpacity={0.2}
                />

                <Tooltip
                  contentStyle={{
                    background: '#141c2e',
                    border: '1px solid #1e2d45',
                    borderRadius: 8,
                  }}
                  itemStyle={{
                    color: '#ff6b35',
                  }}
                />

              </RadarChart>
            </ResponsiveContainer>

          </div>

          {/* Risk Components */}

          <div className="card chart-card chart-card--wide">

            <h3 className="chart-title">
              Location Risk Components
            </h3>

            <ResponsiveContainer
              width="100%"
              height={200}
            >
              <LineChart
                data={riskHistory}
                margin={{
                  top: 5,
                  right: 20,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2d45"
                />

                <XAxis
                  dataKey="year"
                  tick={{
                    fill: '#8892a4',
                    fontSize: 11,
                  }}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{
                    fill: '#8892a4',
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    background: '#141c2e',
                    border: '1px solid #1e2d45',
                    borderRadius: 8,
                  }}
                  labelStyle={{
                    color: '#e8eaf6',
                  }}
                  itemStyle={{
                    color: '#ff3d5a',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#ff3d5a"
                  strokeWidth={2.5}
                  dot={{
                    fill: '#ff3d5a',
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* -------------------------------------------------
            HAZARDS + AI
        ------------------------------------------------- */}

        <div className="results-bottom">

          {/* Hazard Breakdown */}

          <div className="card">

            <h3 style={{ marginBottom: '1.2rem' }}>
              Hazard Scores
            </h3>

            <div className="hazard-bars">

              <HazardBar
                name="Rainfall"
                score={rainfallScore}
              />

              <HazardBar
                name="Coastal Flood"
                score={coastalFloodScore}
              />

              <HazardBar
                name="River Flood"
                score={riverFloodScore}
              />

              <HazardBar
                name="Elevation"
                score={elevationScore}
              />

              <HazardBar
                name="Population"
                score={populationScore}
              />

              <HazardBar
                name="Built-up"
                score={builtupScore}
              />

            </div>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #1e2d45',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
              }}
            >
              Landcover value: {landcover}
            </div>

          </div>

          {/* AI Summary */}

          <div className="card ai-summary">

            <div className="ai-summary__header">

              <span className="ai-summary__icon">
                🧠
              </span>

              <h3>
                AI Risk Summary
              </h3>

              <span className="badge badge-cyan">
                Gemini-Powered
              </span>

            </div>

            <p className="ai-summary__text">
              {aiSummary}
            </p>

            <div className="ai-summary__footer">

              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                Generated using the selected location's
                GEE-derived data · Always validate with
                local expertise
              </span>

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}