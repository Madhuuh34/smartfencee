import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { SENSORS } from '../../data/farmData';
import { Activity, AlertTriangle, CheckCircle, Radio, Signal, Wifi } from 'lucide-react';

export const SensorTelemetry: React.FC = () => {
  const { stage, currentDistanceM, telemetryHistory } = useFarm();

  const sensor = SENSORS[0]; // SEN-01-US (East Boundary)
  const threshold = sensor.thresholdM; // 4.5 meters
  const isBreached = currentDistanceM <= threshold;

  // Percentage on 0-20m gauge (inverted so closer = higher urgency)
  const gaugePercent = Math.min(100, Math.max(0, ((20 - currentDistanceM) / 20) * 100));

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 shadow-xl text-slate-200">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-mono font-bold text-xs text-white">{sensor.id}</div>
            <div className="text-[10px] text-slate-400">Ultrasonic Transceiver Array</div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
          <Wifi className="w-3 h-3" />
          <span>MESH CONNECTED</span>
        </div>
      </div>

      {/* METRIC CARD */}
      <div className="mt-4 flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div>
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Proximity Reading
          </div>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span
              className={`text-3xl font-mono font-extrabold tracking-tight ${
                isBreached ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {currentDistanceM.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-slate-400">meters</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Safety Threshold</div>
          <div className="text-sm font-mono font-bold text-rose-400">
            &le; {threshold.toFixed(1)} m
          </div>
          <div className="mt-1">
            {isBreached ? (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-mono font-bold">
                <AlertTriangle className="w-3 h-3" />
                <span>BREACH</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono">
                <CheckCircle className="w-3 h-3" />
                <span>CLEAR</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* HORIZONTAL GAUGE BAR */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
          <span>0m (Impact)</span>
          <span className="text-rose-400 font-bold">Threshold 4.5m</span>
          <span>20m (Perimeter Edge)</span>
        </div>
        <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          {/* Threshold line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 shadow-[0_0_8px_#f43f5e]"
            style={{ left: `${((20 - threshold) / 20) * 100}%` }}
          />
          {/* Progress fill */}
          <div
            className={`h-full transition-all duration-300 ${
              isBreached
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_12px_#f59e0b]'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
            }`}
            style={{ width: `${gaugePercent}%` }}
          />
        </div>
      </div>

      {/* ROLLING SPARKLINE / HISTORY */}
      <div className="mt-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
          <div className="flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Echo Waveform History (20s)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">40 kHz Ultrasonic</span>
        </div>

        {/* Small Bar visualizer */}
        <div className="flex-1 min-h-[50px] bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 flex items-end space-x-1">
          {telemetryHistory.slice(-16).map((item, idx) => {
            const h = Math.max(10, Math.min(100, (item.distance / 16) * 100));
            const isWarn = item.distance <= threshold;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isWarn ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-emerald-500/70'
                  }`}
                  style={{ height: `${h}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER NOTICE */}
      <div className="mt-3 text-[10px] text-slate-400/90 font-mono text-center bg-slate-950/40 py-1 rounded border border-slate-800/60">
        ULTRASONIC MEASURES DISTANCE ONLY • SPECIES IDENTIFIED VIA AI CAMERA
      </div>
    </div>
  );
};
