import React, { useState, useEffect, useRef } from 'react';
import { Camera, Radio, Eye, Flame, Crosshair, RefreshCw, Zap, Lock, Navigation, Users, UserCheck, AlertTriangle, ShieldCheck, UserX } from 'lucide-react';
import { identifyFace, extractVectorFromRegion, detectFaceRegionsInCanvasAsync } from '../utils/faceIntelligence';
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

  // Active Face Count Limit: 0, 1, 2, 3, or 4 faces in frame
  const [simulatedFacePreset, setSimulatedFacePreset] = useState(1); // Default 1 face focus
  const [includeUnauthorizedInSim, setIncludeUnauthorizedInSim] = useState(false);

  // Active Recognized Faces currently detected in the video frame
  const [detectedFaces, setDetectedFaces] = useState([]);

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
      setWebcamError("Camera access denied or unavailable. Falling back to Drone Simulator.");
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

  // Main Render & Face Recognition Loop
  useEffect(() => {
    let lastScanTime = Date.now();

    const renderLoop = async () => {
      const now = Date.now();

      // Update telemetry
      setTelemetry(prev => {
        if (!prev) return prev;
        const threatActive = targetLock || detectedFaces.some(f => !f.isAuthorized);
        return {
          ...prev,
          status: threatActive ? "TARGET_LOCK" : "PATROLLING",
          flightMode: threatActive ? "TARGET_TRACKING" : "AUTONOMOUS_PATROL",
          visionMode: visionMode,
          speedKmh: threatActive ? 14.2 : 26.8,
          batteryPct: Math.max(5, parseFloat((prev.batteryPct - 0.005).toFixed(2)))
        };
      });

      // Handle Simulated Drone Video Stream Canvas Drawing
      if (streamSource === 'SIMULATOR' && simCanvasRef.current) {
        drawSimulatedCanvas();
      }

      // Perform Real-Time High-Precision Face Scan Every 500ms
      if (now - lastScanTime > 500) {
        lastScanTime = now;
        await performFaceScan();
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [streamSource, visionMode, targetLock, simulatedFacePreset, includeUnauthorizedInSim, personnelList, detectedFaces]);

  // Perform Face Scan over Video Frame
  const performFaceScan = async () => {
    if (streamSource === 'WEBCAM' && videoRef.current && videoRef.current.readyState === 4) {
      if (simulatedFacePreset === 0) {
        setDetectedFaces([]);
        return;
      }

      // Process Live Webcam Video Frame
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = videoRef.current.videoWidth || 640;
      tempCanvas.height = videoRef.current.videoHeight || 480;
      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);

      // Detect prominent face bounding box candidates in camera image
      const allBoxes = await detectFaceRegionsInCanvasAsync(tempCanvas, 4);

      // STRICT CAP based on user's selected "FACES IN FRAME" button (1 face, 2 faces, etc.)
      const boxes = allBoxes.slice(0, simulatedFacePreset);

      if (!boxes || boxes.length === 0) {
        setDetectedFaces([]);
        return;
      }

      // Process each face region in camera
      const recognized = boxes.map((box, idx) => {
        const vec = extractVectorFromRegion(ctx, box.pixelX, box.pixelY, box.pixelW, box.pixelH);
        const match = identifyFace(vec, personnelList, 55.0);
        const isAuth = match.isAuthorized;
        const person = isAuth ? match.matchedPerson : null;

        return {
          id: `WEBCAM-FACE-${idx + 1}`,
          x: box.xPct,
          y: box.yPct,
          width: Math.max(20, box.widthPct),
          height: Math.max(28, box.heightPct),
          isAuthorized: isAuth,
          person: person,
          name: isAuth ? person.name : "UNAUTHORIZED PERSON",
          rank: isAuth ? person.rank : "DETECTED INTRUDER",
          confidence: match.confidence
        };
      });

      setDetectedFaces(recognized);

      // Check if any unauthorized intruder is found
      const hasIntruder = recognized.some(f => !f.isAuthorized);
      if (hasIntruder && !targetLock) {
        setTargetLock(true);
        audioAlerts.playTargetLock();
        audioAlerts.startIntruderSiren();
        onIntruderDetected({
          name: "UNAUTHORIZED PERSON DETECTED",
          confidence: 14.2,
          source: "WEBCAM_LIVE"
        });
      }
    } else if (streamSource === 'SIMULATOR') {
      // Process Simulator Faces based on active face count preset (0 to 4 faces)
      if (simulatedFacePreset === 0) {
        setDetectedFaces([]);
        return;
      }

      const generatedFaces = [];
      const presets = [
        { x: 38, y: 30, w: 22, h: 36, isAuth: !includeUnauthorizedInSim, personIdx: 0 },
        { x: 18, y: 32, w: 20, h: 34, isAuth: true, personIdx: 1 },
        { x: 64, y: 35, w: 20, h: 34, isAuth: true, personIdx: 2 },
        { x: 42, y: 55, w: 20, h: 34, isAuth: true, personIdx: 3 }
      ];

      for (let i = 0; i < Math.min(simulatedFacePreset, presets.length); i++) {
        const p = presets[i];
        const person = p.isAuth && personnelList[p.personIdx % personnelList.length]
          ? personnelList[p.personIdx % personnelList.length]
          : null;

        generatedFaces.push({
          id: `FACE-${i + 1}`,
          x: p.x,
          y: p.y,
          width: p.w,
          height: p.h,
          isAuthorized: p.isAuth,
          person: person,
          name: p.isAuth ? person.name : "UNAUTHORIZED PERSON",
          rank: p.isAuth ? person.rank : "DETECTED INTRUDER",
          confidence: p.isAuth ? parseFloat((93.5 + i * 1.5).toFixed(1)) : 14.2
        });
      }

      setDetectedFaces(generatedFaces);

      const hasIntruder = generatedFaces.some(f => !f.isAuthorized);
      if (hasIntruder && !targetLock) {
        setTargetLock(true);
        audioAlerts.startIntruderSiren();
      }
    }
  };

  // Draw Simulator Canvas Feed
  const drawSimulatedCanvas = () => {
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background terrain
    ctx.fillStyle = visionMode === 'NIGHT_VISION' ? '#041409' : visionMode === 'FLIR_THERMAL' ? '#12001a' : '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = visionMode === 'NIGHT_VISION' ? 'rgba(0, 255, 100, 0.12)' : visionMode === 'FLIR_THERMAL' ? 'rgba(255, 120, 0, 0.12)' : 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Draw human figures for currently active detected faces
    detectedFaces.forEach(face => {
      const fx = (face.x / 100) * w + (face.width / 200) * w;
      const fy = (face.y / 100) * h + (face.height / 200) * h;

      if (visionMode === 'FLIR_THERMAL') {
        const grad = ctx.createRadialGradient(fx, fy, 4, fx, fy, 35);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, face.isAuthorized ? '#00ff66' : '#ff0055');
        grad.addColorStop(0.7, '#ffaa00');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(fx, fy, 35, 0, Math.PI * 2); ctx.fill();
      } else {
        // Draw head & torso silhouette
        ctx.fillStyle = face.isAuthorized
          ? (visionMode === 'NIGHT_VISION' ? '#00ff66' : '#38bdf8')
          : (visionMode === 'NIGHT_VISION' ? '#ff3366' : '#ef4444');
        ctx.beginPath(); ctx.arc(fx, fy - 14, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(fx - 12, fy - 2, 24, 28);
      }
    });
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

  const authorizedCount = detectedFaces.filter(f => f.isAuthorized).length;
  const unauthorizedCount = detectedFaces.filter(f => !f.isAuthorized).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 lg:p-6">
      {/* Main Video Stream Panel (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {/* Stream Controls Header */}
        <div className="hud-panel p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-cyan-900/50">
          {/* Stream Source Selector */}
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

          {/* Number of Faces in Frame Controls (0, 1, 2, 3, 4 Faces) */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 px-2 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> FACES IN FRAME:
            </span>
            {[0, 1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => { audioAlerts.playClick(); setSimulatedFacePreset(num); }}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  simulatedFacePreset === num ? 'bg-cyan-900 text-cyan-300 border border-cyan-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {num === 0 ? '0 FACES' : `${num} FACE${num > 1 ? 'S' : ''}`}
              </button>
            ))}
          </div>

          {/* Toggle Unauthorized Intruder in Frame */}
          <button
            onClick={() => {
              audioAlerts.playClick();
              setIncludeUnauthorizedInSim(!includeUnauthorizedInSim);
            }}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              includeUnauthorizedInSim
                ? 'bg-red-950 text-red-300 border-red-800'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>UNAUTHORIZED: {includeUnauthorizedInSim ? 'PRESENT' : 'NONE'}</span>
          </button>

          {/* Vision Filters */}
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
          unauthorizedCount > 0
            ? 'border-red-500 border-glow-red animate-pulse-slow'
            : 'border-cyan-500/40 border-glow-cyan'
        }`}>
          {/* Vision Filter Layer */}
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

          {/* HUD Top Bar */}
          <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-lg border border-cyan-500/30 text-xs font-mono">
            <div className="flex items-center space-x-3 text-cyan-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-bold">LIVE SURVEILLANCE FEED</span>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300 font-bold">FACES DETECTED: {detectedFaces.length}</span>
              {authorizedCount > 0 && <span className="text-emerald-400 font-bold">[{authorizedCount} AUTHORIZED]</span>}
              {unauthorizedCount > 0 && <span className="text-red-400 font-bold animate-pulse">[{unauthorizedCount} UNAUTHORIZED]</span>}
            </div>

            <div className="flex items-center space-x-4 text-slate-300">
              <span>LAT: {telemetry?.gps.lat.toFixed(4)} N</span>
              <span>LNG: {telemetry?.gps.lng.toFixed(4)} W</span>
              <span className="text-cyan-300 font-bold">ALT: {telemetry?.altitudeMeters}m</span>
              <span className="text-amber-400 font-bold">BAT: {telemetry?.batteryPct}%</span>
            </div>
          </div>

          {/* DYNAMIC FACE BOUNDING BOX OVERLAYS (STRICTLY CAPPED TO 1, 2, 3 FACES) */}
          {detectedFaces.map((face) => (
            <div
              key={face.id}
              className={`absolute z-20 border-2 transition-all duration-300 flex flex-col justify-between p-1.5 rounded ${
                face.isAuthorized
                  ? 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_20px_rgba(0,255,102,0.4)]'
                  : 'border-red-500 bg-red-950/40 shadow-[0_0_30px_rgba(255,0,60,0.6)] animate-target-pulse'
              }`}
              style={{
                left: `${face.x}%`,
                top: `${face.y}%`,
                width: `${face.width}%`,
                height: `${face.height}%`
              }}
            >
              {/* Reticle corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white"></div>

              {/* Tag Header */}
              <div className={`-mt-7 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider inline-flex items-center space-x-1 ${
                face.isAuthorized ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500' : 'bg-red-950/90 text-red-200 border border-red-500'
              }`}>
                {face.isAuthorized ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <Flame className="w-3 h-3 text-red-400 animate-bounce" />}
                <span>{face.isAuthorized ? '[AUTHORIZED]' : '[UNAUTHORIZED PERSON]'}</span>
                <span>{face.confidence}%</span>
              </div>

              {/* Center Crosshair */}
              <div className="self-center my-auto relative">
                <Crosshair className={`w-6 h-6 ${face.isAuthorized ? 'text-emerald-400 opacity-80' : 'text-red-500 animate-spin'}`} />
              </div>

              {/* Name Tag Footer (ONLY DISPLAYED WHEN REAL FACE IS DETECTED!) */}
              <div className={`-mb-8 px-2 py-1 rounded text-[11px] font-mono ${
                face.isAuthorized ? 'bg-emerald-950/95 text-emerald-100 border border-emerald-700' : 'bg-red-950/95 text-red-100 border border-red-700'
              }`}>
                <div className="font-bold text-xs">{face.name}</div>
                <div className="text-[9px] opacity-80">{face.rank}</div>
              </div>
            </div>
          ))}

          {/* No Faces Message Overlay if 0 faces detected */}
          {detectedFaces.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-lg bg-black/60 backdrop-blur-md border border-slate-800 text-slate-400 font-mono text-xs flex items-center space-x-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span>NO HUMAN FACES IN FRAME - SEARCHING...</span>
              </div>
            </div>
          )}

          {/* Bottom HUD Bar */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-between items-center bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <span className="text-slate-400">STATUS:</span>
              <span className="text-cyan-300 font-bold">{detectedFaces.length > 0 ? `${detectedFaces.length} HUMAN FACE(S) LOCKED` : 'IDLE PATROL'}</span>
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
                  onCaptureSnapshot(detectedFaces[0]);
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

      {/* Right Column: Live Detection Roster & Telemetry Panel (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        {/* Active Detected Faces Roster */}
        <div className="hud-panel p-4 rounded-xl border border-cyan-900/50 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-orbitron text-cyan-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              LIVE RECOGNIZED FACES ROSTER
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              {detectedFaces.length} FACES IN FRAME
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {detectedFaces.length === 0 ? (
              <div className="p-4 text-center text-slate-500 font-mono text-xs italic bg-slate-950/50 rounded border border-slate-800">
                No human faces currently detected in camera frame.
              </div>
            ) : (
              detectedFaces.map((face) => (
                <div
                  key={face.id}
                  className={`p-2.5 rounded-lg border font-mono text-xs flex items-center justify-between transition-all ${
                    face.isAuthorized
                      ? 'bg-slate-950/80 border-emerald-900/60 text-slate-200'
                      : 'bg-red-950/30 border-red-800/80 text-red-200 animate-pulse'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded ${face.isAuthorized ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                      {face.isAuthorized ? <UserCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span className={face.isAuthorized ? 'text-slate-100 font-bold' : 'text-red-400 font-orbitron font-bold'}>
                          {face.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {face.rank}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold text-xs ${face.isAuthorized ? 'text-emerald-400' : 'text-red-400'}`}>
                      {face.confidence}%
                    </div>
                    <div className="text-[9px] text-slate-500">
                      {face.isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'}
                    </div>
                  </div>
                </div>
              ))
            )}
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
