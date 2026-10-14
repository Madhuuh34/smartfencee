import React from 'react';
import { useFarm } from '../context/FarmContext';
import { WATER_PUMP_LOCATION } from '../data/farmData';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Droplet,
  Droplets,
  HeartHandshake,
  Radio,
  RotateCcw,
  Shield,
  ToggleLeft,
  ToggleRight,
  Zap,
} from 'lucide-react';

export const DeterrencePage: React.FC = () => {
  const {
    isWaterSpraying,
    isAutoSprayEnabled,
    sprayDurationSec,
    waterTankLevel,
    lastSprayTime,
    testWaterSpray,
    stopWaterSpray,
    toggleAutoSpray,
    setSprayDurationSec,
  } = useFarm();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <span>NON-LETHAL SAFE DETERRENCE CONTROLS</span>
          </h2>
          <p className="text-xs text-slate-400">
            Automated eco-water spray pumps and directional ultrasonic repellent frequencies
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center space-x-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>100% WILDLIFE SAFE • ZERO INJURY</span>
          </span>
        </div>
      </div>

      {/* HARDWARE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Water Pump & Nozzle Management (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Pump Card */}
          <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">
                    {WATER_PUMP_LOCATION.name}
                  </h3>
                  <div className="text-xs text-slate-400">
                    High-efficiency low-pressure mist and fan-arc sprinkler
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                  isWaterSpraying
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isWaterSpraying ? 'PUMP ACTIVE (DISPENSING)' : 'STANDBY READY'}
              </span>
            </div>

            {/* Live Water Tank Reserve Gauge */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase font-mono">
                  Water Reservoir Reserve
                </span>
                <span className="text-sm font-mono font-bold text-cyan-300">
                  {waterTankLevel} / 1500 Liters
                </span>
              </div>

              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                  style={{ width: `${(waterTankLevel / 1500) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                <span>Rainwater harvesting integration active</span>
                <span>Last activation: {lastSprayTime || 'No recent activation'}</span>
              </div>
            </div>

            {/* Spray Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 mb-1 font-mono uppercase text-[10px]">
                  Autonomous Deterrence Mode
                </div>
                <button
                  onClick={toggleAutoSpray}
                  className="flex items-center justify-between w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white"
                >
                  <span>Auto Water Spray</span>
                  {isAutoSprayEnabled ? (
                    <span className="text-emerald-400 font-bold flex items-center">
                      <ToggleRight className="w-5 h-5 mr-1" /> ENABLED
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center">
                      <ToggleLeft className="w-5 h-5 mr-1" /> DISABLED
                    </span>
                  )}
                </button>
              </div>

              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 mb-1 font-mono uppercase text-[10px]">
                  Safe Burst Duration
                </div>
                <div className="flex items-center space-x-2">
                  {[3, 5, 8, 10].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setSprayDurationSec(sec)}
                      className={`flex-1 py-2 rounded-lg font-mono font-bold transition-all ${
                        sprayDurationSec === sec
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Hardware Override Buttons */}
            <div className="pt-2 flex items-center space-x-3">
              {!isWaterSpraying ? (
                <button
                  onClick={testWaterSpray}
                  className="flex-1 py-3 px-4 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition-all flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>MANUAL TEST SPRAY (ANIMATE 3D PARTICLES)</span>
                </button>
              ) : (
                <button
                  onClick={stopWaterSpray}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold text-xs border border-rose-500/40 transition-all flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
                >
                  <span>STOP WATER SPRAY IMMEDIATELY</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Ultrasonic Array & Ethical Guidelines (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Ultrasonic Array Card */}
          <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-mono">
                    ULTRASONIC ACOUSTIC ARRAY
                  </h3>
                  <div className="text-xs text-slate-400">Targeted species-specific sweeps</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Rodent & Bandicoot Channel</div>
                  <div className="text-[11px] text-slate-400">38 kHz – 42 kHz Sweep</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px]">
                  ARMED
                </span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Wild Boar Low-Frequency Horn</div>
                  <div className="text-[11px] text-slate-400">18 kHz – 24 kHz Pulse</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px]">
                  ARMED
                </span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Elephant Acoustic Deterrent</div>
                  <div className="text-[11px] text-slate-400">Bee acoustic recording playback</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px]">
                  ARMED
                </span>
              </div>
            </div>
          </div>

          {/* Ethical Charter Card */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl text-xs space-y-2">
            <div className="font-bold text-emerald-300 font-mono flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Ethical Wildlife Conservation Charter</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              SmartFence AI is strictly designed to protect agricultural yields while preventing
              human-wildlife conflict. It uses no lethal snares, no high-voltage electric fences,
              and no physical traps. Intruders are gently turned around by harmless water spray
              and acoustic signals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
