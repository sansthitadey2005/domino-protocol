import React, { useState } from 'react'
import AlertCard from '../components/AlertCard'
import './Alerts.css'

// ---------------------------------------------------------
// INDIA ALERT DATA
// ---------------------------------------------------------
// This page no longer imports the old Bangladesh sampleData.
//
// These are application-level India monitoring examples.
// They are NOT presented as live government warnings.
// Later, these can be replaced directly by a FastAPI
// /alerts endpoint without changing the page layout.
// ---------------------------------------------------------

const INDIA_ALERTS = [
  {
    id: 'india-flood-001',
    severity: 'critical',
    title: 'Flood Risk Monitoring – Eastern India',
    location: 'West Bengal, India',
    issued: 'Current monitoring',
    expires: 'Continuous monitoring',
    description:
      'Elevated flood exposure is being monitored across low-lying areas of eastern India. Local rainfall, drainage, river levels and elevation should be considered when assessing individual locations.',
    actions: [
      'Monitor local rainfall and river-level information.',
      'Avoid low-lying and waterlogged areas during heavy rainfall.',
      'Check local emergency advisories before travel.',
    ],
  },

  {
    id: 'india-rain-001',
    severity: 'high',
    title: 'Heavy Rainfall Monitoring – Northeast India',
    location: 'Northeast India',
    issued: 'Current monitoring',
    expires: 'Continuous monitoring',
    description:
      'Heavy rainfall exposure is being monitored across parts of Northeast India. Localized flooding and disruption may depend on rainfall intensity, drainage and terrain.',
    actions: [
      'Monitor local weather updates.',
      'Check roads and drainage conditions before travel.',
      'Keep emergency supplies available during prolonged rainfall.',
    ],
  },

  {
    id: 'india-cyclone-001',
    severity: 'medium',
    title: 'Cyclone & Coastal Hazard Monitoring',
    location: 'Bay of Bengal Coast, India',
    issued: 'Current monitoring',
    expires: 'Continuous monitoring',
    description:
      'Coastal districts along the Bay of Bengal are monitored for cyclone-related rainfall, coastal flooding and strong-wind exposure.',
    actions: [
      'Monitor official cyclone bulletins.',
      'Review evacuation routes in exposed coastal areas.',
      'Secure loose outdoor equipment when severe weather approaches.',
    ],
  },

  {
    id: 'india-heat-001',
    severity: 'low',
    title: 'Heat & Urban Exposure Monitoring',
    location: 'Indian Urban Areas',
    issued: 'Current monitoring',
    expires: 'Continuous monitoring',
    description:
      'Urban heat exposure is monitored as part of the broader climate-risk assessment. Local temperature, built-up area and population exposure can influence risk.',
    actions: [
      'Monitor local temperature conditions.',
      'Maintain access to drinking water.',
      'Take additional precautions during periods of extreme heat.',
    ],
  },
]

// ---------------------------------------------------------
// DEFAULT INDIA REPORT DATA
// ---------------------------------------------------------
// Used only until the backend supplies a live risk result.
// ---------------------------------------------------------

const INDIA_REPORT = {
  location: {
    name: 'India',
    lat: 20.5937,
    lon: 78.9629,
  },

  riskScore: 0,

  riskLevel: 'MONITORING',

  hazards: [
    {
      name: 'Flood',
      score: 0,
      trend: 'monitoring',
    },
    {
      name: 'Rainfall',
      score: 0,
      trend: 'monitoring',
    },
    {
      name: 'Coastal Hazard',
      score: 0,
      trend: 'monitoring',
    },
    {
      name: 'Heat Exposure',
      score: 0,
      trend: 'monitoring',
    },
  ],

  exposure: {
    population: 0,
    area_km2: 0,
    criticalInfrastructure: 0,
    agricultureHa: 0,
  },

  aiSummary:
    'India-wide climate risk monitoring is active. Select a specific location on the map and run an analysis to populate location-specific rainfall, elevation, population, built-up area and flood-risk information.',
}

// ---------------------------------------------------------
// PDF GENERATION
// ---------------------------------------------------------

