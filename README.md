# Domino Protocol

AI-powered climate risk analysis and disaster preparedness platform.

Domino Protocol combines geospatial data, climate-risk indicators, interactive mapping, and AI-generated analysis to help users understand environmental risks at selected locations.

## Features

- Interactive geographic risk map
- Location-based climate risk analysis
- Flood, rainfall, elevation, and infrastructure layers
- GEE-based geographic data
- AI-assisted climate risk assessment
- Risk scoring and risk-level classification
- Alerts and warnings interface
- Results and analysis dashboards
- PDF risk report generation
- Satellite and OpenStreetMap map views

## Tech Stack

### Frontend

- React
- Vite
- React Leaflet
- Leaflet
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- Pydantic
- Google Gemini API
- CSV/GEE geospatial data

### Mapping & Geospatial Data

- OpenStreetMap
- ESRI satellite imagery
- Google Earth Engine derived data

## Project Structure

```text
domino-protocol/
│
├── backend/
│   ├── main.py
│   └── ...
│
├── frontend/
│   └── Weather GEE/
│       └── domino-protocol/
│           ├── src/
│           │   ├── api/
│           │   ├── components/
│           │   ├── data/
│           │   └── pages/
│           │
│           ├── package.json
│           └── vite.config.js
│
├── domino-analysis-patched/
│   └── ...
│
└── README.md