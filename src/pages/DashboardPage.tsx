import React from 'react';
import { useFarm } from '../context/FarmContext';
import { CAMERAS, FARM_ZONES, SENSORS } from '../data/farmData';
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle,
  Clock,
  Compass,
  Droplet,
  Eye,
  PlayCircle,
  Radio,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { NavPage } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigate: (page: NavPage) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    stage,
    waterTankLevel,
    events,
    isWaterSpraying,
    testWaterSpray,
    stopWaterSpray,
    setEventDetailModal,
  } = useFarm();

  const totalAreaHa = FARM_ZONES.reduce((acc, z) => acc + z.areaHa, 0).toFixed(1);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-200">
      {/* HERO BANNER LINKING TO THE LIVE PROTOTYPE DEMO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-cyan-950/80 border border-emerald-500/30 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HACKATHON SHOWCASE READY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide font-mono">
              SmartFence AI: Complete Crop Protection Digital Twin
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Experience the end-to-end automated deterrence workflow in full interactive 3D:
              animated wildlife crossing boundaries, optical camera tracking, ultrasonic proximity
              telemetry, and physical pressurized water spray deterrence.
            </p>
          </div>

          <button
            onClick={() => onNavigate('demo')}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black font-mono tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all flex items-center justify-center space-x-2 text-sm shrink-0 cursor-pointer"
          >
            <PlayCircle className="w-5 h-5 fill-current" />
            <span>LAUNCH 3D LIVE DEMO</span>
          </button>
        </div>
      </div>

      {/* 4 TOP TELEMETRY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Protected Area */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono">Total Farm Perimeter</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{totalAreaHa} ha</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>4 Protected Sectors Active</span>
          </div>
        </div>

        {/* Vision Sentinels */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono">Optical AI Sentinels</span>
            <Camera className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{CAMERAS.length} PTZ Cameras</div>
          <div className="text-[11px] text-cyan-400 mt-1 flex items-center space-x-1">
            <Activity className="w-3 h-3" />
            <span>Edge YOLO Model Online</span>
          </div>
        </div>

        {/* Ultrasonic Array */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono">Ultrasonic Array</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">{SENSORS.length} Nodes</div>
          <div className="text-[11px] text-amber-400 mt-1 flex items-center space-x-1">
            <span>40 kHz Proximity Mesh</span>
          </div>
        </div>

        {/* Water Reserve */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase font-mono">Deterrence Water Tank</span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-300 font-mono">{waterTankLevel} L</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Capacity 1500L</span>
            <span className="text-cyan-400 font-bold">{Math.round((waterTankLevel / 1500) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* SECTOR GRID & LIVE INCIDENT TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sector Status (7 columns) */}
        <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white font-mono">FARM SECTOR HEALTH</h3>
              <p className="text-xs text-slate-400">Status of perimeter crops and localized hardware</p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-semibold text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>View On Map</span>
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FARM_ZONES.map((zone) => (
              <div
                key={zone.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{zone.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        zone.id === 'zone-east' && stage === 'detecting'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {zone.id === 'zone-east' && stage === 'detecting' ? 'ALERT' : 'SECURE'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{zone.crop} • {zone.areaHa} ha</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{zone.cameraCount} Cameras</span>
                  <span>{zone.sensorsCount} Sensors</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents (5 columns) */}
        <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white font-mono">RECENT INTRUSION LOGS</h3>
              <p className="text-xs text-slate-400">Verified detections and safe spray outcomes</p>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              All Events
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px]">
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setEventDetailModal(evt)}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-white">{evt.animalName}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {evt.confidence.toFixed(1)}% Conf
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {evt.zoneName} • {evt.timestamp}
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono">
                    {evt.pumpStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
