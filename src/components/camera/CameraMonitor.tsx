import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { ANIMALS, CAMERAS, FARM_ZONES } from '../../data/farmData';
import { Aperture, Camera, Eye, Flame, Radio, ShieldAlert, Sparkles, Video } from 'lucide-react';

export const CameraMonitor: React.FC = () => {
  const {
    stage,
    selectedAnimal,
    selectedCameraId,
    selectedZoneId,
    isNightMode,
    currentDistanceM,
    setSelectedCameraId,
  } = useFarm();

  const [visionFilter, setVisionFilter] = useState<'optical' | 'thermal'>('optical');

  const currentCam = CAMERAS.find((c) => c.id === selectedCameraId) || CAMERAS[1];
  const currentZone = FARM_ZONES.find((z) => z.id === currentCam.zoneId) || FARM_ZONES[1];
  const animalConfig = ANIMALS[selectedAnimal];

  const isDetecting = stage === 'detecting' || stage === 'sensing' || stage === 'spraying' || stage === 'recording';
  const isApproaching = stage === 'approaching' || stage === 'capturing' || isDetecting;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
      {/* MONITOR TOP BAR */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center space-x-2">
          {/* Simulated REC indicator */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-[10px] font-mono text-rose-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>REC • DEMO</span>
          </div>

          <span className="text-xs font-mono font-bold text-white">{currentCam.id}</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 truncate max-w-[140px]">{currentCam.name}</span>
        </div>

        {/* Filter Toggle (Optical vs Thermal) */}
        <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setVisionFilter('optical')}
            className={`px-2 py-0.5 rounded transition-all ${
              visionFilter === 'optical'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Optical
          </button>
          <button
            onClick={() => setVisionFilter('thermal')}
            className={`px-2 py-0.5 rounded transition-all flex items-center space-x-1 ${
              visionFilter === 'thermal'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Thermal</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT CANVAS / FEED */}
      <div
        className={`relative flex-1 min-h-[220px] overflow-hidden flex items-center justify-center transition-colors duration-500 ${
          visionFilter === 'thermal'
            ? 'bg-gradient-to-b from-[#180828] via-[#330033] to-[#0a1033]'
            : isNightMode
            ? 'bg-[#030907]'
            : 'bg-gradient-to-b from-[#0c1f17] to-[#040e0b]'
        }`}
      >
        {/* Scanlines Effect Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 z-10"></div>

        {/* HUD Crosshairs & Grid */}
        <div className="absolute inset-4 pointer-events-none border border-slate-700/30 rounded-lg flex flex-col justify-between p-2 z-10 text-[10px] font-mono text-slate-400">
          <div className="flex justify-between items-center">
            <span>FOV {currentCam.fovDeg}° • PTZ TRACKING</span>
            <span>RNG: {currentDistanceM}m</span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>LAT {currentCam.lat.toFixed(4)}° / LNG {currentCam.lng.toFixed(4)}°</span>
            <span>{isNightMode ? 'IR ILLUM ON' : 'SOLAR LUX NORMAL'}</span>
          </div>
        </div>

        {/* Center reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-16 h-16 border border-cyan-400/50 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
          </div>
        </div>

        {/* SIMULATED ANIMAL GRAPHIC IN FEED */}
        <div className="relative z-0 flex flex-col items-center justify-center transition-transform duration-300">
          {/* Animal visual representation in camera stream */}
          <div
            className={`transition-all duration-300 relative flex items-center justify-center ${
              visionFilter === 'thermal'
                ? 'filter drop-shadow-[0_0_15px_#f97316]'
                : isNightMode
                ? 'filter brightness-90 contrast-125'
                : ''
            }`}
          >
            {/* Visual silhouette / stylized creature representation */}
            <div
              className={`w-36 h-28 rounded-2xl flex flex-col items-center justify-center transition-all ${
                visionFilter === 'thermal'
                  ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-yellow-300 border-2 border-yellow-300'
                  : 'bg-slate-800/80 border border-slate-600'
              }`}
            >
              <div className="text-3xl mb-1">
                {selectedAnimal === 'deer' && '🦌'}
                {selectedAnimal === 'wild_boar' && '🐗'}
                {selectedAnimal === 'elephant' && '🐘'}
                {selectedAnimal === 'rat' && '🐀'}
              </div>
              <div
                className={`text-[11px] font-bold font-mono ${
                  visionFilter === 'thermal' ? 'text-slate-950 font-black' : 'text-slate-200'
                }`}
              >
                {animalConfig.name}
              </div>
              <div
                className={`text-[9px] font-mono ${
                  visionFilter === 'thermal' ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {animalConfig.scientificName}
              </div>
            </div>

            {/* AI DETECTION BOUNDING BOX OVERLAY */}
            {isDetecting && (
              <div className="absolute -inset-3 border-2 border-dashed border-amber-400 rounded-xl animate-pulse pointer-events-none flex flex-col justify-between p-1">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-500 text-slate-950 font-mono font-black text-[9px] px-1 py-0.5 rounded shadow">
                    YOLO-v11: {selectedAnimal.toUpperCase()} (94.6% DEMO)
                  </span>
                  <span className="bg-slate-950/90 text-amber-400 border border-amber-400 font-mono text-[9px] px-1 rounded">
                    SF-DET-EAST
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-amber-300 bg-slate-950/80 px-1 rounded">
                    LOCK: TRUE
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Banner disclaimer in feed */}
        <div className="absolute bottom-1.5 inset-x-2 text-center text-[9px] font-mono text-slate-400/80 bg-slate-950/60 py-0.5 rounded backdrop-blur-sm z-20">
          SIMULATED AI VISION STREAM • NOT A LIVE CLOUD CAM FEED
        </div>
      </div>

      {/* MONITOR FOOTER CONTROLS */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Switch Camera:</span>
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-400"
          >
            {CAMERAS.map((cam) => (
              <option key={cam.id} value={cam.id}>
                {cam.id} ({cam.name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>PTZ Tracking: Active</span>
        </div>
      </div>
    </div>
  );
};
