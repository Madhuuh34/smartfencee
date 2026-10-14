import React, { useState } from 'react';
import { SatelliteFarmMap } from '../components/map/SatelliteFarmMap';
import { useFarm } from '../context/FarmContext';
import { CAMERAS, FARM_ZONES, SENSORS, WATER_PUMP_LOCATION } from '../data/farmData';
import {
  Camera,
  Compass,
  Droplet,
  Info,
  Layers,
  MapPin,
  Radio,
  Shield,
} from 'lucide-react';

export const SatelliteMapPage: React.FC = () => {
  const { selectedZoneId, setSelectedZoneId, selectedCameraId, setSelectedCameraId } = useFarm();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const selectedZone = FARM_ZONES.find((z) => z.id === selectedZoneId) || FARM_ZONES[0];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto text-slate-200">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center space-x-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>GEOSPATIAL SATELLITE OPERATIONS CONSOLE</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time GIS boundary telemetry with Esri satellite imagery & synchronized edge sensors
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
            GPS: 11.4125° N, 76.6980° E
          </span>
        </div>
      </div>

      {/* MAIN MAP CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Full Interactive Map (9 columns) */}
        <div className="lg:col-span-9 flex flex-col">
          <SatelliteFarmMap
            isFullScreenMode={isFullScreen}
            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            heightClass="h-[620px]"
          />
        </div>

        {/* GIS Sidebar Inspector (3 columns) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Selected Zone Inspector */}
          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Zone Inspector
              </span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>

            <div>
              <div className="text-sm font-bold text-white">{selectedZone.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Crop: {selectedZone.crop} • Area: {selectedZone.areaHa} ha
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Status</div>
                <div className="font-bold text-emerald-400 uppercase">{selectedZone.status}</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">Coverage</div>
                <div className="font-bold text-slate-300">{selectedZone.cameraCount} Cams</div>
              </div>
            </div>

            {/* Quick Zone Picker */}
            <div className="space-y-1 pt-1">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Select Sector</div>
              <div className="grid grid-cols-2 gap-1.5">
                {FARM_ZONES.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`p-1.5 rounded-lg text-left text-xs transition-all ${
                      selectedZoneId === z.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <div className="truncate text-[11px]">{z.name.split('—')[1] || z.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hardware inventory list */}
          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Perimeter Hardware
              </span>
              <Camera className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PTZ Vision Cameras</span>
                </span>
                <span className="font-mono font-bold text-white">{CAMERAS.length} Units</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ultrasonic Nodes</span>
                </span>
                <span className="font-mono font-bold text-white">{SENSORS.length} Units</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Eco-Water Pumps</span>
                </span>
                <span className="font-mono font-bold text-white">1 Station</span>
              </div>
            </div>
          </div>

          {/* GIS Legend */}
          <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">
              Map Symbol Legend
            </div>
            <div className="space-y-1.5 text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-emerald-500"></span>
                <span>Farm Perimeter Boundary Wire</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-amber-500 border-dashed"></span>
                <span>Simulated Animal Movement Path</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Optical Camera (75° FOV Cone)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span>Eco Hydro-Sprinkler Node</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
