import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PolarRadiusAxis
} from 'recharts'
import RiskGauge from '../components/RiskGauge'
import StatCard from '../components/StatCard'
import { sampleRiskResult } from '../data/sampleData'
import './Results.css'

const LEVEL_COLOR = { Critical: '#ff3d5a', High: '#ff6b35', Medium: '#ffd700', Low: '#00ff9d' }

function HazardBar({ name, score }) {
  const color = score >= 75 ? '#ff3d5a' : score >= 50 ? '#ff6b35' : score >= 30 ? '#ffd700' : '#00ff9d'
  return (
    <div className="hazard-bar-row">
      <span className="hazard-bar-name">{name}</span>
      <div className="hazard-bar-track">
        <div className="hazard-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="hazard-bar-score" style={{ color }}>{score}</span>
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const apiResult = location.state?.result
  const input = location.state?.analysisInput

  // Accept either camelCase or snake_case from FastAPI.
  const raw = apiResult || {}
  const data = apiResult ? {
    location: raw.location || {
      name: raw.locationName || input?.locationName || 'Selected location',
      lat: raw.lat ?? raw.latitude ?? input?.lat,
      lon: raw.lon ?? raw.longitude ?? input?.lon,
    },
    riskScore: raw.riskScore ?? raw.risk_score ?? raw.score ?? 0,
    riskLevel: raw.riskLevel ?? raw.risk_level ?? 'Unknown',
    analyzedAt: raw.analyzedAt ?? raw.analyzed_at ?? new Date().toISOString(),
    hazards: raw.hazards || [],
    exposure: raw.exposure || { population: 0, area_km2: 0, criticalInfrastructure: 0, agricultureHa: 0 },
    vulnerability: raw.vulnerability || { social: 0, economic: 0, physical: 0, adaptive: 0 },
    aiSummary: raw.aiSummary ?? raw.ai_summary ?? raw.analysis ?? 'No AI summary returned.',
    monthlyRainfall: raw.monthlyRainfall ?? raw.monthly_rainfall ?? [],
    riskHistory: raw.riskHistory ?? raw.risk_history ?? [],
  } : sampleRiskResult

  const vulnData = [
    { subject: 'Social',   value: data.vulnerability.social },
    { subject: 'Economic', value: data.vulnerability.economic },
    { subject: 'Physical', value: data.vulnerability.physical },
    { subject: 'Adaptive', value: data.vulnerability.adaptive },
  ]

  const levelColor = LEVEL_COLOR[data.riskLevel] || '#8892a4'

  return (
    <div className="page">
      <div className="container">
        {/* Header row */}
        <div className="results-header">
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Results Dashboard</div>
            {!apiResult && (
              <p style={{ color: '#ffd700', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                No live analysis result was returned; showing sample data.
              </p>
            )}
            <h2>{data.location.name}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {data.location.lat}°N, {data.location.lon}°E &nbsp;·&nbsp;
              Analyzed {new Date(data.analyzedAt).toLocaleString()}
            </p>
          </div>
          <div className="results-header__actions">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/analysis')}>
              ← New Analysis
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/alerts')}>
              View Alerts ⚑
            </button>
          </div>
        </div>

        {/* Top row: gauge + exposure stats */}
        <div className="results-top">
          <div className="card gauge-card">
            <RiskGauge score={data.riskScore} level={data.riskLevel} size={200} />
            <div className="gauge-meta">
              <div className="badge" style={{
                background: `${levelColor}22`, color: levelColor, fontSize: '0.8rem'
              }}>
                {data.riskLevel} Risk
              </div>
              <p style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>
                Composite score across {data.hazards.length} hazard dimensions
              </p>
            </div>
          </div>

          <div className="exposure-grid">
            <StatCard icon="👥" label="Exposed Population" value={data.exposure.population.toLocaleString()} accent />
            <StatCard icon="🗺" label="Analysis Area" value={data.exposure.area_km2.toLocaleString()} unit=" km²" />
            <StatCard icon="🏗" label="Critical Infrastructure" value={data.exposure.criticalInfrastructure} unit=" assets" />
            <StatCard icon="🌾" label="Agricultural Land" value={`${(data.exposure.agricultureHa/1000).toFixed(0)}k`} unit=" ha" />
          </div>
        </div>

        {/* Charts row */}
        <div className="results-charts">
          {/* Rainfall bar */}
          <div className="card chart-card">
            <h3 className="chart-title">Monthly Rainfall (mm)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthlyRainfall} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#141c2e', border: '1px solid #1e2d45', borderRadius: 8 }}
                  labelStyle={{ color: '#e8eaf6' }} itemStyle={{ color: '#00d4ff' }}
                />
                <Bar dataKey="mm" fill="#00d4ff" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Vulnerability radar */}
          <div className="card chart-card">
            <h3 className="chart-title">Vulnerability Profile</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={vulnData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <PolarGrid stroke="#1e2d45" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892a4', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#ff6b35" fill="#ff6b35" fillOpacity={0.2} />
                <Tooltip
                  contentStyle={{ background: '#141c2e', border: '1px solid #1e2d45', borderRadius: 8 }}
                  itemStyle={{ color: '#ff6b35' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk trend line */}
          <div className="card chart-card chart-card--wide">
            <h3 className="chart-title">Risk Score Trend (Historical)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.riskHistory} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="year" tick={{ fill: '#8892a4', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8892a4', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#141c2e', border: '1px solid #1e2d45', borderRadius: 8 }}
                  labelStyle={{ color: '#e8eaf6' }} itemStyle={{ color: '#ff3d5a' }}
                />
                <Line type="monotone" dataKey="score" stroke="#ff3d5a" strokeWidth={2.5}
                  dot={{ fill: '#ff3d5a', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazards + AI summary */}
        <div className="results-bottom">
          {/* Hazard breakdown */}
          <div className="card">
            <h3 style={{ marginBottom: '1.2rem' }}>Hazard Scores</h3>
            <div className="hazard-bars">
              {data.hazards.map(h => <HazardBar key={h.name} {...h} />)}
            </div>
          </div>

          {/* AI summary */}
          <div className="card ai-summary">
            <div className="ai-summary__header">
              <span className="ai-summary__icon">🧠</span>
              <h3>AI Risk Summary</h3>
              <span className="badge badge-cyan">GPT-Powered</span>
            </div>
            <p className="ai-summary__text">{data.aiSummary}</p>
            <div className="ai-summary__footer">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Generated by Domino Protocol AI · Always validate with local expertise
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
