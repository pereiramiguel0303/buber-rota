/**
 * Utilidades para "encaixar" a posição bruta do GPS na rua mais próxima
 * e calcular a direção de deslocamento (rumo) a partir do movimento real.
 */

export interface LatLon {
  lat: number;
  lon: number;
}

const OSRM_NEAREST = "https://router.project-osrm.org/nearest/v1/driving";

/** Distância aproximada em metros entre dois pontos. */
export function distanceMeters(a: LatLon, b: LatLon): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Rumo (graus, 0 = norte) de `from` para `to`. */
export function bearingBetween(from: LatLon, to: LatLon): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLon = toRad(to.lon - from.lon);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** Normaliza para 0..360 */
export function normalizeBearing(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Interpola rumos pelo caminho mais curto (evita giros de 350° -> 10°). */
export function smoothBearing(prev: number | null, next: number, factor = 0.45): number {
  if (prev == null || !Number.isFinite(prev)) return normalizeBearing(next);
  let diff = ((next - prev + 540) % 360) - 180;
  return normalizeBearing(prev + diff * factor);
}

/**
 * Encaixa a coordenada na via mais próxima usando o serviço público do OSRM.
 * Se a rede falhar ou o ponto estiver longe demais de qualquer rua (>60 m),
 * devolve a coordenada original.
 */
export async function snapToRoad(point: LatLon, signal?: AbortSignal): Promise<LatLon> {
  try {
    const url = `${OSRM_NEAREST}/${point.lon},${point.lat}?number=1`;
    const res = await fetch(url, signal ? { signal } : undefined);
    if (!res.ok) return point;
    const json = (await res.json()) as {
      waypoints?: { location?: [number, number]; distance?: number }[];
    };
    const wp = json.waypoints?.[0];
    const loc = wp?.location;
    if (!loc || loc.length < 2) return point;
    if (typeof wp?.distance === "number" && wp.distance > 60) return point;
    const snapped = { lat: loc[1], lon: loc[0] };
    if (!Number.isFinite(snapped.lat) || !Number.isFinite(snapped.lon)) return point;
    return snapped;
  } catch {
    return point;
  }
}
