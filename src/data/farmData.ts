import { AnimalConfig, AnimalType, CameraNode, FarmZone, SensorNode, StageInfo, Waypoint } from '../types';

export const ANIMALS: Record<AnimalType, AnimalConfig> = {
  deer: {
    id: 'deer',
    name: 'Spotted Deer (Chital)',
    scientificName: 'Axis axis',
    riskLevel: 'Medium',
    typicalSpeedMps: 3.2,
    color: '#F59E0B',
    description: 'Herbivorous ruminant that browses young shoot tips and tender foliage in orchards.',
    deterrenceType: 'Safe Water Spray',
  },
  wild_boar: {
    id: 'wild_boar',
    name: 'Wild Boar',
    scientificName: 'Sus scrofa',
    riskLevel: 'High',
    typicalSpeedMps: 2.8,
    color: '#EF4444',
    description: 'Heavy burrower capable of uprooting tubers and destroying root vegetables rapidly.',
    deterrenceType: 'Ultrasonic + Water Spray',
  },
  elephant: {
    id: 'elephant',
    name: 'Asian Elephant',
    scientificName: 'Elephas maximus',
    riskLevel: 'Severe',
    typicalSpeedMps: 2.1,
    color: '#8B5CF6',
    description: 'Mega-herbivore prone to crop-raiding banana, sugarcane, and paddy fields near forest margins.',
    deterrenceType: 'Safe Water Spray',
  },
  rat: {
    id: 'rat',
    name: 'Field Rat / Bandicoot',
    scientificName: 'Bandicota bengalensis',
    riskLevel: 'Low',
    typicalSpeedMps: 1.5,
    color: '#10B981',
    description: 'Nocturnal rodent causing grain loss, wire chewing, and irrigation pipe damage.',
    deterrenceType: 'Ultrasonic + Water Spray',
  },
};

// Base geospatial anchor: Highland Agro-Forest Fringe (lat 11.4125, lng 76.6980)
export const FARM_CENTER: [number, number] = [11.4125, 76.6980];

export const FARM_BOUNDS_POLYGON: [number, number][] = [
  [11.4145, 76.6955],
  [11.4146, 76.7005],
  [11.4105, 76.7006],
  [11.4104, 76.6954],
];

export const FARM_ZONES: FarmZone[] = [
  {
    id: 'zone-north',
    name: 'Zone A — North Orchard',
    crop: 'Citrus & Mango',
    areaHa: 4.2,
    status: 'secure',
    cameraCount: 2,
    sensorsCount: 3,
    bounds: [
      [11.4126, 76.6955],
      [11.4145, 76.6955],
      [11.4146, 76.7005],
      [11.4126, 76.7005],
    ],
    center: [11.4136, 76.6980],
    color: '#10B981',
  },
  {
    id: 'zone-east',
    name: 'Zone B — East Cornfield',
    crop: 'Sweet Maize',
    areaHa: 3.8,
    status: 'warning',
    cameraCount: 2,
    sensorsCount: 2,
    bounds: [
      [11.4126, 76.6980],
      [11.4146, 76.6980],
      [11.4146, 76.7005],
      [11.4105, 76.7005],
      [11.4105, 76.6980],
    ],
    center: [11.4125, 76.6993],
    color: '#F59E0B',
  },
  {
    id: 'zone-south',
    name: 'Zone C — South Vegetables',
    crop: 'Root & Tuber Beds',
    areaHa: 2.9,
    status: 'secure',
    cameraCount: 1,
    sensorsCount: 2,
    bounds: [
      [11.4104, 76.6954],
      [11.4126, 76.6955],
      [11.4126, 76.6980],
      [11.4105, 76.6980],
    ],
    center: [11.4115, 76.6967],
    color: '#06B6D4',
  },
  {
    id: 'zone-west',
    name: 'Zone D — West Vineyard',
    crop: 'Table Grapes',
    areaHa: 3.1,
    status: 'secure',
    cameraCount: 1,
    sensorsCount: 2,
    bounds: [
      [11.4126, 76.6955],
      [11.4145, 76.6955],
      [11.4126, 76.6980],
      [11.4104, 76.6954],
    ],
    center: [11.4125, 76.6962],
    color: '#8B5CF6',
  },
];

