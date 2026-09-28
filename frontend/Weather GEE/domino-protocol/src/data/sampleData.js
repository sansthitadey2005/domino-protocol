// Sample data used when not connected to a live backend

export const sampleRiskResult = {
  location: { name: 'Dhaka, Bangladesh', lat: 23.8103, lon: 90.4125 },
  riskScore: 78,
  riskLevel: 'High',
  analyzedAt: '2026-09-28T09:14:00Z',
  hazards: [
    { name: 'Flooding',       score: 85, trend: 'up' },
    { name: 'Extreme Rainfall', score: 79, trend: 'up' },
    { name: 'Landslide',      score: 44, trend: 'stable' },
    { name: 'Heat Stress',    score: 62, trend: 'up' },
    { name: 'Cyclone',        score: 70, trend: 'up' },
    { name: 'Drought',        score: 35, trend: 'down' },
  ],
  exposure: {
    population: 21_000_000,
    area_km2: 360,
    criticalInfrastructure: 142,
    agricultureHa: 18_000,
  },
  vulnerability: {
    social: 71,
    economic: 65,
    physical: 80,
    adaptive: 38,
  },
  aiSummary:
    'Dhaka faces severe compound climate risk driven primarily by riverine and pluvial flooding compounded by high population density and inadequate drainage infrastructure. Monsoon intensification trends increase the probability of 1-in-10-year flood events occurring every 3–4 years by 2035. Immediate investments in early-warning systems and community-level preparedness are critical priorities.',
  monthlyRainfall: [
    { month: 'Jan', mm: 8 },
    { month: 'Feb', mm: 19 },
    { month: 'Mar', mm: 56 },
    { month: 'Apr', mm: 125 },
    { month: 'May', mm: 256 },
    { month: 'Jun', mm: 380 },
    { month: 'Jul', mm: 432 },
    { month: 'Aug', mm: 390 },
    { month: 'Sep', mm: 310 },
    { month: 'Oct', mm: 178 },
    { month: 'Nov', mm: 40 },
    { month: 'Dec', mm: 12 },
  ],
  riskHistory: [
    { year: '2020', score: 58 },
    { year: '2021', score: 63 },
    { year: '2022', score: 67 },
    { year: '2023', score: 71 },
    { year: '2024', score: 74 },
    { year: '2025', score: 78 },
  ],
}

export const sampleAlerts = [
  {
    id: 1,
    severity: 'critical',
    title: 'Extreme Flood Warning – Buriganga Basin',
    location: 'Dhaka, Bangladesh',
    issuedAt: '2026-09-28T06:00:00Z',
    expiresAt: '2026-09-30T06:00:00Z',
    description:
      'Water levels in the Buriganga River have exceeded the danger mark by 2.4 m. Immediate evacuation of low-lying zones (Zones A–D) is advised. Emergency shelters are open at designated relief centres.',
    actions: [
      'Evacuate zones A–D immediately',
      'Move to flood shelters at coordinates provided',
      'Avoid all road travel in affected zones',
      'Keep emergency kit ready (water, medicines, documents)',
    ],
  },
  {
    id: 2,
    severity: 'high',
    title: 'Heavy Rainfall Advisory – 72-Hour Outlook',
    location: 'Sylhet Division',
    issuedAt: '2026-09-28T08:00:00Z',
    expiresAt: '2026-10-01T08:00:00Z',
    description:
      'A low-pressure system in the Bay of Bengal is expected to bring 200–300 mm of rainfall over 72 hours. Flash flooding and landslides are probable in hilly terrains.',
    actions: [
      'Reinforce rooftops and drainage channels',
      'Clear debris from drains and culverts',
      'Prepare emergency food and water supplies for 72 hours',
      'Monitor BMET forecasts every 6 hours',
    ],
  },
  {
    id: 3,
    severity: 'medium',
    title: 'Cyclone Watch – Bay of Bengal',
    location: 'Coastal Bangladesh',
    issuedAt: '2026-09-27T14:00:00Z',
    expiresAt: '2026-09-29T14:00:00Z',
    description:
      'A tropical depression is developing 350 km south of the coast. Current trajectory models suggest possible landfall near Khulna. Fishermen advised not to venture into the sea.',
    actions: [
      'All fishing vessels return to port immediately',
      'Secure loose objects and windows',
      'Know the location of your nearest cyclone shelter',
      'Follow official advisories from BMD',
    ],
  },
  {
    id: 4,
    severity: 'low',
    title: 'Heat Stress Alert – Urban Heat Island',
    location: 'Dhaka Metro Area',
    issuedAt: '2026-09-26T10:00:00Z',
    expiresAt: '2026-09-28T20:00:00Z',
    description:
      'Temperatures expected to reach 39°C with high humidity, creating dangerous heat index conditions for outdoor workers and vulnerable populations.',
    actions: [
      'Limit outdoor activity between 11 AM – 4 PM',
      'Stay hydrated – at least 3 litres of water per day',
      'Check on elderly neighbours and relatives',
      'Use cooling centres where available',
    ],
  },
]

export const hazardOptions = [
  { value: 'flood', label: 'Flooding' },
  { value: 'rainfall', label: 'Extreme Rainfall' },
  { value: 'landslide', label: 'Landslide' },
  { value: 'cyclone', label: 'Cyclone / Tropical Storm' },
  { value: 'heat', label: 'Heat Stress' },
  { value: 'drought', label: 'Drought' },
  { value: 'sealevel', label: 'Sea Level Rise' },
  { value: 'earthquake', label: 'Earthquake' },
]
