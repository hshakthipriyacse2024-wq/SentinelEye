import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Filter, Download, FileText, Eye, MapPin, Calendar, Clock, Crosshair, CheckCircle, XCircle } from 'lucide-react';
import { audioAlerts } from '../utils/AudioAlertManager';

export default function IntrusionLogs({ incidentList }) {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const filteredIncidents = incidentList.filter(inc => {
    if (filterLevel === 'ALL') return true;
    return inc.threatLevel === filterLevel;
  });

  const exportForensicReport = (inc) => {
    audioAlerts.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inc, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SentinelEye_ForensicReport_${inc.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header & Filter Controls */}
      <div className="hud-panel p-5 rounded-xl border border-cyan-900/50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-orbitron text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            FORENSIC INCIDENT LOGS & EVIDENCE ARCHIVE
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Automated security trail of all human detections, unknown threat intrusions, snapshot evidence, and facial match metrics.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">THREAT FILTER:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-cyan-300 rounded px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">ALL INCIDENTS</option>
            <option value="CRITICAL">CRITICAL THREATS</option>
            <option value="HIGH">HIGH THREATS</option>
            <option value="VERIFIED_CLEAR">VERIFIED CLEAR</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredIncidents.map((inc) => {
          const isCritical = inc.threatLevel === 'CRITICAL';
          const isHigh = inc.threatLevel === 'HIGH';
          const isClear = inc.threatLevel === 'VERIFIED_CLEAR';

          return (
            <div
              key={inc.id}
              className={`hud-panel p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] flex flex-col md:flex-row gap-4 ${
                isCritical ? 'border-red-900/80 bg-red-950/20 hover:border-red-500' :
                isHigh ? 'border-amber-900/80 bg-amber-950/20 hover:border-amber-500' :
                'border-emerald-900/60 bg-emerald-950/10 hover:border-emerald-500'
              }`}
            >
              {/* Snapshot Image Thumbnail */}
              <div className="relative w-full md:w-44 h-40 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                <img src={inc.snapshotUrl} alt="Evidence" className="w-full h-full object-cover filter contrast-110" />
                
                {/* Threat Badge Overlay */}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                  isCritical ? 'bg-red-600 text-white animate-pulse' :
                  isHigh ? 'bg-amber-600 text-black' :
                  'bg-emerald-600 text-white'
                }`}>
                  {inc.threatLevel}
                </div>

                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300">
                  {inc.matchConfidence}% MATCH
                </div>
              </div>

              {/* Incident Details Info */}
              <div className="flex-1 flex flex-col justify-between space-y-2 text-xs font-mono">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-slate-100 font-orbitron">{inc.id}</h3>
                    <span className="text-[11px] text-slate-400">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-cyan-400 text-xs font-semibold">{inc.sector}</p>
                </div>

                <div className="space-y-1 text-[11px] text-slate-300 border-t border-slate-800/80 pt-2">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>GPS: {inc.gps.lat.toFixed(4)} N, {inc.gps.lng.toFixed(4)} W</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                    <span>DRONE: {inc.droneId}</span>
                  </div>
                </div>

                <p className="text-slate-400 line-clamp-2 text-[11px] italic bg-slate-950/60 p-2 rounded border border-slate-800/60">
                  "{inc.notes}"
                </p>

                {/* Inspect Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => { audioAlerts.playClick(); setSelectedIncident(inc); }}
                    className="px-3 py-1.5 rounded bg-cyan-950 border border-cyan-700 hover:bg-cyan-900 text-cyan-300 font-bold text-[11px] flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>INSPECT FORENSIC BREAKDOWN</span>
                  </button>

                  <button
                    onClick={() => exportForensicReport(inc)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Export JSON Evidence Report"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Forensic Inspection Modal Dialog */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="hud-panel p-6 rounded-2xl border-2 border-red-500/60 max-w-3xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-red-900/50 pb-3">
              <div>
                <h2 className="text-lg font-bold font-orbitron text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                  FORENSIC ANALYSIS REPORT: {selectedIncident.id}
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  DETECTED AT {new Date(selectedIncident.timestamp).toLocaleString()} | {selectedIncident.sector}
                </p>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-xs"
              >
                CLOSE
              </button>
            </div>

            {/* Side by Side Face Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Captured Frame */}
              <div className="p-3 rounded-xl bg-slate-950 border border-red-900/60 space-y-2">
                <div className="text-xs font-mono font-bold text-red-400 flex items-center justify-between">
                  <span>1. CAPTURED INTRUDER FRAME</span>
                  <span className="text-[10px] bg-red-950 text-red-300 px-1.5 py-0.5 rounded border border-red-800">TARGET</span>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden border border-slate-700">
                  <img src={selectedIncident.snapshotUrl} alt="Captured Intruder" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Nearest Database Match */}
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/60 space-y-2">
                <div className="text-xs font-mono font-bold text-cyan-400 flex items-center justify-between">
                  <span>2. NEAREST REGISTERED PROFILE</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                    {selectedIncident.matchConfidence > 75 ? 'MATCH FOUND' : 'NO MATCH'}
                  </span>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                  {selectedIncident.matchConfidence > 75 ? (
                    <img src={selectedIncident.snapshotUrl} alt="Matched Person" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-slate-500 font-mono text-xs">
                      <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2 opacity-60" />
                      <div>UNREGISTERED INTRUDER</div>
                      <div className="text-[10px] text-slate-600 mt-1">No feature similarity above 75% threshold</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Similarity Score Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">FACIAL FEATURE VECTOR MATCH METRIC:</span>
                <span className={`font-bold text-sm ${selectedIncident.matchConfidence > 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedIncident.matchConfidence}% SIMILARITY
                </span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full ${selectedIncident.matchConfidence > 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${selectedIncident.matchConfidence}%` }}
                ></div>
              </div>
            </div>

            {/* Actions Taken Audit Trail */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
              <h4 className="font-bold text-slate-200">AUTOMATED RESPONSES ENGAGED:</h4>
              <ul className="space-y-1 text-slate-400">
                {selectedIncident.actionsTaken.map((act, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Export Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800 font-mono text-xs">
              <button
                onClick={() => exportForensicReport(selectedIncident)}
                className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>EXPORT FORENSIC DOSSIER (JSON)</span>
              </button>

              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 font-bold"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
