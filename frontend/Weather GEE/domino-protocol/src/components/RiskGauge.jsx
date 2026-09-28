import React from 'react'
import './RiskGauge.css'

/**
 * Circular SVG gauge showing a risk score 0–100.
 */
export default function RiskGauge({ score = 0, level = 'Unknown', size = 180 }) {
  const radius = 70
  const stroke = 10
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  const colorMap = {
    Critical: '#ff3d5a',
    High:     '#ff6b35',
    Medium:   '#ffd700',
    Low:      '#00ff9d',
    Unknown:  '#8892a4',
  }
  const color = colorMap[level] || '#8892a4'

  return (
    <div className="risk-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none" stroke="#1e2d45" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="risk-gauge__label">
        <span className="risk-gauge__score" style={{ color }}>{score}</span>
        <span className="risk-gauge__level" style={{ color }}>{level}</span>
        <span className="risk-gauge__sub">Risk Score</span>
      </div>
    </div>
  )
}
