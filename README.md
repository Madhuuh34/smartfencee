# SMARTFENCE AI — Protect Crops, Save Wildlife

**SmartFence AI** is an intelligent, ethical, and non-lethal wildlife intrusion monitoring and crop protection digital twin. Designed for agro-forest fringe communities and high-value agricultural zones, SmartFence AI detects approaching wildlife using optical edge AI cameras and ultrasonic sensors, and safely diverts animals away from crop beds using automated, pressurized eco-water spray deterrence—guaranteeing **100% wildlife safety with zero injury**.

---

## 🌟 Key Highlights & Architecture

### 1. 🎮 Live Prototype Demo (3D Digital Twin)
- **High-Performance 3D Simulation**: Built with Three.js featuring crop rows, soil paths, boundary wire fencing, camera poles, ultrasonic sensor nodes, and water pump stations.
- **Procedural 3D Animated Wildlife**:
  - **Spotted Deer (*Axis axis*)**: Slender body, antlers, 4-beat walking leg gait.
  - **Wild Boar (*Sus scrofa*)**: Stocky torso, tusks, rapid trotting gait.
  - **Asian Elephant (*Elephas maximus*)**: Columnar pillar legs, swinging trunk, flapping ears.
  - **Field Rat (*Bandicota bengalensis*)**: Rapid scurry legs, elongated tail.
- **Screen-Projected HUD Bounding Box**: Tracks the animal's 3D world position projected onto screen coordinates with real-time target status.
- **Parabolic Water Spray Particle Physics**:
  - High-velocity bright cyan droplets launched in a gravity arc.
  - Realistic fan spread, mist formation, and ground collision splashes.
  - Water tank reserve depletion and live pump status LED feedback.
- **End-to-End 8-Stage Demonstration Flow**:
  1. *Monitoring* — Normal sentinel patrol.
  2. *Animal Approaching* — Boundary path approach from forest edge.
  3. *Camera Capture* — Optical PTZ tracking lock.
  4. *AI Detection* — Simulated YOLO-v11 species inference (e.g., 94.6% DEMO).
  5. *Sensor Reading* — Ultrasonic proximity threshold breach (&le; 4.5m).
  6. *Water Deterrence* — Pressurized water spray fan activates; animal safely turns around.
  7. *Event Recorded* — Cryptographic incident ID logged and simulated SMS alert generated.
  8. *Demo Complete* — Animal safely returns to forest cover; system returns to standby.

---

### 2. 🛰️ Geospatial Satellite Map (GIS Console)
- **High-Resolution Satellite Imagery**: Integrated with Esri World Imagery and OpenStreetMap tile layers.
- **Farm Boundary & Sector Polygons**:
  - *Zone A — North Orchard* (Citrus & Mango, 4.2 ha)
  - *Zone B — East Cornfield* (Sweet Maize, 3.8 ha)
  - *Zone C — South Vegetables* (Root & Tuber Beds, 2.9 ha)
  - *Zone D — West Vineyard* (Table Grapes, 3.1 ha)
- **Synchronized Real-Time Animal Marker**: Position updates simultaneously with the 3D scene along matching waypoints (labeled `SIMULATED ANIMAL PATH`).
- **Device Overlays**: Optical camera 75° FOV cones, ultrasonic transceiver nodes, and water pump location.
- **Active Incident Highlights**: Zones pulse amber/red during breach events, retaining permanent historical route trails.

---

### 3. 📹 Cameras & AI Vision Hub
- **Multi-Camera Grid**: Surveillance views across North Gate, East Corridor, South Border, and West Perimeter.
- **Dual Vision Modes**:
  - **Optical HD**: Crisp daylight agricultural monitoring.
  - **Thermal Night Vision**: Heat-signature false-color gradient visualization.
- **AI Computer Vision Overlays**: Real-time bounding boxes with species labels, confidence metrics, and PTZ coordinates.

---

### 4. 📡 Ultrasonic Proximity Telemetry
- **Mesh Transceivers**: 40 kHz ultrasonic acoustic sensors.
- **Real-Time Gauges**: Proximity distance visualization with dynamic threshold boundary markers.
- **Echo Waveform History**: 20-second rolling sparkline showing target approach and retreat patterns.

---

### 5. 💧 Eco-Water Deterrence Hardware
- **1,500L Reservoir Tracking**: Real-time water reserve level monitor with simulated consumption per spray event.
- **Directional Turret Nozzle**: Rotates toward a safe buffer area in front of the target without direct eye contact.
- **Manual Overrides**: Instant `TEST WATER SPRAY` and `STOP SPRAY` controls for physical verification.
- **Configurable Burst Durations**: 3s, 5s, 8s, or 10s deterrence intervals.

---

### 6. 📜 Incident Logs & Audit Trail
- **Immutable Log Storage**: Verified incident history with unique IDs, species data, sensor readings, and timestamps.
- **CSV Export**: One-click audit trail download for farm managers and conservation officers.
- **SMS Sandbox Notice**: Farmer SMS alert status explicitly marked `SIMULATED — NOT SENT`.

---

### 7. ⚙️ System Calibration & Ethical Charter
- **Threshold Calibration**: Adjust AI confidence cutoff (60%–95%) and ultrasonic distance breach triggers (2.0m–8.0m).
- **Ethical Wildlife Charter**: 100% non-lethal deterrence—strictly no high-voltage electric shocks, no snares, and no toxic chemical repellents.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **3D Graphics & Physics** | Three.js (BufferGeometry particle systems, procedural meshes, OrbitControls) |
| **Geospatial Mapping** | Leaflet with Esri World Imagery satellite tiles |
| **Styling & Design** | Tailwind CSS v4 (Forest-green dark palette, cyan/emerald neon accents, glassmorphism) |
| **Audio Feedback** | Web Audio API (Synthesized acoustic pulses, water spray rush, alert tones) |
| **Icons & UI** | Lucide React, Motion |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun

### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

The application runs at `http://localhost:3000`.

---

## 🔒 Verification & Compliance
- **Simulated Demonstration Disclosure**: All AI detection inferences, ultrasonic distance drops, hardware actuations, and SMS notifications in this prototype are clearly labeled as simulations for hackathon presentation and demonstration safety.
