import React from 'react';
import { Navigation, Crosshair, MapPin, Radio, Shield } from 'lucide-react';
import { PATROL_WAYPOINTS } from '../utils/droneSimulator';

export default function TacticalMap({ telemetry, targetLock }) {
  // Map normalized coordinates (0-100%) for SVG drawing
  const waypointCoords = [
    { x: 25, y: 25, id: 'WP-1', label: 'North Gate' },
    { x: 75, y: 30, id: 'WP-2', label: 'Armory East' },
    { x: 70, y: 75, id: 'WP-3', label: 'Substation South' },
    { x: 20, y: 70, id: 'WP-4', label: 'Helipad West' }
  ];

  // Current Drone position derived from telemetry waypoint
  const currentWpIndex = telemetry?.currentWaypointIndex || 0;
  const currentWp = waypointCoords[currentWpIndex];
  
  // Intruder Target position (if target lock active)
  const intruderPos = { x: 55, y: 48 };

  return (
    <div className="relative w-full h-full bg-[#050914] rounded-lg overflow-hidden border border-slate-800 select-none">
      {/* Map Grid Background */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Defense Sectors Quadrants */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0, 240, 255, 0.15)" strokeDasharray="1,1" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0, 240, 255, 0.15)" strokeDasharray="1,1" strokeWidth="0.5" />

        {/* Perimeter Fence Line Boundary */}
        <polygon
          points="15,15 85,15 85,85 15,85"
          fill="rgba(0, 240, 255, 0.02)"
          stroke="rgba(0, 240, 255, 0.3)"
          strokeWidth="0.8"
          strokeDasharray="2,2"
        />

        {/* Drone Patrol Flight Path Polygon */}
        <polyline
          points={waypointCoords.map(p => `${p.x},${p.y}`).join(' ') + ` ${waypointCoords[0].x},${waypointCoords[0].y}`}
          fill="none"
          stroke="rgba(0, 240, 255, 0.6)"
          strokeWidth="1"
        />

        {/* Waypoint Markers */}
        {waypointCoords.map((wp, idx) => (
          <g key={wp.id} transform={`translate(${wp.x}, ${wp.y})`}>
            <circle r="2" fill="#00f0ff" />
            <circle r="4" fill="none" stroke="#00f0ff" strokeWidth="0.5" opacity="0.6" />
            <text x="3" y="-3" fill="#94a3b8" fontSize="2.8" fontFamily="Fira Code">
              {wp.id}
            </text>
          </g>
        ))}

        {/* Intruder Threat Marker on Map (Red Pulse) */}
        {targetLock && (
          <g transform={`translate(${intruderPos.x}, ${intruderPos.y})`}>
            <circle r="6" fill="rgba(255, 0, 60, 0.3)" className="animate-ping" />
            <circle r="3" fill="#ff003c" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#ff003c" strokeWidth="0.8" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#ff003c" strokeWidth="0.8" />
            <text x="5" y="6" fill="#ff003c" fontSize="3" fontWeight="bold" fontFamily="Orbitron">
              THREAT LOCK
            </text>
          </g>
        )}

        {/* Drone Icon Marker */}
        <g
          transform={`translate(${targetLock ? intruderPos.x - 4 : currentWp.x}, ${targetLock ? intruderPos.y - 4 : currentWp.y})`}
          className="transition-all duration-700 ease-out"
        >
          <circle r="5" fill="rgba(0, 240, 255, 0.25)" />
          <circle r="2.5" fill="#00f0ff" className="animate-pulse" />
          <path d="M 0 -4 L 3 3 L -3 3 Z" fill="#ffffff" transform={`rotate(${telemetry?.headingDegrees || 0})`} />
        </g>
      </svg>

      {/* Sector Overlay Labels */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400/70 font-bold">SECTOR ALPHA (NW)</div>
      <div className="absolute top-2 right-2 text-[9px] font-mono text-cyan-400/70 font-bold">SECTOR BRAVO (NE)</div>
      <div className="absolute bottom-2 left-2 text-[9px] font-mono text-cyan-400/70 font-bold">SECTOR DELTA (SW)</div>
      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-cyan-400/70 font-bold">SECTOR CHARLIE (SE)</div>

      {/* Map Legend */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-slate-800 text-[9px] font-mono flex items-center space-x-3 text-slate-300">
        <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span><span>DRONE</span></span>
        <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span><span>INTRUDER</span></span>
      </div>
    </div>
  );
}
