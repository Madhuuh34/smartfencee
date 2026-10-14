import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { DeterrenceEvent } from '../../types';
import { Clock, ExternalLink, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';

export const EventStream: React.FC = () => {
  const { events, activeEvent, setEventDetailModal, clearEvents, stage } = useFarm();

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white uppercase">Live Incident Stream</div>
            <div className="text-[10px] text-slate-400">{events.length} Recorded Events</div>
          </div>
        </div>

        {events.length > 0 && (
          <button
            onClick={clearEvents}
            className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center space-x-1"
            title="Clear demo event logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 max-h-[300px] pr-1">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No incidents recorded yet. Launch the demo to generate an intrusion event.
          </div>
        ) : (
          events.map((evt) => {
            const isLatest = activeEvent?.id === evt.id;
            return (
              <div
                key={evt.id}
                onClick={() => setEventDetailModal(evt)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isLatest
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-xs text-white">{evt.id}</span>
                    {isLatest && (
                      <span className="px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-mono text-[9px] font-black">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{evt.timestamp}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs mt-1">
                  <div className="flex items-center space-x-1.5 text-slate-200 font-semibold">
                    <span>
                      {evt.animalType === 'deer' && '🦌'}
                      {evt.animalType === 'wild_boar' && '🐗'}
                      {evt.animalType === 'elephant' && '🐘'}
                      {evt.animalType === 'rat' && '🐀'}
                    </span>
                    <span>{evt.animalName}</span>
                  </div>
                  <span className="font-mono text-emerald-400 text-[11px]">{evt.confidence.toFixed(1)}% Conf</span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="truncate max-w-[140px]">{evt.zoneName}</span>
                  <span className="text-cyan-400 font-mono flex items-center space-x-1 hover:underline">
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed Demo Banner if stage is completed */}
      {stage === 'completed' && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300">
          <div className="font-bold flex items-center space-x-1.5">
            <span>🎉 End-to-End Workflow Verified</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            Animal safely deterred by animated water spray. Event preserved in system history.
          </div>
        </div>
      )}
    </div>
  );
};
