// SentinelEye AI - Autonomous Drone Telemetry & Flight Simulator

export const PATROL_WAYPOINTS = [
  { id: 'WP-1', name: 'Perimeter Gate North', lat: 34.0522, lng: -118.2437, alt: 45 },
  { id: 'WP-2', name: 'Armory Sector East', lat: 34.0535, lng: -118.2410, alt: 50 },
  { id: 'WP-3', name: 'Substation South', lat: 34.0548, lng: -118.2445, alt: 42 },
  { id: 'WP-4', name: 'Helipad West Boundary', lat: 34.0515, lng: -118.2480, alt: 48 },
];

export function createInitialTelemetry() {
  return {
    droneId: "SENTINEL-DRONE-01",
    model: "Sentinel-X4 Autonomous Defense Quadcopter",
    status: "PATROLLING", // PATROLLING, TARGET_LOCK, MANUAL_OVERRIDE, RETURNING
    batteryPct: 88,
    altitudeMeters: 45.2,
    speedKmh: 24.5,
    headingDegrees: 142,
    signalDb: -62,
    gps: { lat: 34.0522, lng: -118.2437 },
    currentWaypointIndex: 0,
    flightMode: "AUTONOMOUS_PATROL",
    visionMode: "DAYLIGHT", // DAYLIGHT, NIGHT_VISION, FLIR_THERMAL
    aiLatencyMs: 14,
    fps: 30,
    activeThreats: 1,
    targetDistanceMeters: 18.4,
    targetBearingDegrees: 48
  };
}

/**
 * Step drone telemetry forward in time
 */
export function updateDroneTelemetry(current, targetLock = false) {
  const updated = { ...current };

  // Battery drain simulation
  if (Math.random() < 0.2) {
    updated.batteryPct = Math.max(12, parseFloat((updated.batteryPct - 0.1).toFixed(1)));
  }

  // Slight altitude & speed variance
  const altNoise = (Math.random() - 0.5) * 0.4;
  updated.altitudeMeters = parseFloat(Math.max(15, Math.min(120, updated.altitudeMeters + altNoise)).toFixed(1));

  if (targetLock) {
    updated.status = "TARGET_LOCK";
    updated.flightMode = "TARGET_TRACKING";
    updated.speedKmh = parseFloat((12 + Math.random() * 4).toFixed(1)); // Hovering speed around target
    updated.headingDegrees = (updated.headingDegrees + Math.floor((Math.random() - 0.5) * 6)) % 360;
    updated.targetDistanceMeters = parseFloat(Math.max(5, updated.targetDistanceMeters + (Math.random() - 0.5) * 0.8).toFixed(1));
  } else {
    updated.status = "PATROLLING";
    updated.flightMode = "AUTONOMOUS_PATROL";
    updated.speedKmh = parseFloat((22 + Math.random() * 6).toFixed(1));

    // Smooth heading transition toward current waypoint
    const currentWP = PATROL_WAYPOINTS[updated.currentWaypointIndex];
    if (Math.random() < 0.15) {
      updated.currentWaypointIndex = (updated.currentWaypointIndex + 1) % PATROL_WAYPOINTS.length;
    }
    updated.headingDegrees = (updated.headingDegrees + 2) % 360;
    
    // Nudge GPS location slightly along patrol path
    updated.gps = {
      lat: parseFloat((currentWP.lat + (Math.random() - 0.5) * 0.0008).toFixed(6)),
      lng: parseFloat((currentWP.lng + (Math.random() - 0.5) * 0.0008).toFixed(6))
    };
  }

  // AI latency tick
  updated.aiLatencyMs = Math.floor(12 + Math.random() * 8);

  return updated;
}
