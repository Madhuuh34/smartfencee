import React from 'react';
import { useFarm } from '../../context/FarmContext';
import { NavPage } from './Sidebar';
import {
  Bell,
  Droplet,
  Menu,
  Shield,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  currentPage: NavPage;
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onOpenSidebar }) => {
  const {
    waterTankLevel,
    events,
    isMuted,
    setIsMuted,
    isWaterSpraying,
    testWaterSpray,
    stopWaterSpray,
    setEventDetailModal,
  } = useFarm();

  const pageTitles: Record<NavPage, { title: string; desc: string }> = {
    demo: {
      title: 'LIVE PROTOTYPE DEMONSTRATION',
      desc: 'Interactive end-to-end simulation of the SmartFence AI workflow',
    },
    dashboard: {
      title: 'FARM TELEMETRY DASHBOARD',
      desc: 'Real-time multi-zone perimeter status and device health',
    },
    map: {
      title: 'SATELLITE GEOSPATIAL MAP',
      desc: 'High-resolution GIS boundaries, sensor positions, and intrusion trails',
    },
    cameras: {
      title: 'CAMERAS & AI VISION HUB',
      desc: 'Multi-camera PTZ optical sweeps & edge computer vision models',
    },
    deterrence: {
      title: 'NON-LETHAL DETERRENCE SYSTEMS',
      desc: 'Hydro-pump pressure management & directional spray nozzles',
    },
    events: {
      title: 'INCIDENT AUDIT LOG',
      desc: 'Cryptographic event records & wildlife interaction history',
    },
    settings: {
      title: 'CALIBRATION & SETTINGS',
      desc: 'Ultrasonic thresholds, safe spray durations, and notification webhooks',
    },
  };

  const currentMeta = pageTitles[currentPage];

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-emerald-500/15 flex items-center justify-between px-4 sm:px-6">
      {/* LEFT: Toggle + Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-wide font-mono flex items-center space-x-2">
            <span>{currentMeta.title}</span>
            {currentPage === 'demo' && (
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px]">
                INTERACTIVE 3D
              </span>
            )}
          </h1>
          <p className="hidden md:block text-[11px] text-slate-400">{currentMeta.desc}</p>
        </div>
      </div>

      {/* RIGHT: Quick Telemetry Pills & Action Controls */}
      <div className="flex items-center space-x-2.5 text-xs">
        {/* Water Tank Level Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          <Droplet className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">{waterTankLevel}L Tank</span>
        </div>

        {/* Global Quick Test Spray Button */}
        {!isWaterSpraying ? (
          <button
            onClick={testWaterSpray}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-all cursor-pointer"
            title="Fire test water spray from 3D nozzle"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Test Spray</span>
          </button>
        ) : (
          <button
            onClick={stopWaterSpray}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 font-semibold text-xs transition-all cursor-pointer"
          >
            <span>Stop Spray</span>
          </button>
        )}

        {/* Audio Mute / Unmute */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Alert Notifications Badge */}
        <button
          onClick={() => {
            if (events.length > 0) {
              setEventDetailModal(events[0]);
            }
          }}
          className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Recent alerts"
        >
          <Bell className="w-4 h-4" />
          {events.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-bold font-mono flex items-center justify-center">
              {events.length}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
