import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { ANIMALS, CAMERAS, FARM_ZONES } from '../data/farmData';
import { Camera, Eye, Flame, Maximize2, Radio, Shield, Sparkles } from 'lucide-react';

export const CamerasPage: React.FC = () => {
  const {
    stage,
    selectedAnimal,
    selectedCameraId,
    setSelectedCameraId,
    isNightMode,
  } = useFarm();

  const [filterMode, setFilterMode] = useState<'optical' | 'thermal'>('optical');
  const animalConfig = ANIMALS[selectedAnimal];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center space-x-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span>AI COMPUTER VISION SURVEILLANCE ROOM</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-angle edge inference with wildlife bounding box classification
          </p>
        </div>

        {/* Global Filter Switch */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterMode('optical')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterMode === 'optical'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            HD Optical
          </button>
          <button
            onClick={() => setFilterMode('thermal')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              filterMode === 'thermal'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Thermal Vision</span>
          </button>
        </div>
      </div>

      {/* 4-CAMERA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CAMERAS.map((cam) => {
          const isSelected = cam.id === selectedCameraId;
          const isEastCamWithIntruder = cam.id === 'CAM-02-E';
          const isDetectingNow =
            isEastCamWithIntruder &&
            (stage === 'detecting' || stage === 'sensing' || stage === 'spraying');

          return (
            <div
              key={cam.id}
              onClick={() => setSelectedCameraId(cam.id)}
              className={`rounded-2xl border overflow-hidden transition-all bg-slate-900/90 shadow-xl cursor-pointer ${
                isSelected
                  ? 'border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* TOP CAM BAR */}
              <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono font-bold text-white">{cam.id}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">{cam.name}</span>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                  <span>{cam.fovDeg}° FOV</span>
                  <span>{cam.rangeMeters}m RANGE</span>
                </div>
              </div>

              {/* VIDEO FEED VIEWPORT */}
              <div
                className={`relative h-64 flex items-center justify-center overflow-hidden transition-all ${
                  filterMode === 'thermal'
                    ? 'bg-gradient-to-b from-[#180828] via-[#330033] to-[#0a1033]'
                    : isNightMode
                    ? 'bg-[#030907]'
                    : 'bg-gradient-to-b from-[#0c1f17] to-[#040e0b]'
                }`}
              >
                {/* Scanlines overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 z-10"></div>

                {/* Simulated animal if East camera */}
                {isEastCamWithIntruder ? (
                  <div className="relative flex flex-col items-center justify-center">
                    <div
                      className={`w-32 h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        filterMode === 'thermal'
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
                        className={`text-[10px] font-mono font-bold ${
                          filterMode === 'thermal' ? 'text-slate-950' : 'text-slate-200'
                        }`}
                      >
                        {animalConfig.name}
                      </div>
                    </div>

                    {/* AI Bounding Box */}
                    {isDetectingNow && (
                      <div className="absolute -inset-2.5 border-2 border-dashed border-amber-400 rounded-xl animate-pulse pointer-events-none flex flex-col justify-between p-1">
                        <div className="bg-amber-500 text-slate-950 font-mono font-black text-[9px] px-1 py-0.5 rounded w-max">
                          {selectedAnimal.toUpperCase()} (94.6% DEMO)
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs font-mono">
                    <div className="text-xl mb-1 opacity-40">🌾</div>
                    <div>SECTOR PERIMETER CLEAR</div>
                    <div className="text-[10px] text-slate-600">Zero motion anomalies</div>
                  </div>
                )}

                {/* Bottom HUD */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400 z-20">
                  <span>LAT {cam.lat.toFixed(4)}° / LNG {cam.lng.toFixed(4)}°</span>
                  <span>{isDetectingNow ? 'TARGET ACQUIRED' : 'PTZ SWEEP'}</span>
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Assigned Sector: <span className="text-slate-200 font-semibold">{cam.zoneId}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isDetectingNow
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {isDetectingNow ? 'INTRUSION DETECTED' : 'SENTINEL OK'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