async function generatePDF(data) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const margin = 16

  // -------------------------------------------------------
  // HEADER
  // -------------------------------------------------------

  doc.setFillColor(10, 14, 26)
  doc.rect(0, 0, 210, 30, 'F')

  doc.setTextColor(0, 212, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')

  doc.text(
    'DOMINO PROTOCOL',
    margin,
    12
  )

  doc.setFontSize(10)
  doc.setTextColor(136, 146, 164)

  doc.text(
    'AI Climate Risk & Disaster Preparedness Report',
    margin,
    20
  )

  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    210 - margin,
    20,
    {
      align: 'right',
    }
  )

  let y = 42

  // -------------------------------------------------------
  // LOCATION
  // -------------------------------------------------------

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 30)

  doc.text(
    `Location: ${data.location.name}`,
    margin,
    y
  )

  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  doc.text(
    `Coordinates: ${data.location.lat}°N, ${data.location.lon}°E`,
    margin,
    y
  )

  y += 6

  doc.text(
    `Risk Score: ${data.riskScore}/100  –  Level: ${data.riskLevel}`,
    margin,
    y
  )

  y += 10

  // -------------------------------------------------------
  // HAZARD ASSESSMENT
  // -------------------------------------------------------

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')

  doc.text(
    'Hazard Assessment',
    margin,
    y
  )

  y += 5

  autoTable(doc, {
    startY: y,

    head: [
      ['Hazard', 'Score', 'Trend'],
    ],

    body: data.hazards.map((hazard) => [
      hazard.name,
      `${hazard.score}/100`,
      String(hazard.trend).toUpperCase(),
    ]),

    headStyles: {
      fillColor: [0, 68, 180],
      textColor: 255,
    },

    alternateRowStyles: {
      fillColor: [245, 247, 255],
    },

    margin: {
      left: margin,
      right: margin,
    },
  })

  y = doc.lastAutoTable.finalY + 10

  // -------------------------------------------------------
  // EXPOSURE
  // -------------------------------------------------------

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')

  doc.text(
    'Exposure Summary',
    margin,
    y
  )

  y += 5

  autoTable(doc, {
    startY: y,

    head: [
      ['Metric', 'Value'],
    ],

    body: [
      [
        'Exposed Population',
        Number(data.exposure.population || 0).toLocaleString(),
      ],

      [
        'Analysis Area',
        `${data.exposure.area_km2 || 0} km²`,
      ],

      [
        'Critical Infrastructure Assets',
        data.exposure.criticalInfrastructure || 0,
      ],

      [
        'Agricultural Land',
        `${(
          Number(data.exposure.agricultureHa || 0) / 1000
        ).toFixed(0)}k ha`,
      ],
    ],

    headStyles: {
      fillColor: [0, 68, 180],
      textColor: 255,
    },

    margin: {
      left: margin,
      right: margin,
    },
  })

  y = doc.lastAutoTable.finalY + 10

  // -------------------------------------------------------
  // AI SUMMARY
  // -------------------------------------------------------

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')

  doc.text(
    'AI Risk Summary',
    margin,
    y
  )

  y += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  const lines = doc.splitTextToSize(
    data.aiSummary,
    210 - margin * 2
  )

  doc.text(
    lines,
    margin,
    y
  )

  // -------------------------------------------------------
  // FOOTER
  // -------------------------------------------------------

  const pageCount =
    doc.internal.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    doc.setFontSize(8)
    doc.setTextColor(180)

    doc.text(
      `Domino Protocol – India Climate Risk Assessment – Page ${i} of ${pageCount}`,
      105,
      290,
      {
        align: 'center',
      }
    )
  }

  // -------------------------------------------------------
  // FILE NAME
  // -------------------------------------------------------

  const safeName =
    String(data.location.name)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()

  doc.save(
    `domino-india-risk-report-${safeName}.pdf`
  )
}

// ---------------------------------------------------------
// FILTERS
// ---------------------------------------------------------

const FILTER_OPTIONS = [
  'All',
  'Critical',
  'High',
  'Medium',
  'Low',
]

// ---------------------------------------------------------
// ALERTS PAGE
// ---------------------------------------------------------

