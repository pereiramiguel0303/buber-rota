import { ALERTS, LINES, LINES_BY_ID, STOPS, lineShape, lineStopIndexes } from "./network";
import type { AccessibilityFeature, Bus, BusStatus, TransitProvider } from "./types";

interface Personality {
  /** velocidade de cruzeiro (km/h) */
  cruise: number;
  /** aceleração/frenagem (km/h por segundo) */
  accel: number;
  /** tempo parado em cada ponto (s) */
  dwell: number;
  /** amplitude da variação de trânsito */
  jitter: number;
  /** probabilidade de uma retenção momentânea */
  trafficChance: number;
}

interface VehicleState {
  id: string;
  lineId: string;
  idx: number;
  t: number;
  direction: 1 | -1;
  speed: number;
  target: number;
  status: BusStatus;
  baseStatus: BusStatus;
  occupancy: number;
  accessibility: AccessibilityFeature[];
  personality: Personality;
  dwellLeft: number;
  lastStopVertex: number;
  phase: number;
}

const FEATURE_SETS: AccessibilityFeature[][] = [
  ["wheelchair", "visual", "audio", "priority_seats", "air_conditioning", "wide_space"],
  ["wheelchair", "audio", "priority_seats", "air_conditioning"],
  ["wheelchair", "priority_seats", "guide_dog"],
  ["wheelchair", "visual", "audio", "guide_dog", "priority_seats", "wide_space"],
  ["priority_seats", "air_conditioning"],
];

/** Distribuição fixa (determinística) da frota: 2 a 4 veículos por linha. */
const FLEET: {
  line: string;
  index: number;
  offset: number;
  status: BusStatus;
  personality: Personality;
}[] = [
  { line: "101", index: 1, offset: 0.12, status: "operating", personality: { cruise: 38, accel: 3.2, dwell: 12, jitter: 0.18, trafficChance: 0.004 } },
  { line: "101", index: 2, offset: 0.58, status: "operating", personality: { cruise: 29, accel: 2.1, dwell: 22, jitter: 0.3, trafficChance: 0.009 } },
  { line: "102", index: 1, offset: 0.05, status: "operating", personality: { cruise: 45, accel: 4, dwell: 9, jitter: 0.12, trafficChance: 0.003 } },
  { line: "102", index: 2, offset: 0.62, status: "delayed", personality: { cruise: 22, accel: 1.6, dwell: 30, jitter: 0.35, trafficChance: 0.016 } },
  { line: "203", index: 1, offset: 0.2, status: "operating", personality: { cruise: 40, accel: 3, dwell: 14, jitter: 0.2, trafficChance: 0.006 } },
  { line: "203", index: 2, offset: 0.74, status: "operating", personality: { cruise: 33, accel: 2.4, dwell: 18, jitter: 0.25, trafficChance: 0.008 } },
  { line: "301", index: 1, offset: 0.08, status: "operating", personality: { cruise: 47, accel: 4.2, dwell: 10, jitter: 0.14, trafficChance: 0.004 } },
  { line: "301", index: 2, offset: 0.42, status: "operating", personality: { cruise: 36, accel: 2.8, dwell: 16, jitter: 0.22, trafficChance: 0.007 } },
  { line: "301", index: 3, offset: 0.81, status: "operating", personality: { cruise: 26, accel: 1.9, dwell: 26, jitter: 0.32, trafficChance: 0.012 } },
  { line: "302", index: 1, offset: 0.15, status: "operating", personality: { cruise: 41, accel: 3.4, dwell: 12, jitter: 0.18, trafficChance: 0.005 } },
  { line: "302", index: 2, offset: 0.37, status: "delayed", personality: { cruise: 24, accel: 1.7, dwell: 34, jitter: 0.38, trafficChance: 0.018 } },
  { line: "302", index: 3, offset: 0.66, status: "operating", personality: { cruise: 35, accel: 2.9, dwell: 15, jitter: 0.2, trafficChance: 0.006 } },
  { line: "302", index: 4, offset: 0.9, status: "operating", personality: { cruise: 31, accel: 2.3, dwell: 20, jitter: 0.26, trafficChance: 0.009 } },
  { line: "410", index: 1, offset: 0.1, status: "operating", personality: { cruise: 34, accel: 2.6, dwell: 17, jitter: 0.24, trafficChance: 0.007 } },
  { line: "410", index: 2, offset: 0.55, status: "stopped", personality: { cruise: 0, accel: 2, dwell: 40, jitter: 0, trafficChance: 0 } },
  { line: "505", index: 1, offset: 0.28, status: "operating", personality: { cruise: 37, accel: 3.1, dwell: 13, jitter: 0.19, trafficChance: 0.005 } },
  { line: "505", index: 2, offset: 0.7, status: "operating", personality: { cruise: 28, accel: 2, dwell: 24, jitter: 0.3, trafficChance: 0.011 } },
  { line: "606", index: 1, offset: 0.18, status: "operating", personality: { cruise: 43, accel: 3.8, dwell: 11, jitter: 0.16, trafficChance: 0.004 } },
  { line: "606", index: 2, offset: 0.48, status: "operating", personality: { cruise: 34, accel: 2.7, dwell: 16, jitter: 0.22, trafficChance: 0.007 } },
  { line: "606", index: 3, offset: 0.86, status: "delayed", personality: { cruise: 21, accel: 1.5, dwell: 32, jitter: 0.4, trafficChance: 0.02 } },
];

