import React, { useState } from 'react'
import AlertCard from '../components/AlertCard'
import { sampleAlerts, sampleRiskResult } from '../data/sampleData'
import './Alerts.css'

// Lightweight PDF generation using jsPDF
async function generatePDF(data) {
  // Dynamic import to keep initial bundle small
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margin = 16

  // Header
  doc.setFillColor(10, 14, 26)
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(0, 212, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('DOMINO PROTOCOL', margin, 12)
  doc.setFontSize(10)
  doc.setTextColor(136, 146, 164)
  doc.text('AI Climate Risk & Disaster Preparedness Report', margin, 20)
  doc.setTextColor(136, 146, 164)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 210 - margin, 20, { align: 'right' })

  let y = 42

  // Location + Risk Score
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)
  doc.text(`Location: ${data.location.name}`, margin, y); y += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Coordinates: ${data.location.lat}°N, ${data.location.lon}°E`, margin, y); y += 6
  doc.text(`Risk Score: ${data.riskScore}/100  –  Level: ${data.riskLevel}`, margin, y); y += 10

  // Hazard table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Hazard Assessment', margin, y); y += 5

  autoTable(doc, {
    startY: y,
    head: [['Hazard', 'Score', 'Trend']],
    body: data.hazards.map(h => [h.name, `${h.score}/100`, h.trend.toUpperCase()]),
    headStyles: { fillColor: [0, 68, 180], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    margin: { left: margin, right: margin },
  })

  y = doc.lastAutoTable.finalY + 10

  // Exposure
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Exposure Summary', margin, y); y += 5

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Exposed Population', data.exposure.population.toLocaleString()],
      ['Analysis Area', `${data.exposure.area_km2} km²`],
      ['Critical Infrastructure Assets', data.exposure.criticalInfrastructure],
      ['Agricultural Land', `${(data.exposure.agricultureHa / 1000).toFixed(0)}k ha`],
    ],
    headStyles: { fillColor: [0, 68, 180], textColor: 255 },
    margin: { left: margin, right: margin },
  })

  y = doc.lastAutoTable.finalY + 10

  // AI Summary
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('AI Risk Summary', margin, y); y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const lines = doc.splitTextToSize(data.aiSummary, 210 - margin * 2)
  doc.text(lines, margin, y)

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(180)
    doc.text(`Domino Protocol – Confidential Risk Assessment – Page ${i} of ${pageCount}`, 105, 290, { align: 'center' })
  }

  doc.save(`domino-risk-report-${data.location.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`)
}

const FILTER_OPTIONS = ['All', 'Critical', 'High', 'Medium', 'Low']

export default function Alerts() {
  const [filter, setFilter] = useState('All')
  const [downloading, setDownloading] = useState(false)

  const filtered = filter === 'All'
    ? sampleAlerts
    : sampleAlerts.filter(a => a.severity === filter.toLowerCase())

  const handleDownload = async () => {
    setDownloading(true)
    try { await generatePDF(sampleRiskResult) }
    finally { setDownloading(false) }
  }

  const counts = {
    critical: sampleAlerts.filter(a => a.severity === 'critical').length,
    high:     sampleAlerts.filter(a => a.severity === 'high').length,
    medium:   sampleAlerts.filter(a => a.severity === 'medium').length,
    low:      sampleAlerts.filter(a => a.severity === 'low').length,
  }

  return (
    <div className="page">
      <div className="container">
        <div className="alerts-header">
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Alerts & Reports</div>
            <h2>Active Warnings</h2>
            <p>Real-time climate hazard warnings and recommended response actions.</p>
          </div>
          <button
            className="btn btn-danger btn-lg"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? '⏳ Generating…' : '⬇ Download PDF Report'}
          </button>
        </div>

        {/* Severity summary chips */}
        <div className="severity-chips">
          <div className="severity-chip severity-chip--critical">
            <span>⚠</span> {counts.critical} Critical
          </div>
          <div className="severity-chip severity-chip--high">
            <span>▲</span> {counts.high} High
          </div>
          <div className="severity-chip severity-chip--medium">
            <span>◆</span> {counts.medium} Medium
          </div>
          <div className="severity-chip severity-chip--low">
            <span>●</span> {counts.low} Low
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f}
              className={`filter-tab${filter === f ? ' filter-tab--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="alert-list">
          {filtered.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No alerts for this severity level.</p>
            : filtered.map(alert => <AlertCard key={alert.id} alert={alert} />)
          }
        </div>

        {/* Report info */}
        <div className="report-info card">
          <h3>📄 PDF Report Contents</h3>
          <div className="report-info__grid">
            {[
              'Location & coordinate metadata',
              'Overall risk score & level',
              'Per-hazard breakdown table',
              'Population & infrastructure exposure',
              'AI-generated risk narrative',
              'Vulnerability index scores',
            ].map(item => (
              <div key={item} className="report-info__item">
                <span className="report-info__check">✓</span>
                {item}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Reports are generated client-side and contain sample data.
            Connect to a FastAPI backend to generate live reports.
          </p>
        </div>
      </div>
    </div>
  )
}
