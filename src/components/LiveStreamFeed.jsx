import React, { useState, useEffect, useRef } from 'react';
import { Camera, Radio, Eye, Flame, ShieldAlert, Crosshair, RefreshCw, Zap, Lock, Volume2, Navigation, Layers } from 'lucide-react';
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
  const [detectedTarget, setDetectedTarget] = useState(null);
  const [simulatedSubject, setSimulatedSubject] = useState({
    x: 45, // percentage
    y: 40,
    vx: 0.15,
    vy: 0.1,
    type: 'INTRUDER' // 'INTRUDER' | 'AUTHORIZED'
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
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

  // Main Loop for Real-time AI Face Recognition & Drone Telemetry simulation
  useEffect(() => {
    let lastCheckTime = Date.now();

    const renderLoop = async () => {
      const now = Date.now();

      // Update telemetry
      setTelemetry(prev => {
        if (!prev) return prev;
        const targetState = targetLock || activeThreatCount > 0;
        return {
          ...prev,
          status: targetState ? "TARGET_LOCK" : "PATROLLING",
          flightMode: targetState ? "TARGET_TRACKING" : "AUTONOMOUS_PATROL",
          visionMode: visionMode,
          speedKmh: targetState ? 14.2 : 26.8,
          batteryPct: Math.max(5, parseFloat((prev.batteryPct - 0.005).toFixed(2)))
        };
      });

      // Handle Simulated Drone Feed Drawing
      if (streamSource === 'SIMULATOR' && simCanvasRef.current) {
        drawDroneSimCanvas();
      }

      // Handle Live Face Recognition Check every 1.5s
      if (now - lastCheckTime > 1500) {
        lastCheckTime = now;
        await performAiFaceCheck();
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [streamSource, visionMode, targetLock, activeThreatCount, personnelList]);

  // AI Face Detection & Identification
  const performAiFaceCheck = async () => {
    try {
      if (streamSource === 'WEBCAM' && videoRef.current && videoRef.current.readyState === 4) {
        // Extract vector from live video frame
        const vector = await extractFaceVectorFromElement(videoRef.current);
        const matchResult = identifyFace(vector, personnelList, 72.0);

        setDetectedTarget({
          x: 50,
          y: 45,
          width: 25,
          height: 35,
          isAuthorized: matchResult.isAuthorized,
          name: matchResult.isAuthorized ? matchResult.matchedPerson.name : "UNAUTHORIZED SUBJECT",
          confidence: matchResult.confidence,
          idTag: matchResult.isAuthorized ? matchResult.matchedPerson.id : "THREAT-ID-#991",
          rank: matchResult.isAuthorized ? matchResult.matchedPerson.rank : "UNKNOWN INTRUDER"
        });

        if (!matchResult.isAuthorized) {
          if (!targetLock) {
            setTargetLock(true);
            audioAlerts.playTargetLock();
            audioAlerts.startIntruderSiren();
            audioAlerts.speakVoiceAlert("Warning! Unidentified subject detected in protected perimeter.");
          }
          onIntruderDetected({
            name: "Unidentified Intruder",
            confidence: matchResult.confidence,
            source: "WEBCAM_LIVE",
            nearestMatch: matchResult.matchedPerson
          });
        } else {
          audioAlerts.playAuthMatch();
        }
      } else if (streamSource === 'SIMULATOR') {
        // Update simulated intruder movement
        setSimulatedSubject(prev => {
          let nx = prev.x + prev.vx;
          let ny = prev.y + prev.vy;
          let nvx = prev.vx;
          let nvy = prev.vy;

          if (nx < 20 || nx > 80) nvx = -nvx;
          if (ny < 25 || ny > 75) nvy = -nvy;

          return { ...prev, x: nx, y: ny, vx: nvx, vy: nvy };
        });

        // Set target box
        const isAuth = simulatedSubject.type === 'AUTHORIZED';
        const targetConfidence = isAuth ? 94.2 : (12.4 + Math.random() * 5);

        setDetectedTarget({
          x: simulatedSubject.x,
          y: simulatedSubject.y,
          width: 20,
          height: 30,
          isAuthorized: isAuth,
          name: isAuth ? "Cmdr. Sarah Vance" : "UNKNOWN INTRUDER",
          confidence: parseFloat(targetConfidence.toFixed(1)),
          idTag: isAuth ? "AUTH-8092" : "THREAT-LOCK-#802",
          rank: isAuth ? "Base Commander" : "UNAUTHORIZED SUBJECT"
        });

        if (!isAuth && (activeThreatCount > 0 || targetLock)) {
          // Continuous Lock
        }
      }
    } catch (e) {
      console.warn("AI face check error:", e);
    }
  };

  // Draw Drone Tactical Canvas Simulation
  const drawDroneSimCanvas = () => {
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background terrain grid
    ctx.fillStyle = visionMode === 'NIGHT_VISION' ? '#041409' : visionMode === 'FLIR_THERMAL' ? '#14001c' : '#0a101d';
    ctx.fillRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = visionMode === 'NIGHT_VISION' ? 'rgba(0, 255, 100, 0.15)' : visionMode === 'FLIR_THERMAL' ? 'rgba(255, 120, 0, 0.15)' : 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Simulated Subject (Human Figure / Heat Signature)
    const subjX = (simulatedSubject.x / 100) * w;
    const subjY = (simulatedSubject.y / 100) * h;

    if (visionMode === 'FLIR_THERMAL') {
      // Heat signature aura
      const grad = ctx.createRadialGradient(subjX, subjY, 5, subjX, subjY, 40);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ff0055');
      grad.addColorStop(0.7, '#ffaa00');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(subjX, subjY, 40, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Body Silhouette
      ctx.fillStyle = visionMode === 'NIGHT_VISION' ? '#00ff66' : '#e2e8f0';
      ctx.beginPath();
      ctx.arc(subjX, subjY - 15, 10, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(subjX - 12, subjY - 3, 24, 30); // Body
    }
  };

  const toggleSimulatedSubject = () => {
    audioAlerts.playClick();
    const nextType = simulatedSubject.type === 'INTRUDER' ? 'AUTHORIZED' : 'INTRUDER';
    setSimulatedSubject(prev => ({ ...prev, type: nextType }));
    if (nextType === 'INTRUDER') {
      setTargetLock(true);
      audioAlerts.startIntruderSiren();
    } else {
      setTargetLock(false);
      audioAlerts.stopIntruderSiren();
    }
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

          {/* Vision Modes */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'DAYLIGHT', label: 'RGB DAY', color: 'text-cyan-400' },
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

          {/* Target Toggle */}
          <button
            onClick={toggleSimulatedSubject}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-950 font-mono text-xs font-semibold flex items-center space-x-1.5 transition-all"
            title="Toggle between authorized subject and intruder threat in simulator"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>TOGGLE TARGET: {simulatedSubject.type}</span>
          </button>
        </div>

        {/* Video Canvas Feed Container */}
        <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${
          detectedTarget && !detectedTarget.isAuthorized
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
          <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-lg border border-cyan-500/30 text-xs font-mono">
            <div className="flex items-center space-x-3 text-cyan-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-bold">LIVE STREAM</span>
              </span>
              <span>CAM-01 [AZ: 142° EL: -18°]</span>
            </div>

            <div className="flex items-center space-x-4 text-slate-300">
              <span>LAT: {telemetry?.gps.lat.toFixed(4)} N</span>
              <span>LNG: {telemetry?.gps.lng.toFixed(4)} W</span>
              <span className="text-cyan-300 font-bold">ALT: {telemetry?.altitudeMeters}m</span>
              <span className="text-amber-400 font-bold">BAT: {telemetry?.batteryPct}%</span>
            </div>
          </div>

          {/* Tactical Bounding Box Overlay for AI Face Detection */}
          {detectedTarget && (
            <div
              className={`absolute z-20 border-2 transition-all duration-300 flex flex-col justify-between p-2 rounded ${
                detectedTarget.isAuthorized
                  ? 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_20px_rgba(0,255,102,0.4)]'
                  : 'border-red-500 bg-red-950/40 shadow-[0_0_30px_rgba(255,0,60,0.6)] animate-target-pulse'
              }`}
              style={{
                left: `${detectedTarget.x - 10}%`,
                top: `${detectedTarget.y - 15}%`,
                width: `${detectedTarget.width}%`,
                height: `${detectedTarget.height}%`
              }}
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white"></div>

              {/* Tag Header */}
              <div className={`-mt-7 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider inline-flex items-center space-x-1.5 ${
                detectedTarget.isAuthorized ? 'bg-emerald-900/90 text-emerald-300 border border-emerald-500' : 'bg-red-900/90 text-red-200 border border-red-500'
              }`}>
                {detectedTarget.isAuthorized ? <Lock className="w-3 h-3 text-emerald-400" /> : <Flame className="w-3 h-3 text-red-400 animate-bounce" />}
                <span>{detectedTarget.isAuthorized ? '[AUTHORIZED]' : '[THREAT INTRUDER]'}</span>
                <span>{detectedTarget.confidence}% MATCH</span>
              </div>

              {/* Center Crosshair */}
              <div className="self-center my-auto relative">
                <Crosshair className={`w-8 h-8 ${detectedTarget.isAuthorized ? 'text-emerald-400' : 'text-red-500 animate-spin'}`} />
              </div>

              {/* Tag Footer Info */}
              <div className={`-mb-8 px-2 py-1 rounded text-[11px] font-mono ${
                detectedTarget.isAuthorized ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-800' : 'bg-red-950/90 text-red-200 border border-red-800'
              }`}>
                <div className="font-bold">{detectedTarget.name}</div>
                <div className="text-[9px] opacity-80">{detectedTarget.rank} | {detectedTarget.idTag}</div>
              </div>
            </div>
          )}

          {/* HUD Reticle Overlay */}
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border border-cyan-500/20 rounded-full flex items-center justify-center">
              <div className="w-24 h-24 border border-dashed border-cyan-500/40 rounded-full"></div>
            </div>
          </div>

          {/* Bottom HUD Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-between items-center bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <span className="text-slate-400">FLIGHT MODE:</span>
              <span className="text-cyan-300 font-bold">{telemetry?.flightMode}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">SPEED:</span>
              <span className="text-emerald-400 font-bold">{telemetry?.speedKmh} km/h</span>
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
                <span>{targetLock ? 'TARGET LOCK ACTIVE' : 'ENGAGE LOCK'}</span>
              </button>

              <button
                onClick={() => {
                  audioAlerts.playClick();
                  onCaptureSnapshot(detectedTarget);
                }}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs flex items-center space-x-1"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>SNAP EVIDENCE</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Tactical Map & Live Telemetry Panel (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        {/* Tactical Map Widget */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-900/50 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-orbitron text-cyan-300 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              PERIMETER FLIGHT MAP
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              SECTOR ALPHA
            </span>
          </div>

          <div className="h-56 rounded-lg overflow-hidden border border-slate-800">
            <TacticalMap telemetry={telemetry} targetLock={targetLock} />
          </div>
        </div>

        {/* Live AI Diagnostics & Vector Match Telemetry */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-900/50 flex flex-col space-y-3">
          <h2 className="text-sm font-bold font-orbitron text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            REAL-TIME AI DIAGNOSTICS
          </h2>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">REGISTERED PERSONNEL DB:</span>
              <span className="text-cyan-400 font-bold">{personnelList.length} Profiles</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">VECTOR DISTANCE METRIC:</span>
              <span className="text-emerald-400 font-bold">Euclidean (L2 Norm)</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">MATCH CONFIDENCE THRESHOLD:</span>
              <span className="text-amber-400 font-bold">75.0%</span>
            </div>

            <div className="p-2.5 rounded bg-slate-950/90 border border-slate-800 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">NEAREST MATCH PROFILE:</span>
                <span className="text-cyan-300 font-bold">{detectedTarget?.name || 'Searching...'}</span>
              </div>
              {/* Confidence Meter Bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    detectedTarget?.isAuthorized ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${detectedTarget?.confidence || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                <span>0% (Threat)</span>
                <span>{detectedTarget?.confidence || 0}%</span>
                <span>100% (Authorized)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
