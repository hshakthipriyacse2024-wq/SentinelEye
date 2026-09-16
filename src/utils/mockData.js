// Pre-seeded Authorized Personnel and Intrusion History for SentinelEye AI

export const INITIAL_PERSONNEL = [
  {
    id: "AUTH-8092",
    name: "Cmdr. Sarah Vance",
    rank: "Base Commander",
    clearance: "Level 5 - Top Secret",
    department: "Executive Command",
    registeredAt: "2026-08-10T14:30:00Z",
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    featureVector: [0.85, 0.42, 0.91, 0.12, 0.77, 0.64, 0.33, 0.89],
    accessAreas: ["Sector Alpha", "Command Center", "Armory", "Substation B"]
  },
  {
    id: "AUTH-4412",
    name: "Lt. Alex Mercer",
    rank: "Perimeter Security Chief",
    clearance: "Level 4 - Restricted",
    department: "Base Security",
    registeredAt: "2026-08-15T09:15:00Z",
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400",
    featureVector: [0.31, 0.95, 0.44, 0.88, 0.23, 0.71, 0.65, 0.19],
    accessAreas: ["Sector Alpha", "Sector Bravo", "Perimeter Fence North"]
  },
  {
    id: "AUTH-1094",
    name: "Dr. Elena Rostova",
    rank: "Chief Systems Engineer",
    clearance: "Level 4 - Technical",
    department: "Cyber Defense & Avionics",
    registeredAt: "2026-09-01T11:45:00Z",
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    featureVector: [0.62, 0.18, 0.83, 0.54, 0.92, 0.39, 0.47, 0.81],
    accessAreas: ["Drone Hangar", "Control Center", "Substation B"]
  },
  {
    id: "AUTH-3321",
    name: "Sgt. Marcus Holloway",
    rank: "Tactical Patrol Officer",
    clearance: "Level 3 - Operational",
    department: "Rapid Response Force",
    registeredAt: "2026-09-05T16:20:00Z",
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    featureVector: [0.49, 0.73, 0.25, 0.61, 0.84, 0.15, 0.93, 0.38],
    accessAreas: ["Sector Bravo", "Sector Charlie", "Perimeter Fence South"]
  }
];

export const INITIAL_INCIDENTS = [
  {
    id: "INC-2026-0941",
    timestamp: "2026-09-16T08:42:10Z",
    sector: "Sector Alpha - Fence Line 04",
    gps: { lat: 34.0522, lng: -118.2437 },
    threatLevel: "CRITICAL",
    classification: "UNAUTHORIZED_INTRUDER",
    matchConfidence: 12.4, // Match score % against nearest authorized person
    nearestMatchName: "None (Unrecognized Face Pattern)",
    status: "TARGET_LOCKED",
    droneId: "SENTINEL-DRONE-01",
    snapshotUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    notes: "Subject detected approaching perimeter wall with thermal heat signature. Refused visual identification. Autonomous target lock engaged.",
    actionsTaken: ["Siren Broadcast Engaged", "Command Center Alerted", "GPS Tracking Locked"]
  },
  {
    id: "INC-2026-0819",
    timestamp: "2026-09-15T22:15:44Z",
    sector: "Sector Charlie - Power Substation",
    gps: { lat: 34.0545, lng: -118.2490 },
    threatLevel: "HIGH",
    classification: "UNAUTHORIZED_INTRUDER",
    matchConfidence: 18.2,
    nearestMatchName: "Unmatched",
    status: "INVESTIGATED",
    droneId: "SENTINEL-DRONE-02",
    snapshotUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    notes: "Unknown individual observed near high-voltage transformer enclosure. Patrol team dispatched. Subject fled perimeter boundary.",
    actionsTaken: ["Visual Evidence Archived", "Patrol Dispatched", "Area Secured"]
  },
  {
    id: "INC-2026-0702",
    timestamp: "2026-09-14T14:02:11Z",
    sector: "Sector Bravo - Vehicle Gate 2",
    gps: { lat: 34.0510, lng: -118.2411 },
    threatLevel: "VERIFIED_CLEAR",
    classification: "AUTHORIZED_PERSONNEL",
    matchConfidence: 96.8,
    nearestMatchName: "Cmdr. Sarah Vance",
    status: "RESOLVED",
    droneId: "SENTINEL-DRONE-01",
    snapshotUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    notes: "Routine perimeter walkthrough. Autonomous face recognition matched Cmdr. Sarah Vance with 96.8% confidence. Clearance verified.",
    actionsTaken: ["Identity Logged", "Continuous Surveillance Maintained"]
  }
];

export const PERIMETER_SECTORS = [
  { id: 'SEC-A', name: 'Sector Alpha - North Wall', threatLevel: 'CRITICAL', status: 'ALERT', intruderCount: 1, droneAssigned: 'SENTINEL-01' },
  { id: 'SEC-B', name: 'Sector Bravo - East Gate', threatLevel: 'LOW', status: 'CLEAR', intruderCount: 0, droneAssigned: 'SENTINEL-02' },
  { id: 'SEC-C', name: 'Sector Charlie - Substation', threatLevel: 'MEDIUM', status: 'MONITORING', intruderCount: 0, droneAssigned: 'SENTINEL-03' },
  { id: 'SEC-D', name: 'Sector Delta - South Fence', threatLevel: 'LOW', status: 'CLEAR', intruderCount: 0, droneAssigned: 'SENTINEL-01' },
];
