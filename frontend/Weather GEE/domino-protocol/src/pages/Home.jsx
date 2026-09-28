import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

const FEATURES = [
  {
    icon: '🗺',
    title: 'Geospatial Risk Mapping',
    desc: 'Overlay rainfall, flood extent, elevation, land-cover and infrastructure layers on interactive maps powered by OpenStreetMap.',
  },
  {
    icon: '🧠',
    title: 'AI-Powered Analysis',
    desc: 'Machine-learning models trained on historical climate data generate location-specific risk scores and compound hazard assessments.',
  },
  {
    icon: '📊',
    title: 'Risk Dashboards',
    desc: 'Visualise exposure, vulnerability, and adaptive capacity with clear charts and indicators tailored for decision-makers.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Alerts',
    desc: 'Receive severity-graded warnings for floods, cyclones, heat stress, and more — with actionable response guidance.',
  },
  {
    icon: '📄',
    title: 'Automated Reports',
    desc: 'Generate downloadable PDF risk reports for communities, infrastructure assets, or entire districts in one click.',
  },
  {
    icon: '🔗',
    title: 'Open API Ready',
    desc: 'Built with a clean REST API layer so government systems, NGOs, and research tools can connect seamlessly.',
  },
]

const STATS = [
  { value: '195+', label: 'Countries Covered' },
  { value: '40TB', label: 'Climate Datasets' },
  { value: '12',   label: 'Hazard Types' },
  { value: '99.7%', label: 'Model Accuracy' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__grid" />
          <div className="hero__glow hero__glow--1" />
          <div className="hero__glow hero__glow--2" />
        </div>
        <div className="container hero__content">
          <div className="hero__badge badge badge-cyan">AI Climate Intelligence Platform</div>
          <h1 className="hero__title">
            Predict. Prepare.<br />
            <span className="glow-cyan">Protect.</span>
          </h1>
          <p className="hero__subtitle">
            Domino Protocol combines satellite data, machine learning, and geospatial analytics
            to map climate risk and power disaster preparedness decisions at every scale.
          </p>
          <div className="hero__actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/analysis')}>
              Get Started →
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/map')}>
              Explore Map
            </button>
          </div>
        </div>

        {/* Animated stat strip */}
        <div className="hero__stats">
          {STATS.map(s => (
            <div key={s.label} className="hero__stat">
              <span className="hero__stat-value glow-cyan">{s.value}</span>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features page">
        <div className="container">
          <div className="section-header">
            <div className="badge badge-cyan">Capabilities</div>
            <h2 style={{ marginTop: '0.75rem' }}>Everything you need to manage climate risk</h2>
            <p>A single platform from raw data to actionable intelligence.</p>
          </div>
          <div className="features__grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div>
            <h2>Ready to assess your risk?</h2>
            <p>Run a full hazard analysis for any location on Earth in under 10 seconds.</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/analysis')}>
            Start Risk Analysis →
          </button>
        </div>
      </section>
    </div>
  )
}
