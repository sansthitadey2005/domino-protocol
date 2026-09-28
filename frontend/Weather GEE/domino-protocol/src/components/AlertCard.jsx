import React, { useState } from 'react'
import './AlertCard.css'

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', cls: 'alert-card--critical', badge: 'badge-red',    icon: '⚠' },
  high:     { label: 'High',     cls: 'alert-card--high',     badge: 'badge-orange',  icon: '▲' },
  medium:   { label: 'Medium',   cls: 'alert-card--medium',   badge: 'badge-yellow',  icon: '◆' },
  low:      { label: 'Low',      cls: 'alert-card--low',      badge: 'badge-green',   icon: '●' },
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AlertCard({ alert }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low

  return (
    <div className={`alert-card card ${cfg.cls}`}>
      <div className="alert-card__header" onClick={() => setExpanded(e => !e)}>
        <div className="alert-card__title-row">
          <span className={`badge ${cfg.badge}`}>{cfg.icon} {cfg.label}</span>
          <h3 className="alert-card__title">{alert.title}</h3>
        </div>
        <div className="alert-card__meta">
          <span>📍 {alert.location}</span>
          <span>🕐 Issued: {formatDate(alert.issuedAt)}</span>
          <span>⏱ Expires: {formatDate(alert.expiresAt)}</span>
        </div>
        <button className="alert-card__toggle btn btn-sm btn-secondary">
          {expanded ? 'Collapse ▲' : 'Details ▼'}
        </button>
      </div>

      {expanded && (
        <div className="alert-card__body">
          <p className="alert-card__desc">{alert.description}</p>
          <div className="alert-card__actions">
            <h4>Recommended Actions</h4>
            <ul>
              {alert.actions.map((action, i) => (
                <li key={i}><span className="action-bullet">›</span> {action}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
