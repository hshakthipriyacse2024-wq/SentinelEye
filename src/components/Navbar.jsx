import React, { useState, useEffect } from 'react';
import { Shield, Eye, AlertTriangle, UserPlus, Radio, Activity, Volume2, VolumeX, Flame, Lock } from 'lucide-react';
import { audioAlerts } from '../utils/AudioAlertManager';

export default function Navbar({ activeTab, setActiveTab, activeThreatCount, isMuted, setIsMuted, onTriggerEmergency }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioAlerts.setMuted(nextMute);
    if (!nextMute) audioAlerts.playClick();
  };

  const navItems = [
    { id: 'surveillance', label: 'LIVE SURVEILLANCE', icon: Eye, badge: activeThreatCount > 0 ? activeThreatCount : null },
    { id: 'personnel', label: 'AUTHORIZED PERSONNEL', icon: UserPlus },
    { id: 'incidents', label: 'FORENSIC INCIDENTS', icon: AlertTriangle, badge: 'LOGS' },
    { id: 'analytics', label: 'COMMAND ANALYTICS', icon: Activity },
  ];

  return (
    <header className="border-b border-cyan-900/40 bg-[#080d17]/95 backdrop-blur-md sticky top-0 z-40 select-none shadow-2xl">
      {/* Top Telemetry Ticker */}
      <div className="bg-[#04060a] border-b border-slate-800/80 px-4 py-1 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-emerald-400 font-bold">SYSTEM ONLINE</span>
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-cyan-300/80">LATENCY: 14ms</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">LINK: 98.4% [ENCRYPTED-AES256]</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-300 tracking-wider font-semibold">{timeStr}</span>
          <button 
            onClick={toggleMute}
            className={`p-1 rounded transition-colors ${isMuted ? 'bg-red-950/60 text-red-400 border border-red-800/50' : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/50'}`}
            title={isMuted ? "Unmute Tactical Audio" : "Mute Tactical Audio"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Defense Status */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/40 shadow-lg shadow-cyan-950/50">
            <Eye className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg md:text-xl font-bold font-orbitron tracking-wider text-slate-100 flex items-center gap-1.5">
                SENTINEL<span className="text-cyan-400">EYE</span> <span className="text-xs bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800/60">AI</span>
              </h1>
            </div>
            <p className="text-[11px] font-mono text-slate-400 tracking-tight">AUTONOMOUS DEFENSE SURVEILLANCE DRONE ECOSYSTEM</p>
          </div>
        </div>

        {/* DEFCON Status Pill */}
        <div className="hidden lg:flex items-center space-x-3">
          {activeThreatCount > 0 ? (
            <div className="px-3.5 py-1.5 rounded-md bg-red-950/80 border border-red-600/70 text-red-400 flex items-center space-x-2 animate-pulse shadow-lg shadow-red-950/50">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
              <div className="font-orbitron font-bold text-xs">
                DEFCON 2: <span className="underline">INTRUSION ALERT</span>
              </div>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-md bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <div className="font-orbitron font-semibold text-xs">
                DEFCON 4: <span className="text-emerald-300">SECURE PATROL</span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              audioAlerts.playClick();
              onTriggerEmergency();
            }}
            className="px-3 py-1.5 rounded-md bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-xs font-bold tracking-wider flex items-center space-x-1.5 shadow-md shadow-red-950/50 border border-red-400/40 transition-all hover:scale-105 active:scale-95"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>SIMULATE INTRUSION</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  audioAlerts.playClick();
                  setActiveTab(item.id);
                }}
                className={`px-3 py-2 rounded-lg font-mono text-xs font-semibold flex items-center space-x-2 transition-all duration-200 border ${
                  isActive
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-950/60 glow-cyan'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