export const CAMERAS: CameraNode[] = [
  {
    id: 'CAM-01-N',
    name: 'Camera 01 (North Gate)',
    zoneId: 'zone-north',
    status: 'active',
    headingDeg: 175,
    fovDeg: 78,
    rangeMeters: 45,
    lat: 11.4142,
    lng: 76.6978,
    worldPos: [0, 2.5, -16],
  },
  {
    id: 'CAM-02-E',
    name: 'Camera 02 (East Corridor)',
    zoneId: 'zone-east',
    status: 'active',
    headingDeg: 260,
    fovDeg: 72,
    rangeMeters: 40,
    lat: 11.4128,
    lng: 76.7001,
    worldPos: [16, 2.5, -2],
  },
  {
    id: 'CAM-03-S',
    name: 'Camera 03 (South Border)',
    zoneId: 'zone-south',
    status: 'active',
    headingDeg: 10,
    fovDeg: 70,
    rangeMeters: 38,
    lat: 11.4108,
    lng: 76.6970,
    worldPos: [-4, 2.5, 15],
  },
  {
    id: 'CAM-04-W',
    name: 'Camera 04 (West Perimeter)',
    zoneId: 'zone-west',
    status: 'active',
    headingDeg: 85,
    fovDeg: 75,
    rangeMeters: 42,
    lat: 11.4122,
    lng: 76.6958,
    worldPos: [-17, 2.5, 0],
  },
];

export const SENSORS: SensorNode[] = [
  {
    id: 'SEN-01-US',
    name: 'Ultrasonic Node #1 (East Boundary)',
    zoneId: 'zone-east',
    type: 'ultrasonic',
    currentDistanceM: 14.2,
    normalDistanceM: 15.0,
    thresholdM: 4.5,
    lat: 11.4126,
    lng: 76.6996,
    worldPos: [11, 0.9, -1],
  },
  {
    id: 'SEN-02-US',
    name: 'Ultrasonic Node #2 (North Gap)',
    zoneId: 'zone-north',
    type: 'ultrasonic',
    currentDistanceM: 18.0,
    normalDistanceM: 18.0,
    thresholdM: 5.0,
    lat: 11.4140,
    lng: 76.6972,
    worldPos: [-2, 0.9, -14],
  },
  {
    id: 'SEN-03-PIR',
    name: 'PIR Motion Sensor #3 (Center Orchard)',
    zoneId: 'zone-north',
    type: 'pir',
    currentDistanceM: 9.5,
    normalDistanceM: 10.0,
    thresholdM: 3.0,
    lat: 11.4132,
    lng: 76.6982,
    worldPos: [2, 0.9, -6],
  },
];

export const WATER_PUMP_LOCATION = {
  id: 'PUMP-01',
  name: 'Central Eco-Spray Pump Station',
  lat: 11.4124,
  lng: 76.6988,
  worldPos: [6.5, 0, -2.5] as [number, number, number],
  nozzlePos: [6.8, 1.4, -2.2] as [number, number, number],
  tankCapacityLiters: 1500,
  currentLevelLiters: 1340,
};

