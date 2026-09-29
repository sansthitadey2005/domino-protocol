import React, { useState } from 'react'
import {
  MapContainer,
  TileLayer,
  LayersControl,
  CircleMarker,
  Tooltip,
  useMapEvents,
} from 'react-leaflet'
import './MapPage.css'

const { BaseLayer } = LayersControl

// ---------------------------------------------------------
// MAP CLICK HANDLER
// ---------------------------------------------------------

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return null
}

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

function formatNumber(value, decimals = 2) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return '—'
  }

  return number.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  })
}

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------

export default function MapPage() {
  const [clickedCoord, setClickedCoord] = useState(null)

  const [geeData, setGeeData] = useState(null)

  const [analysis, setAnalysis] = useState(null)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)

  // -------------------------------------------------------
  // SELECT LOCATION
  // -------------------------------------------------------

  const handleLocationSelect = async (latitude, longitude) => {
    setClickedCoord({
      lat: latitude,
      lng: longitude,
    })

    setGeeData(null)
    setAnalysis(null)
    setError(null)
    setLoading(true)

    try {
      // ---------------------------------------------------
      // 1. GET ACTUAL GEE DATA FOR SELECTED LOCATION
      // ---------------------------------------------------

      const geeResponse = await fetch(
        `http://127.0.0.1:8000/gee-data?latitude=${encodeURIComponent(
          latitude
        )}&longitude=${encodeURIComponent(longitude)}`
      )

      if (!geeResponse.ok) {
        const errorText = await geeResponse.text()

        throw new Error(
          errorText || `GEE request failed: ${geeResponse.status}`
        )
      }

      const gee = await geeResponse.json()

      console.log('SELECTED LOCATION GEE DATA:', gee)

      setGeeData(gee)

      // ---------------------------------------------------
      // 2. SEND CORRECT REQUEST TO /analyze
      // ---------------------------------------------------

      const analyzeResponse = await fetch(
        'http://127.0.0.1:8000/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: `Selected location (${latitude.toFixed(
              4
            )}, ${longitude.toFixed(4)})`,

            latitude: latitude,

            longitude: longitude,

            text: 'Analyze the climate and geographic risk of this selected location.',
          }),
        }
      )

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text()

        throw new Error(
          errorText || `Analysis request failed: ${analyzeResponse.status}`
        )
      }

      const result = await analyzeResponse.json()

      console.log('LOCATION ANALYSIS:', result)

      setAnalysis(result)
    } catch (err) {
      console.error('Location analysis failed:', err)

      setError(err.message || 'Unable to analyze selected location.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <div className="map-page">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="map-sidebar">

        <div className="map-sidebar__header">
          <h2>Map Layers</h2>

          <p>
            Click anywhere on the map to analyze that
            geographic location.
          </p>
        </div>

        {/* -------------------------------------------------
            INFORMATION
        ------------------------------------------------- */}

        <div className="map-sidebar__section">

          <h3>Data Source</h3>

          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            Geographic values are retrieved from the
            location-specific GEE dataset.
          </p>

        </div>

        <hr className="divider" />

        {/* =================================================
            SELECTED LOCATION
        ================================================= */}

        {clickedCoord && (
          <>
            <div className="map-sidebar__section">

              <h3>Selected Location</h3>

              <div className="coord-display">

                <div>
                  <span>Lat</span>{' '}
                  {clickedCoord.lat.toFixed(5)}
                </div>

                <div>
                  <span>Lon</span>{' '}
                  {clickedCoord.lng.toFixed(5)}
                </div>

              </div>

            </div>

            <hr className="divider" />
          </>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="map-sidebar__section">

            <p
              style={{
                color: '#00d4ff',
                fontSize: '0.85rem',
              }}
            >
              Loading geographic data...
            </p>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="map-sidebar__section">

            <h3 style={{ color: '#ff5c5c' }}>
              Error
            </h3>

            <p
              style={{
                color: '#ff8a8a',
                fontSize: '0.78rem',
                lineHeight: 1.5,
                wordBreak: 'break-word',
              }}
            >
              {error}
            </p>

          </div>
        )}

        {/* =================================================
            GEE DATA
        ================================================= */}

        {geeData && (
          <>
            <div className="map-sidebar__section">

              <h3>Location Data</h3>

              <div
                style={{
                  display: 'grid',
                  gap: '10px',
                  marginTop: '12px',
                }}
              >

                <div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
                    }}
                  >
                    Rainfall
                  </div>

                  <strong>
                    {formatNumber(geeData.rainfall_mm)} mm
                  </strong>
                </div>

                <div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
                    }}
                  >
                    Elevation
                  </div>

                  <strong>
                    {formatNumber(geeData.elevation_m)} m
                  </strong>
                </div>

                <div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
                    }}
                  >
                    Population
                  </div>

                  <strong>
                    {formatNumber(geeData.population)}
                  </strong>
                </div>

                <div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
                    }}
                  >
                    Built-up Area
                  </div>

                  <strong>
                    {formatNumber(geeData.builtup_area_m2)} m²
                  </strong>
                </div>

                <div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
                    }}
                  >
                    Coastal Flood Depth
                  </div>

                  <strong>
                    {formatNumber(
                      geeData.coastal_flood_depth_m
                    )}{' '}
                    m
                  </strong>
                </div>

                <div>
                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
                    }}
                  >
                    Landcover
                  </div>

                  <strong>
                    {formatNumber(geeData.landcover)}
                  </strong>
                </div>

              </div>

            </div>

            <hr className="divider" />
          </>
        )}

        {/* =================================================
            ANALYSIS
        ================================================= */}

        {analysis && (
          <>
            <div className="map-sidebar__section">

              <h3>Risk Analysis</h3>

              <p
                style={{
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  marginTop: '10px',
                }}
              >
                {analysis.summary}
              </p>

              {Array.isArray(analysis.risks) &&
                analysis.risks.length > 0 && (
                  <div style={{ marginTop: '14px' }}>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginBottom: '6px',
                      }}
                    >
                      RISKS
                    </div>

                    <ul
                      style={{
                        paddingLeft: '18px',
                        margin: 0,
                        fontSize: '0.78rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {analysis.risks.map((risk, index) => (
                        <li key={index}>
                          {risk}
                        </li>
                      ))}
                    </ul>

                  </div>
                )}

            </div>

            <hr className="divider" />
          </>
        )}

        {/* =================================================
            INSTRUCTION
        ================================================= */}

        <div className="map-sidebar__section">

          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            Click a location on the map. Only data associated
            with the selected geographic coordinates will be
            loaded.
          </p>

        </div>

      </aside>

      {/* ===================================================
          MAP
      =================================================== */}

      <div className="map-container">

        <MapContainer
          center={[23.8103, 90.4125]}
          zoom={7}
          style={{
            height: '100%',
            width: '100%',
          }}
          zoomControl={true}
        >

          {/* =================================================
              BASE MAPS
          ================================================= */}

          <LayersControl position="topright">

            <BaseLayer
              checked
              name="OpenStreetMap"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>

            <BaseLayer name="Satellite (ESRI)">
              <TileLayer
                attribution="&copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </BaseLayer>

          </LayersControl>

          {/* =================================================
              MAP CLICK
          ================================================= */}

          <MapClickHandler
            onLocationSelect={handleLocationSelect}
          />

          {/* =================================================
              SELECTED LOCATION ONLY
              
              IMPORTANT:
              There are NO hard-coded Dhaka circles here.
          ================================================= */}

          {clickedCoord && (
            <CircleMarker
              center={[
                clickedCoord.lat,
                clickedCoord.lng,
              ]}
              radius={9}
              pathOptions={{
                color: '#00d4ff',
                fillColor: '#00d4ff',
                fillOpacity: 0.9,
                weight: 3,
              }}
            >
              <Tooltip permanent>
                Selected Location
              </Tooltip>
            </CircleMarker>
          )}

        </MapContainer>

      </div>

    </div>
  )
}