import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, Cpu, Radio, Battery, Zap, Flame, BarChart3, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function AnalyticsDashboard({ personnelList, incidentList, telemetry }) {
  // Mock 24-hour Detection Timeline Data
  const hourlyData = [
    { hour: '00:00', authorized: 2, intruders: 0 },
    { hour: '03:00', authorized: 1, intruders: 1 },
    { hour: '06:00', authorized: 5, intruders: 0 },
    { hour: '09:00', authorized: 14, intruders: 2 },
    { hour: '12:00', authorized: 18, intruders: 1 },
    { hour: '15:00', authorized: 12, intruders: 0 },
    { hour: '18:00', authorized: 8, intruders: 3 },
    { hour: '21:00', authorized: 4, intruders: 1 }
  ];

  // Sector Risk Bar Data
  const sectorData = [
    { sector: 'Sector Alpha', risk: 85, threats: 4 },
    { sector: 'Sector Bravo', risk: 20, threats: 1 },
    { sector: 'Sector Charlie', risk: 45, threats: 2 },
    { sector: 'Sector Delta', risk: 15, threats: 0 }
  ];

  const activeIntruders = incidentList.filter(i => i.threatLevel === 'CRITICAL' || i.threatLevel === 'HIGH').length;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="hud-panel p-5 rounded-xl border border-cyan-900/50">
        <h1 className="text-xl font-bold font-orbitron text-slate-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          PERIMETER SECURITY COMMAND ANALYTICS
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Real-time threat metrics, AI inference performance, sector risk index, and autonomous surveillance telemetry.
        </p>
      </div>

      {/* KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-900/50 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400">REGISTERED PERSONNEL</p>
            <h2 className="text-2xl font-bold font-orbitron text-cyan-300 mt-1">{personnelList.length}</h2>
            <span className="text-[10px] font-mono text-emerald-400">100% Zero-Dataset Vector Enrolled</span>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="hud-panel p-4 rounded-xl border border-red-900/60 bg-red-950/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400">ACTIVE INTRUSION THREATS</p>
            <h2 className="text-2xl font-bold font-orbitron text-red-400 mt-1">{activeIntruders}</h2>
            <span className="text-[10px] font-mono text-red-400 animate-pulse">Target Tracking Engaged</span>
          </div>
          <div className="p-3 rounded-lg bg-red-950 border border-red-800 text-red-500">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-900/50 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400">AI INFERENCE LATENCY</p>
            <h2 className="text-2xl font-bold font-orbitron text-amber-300 mt-1">{telemetry?.aiLatencyMs || 14}ms</h2>
            <span className="text-[10px] font-mono text-slate-400">Real-Time Canvas Feature Vector Engine</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-900/50 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono text-slate-400">DRONE BATTERY & SIGNAL</p>
            <h2 className="text-2xl font-bold font-orbitron text-emerald-400 mt-1">{telemetry?.batteryPct}%</h2>
            <span className="text-[10px] font-mono text-emerald-400">Signal: -62 dBm [AES-256]</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
            <Battery className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Detection Timeline Chart (7 Cols) */}
        <div className="lg:col-span-7 hud-panel p-5 rounded-xl border border-cyan-900/50 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold font-orbitron text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              24-HOUR DETECTION TIMELINE (AUTHORIZED VS INTRUDER)
            </h2>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorAuth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff66" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00ff66" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff003c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff003c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'Fira Code' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'Fira Code' }} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: '12px', fontFamily: 'Fira Code' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Fira Code' }} />
                <Area type="monotone" dataKey="authorized" stroke="#00ff66" fillOpacity={1} fill="url(#colorAuth)" name="Authorized Detections" />
                <Area type="monotone" dataKey="intruders" stroke="#ff003c" fillOpacity={1} fill="url(#colorThreat)" name="Unidentified Intruder Alerts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Risk Index Bar Chart (5 Cols) */}
        <div className="lg:col-span-5 hud-panel p-5 rounded-xl border border-cyan-900/50 space-y-4">
          <h2 className="text-sm font-bold font-orbitron text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            PERIMETER SECTOR RISK INDEX
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sector" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'Fira Code' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'Fira Code' }} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: '12px', fontFamily: 'Fira Code' }} />
                <Bar dataKey="risk" fill="#ffb700" radius={[4, 4, 0, 0]} name="Sector Risk Index (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