export default function Alerts() {
  const [filter, setFilter] = useState('All')

  const [downloading, setDownloading] =
    useState(false)

  // -------------------------------------------------------
  // FILTER ALERTS
  // -------------------------------------------------------

  const filtered =
    filter === 'All'
      ? INDIA_ALERTS
      : INDIA_ALERTS.filter(
          (alert) =>
            alert.severity ===
            filter.toLowerCase()
        )

  // -------------------------------------------------------
  // DOWNLOAD PDF
  // -------------------------------------------------------

  const handleDownload = async () => {
    setDownloading(true)

    try {
      await generatePDF(INDIA_REPORT)
    } catch (error) {
      console.error(
        'PDF generation failed:',
        error
      )
    } finally {
      setDownloading(false)
    }
  }

  // -------------------------------------------------------
  // COUNTS
  // -------------------------------------------------------

  const counts = {
    critical: INDIA_ALERTS.filter(
      (alert) =>
        alert.severity === 'critical'
    ).length,

    high: INDIA_ALERTS.filter(
      (alert) =>
        alert.severity === 'high'
    ).length,

    medium: INDIA_ALERTS.filter(
      (alert) =>
        alert.severity === 'medium'
    ).length,

    low: INDIA_ALERTS.filter(
      (alert) =>
        alert.severity === 'low'
    ).length,
  }

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <div className="page">

      <div className="container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="alerts-header">

          <div>

            <div
              className="badge badge-cyan"
              style={{
                marginBottom: '0.5rem',
              }}
            >
              India Alerts & Reports
            </div>

            <h2>
              Climate Risk Monitoring
            </h2>

            <p>
              India-focused climate hazard monitoring
              and recommended response actions.
            </p>

          </div>

          <button
            className="btn btn-danger btn-lg"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading
              ? '⏳ Generating…'
              : '⬇ Download PDF Report'}
          </button>

        </div>

        {/* =================================================
            IMPORTANT DATA NOTICE
        ================================================= */}

        <div
          className="card"
          style={{
            marginBottom: '1.25rem',
            padding: '1rem 1.2rem',
            borderColor:
              'rgba(0, 212, 255, 0.25)',
          }}
        >

          <div
            style={{
              color: '#00d4ff',
              fontWeight: 600,
              marginBottom: '0.35rem',
            }}
          >
            🇮🇳 India Monitoring
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '0.82rem',
              lineHeight: 1.5,
              color: 'var(--text-muted)',
            }}
          >
            This dashboard is configured for India.
            The displayed monitoring entries are
            application-level risk indicators, not
            official government warnings. Location-specific
            analysis should be performed from the Map page.
          </p>

        </div>

        {/* =================================================
            SEVERITY SUMMARY
        ================================================= */}

        <div className="severity-chips">

          <div
            className="severity-chip severity-chip--critical"
          >
            <span>⚠</span>{' '}
            {counts.critical} Critical
          </div>

          <div
            className="severity-chip severity-chip--high"
          >
            <span>▲</span>{' '}
            {counts.high} High
          </div>

          <div
            className="severity-chip severity-chip--medium"
          >
            <span>◆</span>{' '}
            {counts.medium} Medium
          </div>

          <div
            className="severity-chip severity-chip--low"
          >
            <span>●</span>{' '}
            {counts.low} Low
          </div>

        </div>

        {/* =================================================
            FILTER TABS
        ================================================= */}

        <div className="filter-tabs">

          {FILTER_OPTIONS.map((option) => (

            <button
              key={option}
              className={`filter-tab${
                filter === option
                  ? ' filter-tab--active'
                  : ''
              }`}
              onClick={() =>
                setFilter(option)
              }
            >
              {option}
            </button>

          ))}

        </div>

        {/* =================================================
            ALERT LIST
        ================================================= */}

        <div className="alert-list">

          {filtered.length === 0 ? (

            <p
              style={{
                color:
                  'var(--text-muted)',
              }}
            >
              No alerts for this severity
              level.
            </p>

          ) : (

            filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
              />
            ))

          )}

        </div>

        {/* =================================================
            REPORT INFORMATION
        ================================================= */}

        <div className="report-info card">

          <h3>
            📄 PDF Report Contents
          </h3>

          <div className="report-info__grid">

            {[
              'Location & coordinate metadata',
              'Overall risk score & level',
              'Per-hazard breakdown table',
              'Population & infrastructure exposure',
              'AI-generated risk narrative',
              'Vulnerability index scores',
            ].map((item) => (

              <div
                key={item}
                className="report-info__item"
              >

                <span
                  className="report-info__check"
                >
                  ✓
                </span>

                {item}

              </div>

            ))}

          </div>

          <p
            style={{
              fontSize: '0.8rem',
              color:
                'var(--text-muted)',
              marginTop: '0.75rem',
            }}
          >
            India-wide monitoring is shown until
            location-specific analysis data is
            available from the FastAPI/GEE backend.
          </p>

        </div>

      </div>

    </div>
  )
}