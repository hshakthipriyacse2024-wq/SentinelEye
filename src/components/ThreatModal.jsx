import React from 'react';
import { AlertTriangle, Crosshair, Volume2, ShieldCheck, MapPin, X } from 'lucide-react';
import { audioAlerts } from '../utils/AudioAlertManager';

export default function ThreatModal({ threat, onDismiss, onLockTarget }) {
  if (!threat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="hud-panel p-6 rounded-2xl border-2 border-red-500 bg-red-950/40 max-w-lg w-full space-y-5 shadow-[0_0_50px_rgba(255,0,60,0.5)] animate-pulse-slow">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-red-800/80 pb-3">
          <div className="flex items-center space-x-2 text-red-500 font-orbitron font-bold text-lg animate-pulse">
            <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />
            <span>CRITICAL INTRUSION DETECTED!</span>
          </div>
          <button
            onClick={() => { audioAlerts.playClick(); onDismiss(); }}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Threat Snapshot Preview */}
        <div className="flex gap-4 items-center bg-black/60 p-3 rounded-xl border border-red-900/60">
          <div className="w-28 h-28 rounded-lg overflow-hidden border border-red-500 shrink-0">
            <img
              src={threat.snapshotUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"}
              alt="Intruder"
              className="w-full h-full object-cover filter contrast-125"
            />
          </div>

          <div className="space-y-1 font-mono text-xs">
            <div className="text-red-400 font-bold text-sm font-orbitron">UNAUTHORIZED SUBJECT</div>
            <div className="text-slate-300">LOCATION: Sector Alpha - Fence Line 04</div>
            <div className="text-amber-400">DISTANCE TO WALL: 18.4 meters</div>
            <div className="text-slate-400 text-[10px]">FACIAL MATCH SCORE: {threat.confidence}% (UNRECOGNIZED)</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
          <button
            onClick={() => {
              audioAlerts.playClick();
              audioAlerts.startIntruderSiren();
              onLockTarget();
            }}
            className="py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center space-x-2 shadow-lg shadow-red-950/60"
          >
            <Crosshair className="w-4 h-4" />
            <span>ENGAGE TARGET LOCK</span>
          </button>

          <button
            onClick={() => {
              audioAlerts.playClick();
              audioAlerts.speakVoiceAlert("Attention intruder! You are trespassing in a prohibited defense zone. Remain stationary.");
            }}
            className="py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-950/60"
          >
            <Volume2 className="w-4 h-4" />
            <span>BROADCAST SIREN</span>
          </button>
        </div>
      </div>
    </div>
  );
}