function busId(line: string, index: number) {
  return `BUS-${line}-${String(index).padStart(2, "0")}`;
}

function shapeOf(lineId: string): [number, number][] {
  return lineShape(LINES_BY_ID[lineId]!);
}

function pointAt(coords: [number, number][], i: number) {
  const c = coords[i]!;
  return { lon: c[0], lat: c[1] };
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function segKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  return haversineKm(a.lat, a.lon, b.lat, b.lon);
}

function bearingDeg(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const y = Math.sin(((b.lon - a.lon) * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180);
  const x =
    Math.cos((a.lat * Math.PI) / 180) * Math.sin((b.lat * Math.PI) / 180) -
    Math.sin((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.cos(((b.lon - a.lon) * Math.PI) / 180);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function createVehicles(): VehicleState[] {
  return FLEET.map((f, i) => {
    const coords = shapeOf(f.line);
    const last = coords.length - 1;
    const pos = f.offset * last;
    const idx = Math.min(Math.floor(pos), last - 1);
    return {
      id: busId(f.line, f.index),
      lineId: f.line,
      idx,
      t: pos - idx,
      direction: i % 3 === 2 ? -1 : 1,
      speed: f.status === "operating" ? f.personality.cruise * 0.8 : 0,
      target: f.personality.cruise,
      status: f.status,
      baseStatus: f.status,
      occupancy: 25 + ((i * 37) % 70),
      accessibility: FEATURE_SETS[i % FEATURE_SETS.length]!,
      personality: f.personality,
      dwellLeft: 0,
      lastStopVertex: -1,
      phase: (i * 0.7) % (Math.PI * 2),
    };
  });
}

/** Próximo ponto de parada (id + índice na polilinha) no sentido de viagem. */
function nextStopOf(v: VehicleState) {
  const line = LINES_BY_ID[v.lineId]!;
  const idxs = lineStopIndexes(line);
  if (v.direction === 1) {
    for (let k = 0; k < idxs.length; k++) {
      if (idxs[k]! > v.idx) return { stopId: line.stopIds[k]!, vertex: idxs[k]! };
    }
    return { stopId: line.stopIds[line.stopIds.length - 1]!, vertex: idxs[idxs.length - 1]! };
  }
  for (let k = idxs.length - 1; k >= 0; k--) {
    if (idxs[k]! <= v.idx) return { stopId: line.stopIds[k]!, vertex: idxs[k]! };
  }
  return { stopId: line.stopIds[0]!, vertex: idxs[0]! };
}

function project(v: VehicleState): Bus {
  const coords = shapeOf(v.lineId);
  const line = LINES_BY_ID[v.lineId]!;
  const from = pointAt(coords, v.idx);
  const to = pointAt(coords, Math.min(v.idx + 1, coords.length - 1));
  const lat = from.lat + (to.lat - from.lat) * v.t;
  const lon = from.lon + (to.lon - from.lon) * v.t;

  const forward = v.direction === 1;
  const next = nextStopOf(v);

  // distância pela via até o próximo ponto
  let km = 0;
  if (forward) {
    km += segKm({ lat, lon }, to);
    for (let i = v.idx + 1; i < next.vertex; i++) {
      km += segKm(pointAt(coords, i), pointAt(coords, i + 1));
    }
  } else {
    km += segKm({ lat, lon }, from);
    for (let i = v.idx; i > next.vertex; i--) {
      km += segKm(pointAt(coords, i), pointAt(coords, i - 1));
    }
  }
  const cruise = Math.max(v.personality.cruise, 12);
  const etaMin = Math.max(1, Math.round((km / cruise) * 60));

  return {
    id: v.id,
    lineId: v.lineId,
    destination: forward ? line.destination : line.origin,
    lat,
    lon,
    bearing: forward ? bearingDeg(from, to) : bearingDeg(to, from),
    speed: Math.round(v.speed),
    status: v.status,
    nextStopId: next.stopId,
    etaMin,
    occupancy: v.occupancy,
    accessibility: v.accessibility,
  };
}

/** Curva de frenagem: reduz a velocidade ao se aproximar de um ponto. */
function speedLimitNearStop(v: VehicleState, distKm: number) {
  if (distKm > 0.25) return v.personality.cruise;
  return Math.max(6, v.personality.cruise * (distKm / 0.25));
}

function advance(v: VehicleState, deltaSec: number) {
  if (v.baseStatus === "stopped" || v.baseStatus === "out_of_service") {
    v.speed = 0;
    return;
  }
  const coords = shapeOf(v.lineId);
  const last = coords.length - 1;

  // parada em ponto
  if (v.dwellLeft > 0) {
    v.dwellLeft -= deltaSec;
    v.speed = 0;
    v.status = "stopped";
    if (v.dwellLeft <= 0) v.status = v.baseStatus;
    return;
  }

  // variação de trânsito: pequenas retenções aleatórias
  v.phase += deltaSec * 0.15;
  const traffic = 1 - v.personality.jitter * (0.5 + 0.5 * Math.sin(v.phase * 1.7));
  if (Math.random() < v.personality.trafficChance * deltaSec) {
    v.dwellLeft = 4 + Math.random() * 8;
    v.status = "delayed";
    return;
  }

  const next = nextStopOf(v);
  const from = pointAt(coords, v.idx);
  const to = pointAt(coords, Math.min(v.idx + 1, last));
  const here = {
    lat: from.lat + (to.lat - from.lat) * v.t,
    lon: from.lon + (to.lon - from.lon) * v.t,
  };
  const distStop = segKm(here, pointAt(coords, next.vertex));

  v.target = Math.min(v.personality.cruise * traffic, speedLimitNearStop(v, distStop));
  const diff = v.target - v.speed;
  const step = v.personality.accel * deltaSec;
  v.speed += Math.max(-step * 1.6, Math.min(step, diff));
  v.speed = Math.max(0, v.speed);

  let moved = (v.speed / 3600) * deltaSec;
  let guard = 0;
  while (moved > 0 && guard++ < 500) {
    const a = pointAt(coords, v.idx);
    const b = pointAt(coords, Math.min(v.idx + 1, last));
    const lengthKm = Math.max(segKm(a, b), 0.002);
    const remaining = v.direction === 1 ? (1 - v.t) * lengthKm : v.t * lengthKm;

    if (moved < remaining) {
      v.t += (v.direction * moved) / lengthKm;
      moved = 0;
    } else {
      moved -= remaining;
      if (v.direction === 1) {
        if (v.idx + 1 >= last) {
          v.direction = -1;
          v.t = 1;
          v.lastStopVertex = -1;
        } else {
          v.idx += 1;
          v.t = 0;
        }
      } else {
        if (v.idx === 0) {
          v.direction = 1;
          v.t = 0;
          v.lastStopVertex = -1;
        } else {
          v.idx -= 1;
          v.t = 1;
        }
      }
    }
  }
  v.t = Math.min(1, Math.max(0, v.t));

  // chegou a um ponto? embarque/desembarque
  const arrived = v.direction === 1 ? v.idx >= next.vertex : v.idx <= next.vertex;
  if (arrived && v.lastStopVertex !== next.vertex) {
    v.lastStopVertex = next.vertex;
    v.dwellLeft = v.personality.dwell * (0.6 + Math.random() * 0.8);
    v.occupancy = Math.max(8, Math.min(100, v.occupancy + Math.round((Math.random() - 0.45) * 26)));
    v.speed = 0;
  }
}

/**
 * Provider de simulação. Substituível por um provider Firebase sem alterar a UI.
 */
export function createSimulationProvider(): TransitProvider {
  let vehicles: VehicleState[] | null = null;

  return {
    id: "simulation",
    getLines: () => LINES,
    getStops: () => STOPS,
    getAlerts: () => ALERTS,
    subscribeBuses(onChange) {
      if (!vehicles) vehicles = createVehicles();
      const state = vehicles;
      onChange(state.map(project));
      const interval = setInterval(() => {
        state.forEach((v) => advance(v, 1));
        onChange(state.map(project));
      }, 700);
      return () => clearInterval(interval);
    },
  };
}
