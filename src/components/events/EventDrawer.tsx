import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { DeterrenceEvent } from '../../types';
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Compass,
  Droplet,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Radio,
  Shield,
  ShieldAlert,
  X,
} from 'lucide-react';

export const EventDrawer: React.FC = () => {
  const { eventDetailModal, setEventDetailModal } = useFarm();

  if (!eventDetailModal) return null;

  const evt = eventDetailModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-base text-white">{evt.id}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  VERIFIED
                </span>
              </div>
              <div className="text-xs text-slate-400">Intrusion Incident Record</div>
            </div>
          </div>

          <button
            onClick={() => setEventDetailModal(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
          {/* Species Banner */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Species Detected</div>
              <div className="text-lg font-bold text-white mt-0.5">{evt.animalName}</div>
              <div className="text-xs text-amber-400 font-mono mt-0.5">
                Inference Confidence: {evt.confidence.toFixed(1)}% (DEMO)
              </div>
            </div>
            <div className="text-4xl">
              {evt.animalType === 'deer' && '🦌'}
              {evt.animalType === 'wild_boar' && '🐗'}
              {evt.animalType === 'elephant' && '🐘'}
              {evt.animalType === 'rat' && '🐀'}
            </div>
          </div>

          {/* Grid telemetry metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] uppercase font-mono">Location / Sector</span>
              </div>
              <div className="font-semibold text-white">{evt.zoneName}</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] uppercase font-mono">Camera ID</span>
              </div>
              <div className="font-semibold text-white font-mono">{evt.cameraId}</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] uppercase font-mono">Proximity Reading</span>
              </div>
              <div className="font-semibold text-white font-mono">{evt.sensorDistanceM} meters</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] uppercase font-mono">Water Spray Action</span>
              </div>
              <div className="font-semibold text-white">{evt.pumpDurationSec}s Duration</div>
            </div>
          </div>

          {/* Non-Lethal Deterrence Response Detail */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">
              Automated Response Log
            </div>
            <p className="text-slate-300 leading-relaxed">{evt.deterrenceResponse}</p>
            <p className="text-slate-400 leading-relaxed text-[11px] italic">{evt.notes}</p>
          </div>

          {/* SMS Notification Status (Explicitly Simulated) */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">SMS Alert Status</div>
                <div className="font-mono text-rose-400 font-bold text-[11px]">
                  {evt.smsStatus}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">Twilio Demo Sandbox</div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center">
            EVENT SOURCE: SIMULATED PROTOTYPE RUN • NO REAL-WORLD HARDWARE TRIGGERED
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={() => setEventDetailModal(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close Incident
          </button>
        </div>
      </div>
    </div>
  );
};
