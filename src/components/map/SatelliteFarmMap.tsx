import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useFarm } from '../../context/FarmContext';
import {
  CAMERAS,
  FARM_BOUNDS_POLYGON,
  FARM_CENTER,
  FARM_ZONES,
  SENSORS,
  SIMULATION_WAYPOINTS,
  WATER_PUMP_LOCATION,
} from '../../data/farmData';
import {
  Compass,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  RotateCcw,
  Shield,
  Video,
  Radio,
  Droplet,
} from 'lucide-react';

interface SatelliteFarmMapProps {
  isFullScreenMode?: boolean;
  onToggleFullScreen?: () => void;
  heightClass?: string;
}

export const SatelliteFarmMap: React.FC<SatelliteFarmMapProps> = ({
  isFullScreenMode = false,
  onToggleFullScreen,
  heightClass = 'h-[440px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const {
    stage,
    selectedAnimal,
    selectedZoneId,
    selectedCameraId,
    animalMapPos,
    historicalMapTrail,
    events,
    setSelectedZoneId,
    setSelectedCameraId,
  } = useFarm();

  const [activeBaseLayer, setActiveBaseLayer] = useState<'satellite' | 'streets'>('satellite');
  const [showCoverageCones, setShowCoverageCones] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showPumps, setShowPumps] = useState(true);
  const [showHistoricalEvents, setShowHistoricalEvents] = useState(true);
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);

  // References to leaflet layers
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const zoneLayersRef = useRef<{ [key: string]: L.Polygon }>({});
  const animalMarkerRef = useRef<L.Marker | null>(null);
  const trailPolylineRef = useRef<L.Polyline | null>(null);
  const featureGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet map centered at FARM_CENTER
    const map = L.map(mapContainerRef.current, {
      center: FARM_CENTER,
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Default tile: Esri World Imagery (High-res Satellite)
    const satLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri',
      }
    ).addTo(map);
    baseTileLayerRef.current = satLayer;

    const featureGroup = L.layerGroup().addTo(map);
    featureGroupRef.current = featureGroup;

    // Draw Farm Outer Boundary (Glowing Emerald Polygon)
    const farmBoundary = L.polygon(FARM_BOUNDS_POLYGON, {
      color: '#10B981',
      weight: 2.5,
      dashArray: '6, 6',
      fillColor: '#10B981',
      fillOpacity: 0.08,
    }).addTo(featureGroup);

    // Draw Farm Zones
    FARM_ZONES.forEach((zone) => {
      const isSelected = zone.id === selectedZoneId;
      const isBreached = zone.id === 'zone-east' && (stage === 'detecting' || stage === 'spraying');

      const poly = L.polygon(zone.bounds, {
        color: isBreached ? '#EF4444' : isSelected ? '#F59E0B' : zone.color,
        weight: isSelected || isBreached ? 3 : 1.5,
        fillColor: isBreached ? '#EF4444' : zone.color,
        fillOpacity: isBreached ? 0.28 : isSelected ? 0.22 : 0.12,
      }).addTo(featureGroup);

      poly.bindTooltip(
        `<div class="font-mono text-xs font-bold">${zone.name}</div><div class="text-[10px] text-slate-300">${zone.crop} (${zone.areaHa} ha)</div>`,
        { permanent: false, direction: 'center', className: 'custom-leaflet-tooltip' }
      );

      poly.on('click', () => {
        setSelectedZoneId(zone.id);
      });

      zoneLayersRef.current[zone.id] = poly;
    });

    // Draw Waypoint Simulation Planned Path (Dashed White Polyline)
    const plannedCoords = SIMULATION_WAYPOINTS.map((wp) => [wp.lat, wp.lng] as [number, number]);
    L.polyline(plannedCoords, {
      color: '#94A3B8',
      weight: 2,
      dashArray: '4, 6',
      opacity: 0.6,
    }).addTo(featureGroup);

    // Add Dynamic Historical Trail Polyline (Glowing Green)
    const trailLine = L.polyline([], {
      color: '#10B981',
      weight: 3,
      opacity: 0.85,
    }).addTo(featureGroup);
    trailPolylineRef.current = trailLine;

    // Create Animated Animal Marker with custom HTML icon
    const animalIcon = L.divIcon({
      className: 'custom-animal-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-amber-500/30 border border-amber-400 animate-ping absolute"></div>
          <div class="w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-slate-950 font-bold text-[10px]">
            🐾
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap bg-slate-950/90 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shadow-md">
            SIMULATED ANIMAL PATH
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const initPos = [SIMULATION_WAYPOINTS[0].lat, SIMULATION_WAYPOINTS[0].lng] as [number, number];
    const animalMarker = L.marker(initPos, { icon: animalIcon, zIndexOffset: 1000 }).addTo(featureGroup);
    animalMarkerRef.current = animalMarker;

    // Fit map bounds comfortably around farm boundary
    map.fitBounds(farmBoundary.getBounds(), { padding: [25, 25] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer (Satellite vs Streets)
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(baseTileLayerRef.current);

    if (activeBaseLayer === 'satellite') {
      baseTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, attribution: 'Tiles &copy; Esri' }
      ).addTo(mapInstanceRef.current);
    } else {
      baseTileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '&copy; OpenStreetMap' }
      ).addTo(mapInstanceRef.current);
    }
  }, [activeBaseLayer]);

  // Update Dynamic Animal Marker Position and Historical Trail
  useEffect(() => {
    if (animalMarkerRef.current && animalMapPos) {
      animalMarkerRef.current.setLatLng(animalMapPos);
    }
    if (trailPolylineRef.current && historicalMapTrail.length > 0) {
      trailPolylineRef.current.setLatLngs(historicalMapTrail);
    }
  }, [animalMapPos, historicalMapTrail]);

  // Highlight Active Zone (Amber/Red during detection/spraying)
  useEffect(() => {
    FARM_ZONES.forEach((zone) => {
      const poly = zoneLayersRef.current[zone.id];
      if (!poly) return;

      const isBreached = zone.id === 'zone-east' && (stage === 'detecting' || stage === 'sensing' || stage === 'spraying');
      const isSelected = zone.id === selectedZoneId;

      poly.setStyle({
        color: isBreached ? '#EF4444' : isSelected ? '#F59E0B' : zone.color,
        weight: isBreached ? 3.5 : isSelected ? 3 : 1.5,
        fillColor: isBreached ? '#EF4444' : zone.color,
        fillOpacity: isBreached ? 0.32 : isSelected ? 0.22 : 0.12,
      });
    });
  }, [stage, selectedZoneId]);

  // Update Devices & Coverage Markers whenever layer toggles or devices change
  useEffect(() => {
    if (!mapInstanceRef.current || !featureGroupRef.current) return;

    // Clear previous device markers
    const group = featureGroupRef.current;

    // Cameras
    if (showCameras) {
      CAMERAS.forEach((cam) => {
        const isTargetCam = cam.id === selectedCameraId;
        const camIcon = L.divIcon({
          className: 'custom-cam-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="w-6 h-6 rounded-full ${
                isTargetCam ? 'bg-cyan-500/40 animate-ping' : 'bg-slate-700/40'
              } absolute"></div>
              <div class="w-5 h-5 rounded-full ${
                isTargetCam ? 'bg-cyan-500 border-2 border-white' : 'bg-slate-800 border border-slate-600'
              } shadow flex items-center justify-center text-[10px] text-white">
                📹
              </div>
              <div class="absolute -top-6 whitespace-nowrap bg-slate-900/90 text-cyan-300 border border-cyan-500/30 px-1 py-0.5 rounded text-[8px] font-mono">
                ${cam.id}
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const m = L.marker([cam.lat, cam.lng], { icon: camIcon }).addTo(group);
        m.on('click', () => setSelectedCameraId(cam.id));

        // Coverage Sector Cone (approximate 75 deg FOV)
        if (showCoverageCones) {
          const conePts: [number, number][] = [
            [cam.lat, cam.lng],
            [cam.lat - 0.001, cam.lng - 0.0012],
            [cam.lat - 0.0012, cam.lng + 0.0006],
          ];
          L.polygon(conePts, {
            color: '#06B6D4',
            weight: 1,
            fillColor: '#06B6D4',
            fillOpacity: isTargetCam ? 0.18 : 0.08,
            dashArray: '3, 3',
          }).addTo(group);
        }
      });
    }

    // Ultrasonic Sensors
    if (showSensors) {
      SENSORS.forEach((sen) => {
        const isBreached = sen.id === 'SEN-01-US' && (stage === 'sensing' || stage === 'detecting');
        const senIcon = L.divIcon({
          className: 'custom-sensor-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="w-5 h-5 rounded-full ${
                isBreached ? 'bg-amber-500 animate-ping' : 'bg-amber-600/30'
              } absolute"></div>
              <div class="w-4 h-4 rounded-full bg-amber-500 border border-white text-[8px] flex items-center justify-center text-slate-950 font-bold">
                📡
              </div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([sen.lat, sen.lng], { icon: senIcon }).addTo(group);
      });
    }

    // Water Pump Station
    if (showPumps) {
      const isPumping = stage === 'spraying';
      const pumpIcon = L.divIcon({
        className: 'custom-pump-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-7 h-7 rounded-full ${
              isPumping ? 'bg-cyan-400 animate-ping' : 'bg-cyan-700/20'
            } absolute"></div>
            <div class="w-5 h-5 rounded-full bg-cyan-600 border-2 border-white text-[9px] flex items-center justify-center text-white">
              💧
            </div>
            <div class="absolute -bottom-5 whitespace-nowrap bg-slate-900/90 text-cyan-300 border border-cyan-500/30 px-1 py-0.5 rounded text-[8px] font-mono">
              ECO PUMP #1
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([WATER_PUMP_LOCATION.lat, WATER_PUMP_LOCATION.lng], { icon: pumpIcon }).addTo(group);
    }
  }, [showCameras, showSensors, showPumps, showCoverageCones, selectedCameraId, stage]);

  // Reset View Action
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(FARM_CENTER, 17);
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-emerald-500/20 shadow-xl bg-slate-950`}>
      {/* Map Target */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP HEADER OVERLAY */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center space-x-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 text-xs pointer-events-auto shadow-lg">
          <div className="flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span className="font-mono font-bold text-white">GEOSPATIAL DIGITAL TWIN</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-300">
            {activeBaseLayer === 'satellite' ? 'Esri World Imagery (High-Res)' : 'OpenStreetMap Vector'}
          </span>
        </div>

        {/* Right Tools (Layer Switcher, Fullscreen, Reset) */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Layer switcher menu */}
          <div className="relative">
            <button
              onClick={() => setShowLayersDropdown(!showLayersDropdown)}
              className="p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all shadow-lg flex items-center space-x-1 text-xs"
              title="Toggle Map Layers"
            >
              <Layers className="w-4 h-4" />
            </button>

            {showLayersDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-xl p-3 shadow-2xl z-50 text-xs space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Base Imagery
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setActiveBaseLayer('satellite')}
                    className={`py-1 px-2 rounded-lg text-center transition-all ${
                      activeBaseLayer === 'satellite'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setActiveBaseLayer('streets')}
                    className={`py-1 px-2 rounded-lg text-center transition-all ${
                      activeBaseLayer === 'streets'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Street Map
                  </button>
                </div>

                <div className="border-t border-slate-800 pt-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Hardware Overlays
                </div>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCameras}
                    onChange={(e) => setShowCameras(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span className="flex items-center space-x-1">
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cameras & Cones</span>
                  </span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSensors}
                    onChange={(e) => setShowSensors(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span className="flex items-center space-x-1">
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ultrasonic Sensors</span>
                  </span>
                </label>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPumps}
                    onChange={(e) => setShowPumps(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span className="flex items-center space-x-1">
                    <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Water Pump Station</span>
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Reset Map View */}
          <button
            onClick={handleResetView}
            className="p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all shadow-lg"
            title="Reset Map to Farm Boundary"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle if provided */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all shadow-lg"
              title={isFullScreenMode ? 'Exit Full Screen' : 'Full Screen Map'}
            >
              {isFullScreenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM METADATA & ACCURACY DISCLAIMER */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 pointer-events-auto">
          <span className="text-amber-400 font-mono font-bold">NOTE:</span>
          <span>Animal path is synchronized from simulation waypoints. Cameras detect zone occupancy.</span>
        </div>

        {/* Legend pills */}
        <div className="hidden sm:flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] pointer-events-auto">
          <span className="flex items-center space-x-1 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Perimeter</span>
          </span>
          <span className="flex items-center space-x-1 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Simulated Path</span>
          </span>
          <span className="flex items-center space-x-1 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>Cameras</span>
          </span>
          <span className="flex items-center space-x-1 text-purple-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Sprinkler</span>
          </span>
        </div>
      </div>
    </div>
  );
};
