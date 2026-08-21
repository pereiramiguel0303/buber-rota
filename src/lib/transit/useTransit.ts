import { useEffect, useMemo, useState } from "react";
import { transitProvider } from "./provider";
import { haversineKm } from "./simulation";
import { CITY_CENTER, LINES, LINES_BY_ID, STOPS, STOPS_BY_ID, linesForStop } from "./network";
import type { Bus } from "./types";

/** Assina as posições dos veículos (simulação hoje, Firebase no futuro). */
export function useBuses(): Bus[] {
  const [buses, setBuses] = useState<Bus[]>([]);
  useEffect(() => transitProvider.subscribeBuses(setBuses), []);
  return buses;
}

export function useBusesByLine(lineId: string | undefined) {
  const buses = useBuses();
  return useMemo(
    () => (lineId ? buses.filter((b) => b.lineId === lineId) : buses),
    [buses, lineId],
  );
}

export interface StopArrival {
  lineId: string;
  busId: string;
  etaMin: number;
}

/** Próximas chegadas de um ponto, combinando veículos reais + intervalo da linha. */
export function arrivalsForStop(stopId: string, buses: Bus[]): StopArrival[] {
  const stop = STOPS_BY_ID[stopId];
  if (!stop) return [];
  const lines = linesForStop(stopId);
  const arrivals: StopArrival[] = [];

  for (const line of lines) {
    const candidates = buses
      .filter((b) => b.lineId === line.id)
      .map((b) => {
        const km = haversineKm(b.lat, b.lon, stop.lat, stop.lon);
        const speed = b.speed > 5 ? b.speed : 18;
        return { bus: b, eta: Math.max(1, Math.round((km / speed) * 60)) };
      })
      .sort((a, b) => a.eta - b.eta);

    candidates.slice(0, 2).forEach((c) =>
      arrivals.push({ lineId: line.id, busId: c.bus.id, etaMin: c.eta }),
    );
  }
  return arrivals.sort((a, b) => a.etaMin - b.etaMin);
}

export function nextBusesForLine(lineId: string, buses: Bus[]) {
  const line = LINES_BY_ID[lineId];
  const fleet = buses.filter((b) => b.lineId === lineId).sort((a, b) => a.etaMin - b.etaMin);
  return fleet.map((b, i) => ({
    bus: b,
    etaMin: b.etaMin + i * Math.round((line?.headwayMin ?? 10) * 0.6),
  }));
}

export function useUserLocation() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");

  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("denied");
      setCoords(CITY_CENTER);
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lon: p.coords.longitude });
        setStatus("ok");
      },
      () => {
        setCoords(CITY_CENTER);
        setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return { coords, status, locate };
}

export function nearbyStops(origin: { lat: number; lon: number }, limit = 5) {
  return STOPS.map((s) => ({
    stop: s,
    distanceM: Math.round(haversineKm(origin.lat, origin.lon, s.lat, s.lon) * 1000),
  }))
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, limit);
}

export interface SearchResult {
  kind: "line" | "bus" | "stop" | "neighborhood";
  id: string;
  title: string;
  subtitle: string;
  lineId?: string;
  stopId?: string;
  busId?: string;
}

export function searchNetwork(query: string, buses: Bus[]): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const results: SearchResult[] = [];

  for (const line of LINES) {
    const hay = `${line.id} ${line.name} ${line.origin} ${line.destination}`.toLowerCase();
    if (hay.includes(q)) {
      const count = buses.filter((b) => b.lineId === line.id).length;
      results.push({
        kind: "line",
        id: `line-${line.id}`,
        title: `Linha ${line.id} — ${line.origin} → ${line.destination}`,
        subtitle: `${count} ônibus em circulação`,
        lineId: line.id,
      });
    }
  }

  for (const bus of buses) {
    if (bus.id.toLowerCase().includes(q)) {
      results.push({
        kind: "bus",
        id: `bus-${bus.id}`,
        title: bus.id,
        subtitle: `Linha ${bus.lineId} → ${bus.destination}`,
        busId: bus.id,
        lineId: bus.lineId,
      });
    }
  }

  for (const stop of STOPS) {
    if (`${stop.name} ${stop.neighborhood}`.toLowerCase().includes(q)) {
      results.push({
        kind: "stop",
        id: `stop-${stop.id}`,
        title: stop.name,
        subtitle: `Ponto • ${stop.neighborhood}`,
        stopId: stop.id,
      });
    }
  }

  return results.slice(0, 8);
}
