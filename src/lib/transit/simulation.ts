import { ALERTS, LINES, LINES_BY_ID, STOPS, STOPS_BY_ID } from "./network";
import type { AccessibilityFeature, Bus, BusStatus, TransitProvider } from "./types";

interface VehicleState {
  id: string;
  lineId: string;
  segment: number;
  t: number;
  direction: 1 | -1;
  speed: number;
  status: BusStatus;
  occupancy: number;
  accessibility: AccessibilityFeature[];
}

const FEATURE_SETS: AccessibilityFeature[][] = [
  ["wheelchair", "visual", "audio", "priority_seats", "air_conditioning", "wide_space"],
  ["wheelchair", "audio", "priority_seats", "air_conditioning"],
  ["wheelchair", "priority_seats", "guide_dog"],
  ["wheelchair", "visual", "audio", "guide_dog", "priority_seats", "wide_space"],
  ["priority_seats", "air_conditioning"],
];

/** Distribuição fixa (determinística) da frota: 2 a 3 veículos por linha. */
const FLEET: { line: string; index: number; offset: number; speed: number; status: BusStatus }[] = [
  { line: "101", index: 1, offset: 0.12, speed: 34, status: "operating" },
  { line: "101", index: 2, offset: 0.58, speed: 27, status: "operating" },
  { line: "102", index: 1, offset: 0.05, speed: 41, status: "operating" },
  { line: "102", index: 2, offset: 0.62, speed: 19, status: "delayed" },
  { line: "203", index: 1, offset: 0.2, speed: 38, status: "operating" },
  { line: "203", index: 2, offset: 0.74, speed: 30, status: "operating" },
  { line: "301", index: 1, offset: 0.08, speed: 44, status: "operating" },
  { line: "301", index: 2, offset: 0.42, speed: 36, status: "operating" },
  { line: "301", index: 3, offset: 0.81, speed: 22, status: "operating" },
  { line: "302", index: 1, offset: 0.15, speed: 38, status: "operating" },
  { line: "302", index: 2, offset: 0.37, speed: 25, status: "delayed" },
  { line: "302", index: 3, offset: 0.66, speed: 33, status: "operating" },
  { line: "302", index: 4, offset: 0.9, speed: 29, status: "operating" },
  { line: "410", index: 1, offset: 0.1, speed: 31, status: "operating" },
  { line: "410", index: 2, offset: 0.55, speed: 0, status: "stopped" },
  { line: "505", index: 1, offset: 0.28, speed: 35, status: "operating" },
  { line: "505", index: 2, offset: 0.7, speed: 26, status: "operating" },
  { line: "606", index: 1, offset: 0.18, speed: 40, status: "operating" },
  { line: "606", index: 2, offset: 0.48, speed: 32, status: "operating" },
  { line: "606", index: 3, offset: 0.86, speed: 24, status: "delayed" },
];

function busId(line: string, index: number) {
  return `BUS-${line}-${String(index).padStart(2, "0")}`;
}

function shapeOf(lineId: string) {
  const line = LINES_BY_ID[lineId]!;
  return line.stopIds.map((id) => STOPS_BY_ID[id]!);
}

function segmentLengthKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  return haversineKm(a.lat, a.lon, b.lat, b.lon);
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
    const stops = shapeOf(f.line);
    const segments = stops.length - 1;
    const pos = f.offset * segments;
    const segment = Math.min(Math.floor(pos), segments - 1);
    return {
      id: busId(f.line, f.index),
      lineId: f.line,
      segment,
      t: pos - segment,
      direction: i % 3 === 2 ? -1 : 1,
      speed: f.speed,
      status: f.status,
      occupancy: 25 + ((i * 37) % 70),
      accessibility: FEATURE_SETS[i % FEATURE_SETS.length]!,
    };
  });
}

function project(v: VehicleState): Bus {
  const stops = shapeOf(v.lineId);
  const line = LINES_BY_ID[v.lineId]!;
  const from = stops[v.segment]!;
  const to = stops[v.segment + 1]!;
  const lat = from.lat + (to.lat - from.lat) * v.t;
  const lon = from.lon + (to.lon - from.lon) * v.t;

  const forward = v.direction === 1;
  const nextStop = forward ? to : from;
  const remainingKm = segmentLengthKm({ lat, lon }, nextStop);
  const etaMin = v.speed > 1 ? Math.max(1, Math.round((remainingKm / v.speed) * 60)) : 12;

  return {
    id: v.id,
    lineId: v.lineId,
    destination: forward ? line.destination : line.origin,
    lat,
    lon,
    bearing: forward ? bearingDeg(from, to) : bearingDeg(to, from),
    speed: Math.round(v.speed),
    status: v.status,
    nextStopId: nextStop.id,
    etaMin,
    occupancy: v.occupancy,
    accessibility: v.accessibility,
  };
}

function advance(v: VehicleState, deltaSec: number) {
  if (v.status === "stopped" || v.status === "out_of_service") return;
  const stops = shapeOf(v.lineId);
  const segments = stops.length - 1;
  let moved = (v.speed / 3600) * deltaSec; // km percorridos

  while (moved > 0) {
    const from = stops[v.segment]!;
    const to = stops[v.segment + 1]!;
    const segKm = Math.max(segmentLengthKm(from, to), 0.05);
    const remaining = v.direction === 1 ? (1 - v.t) * segKm : v.t * segKm;

    if (moved < remaining) {
      v.t += (v.direction * moved) / segKm;
      moved = 0;
    } else {
      moved -= remaining;
      if (v.direction === 1) {
        if (v.segment + 1 >= segments) {
          v.direction = -1;
          v.t = 1;
        } else {
          v.segment += 1;
          v.t = 0;
        }
      } else {
        if (v.segment === 0) {
          v.direction = 1;
          v.t = 0;
        } else {
          v.segment -= 1;
          v.t = 1;
        }
      }
    }
  }
  v.t = Math.min(1, Math.max(0, v.t));
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
        state.forEach((v) => advance(v, 1.6));
        onChange(state.map(project));
      }, 1000);
      return () => clearInterval(interval);
    },
  };
}
