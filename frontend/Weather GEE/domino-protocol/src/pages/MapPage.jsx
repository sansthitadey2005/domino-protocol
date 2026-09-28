import React, { useState } from 'react'
import { MapContainer, TileLayer, LayersControl, Circle, Tooltip, useMapEvents } from 'react-leaflet'
import './MapPage.css'

const { BaseLayer, Overlay } = LayersControl

// Sample overlay data points
const FLOOD_ZONES = [
  { lat: 23.73, lon: 90.39, radius: 4000, color: '#00d4ff', label: 'Flood Zone A' },
  { lat: 23.78, lon: 90.45, radius: 6000, color: '#00d4ff', label: 'Flood Zone B' },
  { lat: 23.70, lon: 90.42, radius: 3500, color: '#0088cc', label: 'Flood Zone C' },
]

const RAINFALL_ZONES = [
  { lat: 23.85, lon: 90.40, radius: 5000, color: '#0044ff', label: '350mm/month' },
  { lat: 23.72, lon: 90.38, radius: 7000, color: '#0033bb', label: '410mm/month' },
]

const INFRASTRUCTURE = [
  { lat: 23.7946, lon: 90.4070, radius: 300, color: '#ff6b35', label: 'Shahjalal Hospital' },
  { lat: 23.7465, lon: 90.3785, radius: 300, color: '#ff6b35', label: 'Dhaka Airport' },
  { lat: 23.7259, lon: 90.4148, radius: 300, color: '#ff6b35', label: 'Buriganga Bridge' },
  { lat: 23.8103, lon: 90.4125, radius: 300, color: '#ffd700', label: 'Power Station North' },
]

const ELEVATION_ZONES = [
  { lat: 23.76, lon: 90.37, radius: 8000, color: '#00ff9d', label: 'High Elevation (>15m)' },
  { lat: 23.82, lon: 90.48, radius: 5000, color: '#88ffcc', label: 'Mid Elevation (5–15m)' },
]

const LAYERS_INFO = [
  { key: 'flood',          label: 'Flood Zones',      color: '#00d4ff', icon: '💧' },
  { key: 'rainfall',       label: 'Rainfall Intensity', color: '#0044ff', icon: '🌧' },
  { key: 'elevation',      label: 'Elevation Bands',  color: '#00ff9d', icon: '⛰' },
  { key: 'infrastructure', label: 'Infrastructure',   color: '#ff6b35', icon: '🏗' },
]

function ClickMarker({ onCoord }) {
  useMapEvents({
    click(e) { onCoord(e.latlng) }
  })
  return null
}

export default function MapPage() {
  const [clickedCoord, setClickedCoord] = useState(null)
  const [activeLayers, setActiveLayers] = useState({
    flood: true, rainfall: false, elevation: false, infrastructure: true,
  })

  const toggleLayer = (key) =>
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="map-page">
      {/* Sidebar */}
      <aside className="map-sidebar">
        <div className="map-sidebar__header">
          <h2>Map Layers</h2>
          <p>Toggle overlays to explore climate risk factors.</p>
        </div>

        <div className="layer-list">
          {LAYERS_INFO.map(l => (
            <button
              key={l.key}
              className={`layer-btn${activeLayers[l.key] ? ' layer-btn--active' : ''}`}
              onClick={() => toggleLayer(l.key)}
              style={activeLayers[l.key] ? { borderColor: l.color, color: l.color } : {}}
            >
              <span>{l.icon}</span>
              <span className="layer-btn__label">{l.label}</span>
              <span className="layer-btn__dot" style={{ background: activeLayers[l.key] ? l.color : '#4a5568' }} />
            </button>
          ))}
        </div>

        <hr className="divider" />

        <div className="map-sidebar__section">
          <h3>Legend</h3>
          <div className="legend">
            {LAYERS_INFO.map(l => (
              <div key={l.key} className="legend-item">
                <span className="legend-dot" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#ff3d5a' }} />
              Critical Risk Zone
            </div>
          </div>
        </div>

        {clickedCoord && (
          <>
            <hr className="divider" />
            <div className="map-sidebar__section">
              <h3>Selected Location</h3>
              <div className="coord-display">
                <div><span>Lat</span> {clickedCoord.lat.toFixed(5)}</div>
                <div><span>Lon</span> {clickedCoord.lng.toFixed(5)}</div>
              </div>
            </div>
          </>
        )}

        <hr className="divider" />
        <div className="map-sidebar__section">
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Click anywhere on the map to capture coordinates.
            Layers are illustrative overlays based on sample data.
          </p>
        </div>
      </aside>

      {/* Map */}
      <div className="map-container">
        <MapContainer
          center={[23.8103, 90.4125]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Dark (CartoDB)">
              <TileLayer
                attribution='&copy; <a href="https://carto.com">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </BaseLayer>
            <BaseLayer name="Satellite (ESRI)">
              <TileLayer
                attribution='&copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </BaseLayer>
            <BaseLayer name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
          </LayersControl>

          <ClickMarker onCoord={setClickedCoord} />

          {/* Flood overlay */}
          {activeLayers.flood && FLOOD_ZONES.map((z, i) => (
            <Circle key={i} center={[z.lat, z.lon]} radius={z.radius}
              pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.18, weight: 1.5 }}>
              <Tooltip>{z.label}</Tooltip>
            </Circle>
          ))}

          {/* Rainfall overlay */}
          {activeLayers.rainfall && RAINFALL_ZONES.map((z, i) => (
            <Circle key={i} center={[z.lat, z.lon]} radius={z.radius}
              pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.15, weight: 1, dashArray: '6 4' }}>
              <Tooltip>{z.label}</Tooltip>
            </Circle>
          ))}

          {/* Elevation overlay */}
          {activeLayers.elevation && ELEVATION_ZONES.map((z, i) => (
            <Circle key={i} center={[z.lat, z.lon]} radius={z.radius}
              pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.12, weight: 1 }}>
              <Tooltip>{z.label}</Tooltip>
            </Circle>
          ))}

          {/* Infrastructure overlay */}
          {activeLayers.infrastructure && INFRASTRUCTURE.map((z, i) => (
            <Circle key={i} center={[z.lat, z.lon]} radius={z.radius}
              pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: 0.8, weight: 2 }}>
              <Tooltip permanent={false}>{z.label}</Tooltip>
            </Circle>
          ))}

          {/* Clicked location */}
          {clickedCoord && (
            <Circle
              center={[clickedCoord.lat, clickedCoord.lng]}
              radius={500}
              pathOptions={{ color: '#ff3d5a', fillColor: '#ff3d5a', fillOpacity: 0.6, weight: 2 }}
            >
              <Tooltip permanent>Selected</Tooltip>
            </Circle>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
