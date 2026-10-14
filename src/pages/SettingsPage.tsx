import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Bell,
  Check,
  Cpu,
  Droplets,
  Radio,
  Save,
  Settings,
  Shield,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    isAutoSprayEnabled,
    toggleAutoSpray,
    sprayDurationSec,
    setSprayDurationSec,
    isNightMode,
    setIsNightMode,
  } = useFarm();

  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(85);
  const [ultrasonicDistanceThreshold, setUltrasonicDistanceThreshold] = useState(4.5);
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 438-2910');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>SYSTEM CALIBRATION & HARDWARE THRESHOLDS</span>
          </h2>
          <p className="text-xs text-slate-400">
            Tune neural inference thresholds, ultrasonic proximity triggers, and safe spray timing
          </p>
        </div>

        <button
          onClick={handleSave}
          className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center space-x-1.5 shadow-lg cursor-pointer"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'SETTINGS SAVED' : 'SAVE CONFIGURATION'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Computer Vision Thresholds */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white font-mono">EDGE AI INFERENCE PARAMS</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1.5 text-slate-300">
                <span>YOLO Minimum Confidence Cutoff</span>
                <span className="font-mono font-bold text-cyan-400">{aiConfidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={aiConfidenceThreshold}
                onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Detections below {aiConfidenceThreshold}% confidence are logged as passive observations.
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span>Auto Infrared / Night Vision Shift</span>
                <button
                  onClick={() => setIsNightMode(!isNightMode)}
                  className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                    isNightMode
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isNightMode ? 'NIGHT VISION ON' : 'DAYTIME MODE'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ultrasonic Proximity Hardware */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Radio className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white font-mono">ULTRASONIC PROXIMITY LIMITS</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1.5 text-slate-300">
                <span>Breach Distance Trigger Threshold</span>
                <span className="font-mono font-bold text-amber-400">
                  {ultrasonicDistanceThreshold} meters
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.5"
                value={ultrasonicDistanceThreshold}
                onChange={(e) => setUltrasonicDistanceThreshold(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                When wildlife approaches within {ultrasonicDistanceThreshold}m of crops, deterrence is armed.
              </div>
            </div>
          </div>
        </div>

        {/* Deterrence Hardware Timing */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white font-mono">ECO WATER SPRAY TIMING</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span>Automatic Response Authorization</span>
              <button
                onClick={toggleAutoSpray}
                className={`px-3 py-1 rounded-lg font-mono font-bold text-xs ${
                  isAutoSprayEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isAutoSprayEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="pt-2">
              <span className="text-slate-300 block mb-1">Burst Spray Duration</span>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 8, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSprayDurationSec(s)}
                    className={`py-2 rounded-lg font-mono font-bold text-center ${
                      sprayDurationSec === s
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {s} sec
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Webhooks & SMS */}
        <div className="bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white font-mono">FARMER ALERT CHANNELS</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Emergency Farmer SMS Destination</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-200 focus:ring-1 focus:ring-emerald-400"
              />
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                NOTE: IN DEMO PROTOTYPE MODE, SMS DISPATCHES ARE LABELED 'SIMULATED — NOT SENT'
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
