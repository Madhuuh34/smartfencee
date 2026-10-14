import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { ANIMALS, CAMERAS, FARM_ZONES, STAGES_CONFIG } from '../../data/farmData';
import { AnimalType } from '../../types';
import {
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Zap,
} from 'lucide-react';

export const DemoControls: React.FC = () => {
  const {
    stage,
    stageInfo,
    stageProgress,
    totalProgress,
    isPlaying,
    isPaused,
    selectedAnimal,
    selectedCameraId,
    selectedZoneId,
    isNightMode,
    isAutoSprayEnabled,
    sprayDurationSec,
    isWaterSpraying,
    waterTankLevel,
    lastSprayTime,
    startFullDemo,
    pauseDemo,
    resumeDemo,
    replayDemo,
    resetDemo,
    triggerDetectionNow,
    testWaterSpray,
    stopWaterSpray,
    toggleAutoSpray,
    setSprayDurationSec,
    setSelectedAnimal,
    setSelectedCameraId,
    setSelectedZoneId,
    setIsNightMode,
  } = useFarm();

  const animalKeys: AnimalType[] = ['deer', 'wild_boar', 'elephant', 'rat'];

  return (
    <div className="flex flex-col space-y-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 shadow-2xl">
      {/* 1. HORIZONTAL 8-STAGE TIMELINE */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Prototype Sequence Pipeline
            </span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs font-mono text-slate-300">
              {Math.round(totalProgress * 100)}% Complete
            </span>
          </div>

          <span className="text-[11px] font-mono text-amber-400">
            {stageInfo ? stageInfo.statusBadge : isPlaying ? 'EXECUTING' : 'READY TO LAUNCH'}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 transition-all duration-200"
            style={{ width: `${Math.round(totalProgress * 100)}%` }}
          />
        </div>

        {/* 8 Stage Nodes Carousel / Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {STAGES_CONFIG.map((stg, idx) => {
            const isCurrent = stage === stg.id;
            const isCompleted =
              stage === 'completed' ||
              (isPlaying &&
                STAGES_CONFIG.findIndex((s) => s.id === stage) > idx);

            return (
              <div
                key={stg.id}
                className={`flex flex-col items-center p-2 rounded-xl text-center transition-all border ${
                  isCurrent
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-102'
                    : isCompleted
                    ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full mb-1 text-[10px] font-bold">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 font-black animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>
                <div
                  className={`text-[10px] font-medium leading-tight truncate w-full ${
                    isCurrent ? 'text-white font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {stg.label.replace(/^\d+\.\s*/, '')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PRIMARY ACTION CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800">
        {/* START / PAUSE / RESUME */}
        {!isPlaying ? (
          <button
            onClick={startFullDemo}
            className="lg:col-span-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-mono tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START FULL PROTOTYPE DEMO</span>
          </button>
        ) : isPaused ? (
          <button
            onClick={resumeDemo}
            className="lg:col-span-2 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-black font-mono shadow-lg transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME SIMULATION</span>
          </button>
        ) : (
          <button
            onClick={pauseDemo}
            className="lg:col-span-2 py-3 px-4 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 font-bold font-mono transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <Pause className="w-4 h-4" />
            <span>PAUSE DEMO</span>
          </button>
        )}

        {/* FAST-FORWARD / TRIGGER DETECTION NOW */}
        <button
          onClick={triggerDetectionNow}
          className="py-3 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          title="Jump directly to AI Detection stage"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>TRIGGER DETECTION</span>
        </button>

        {/* REPLAY */}
        <button
          onClick={replayDemo}
          className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          title="Restart demonstration from beginning"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>REPLAY DEMO</span>
        </button>

        {/* RESET FARM */}
        <button
          onClick={resetDemo}
          className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          title="Reset farm state, animal position, and sensors"
        >
          <span>RESET FARM</span>
        </button>
      </div>

      {/* 3. SIMULATION CONFIGURATION PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
        {/* Animal Selector */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
            Intruder Species (3D Model)
          </label>
          <div className="grid grid-cols-2 gap-1">
            {animalKeys.map((type) => {
              const cfg = ANIMALS[type];
              const isSelected = selectedAnimal === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedAnimal(type)}
                  className={`py-1.5 px-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="truncate text-[11px]">{cfg.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Farm Zone Selector */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
            Focus Farm Zone
          </label>
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-400"
          >
            {FARM_ZONES.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.crop})
              </option>
            ))}
          </select>
          <div className="mt-1.5 text-[10px] text-slate-500">
            Selected zone lights up during intrusion detection.
          </div>
        </div>

        {/* Optical Camera Selector */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
            Primary PTZ Camera
          </label>
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-400"
          >
            {CAMERAS.map((cam) => (
              <option key={cam.id} value={cam.id}>
                {cam.id} — {cam.name}
              </option>
            ))}
          </select>
          <div className="mt-1.5 text-[10px] text-slate-500">
            Auto-rotates and locks on intrusion target.
          </div>
        </div>

        {/* Safe Deterrence Hardware Controls */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Auto Deterrence</span>
              <button
                onClick={toggleAutoSpray}
                className="flex items-center space-x-1 text-slate-300 hover:text-white"
              >
                {isAutoSprayEnabled ? (
                  <span className="text-emerald-400 font-bold flex items-center">
                    <ToggleRight className="w-4 h-4 mr-0.5 text-emerald-400" /> ON
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center">
                    <ToggleLeft className="w-4 h-4 mr-0.5" /> OFF
                  </span>
                )}
              </button>
            </div>
            <div className="text-[10px] text-slate-400">
              Tank: <span className="font-mono text-cyan-300">{waterTankLevel}L</span> • Spray: {sprayDurationSec}s
            </div>
          </div>

          <div className="flex items-center space-x-1.5 mt-2">
            {!isWaterSpraying ? (
              <button
                onClick={testWaterSpray}
                className="w-full py-1.5 px-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 font-bold border border-cyan-500/40 text-xs flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>TEST WATER SPRAY</span>
              </button>
            ) : (
              <button
                onClick={stopWaterSpray}
                className="w-full py-1.5 px-2 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold border border-rose-500/40 text-xs cursor-pointer"
              >
                STOP SPRAY
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
