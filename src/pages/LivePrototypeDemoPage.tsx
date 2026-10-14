import React from 'react';
import { useFarm } from '../context/FarmContext';
import { FarmScene } from '../components/3d/FarmScene';
import { SatelliteFarmMap } from '../components/map/SatelliteFarmMap';
import { CameraMonitor } from '../components/camera/CameraMonitor';
import { SensorTelemetry } from '../components/telemetry/SensorTelemetry';
import { DemoControls } from '../components/controls/DemoControls';
import { EventStream } from '../components/events/EventStream';
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Info,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

export const LivePrototypeDemoPage: React.FC = () => {
  const {
    stage,
    stageInfo,
    activeEvent,
    alertBanner,
    dismissAlert,
    replayDemo,
    resetDemo,
    setEventDetailModal,
  } = useFarm();

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto">
      {/* ALERT TOAST BANNER (IF ACTIVE) */}
      {alertBanner && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-2xl transition-all animate-in slide-in-from-top-4 ${
            alertBanner.type === 'amber'
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
              : alertBanner.type === 'emerald'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl ${
                alertBanner.type === 'amber'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {alertBanner.type === 'amber' ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="font-mono font-bold text-xs uppercase tracking-wide">
                {alertBanner.title}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">{alertBanner.message}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeEvent && (
              <button
                onClick={() => setEventDetailModal(activeEvent)}
                className="px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Inspect Event
              </button>
            )}
            <button
              onClick={dismissAlert}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TOP CONTROLS & TIMELINE ROW */}
      <DemoControls />

      {/* MAIN DEMO WORKSPACE: 3D DIGITAL TWIN + COMPANION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 3D FARM SCENE (APPROXIMATELY 60% WIDTH ON DESKTOP -> 7 COLUMNS) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="h-[520px] w-full">
            <FarmScene />
          </div>

          {/* SATELLITE MAP POSITIONED DIRECTLY UNDER 3D FARM */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Synchronized Geospatial Map</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Real-Time Coordinates Synchronized with 3D Simulation
              </span>
            </div>
            <SatelliteFarmMap heightClass="h-[360px]" />
          </div>
        </div>

        {/* COMPANION SIDE PANELS (5 COLUMNS) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* 1. Synchronized AI Camera Monitor */}
          <div className="h-[320px]">
            <CameraMonitor />
          </div>

          {/* 2. Ultrasonic Sensor Telemetry Gauge */}
          <div className="h-[250px]">
            <SensorTelemetry />
          </div>

          {/* 3. Live Incident Stream */}
          <div className="flex-1 min-h-[280px]">
            <EventStream />
          </div>
        </div>
      </div>

      {/* DEMO COMPLETION MODAL OVERLAY */}
      {stage === 'completed' && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-teal-950/90 border border-emerald-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              <Sparkles className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                FULL 8-STAGE WORKFLOW COMPLETED SUCCESSFULLY
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Animal entered the perimeter, triggered camera AI tracking and ultrasonic proximity
                sensors, and was safely deterred via pressurized water spray with zero harm.
                Incident is logged with immutable cryptographic event ID.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={replayDemo}
              className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY DEMO</span>
            </button>

            {activeEvent && (
              <button
                onClick={() => setEventDetailModal(activeEvent)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>VIEW EVENT</span>
              </button>
            )}

            <button
              onClick={resetDemo}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              RESET FARM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
