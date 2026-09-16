import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiveStreamFeed from './components/LiveStreamFeed';
import DynamicPersonnelManager from './components/DynamicPersonnelManager';
import IntrusionLogs from './components/IntrusionLogs';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ThreatModal from './components/ThreatModal';
import { INITIAL_PERSONNEL, INITIAL_INCIDENTS } from './utils/mockData';
import { createInitialTelemetry } from './utils/droneSimulator';
import { audioAlerts } from './utils/AudioAlertManager';

export default function App() {
  const [activeTab, setActiveTab] = useState('surveillance');
  const [personnelList, setPersonnelList] = useState(INITIAL_PERSONNEL);
  const [incidentList, setIncidentList] = useState(INITIAL_INCIDENTS);
  const [telemetry, setTelemetry] = useState(createInitialTelemetry());
  const [activeThreat, setActiveThreat] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  // Handle Intruder Detection from Live Stream or AI Engine
  const handleIntruderDetected = (threatDetails) => {
    // Only create a new incident if threat not already active
    if (!activeThreat) {
      const newIncId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newIncident = {
        id: newIncId,
        timestamp: new Date().toISOString(),
        sector: "Sector Alpha - Perimeter Fence 04",
        gps: { ...telemetry.gps },
        threatLevel: "CRITICAL",
        classification: "UNAUTHORIZED_INTRUDER",
        matchConfidence: threatDetails.confidence || 14.2,
        nearestMatchName: threatDetails.nearestMatch ? threatDetails.nearestMatch.name : "Unrecognized Pattern",
        status: "TARGET_LOCKED",
        droneId: telemetry.droneId,
        snapshotUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
        notes: "Real-time facial vector matching failed threshold. Subject classified as unknown intruder threat.",
        actionsTaken: ["Visual Alert Triggered", "Siren Broadcast Activated", "Drone Target Lock Engaged"]
      };

      setIncidentList(prev => [newIncident, ...prev]);
      setActiveThreat(newIncident);
    }
  };

  // Manual Trigger Emergency Simulation button
  const handleTriggerEmergency = () => {
    handleIntruderDetected({
      confidence: 12.4,
      source: "MANUAL_SIMULATION"
    });
    audioAlerts.startIntruderSiren();
    setActiveTab('surveillance');
  };

  // Manual Capture Evidence Snapshot
  const handleCaptureSnapshot = (detectedTarget) => {
    const newIncId = `SNAP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const isAuth = detectedTarget ? detectedTarget.isAuthorized : false;

    const newSnapshotEntry = {
      id: newIncId,
      timestamp: new Date().toISOString(),
      sector: "Sector Alpha - Manual Capture",
      gps: { ...telemetry.gps },
      threatLevel: isAuth ? "VERIFIED_CLEAR" : "HIGH",
      classification: isAuth ? "AUTHORIZED_PERSONNEL" : "UNAUTHORIZED_INTRUDER",
      matchConfidence: detectedTarget ? detectedTarget.confidence : 15.0,
      nearestMatchName: detectedTarget ? detectedTarget.name : "Unrecognized",
      status: "LOGGED",
      droneId: telemetry.droneId,
      snapshotUrl: isAuth
        ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
        : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
      notes: "Manual snapshot recorded by command operator.",
      actionsTaken: ["Snapshot Evidence Archived", "GPS Position Telemetry Stored"]
    };

    setIncidentList(prev => [newSnapshotEntry, ...prev]);
    audioAlerts.playAuthMatch();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#05080e] text-slate-100 hud-grid">
      {/* Tactical Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeThreatCount={activeThreat ? 1 : 0}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onTriggerEmergency={handleTriggerEmergency}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto">
        {activeTab === 'surveillance' && (
          <LiveStreamFeed
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            personnelList={personnelList}
            onIntruderDetected={handleIntruderDetected}
            activeThreatCount={activeThreat ? 1 : 0}
            onCaptureSnapshot={handleCaptureSnapshot}
          />
        )}

        {activeTab === 'personnel' && (
          <DynamicPersonnelManager
            personnelList={personnelList}
            setPersonnelList={setPersonnelList}
          />
        )}

        {activeTab === 'incidents' && (
          <IntrusionLogs
            incidentList={incidentList}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            personnelList={personnelList}
            incidentList={incidentList}
            telemetry={telemetry}
          />
        )}
      </main>

      {/* Emergency Intrusion Threat Modal */}
      <ThreatModal
        threat={activeThreat}
        onDismiss={() => {
          setActiveThreat(null);
          audioAlerts.stopIntruderSiren();
        }}
        onLockTarget={() => {
          setActiveTab('surveillance');
        }}
      />
    </div>
  );
}
