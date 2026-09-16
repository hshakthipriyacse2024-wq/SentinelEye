import React, { useState, useEffect, useRef } from 'react';
import { Camera, Radio, Eye, Flame, ShieldAlert, Crosshair, RefreshCw, Zap, Lock, Volume2, Navigation, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { identifyFace, extractFaceVectorFromElement } from '../utils/faceIntelligence';
import { audioAlerts } from '../utils/AudioAlertManager';
import TacticalMap from './TacticalMap';

export default function LiveStreamFeed({
  telemetry,
  setTelemetry,
  personnelList,
  onIntruderDetected,
  activeThreatCount,
  onCaptureSnapshot
}) {
  const [streamSource, setStreamSource] = useState('SIMULATOR'); // 'SIMULATOR' | 'WEBCAM'
  const [visionMode, setVisionMode] = useState('DAYLIGHT'); // 'DAYLIGHT' | 'NIGHT_VISION' | 'FLIR_THERMAL'
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [targetLock, setTargetLock] = useState(false);
  const [targetCount, setTargetCount] = useState(4); // 4 or 5 simultaneous people in frame!

  // Array of 4-5 simultaneous moving subjects in the frame
  const [simulatedGroup, setSimulatedGroup] = useState([
    { id: 'T-01', x: 22, y: 35, vx: 0.08, vy: 0.05, width: 16, height: 26, isAuthorized: true, personIndex: 0 },
    { id: 'T-02', x: 42, y: 32, vx: -0.06, vy: 0.04, width: 16, height: 26, isAuthorized: true, personIndex: 1 },
    { id: 'T-03', x: 62, y: 38, vx: 0.07, vy: -0.06, width: 16, height: 26, isAuthorized: true, personIndex: 2 },
    { id: 'T-04', x: 78, y: 44, vx: -0.09, vy: 0.05, width: 16, height: 26, isAuthorized: false, personIndex: -1 }, // Intruder
    { id: 'T-05', x: 30, y: 55, vx: 0.05, vy: -0.04, width: 16, height: 26, isAuthorized: true, personIndex: 3 },
  ]);

  const videoRef = useRef(null);
  const simCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize or Stop Webcam
  useEffect(() => {
    if (streamSource === 'WEBCAM') {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [streamSource]);

  const startWebcam = async () => {
    try {
      setWebcamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setWebcamActive(true);
      }
    } catch (err) {
      console.error("Webcam access error:", err);
      setWebcamError("Camera access denied or unavailable. Falling back to Tactical Drone Simulator.");
      setStreamSource('SIMULATOR');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  // Main Loop for Real-Time Multi-Person Movement & Recognition
  useEffect(() => {
    let lastCheckTime = Date.now();

    const renderLoop = () => {
      const now = Date.now();

      // Update telemetry
      setTelemetry(prev => {
        if (!prev) return prev;
        const threatActive = targetLock || activeThreatCount > 0;
        return {
          ...prev,
          status: threatActive ? "MULTI_TARGET_LOCK" : "PATROLLING",
          flightMode: threatActive ? "TARGET_TRACKING" : "AUTONOMOUS_PATROL",
          visionMode: visionMode,
          speedKmh: threatActive ? 14.2 : 26.8,
          batteryPct: Math.max(5, parseFloat((prev.batteryPct - 0.005).toFixed(2)))
        };
      });

      // Update positions of the 4-5 simulated subjects
      setSimulatedGroup(prevGroup => {
        return prevGroup.map(subj => {
          let nx = subj.x + subj.vx;
          let ny = subj.y + subj.vy;
          let nvx = subj.vx;
          let nvy = subj.vy;

          if (nx < 12 || nx > 82) nvx = -nvx;
          if (ny < 20 || ny > 70) nvy = -nvy;

          return { ...subj, x: nx, y: ny, vx: nvx, vy: nvy };
        });
      });

      // Draw Drone Canvas Background & Thermal Heat Maps
      if (streamSource === 'SIMULATOR' && simCanvasRef.current) {
        drawMultiPersonSimCanvas();
      }

      // Check for intruder in group every 2 seconds
      if (now - lastCheckTime > 2000) {
        lastCheckTime = now;
        const intrudersInGroup = simulatedGroup.slice(0, targetCount).filter(s => !s.isAuthorized);
        if (intrudersInGroup.length > 0 && !targetLock) {
          setTargetLock(true);
          audioAlerts.playTargetLock();
          audioAlerts.startIntruderSiren();
          onIntruderDetected({
            name: "Unidentified Intruder Subject",
            confidence: 14.2,
            source: "MULTI_TARGET_SURVEILLANCE"
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [streamSource, visionMode, targetLock, activeThreatCount, targetCount, simulatedGroup]);

  // Render 4-5 moving subjects on the canvas
  const drawMultiPersonSimCanvas = () => {
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background terrain
    ctx.fillStyle = visionMode === 'NIGHT_VISION' ? '#041409' : visionMode === 'FLIR_THERMAL' ? '#12001a' : '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Tactical Grid
    ctx.strokeStyle = visionMode === 'NIGHT_VISION' ? 'rgba(0, 255, 100, 0.12)' : visionMode === 'FLIR_THERMAL' ? 'rgba(255, 120, 0, 0.12)' : 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw silhouettes / thermal signatures for each person in frame
    simulatedGroup.slice(0, targetCount).forEach((subj) => {
      const sx = (subj.x / 100) * w;
      const sy = (subj.y / 100) * h;

      if (visionMode === 'FLIR_THERMAL') {
        const grad = ctx.createRadialGradient(sx, sy, 4, sx, sy, 35);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, subj.isAuthorized ? '#00ff66' : '#ff0055');
        grad.addColorStop(0.7, '#ffaa00');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(sx, sy, 35, 0, Math.PI * 2); ctx.fill();
      } else {
        // Draw head & body silhouette
        ctx.fillStyle = subj.isAuthorized
          ? (visionMode === 'NIGHT_VISION' ? '#00ff66' : '#38bdf8')
          : (visionMode === 'NIGHT_VISION' ? '#ff3366' : '#ef4444');
        ctx.beginPath(); ctx.arc(sx, sy - 14, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(sx - 10, sy - 4, 20, 26);
      }
    });
  };

  // Toggle Intruder vs Authorized status for Target 4
  const toggleIntruderInGroup = () => {
    audioAlerts.playClick();
    setSimulatedGroup(prev => prev.map(s => {
      if (s.id === 'T-04') {
        const nextAuth = !s.isAuthorized;
        if (!nextAuth) {
          setTargetLock(true);
          audioAlerts.startIntruderSiren();
        } else {
          setTargetLock(false);
          audioAlerts.stopIntruderSiren();
        }
        return { ...s, isAuthorized: nextAuth };
      }
      return s;
    }));
  };

  const handleManualLockToggle = () => {
    audioAlerts.playClick();
    const nextLock = !targetLock;
    setTargetLock(nextLock);
    if (nextLock) {
      audioAlerts.startIntruderSiren();
      audioAlerts.playTargetLock();
    } else {
      audioAlerts.stopIntruderSiren();
    }
  };

  // Compute multi-target details array for HUD bounding boxes
  const activeTargets = (streamSource === 'WEBCAM' ? [
    { id: 'T-01', x: 28, y: 35, width: 20, height: 32, isAuthorized: true, person: personnelList[0], confidence: 96.4 },
    { id: 'T-02', x: 52, y: 35, width: 20, height: 32, isAuthorized: true, person: personnelList[1], confidence: 94.1 },
    { id: 'T-03', x: 74, y: 35, width: 20, height: 32, isAuthorized: false, person: null, confidence: 12.8 },
  ] : simulatedGroup.slice(0, targetCount).map((subj, idx) => {
    const person = subj.isAuthorized && personnelList[subj.personIndex % personnelList.length]
      ? personnelList[subj.personIndex % personnelList.length]
      : null;

    return {
      id: subj.id,
      x: subj.x,
      y: subj.y,
      width: subj.width,
      height: subj.height,
      isAuthorized: subj.isAuthorized,
      person: person,
      confidence: subj.isAuthorized ? parseFloat((92 + (idx * 1.8)).toFixed(1)) : 14.2
    };
  }));

  const authorizedInViewCount = activeTargets.filter(t => t.isAuthorized).length;
  const intrudersInViewCount = activeTargets.filter(t => !t.isAuthorized).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 lg:p-6">
      {/* Main Stream Area (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Stream Top Control Header */}
        <div className="hud-panel p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-cyan-900/50">
          {/* Source Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => { audioAlerts.playClick(); setStreamSource('SIMULATOR'); }}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                streamSource === 'SIMULATOR' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 glow-cyan' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>DRONE SIMULATOR</span>
            </button>

            <button
              onClick={() => { audioAlerts.playClick(); setStreamSource('WEBCAM'); }}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                streamSource === 'WEBCAM' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 glow-cyan' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>LIVE WEBCAM AI</span>
            </button>
          </div>

          {/* Simultaneous Target Count Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 px-2 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> SIMULTANEOUS TARGETS:
            </span>
            {[3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => { audioAlerts.playClick(); setTargetCount(num); }}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  targetCount === num ? 'bg-cyan-900 text-cyan-300 border border-cyan-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {num} PEOPLE
              </button>
            ))}
          </div>

          {/* Vision Modes */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'DAYLIGHT', label: 'DAYLIGHT', color: 'text-cyan-400' },
              { id: 'NIGHT_VISION', label: 'NIGHT VIS', color: 'text-emerald-400' },
              { id: 'FLIR_THERMAL', label: 'FLIR HEAT', color: 'text-amber-400' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => { audioAlerts.playClick(); setVisionMode(mode.id); }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  visionMode === mode.id ? `bg-slate-800 ${mode.color} border border-slate-700` : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Canvas Feed Container */}
        <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${
          intrudersInViewCount > 0
            ? 'border-red-500 border-glow-red animate-pulse-slow'
            : 'border-cyan-500/40 border-glow-cyan'
        }`}>
          {/* Vision filter overlay container */}
          <div className={`absolute inset-0 z-0 ${
            visionMode === 'NIGHT_VISION' ? 'filter saturate-200 hue-rotate-90 contrast-125 brightness-90 bg-emerald-950/20' :
            visionMode === 'FLIR_THERMAL' ? 'filter saturate-200 hue-rotate-180 contrast-200 brightness-90 bg-purple-950/30' : ''
          }`}>
            {streamSource === 'WEBCAM' ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <canvas
                ref={simCanvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Scanlines Effect */}
          <div className="scanlines"></div>

          {/* HUD Top Bar Overlay */}
          <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-lg border border-cyan-500/30 text-xs font-mono">
            <div className="flex items-center space-x-3 text-cyan-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-bold">MULTI-PERSON AI SURVEILLANCE</span>
              </span>
              <span className="text-emerald-400 font-bold">[{authorizedInViewCount} AUTHORIZED]</span>
              {intrudersInViewCount > 0 && (
                <span className="text-red-400 font-bold animate-pulse">[{intrudersInViewCount} INTRUDER THREAT]</span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-slate-300">
              <span>LAT: {telemetry?.gps.lat.toFixed(4)} N</span>
              <span>LNG: {telemetry?.gps.lng.toFixed(4)} W</span>
              <span className="text-cyan-300 font-bold">ALT: {telemetry?.altitudeMeters}m</span>
              <span className="text-amber-400 font-bold">BAT: {telemetry?.batteryPct}%</span>
            </div>
          </div>

          {/* SIMULTANEOUS MULTI-PERSON BOUNDING BOX OVERLAYS (4-5 PEOPLE AT A TIME!) */}
          {activeTargets.map((target) => (
            <div
              key={target.id}
              className={`absolute z-20 border-2 transition-all duration-300 flex flex-col justify-between p-1.5 rounded ${
                target.isAuthorized
                  ? 'border-emerald-400 bg-emerald-950/25 shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : 'border-red-500 bg-red-950/40 shadow-[0_0_25px_rgba(255,0,60,0.6)] animate-target-pulse'
              }`}
              style={{
                left: `${target.x - 7}%`,
                top: `${target.y - 12}%`,
                width: `${target.width}%`,
                height: `${target.height}%`
              }}
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white"></div>
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white"></div>
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white"></div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white"></div>

              {/* Tag Header */}
              <div className={`-mt-6 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider inline-flex items-center space-x-1 ${
                target.isAuthorized ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500' : 'bg-red-950/90 text-red-200 border border-red-500'
              }`}>
                {target.isAuthorized ? <Lock className="w-2.5 h-2.5 text-emerald-400" /> : <Flame className="w-2.5 h-2.5 text-red-400 animate-bounce" />}
                <span>{target.id}: {target.isAuthorized ? '[AUTHORIZED]' : '[INTRUDER]'}</span>
                <span>{target.confidence}%</span>
              </div>

              {/* Center Target Lock Reticle */}
              <div className="self-center my-auto relative">
                <Crosshair className={`w-6 h-6 ${target.isAuthorized ? 'text-emerald-400 opacity-80' : 'text-red-500 animate-spin'}`} />
              </div>

              {/* Tag Footer Info */}
              <div className={`-mb-7 px-1.5 py-0.5 rounded text-[10px] font-mono ${
                target.isAuthorized ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-800' : 'bg-red-950/90 text-red-200 border border-red-800'
              }`}>
                <div className="font-bold truncate">{target.person ? target.person.name : "UNAUTHORIZED SUBJECT"}</div>
                <div className="text-[8px] opacity-80 truncate">{target.person ? `${target.person.rank} | ${target.person.id}` : "UNKNOWN PATTERN"}</div>
              </div>
            </div>
          ))}

          {/* Bottom HUD Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-between items-center bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30 text-xs font-mono">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleIntruderInGroup}
                className="px-3 py-1 rounded bg-slate-900 border border-cyan-700 text-cyan-300 hover:bg-cyan-950 font-bold text-xs flex items-center space-x-1.5"
                title="Toggle intruder in multi-person group"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>TOGGLE THREAT SUBJECT</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleManualLockToggle}
                className={`px-3 py-1 rounded font-bold text-xs flex items-center space-x-1.5 transition-all ${
                  targetLock
                    ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/50'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-700 hover:bg-cyan-900'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>{targetLock ? 'MULTI-TARGET LOCK ACTIVE' : 'ENGAGE LOCK'}</span>
              </button>

              <button
                onClick={() => {
                  audioAlerts.playClick();
                  onCaptureSnapshot(activeTargets[0]);
                }}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs flex items-center space-x-1"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>SNAP MULTI-FRAME EVIDENCE</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Multi-Target Lock Roster & Telemetry Panel (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        {/* Simultaneous Multi-Target Tracking Roster */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-900/50 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-orbitron text-cyan-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              SIMULTANEOUS MULTI-FACE AI TRACKER
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              {targetCount} TARGETS IN VIEW
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {activeTargets.map((target) => (
              <div
                key={target.id}
                className={`p-2.5 rounded-lg border font-mono text-xs flex items-center justify-between transition-all ${
                  target.isAuthorized
                    ? 'bg-slate-950/80 border-emerald-900/60 text-slate-200'
                    : 'bg-red-950/30 border-red-800/80 text-red-200 animate-pulse'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1.5 rounded ${target.isAuthorized ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                    {target.isAuthorized ? <UserCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>{target.id}:</span>
                      <span className={target.isAuthorized ? 'text-slate-100' : 'text-red-400 font-orbitron'}>
                        {target.person ? target.person.name : "UNKNOWN INTRUDER"}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {target.person ? target.person.rank : "NO DATABASE MATCH"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-xs ${target.isAuthorized ? 'text-emerald-400' : 'text-red-400'}`}>
                    {target.confidence}%
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {target.isAuthorized ? 'AUTHORIZED' : 'THREAT ALERT'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Map Widget */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-900/50 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-orbitron text-slate-200 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              PERIMETER FLIGHT MAP
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              SECTOR ALPHA
            </span>
          </div>

          <div className="h-44 rounded-lg overflow-hidden border border-slate-800">
            <TacticalMap telemetry={telemetry} targetLock={targetLock} />
          </div>
        </div>
      </div>
    </div>
  );
}
