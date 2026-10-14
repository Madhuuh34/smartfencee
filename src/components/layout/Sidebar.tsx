import React from 'react';
import {
  Camera,
  Compass,
  Droplets,
  FileText,
  Flame,
  LayoutDashboard,
  PlayCircle,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react';

export type NavPage =
  | 'demo'
  | 'dashboard'
  | 'map'
  | 'cameras'
  | 'deterrence'
  | 'events'
  | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  isOpen,
  setIsOpen,
}) => {
  const navItems = [
    {
      id: 'demo' as NavPage,
      label: 'Live Prototype Demo',
      subtitle: 'Experience the complete workflow',
      icon: PlayCircle,
      isHighlight: true,
    },
    {
      id: 'dashboard' as NavPage,
      label: 'Farm Overview',
      subtitle: 'Real-time telemetry & metrics',
      icon: LayoutDashboard,
    },
    {
      id: 'map' as NavPage,
      label: 'Satellite Geospatial Map',
      subtitle: 'Farm perimeter & device overlay',
      icon: Compass,
    },
    {
      id: 'cameras' as NavPage,
      label: 'Cameras & AI Vision',
      subtitle: 'Multi-camera feeds & YOLO models',
      icon: Camera,
    },
    {
      id: 'deterrence' as NavPage,
      label: 'Safe Deterrence Systems',
      subtitle: 'Water pump & ultrasonic nodes',
      icon: Droplets,
    },
    {
      id: 'events' as NavPage,
      label: 'Incident Logs & Alerts',
      subtitle: 'Historical intrusion audits',
      icon: FileText,
    },
    {
      id: 'settings' as NavPage,
      label: 'System Calibration',
      subtitle: 'Zones, thresholds & sensitivity',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-950 border-r border-emerald-500/20 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* BRAND HEADER */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
          </div>

          <div>
            <div className="font-extrabold text-sm tracking-wider text-white flex items-center space-x-1.5">
              <span>SMARTFENCE</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                AI
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Protect Crops • Save Wildlife</div>
          </div>
        </div>

        {/* NAVIGATION ITEMS */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;

            if (item.isHighlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all relative overflow-hidden group cursor-pointer mb-3 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/25 to-cyan-500/15 border-2 border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                      : 'bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 hover:border-emerald-400/60'
                  }`}
                >
                  {/* Subtle animated neon shimmer background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/10 to-transparent pointer-events-none" />

                  <div className="relative flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors flex items-center space-x-1.5">
                        <span>{item.label}</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 text-[9px] font-black font-mono">
                          FEATURED
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-300/80 leading-tight mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center space-x-3 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800/80 text-white font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">{item.label}</div>
                  <div className="text-[10px] text-slate-500 leading-none mt-0.5">{item.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* BOTTOM STATUS FOOTER */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px]">System Sentinel:</span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>STANDBY ONLINE</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-500 leading-relaxed">
            Non-lethal wildlife protection with optical AI & pressurized eco-water deterrence.
          </div>
        </div>
      </aside>
    </>
  );
};
