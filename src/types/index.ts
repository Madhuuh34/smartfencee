export type AnimalType = 'wild_boar' | 'deer' | 'elephant' | 'rat';

export interface AnimalConfig {
  id: AnimalType;
  name: string;
  scientificName: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe';
  typicalSpeedMps: number;
  color: string;
  description: string;
  deterrenceType: 'Safe Water Spray' | 'Ultrasonic + Water Spray';
}

export type DemoStage =
  | 'idle'
  | 'monitoring'
  | 'approaching'
  | 'capturing'
  | 'detecting'
  | 'sensing'
  | 'spraying'
  | 'recording'
  | 'departing'
  | 'completed';

export interface StageInfo {
  id: DemoStage;
  label: string;
  stepNumber: number;
  durationMs: number;
  description: string;
  statusBadge: string;
}

export interface FarmZone {
  id: string;
  name: string;
  crop: string;
  areaHa: number;
  status: 'secure' | 'warning' | 'breached';
  cameraCount: number;
  sensorsCount: number;
  bounds: [number, number][]; // Leaflet lat, lng polygon
  center: [number, number];
  color: string;
}

export interface CameraNode {
  id: string;
  name: string;
  zoneId: string;
  status: 'active' | 'scanning' | 'tracking' | 'offline';
  headingDeg: number;
  fovDeg: number;
  rangeMeters: number;
  lat: number;
  lng: number;
  worldPos: [number, number, number]; // 3D world coords [x, y, z]
}

export interface SensorNode {
  id: string;
  name: string;
  zoneId: string;
  type: 'ultrasonic' | 'pir';
  currentDistanceM: number;
  normalDistanceM: number;
  thresholdM: number;
  lat: number;
  lng: number;
  worldPos: [number, number, number];
}

export interface DeterrenceEvent {
  id: string;
  timestamp: string;
  isoDate: string;
  animalType: AnimalType;
  animalName: string;
  confidence: number;
  zoneId: string;
  zoneName: string;
  cameraId: string;
  sensorId: string;
  sensorDistanceM: number;
  pumpDurationSec: number;
  pumpStatus: 'Success' | 'Manual' | 'Aborted';
  deterrenceResponse: string;
  smsStatus: 'SIMULATED — NOT SENT';
  verified: boolean;
  notes: string;
}

export interface Waypoint {
  x: number;
  z: number;
  lat: number;
  lng: number;
  progress: number; // 0 to 1
  label?: string;
}
