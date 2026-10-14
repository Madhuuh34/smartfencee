import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { events, setEventDetailModal, clearEvents } = useFarm();
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.zoneName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = speciesFilter === 'all' || e.animalType === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  const exportCSV = () => {
    const rows = [
      ['Event ID', 'Timestamp', 'Species', 'Confidence (%)', 'Zone', 'Camera', 'Distance (m)', 'Response', 'SMS Status'],
      ...events.map((e) => [
        e.id,
        e.timestamp,
        e.animalName,
        e.confidence.toString(),
        e.zoneName,
        e.cameraId,
        e.sensorDistanceM.toString(),
        e.deterrenceResponse,
        e.smsStatus,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartfence_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1600px] mx-auto text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>WILDLIFE INTRUSION AUDIT TRAIL</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable log of detected wildlife, camera inference records, and automated water sprays
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {events.length > 0 && (
            <button
              onClick={clearEvents}
              className="py-2 px-3.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-xs font-semibold text-rose-300 border border-rose-500/30 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search event ID, species, or sector..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-400"
          >
            <option value="all">All Species</option>
            <option value="deer">Spotted Deer</option>
            <option value="wild_boar">Wild Boar</option>
            <option value="elephant">Asian Elephant</option>
            <option value="rat">Field Rat</option>
          </select>
        </div>
      </div>

      {/* EVENTS TABLE */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Species</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Camera</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Deterrence</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No matching events found. Run the Live Prototype Demo to log new intrusions.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{evt.id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{evt.timestamp}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
                        <span>
                          {evt.animalType === 'deer' && '🦌'}
                          {evt.animalType === 'wild_boar' && '🐗'}
                          {evt.animalType === 'elephant' && '🐘'}
                          {evt.animalType === 'rat' && '🐀'}
                        </span>
                        <span>{evt.animalName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                      {evt.confidence.toFixed(1)}% (DEMO)
                    </td>
                    <td className="py-3.5 px-4">{evt.zoneName}</td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400">{evt.cameraId}</td>
                    <td className="py-3.5 px-4 font-mono">{evt.sensorDistanceM}m</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                        {evt.pumpStatus} ({evt.pumpDurationSec}s)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setEventDetailModal(evt)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center justify-end space-x-1 ml-auto cursor-pointer"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
