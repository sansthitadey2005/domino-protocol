import React from 'react'
import './StatCard.css'

export default function StatCard({ icon, label, value, unit = '', accent = false }) {
  return (
    <div className={`stat-card card${accent ? ' stat-card--accent' : ''}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <span className="stat-card__value">{value}<span className="stat-card__unit">{unit}</span></span>
        <span className="stat-card__label">{label}</span>
      </div>
    </div>
  )
}