// Continuous waypoint path for animal intrusion scenario:
// Starts outside the farm boundary -> crosses boundary fence -> walks between crops ->
// approaches camera & ultrasonic sensor coverage -> deterrence spray triggered ->
// turns around safely -> retreats back across perimeter.
export const SIMULATION_WAYPOINTS: Waypoint[] = [
  // Outside boundary
  { x: 23, z: 8, lat: 11.4116, lng: 76.7018, progress: 0.00, label: 'Forest Edge Outside Boundary' },
  { x: 19, z: 5, lat: 11.4120, lng: 76.7011, progress: 0.12, label: 'Approaching Perimeter Wire' },
  // Crosses fence
  { x: 14.5, z: 2, lat: 11.4123, lng: 76.7003, progress: 0.24, label: 'Fence Breach - Entering East Zone' },
  // Walks between crop rows
  { x: 10.5, z: 0, lat: 11.4125, lng: 76.6995, progress: 0.38, label: 'Walking Along Cornfield Ridge' },
  // Detection point (near camera CAM-02 and sensor SEN-01, within spray reach)
  { x: 7.2, z: -1.2, lat: 11.4126, lng: 76.6990, progress: 0.52, label: 'Detection Zone (Camera & Sensor Focus)' },
  // Pause / deterrence point where water spray hits nearby ground
  { x: 6.0, z: -0.5, lat: 11.4126, lng: 76.6987, progress: 0.62, label: 'Deterrence Impact Area' },
  // Turning away startled / safely fleeing
  { x: 8.5, z: 2.2, lat: 11.4124, lng: 76.6992, progress: 0.74, label: 'Turning Away From Water Spray' },
  { x: 13.0, z: 5.5, lat: 11.4121, lng: 76.7001, progress: 0.86, label: 'Retreating Along Perimeter Path' },
  { x: 21, z: 9.5, lat: 11.4115, lng: 76.7015, progress: 1.00, label: 'Exited Farm Boundary Safely' },
];

export const STAGES_CONFIG: StageInfo[] = [
  {
    id: 'monitoring',
    label: '1. Monitoring',
    stepNumber: 1,
    durationMs: 3000,
    description: 'Farm perimeter secure. AI optical cameras and ultrasonic nodes in active sentinel sweep.',
    statusBadge: 'NORMAL MONITORING',
  },
  {
    id: 'approaching',
    label: '2. Animal Approaching',
    stepNumber: 2,
    durationMs: 4000,
    description: 'Perimeter movement detected. Animal approaches boundary along trail from forest edge.',
    statusBadge: 'PERIMETER ALERT',
  },
  {
    id: 'capturing',
    label: '3. Camera Capture',
    stepNumber: 3,
    durationMs: 3000,
    description: 'Optical PTZ tracking lock engaged. Camera 02 rotates to frame subject.',
    statusBadge: 'OPTICAL LOCK',
  },
  {
    id: 'detecting',
    label: '4. AI Detection',
    stepNumber: 4,
    durationMs: 3500,
    description: 'Simulated YOLO edge inference model identifies species class with 94.6% confidence.',
    statusBadge: 'SIMULATED AI DETECTION',
  },
  {
    id: 'sensing',
    label: '5. Sensor Reading',
    stepNumber: 5,
    durationMs: 3000,
    description: 'Ultrasonic echo confirms subject range down to 2.4m, breaching safety threshold of 4.5m.',
    statusBadge: 'PROXIMITY BREACH',
  },
  {
    id: 'spraying',
    label: '6. Water Deterrence',
    stepNumber: 6,
    durationMs: 5000,
    description: 'Pump activates. Physical cyan water jet fans across perimeter buffer. Animal turns away harmlessly.',
    statusBadge: 'ECO WATER SPRAY ACTIVE',
  },
  {
    id: 'recording',
    label: '7. Event Recorded',
    stepNumber: 7,
    durationMs: 3000,
    description: 'Incident log created with cryptographic event ID. SMS alert logged (SIMULATED — NOT SENT).',
    statusBadge: 'INCIDENT LOGGED',
  },
  {
    id: 'departing',
    label: '8. Demo Complete',
    stepNumber: 8,
    durationMs: 4000,
    description: 'Animal safely retreats to forest cover. Water pump shuts off. System returns to standby monitoring.',
    statusBadge: 'FARM SECURED',
  },
];
