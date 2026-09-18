import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { CITY_CENTER, LINES, LINES_BY_ID, STOPS, lineShape } from "@/lib/transit/network";
import { CITY_STOPS, LINE_CITY_STOPS } from "@/lib/transit/citystops.generated";
import type { FeatureCollection } from "geojson";
import type { Bus } from "@/lib/transit/types";

export interface CityMapProps {
  buses: Bus[];
  selectedLineId?: string | undefined;
  selectedBusId?: string | undefined;
  selectedStopId?: string | undefined;
  userLocation?: { lat: number; lon: number } | null | undefined;
  liveLabel?: string | undefined;
  /** Direção (graus, 0 = norte) vinda do GPS. Use null/undefined ou valor negativo quando desconhecida. */
  liveBearing?: number | null | undefined;
  onSelectBus: (id: string) => void;
  onSelectStop: (id: string) => void;
  onBackgroundClick: () => void;
  onStatus?: ((status: "loading" | "ready" | "error") => void) | undefined;
}


/**
 * Base clara sem chave de API e sem marca-d'água: estilo vetorial Positron do
 * OpenFreeMap. Se o style externo falhar, usamos os tiles raster do
 * OpenStreetMap como reserva (também livres de chave).
 */
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {
    basemap: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    { id: "basemap", type: "raster", source: "basemap", paint: { "raster-opacity": 1 } },
  ],
};

async function resolveStyle(): Promise<maplibregl.StyleSpecification> {
  try {
    const res = await fetch(STYLE_URL);
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as maplibregl.StyleSpecification;
  } catch {
    return FALLBACK_STYLE;
  }
}




function routesGeoJSON(): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: LINES.map((line) => ({
      type: "Feature",
      properties: { lineId: line.id, color: line.color },
      geometry: { type: "LineString", coordinates: lineShape(line) },
    })),
  };
}

function stopsGeoJSON(): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: STOPS.map((s) => ({
      type: "Feature",
      properties: {
        id: s.id,
        name: s.name,
        neighborhood: s.neighborhood,
        lines: LINES.filter((l) => l.stopIds.includes(s.id))
          .map((l) => l.id)
          .join(","),
        seq: "",
      },
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
    })),
  };
}

/** Todas as paradas reais de São Leopoldo (OpenStreetMap) — pontinhos sutis. */
function cityStopsGeoJSON(): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: CITY_STOPS.map((s) => ({
      type: "Feature",
      properties: { id: s.id, name: s.name },
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
    })),
  };
}

/** Paradas reais atendidas pela linha selecionada, na ordem do trajeto. */
function lineCityStopsGeoJSON(lineId?: string): FeatureCollection {
  const line = lineId ? LINES_BY_ID[lineId] : undefined;
  const ids = lineId ? (LINE_CITY_STOPS[lineId] ?? []) : [];
  if (!line || ids.length === 0) return { type: "FeatureCollection", features: [] };
  return {
    type: "FeatureCollection",
    features: ids.flatMap((id, i) => {
      const s = CITY_STOPS.find((x) => x.id === id);
      if (!s) return [];
      return [
        {
          type: "Feature" as const,
          properties: { id: s.id, name: s.name, seq: String(i + 1), color: line.color },
          geometry: { type: "Point" as const, coordinates: [s.lon, s.lat] },
        },
      ];
    }),
  };
}

/** Pontos da linha selecionada, com o número de ordem no itinerário. */
function lineStopsGeoJSON(lineId?: string): FeatureCollection {
  const line = lineId ? LINES_BY_ID[lineId] : undefined;
  if (!line) return { type: "FeatureCollection", features: [] };
  return {
    type: "FeatureCollection",
    features: line.stopIds.flatMap((id, i) => {
      const s = STOPS.find((x) => x.id === id);
      if (!s) return [];
      return [
        {
          type: "Feature" as const,
          properties: {
            id: s.id,
            name: s.name,
            seq: String(i + 1),
            terminal: i === 0 ? "origem" : i === line.stopIds.length - 1 ? "destino" : "",
            color: line.color,
          },
          geometry: { type: "Point" as const, coordinates: [s.lon, s.lat] },
        },
      ];
    }),
  };
}

/** Marcadores de origem e destino da linha selecionada. */
function endpointsGeoJSON(lineId?: string): FeatureCollection {
  const line = lineId ? LINES_BY_ID[lineId] : undefined;
  if (!line) return { type: "FeatureCollection", features: [] };
  const first = STOPS.find((s) => s.id === line.stopIds[0]);
  const last = STOPS.find((s) => s.id === line.stopIds[line.stopIds.length - 1]);
  const feats = [] as FeatureCollection["features"];
  if (first)
    feats.push({
      type: "Feature",
      properties: { label: `Origem · ${line.origin}`, color: line.color },
      geometry: { type: "Point", coordinates: [first.lon, first.lat] },
    });
  if (last)
    feats.push({
      type: "Feature",
      properties: { label: `Destino · ${line.destination}`, color: line.color },
      geometry: { type: "Point", coordinates: [last.lon, last.lat] },
    });
  return { type: "FeatureCollection", features: feats };
}

/** Seta usada para indicar o sentido do trajeto (ícone gerado em canvas). */
function arrowImage(): ImageData {
  const size = 32;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.translate(size / 2, size / 2);
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-6, -7.5);
  ctx.lineTo(-3.5, 0);
  ctx.lineTo(-6, 7.5);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(15,23,42,.55)";
  ctx.lineWidth = 1.6;
  ctx.fill();
  ctx.stroke();
  return ctx.getImageData(0, 0, size, size);
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.max(0, Math.min(255, Math.round(c + 255 * amount))),
  );
  return `rgb(${ch[0]},${ch[1]},${ch[2]})`;
}

function applyBusScale(el: HTMLElement, selected: boolean) {
  const inner = el.firstElementChild as HTMLElement | null;
  el.style.zIndex = selected ? "5" : "1";
  if (inner) inner.style.setProperty("--scale", selected ? "1.3" : "1");
}

/**
 * Marcador de veículo: ônibus visto de cima, em SVG, com sombra suave e
 * anel de status. A rotação/escala fica SEMPRE num elemento interno — o
 * elemento raiz é controlado pelo MapLibre e não pode ter transição.
 */
function busElement(bus: Bus, selected: boolean) {
  const color = LINES_BY_ID[bus.lineId]?.color ?? "#0f9b8e";
  const light = shade(color, 0.18);
  const dark = shade(color, -0.2);
  const uid = bus.id.replace(/[^a-zA-Z0-9]/g, "");

  const el = document.createElement("button");
  el.type = "button";
  el.className = "mobisl-bus";
  el.setAttribute("aria-label", `Ônibus ${bus.id}, linha ${bus.lineId}`);
  el.dataset['busId'] = bus.id;
  el.dataset['longitude'] = String(bus.lon);
  el.dataset['latitude'] = String(bus.lat);

  const inner = document.createElement("div");
  inner.className = "mobisl-bus-inner";
  inner.style.setProperty("--rot", `${bus.bearing}deg`);
  inner.style.setProperty("--scale", selected ? "1.3" : "1");

  inner.innerHTML = `
  <svg width="100%" height="100%" viewBox="0 0 52 52" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="body-${uid}" x1="0.1" y1="0" x2="0.95" y2="1">
        <stop offset="0%" stop-color="${light}"/>
        <stop offset="46%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${dark}"/>
      </linearGradient>
      <linearGradient id="gloss-${uid}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="35%" stop-color="#ffffff" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
      </linearGradient>
      <linearGradient id="glass-${uid}" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stop-color="#dff2ff"/>
        <stop offset="100%" stop-color="#7fa6bd"/>
      </linearGradient>
      <filter id="sh-${uid}" x="-60%" y="-60%" width="220%" height="220%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.1" flood-color="#0b1220" flood-opacity="0.42"/>
      </filter>
    </defs>
    <ellipse cx="26" cy="29" rx="10.5" ry="16" fill="#0b1220" opacity=".16"/>
    <g filter="url(#sh-${uid})">
      <rect x="15.5" y="20" width="21" height="5" rx="2" fill="#1a2230" opacity=".85"/>
      <rect x="15.5" y="30" width="21" height="5" rx="2" fill="#1a2230" opacity=".85"/>
      <rect x="16" y="7" width="20" height="38" rx="7" fill="url(#body-${uid})" stroke="#ffffff" stroke-width="1.8"/>
      <rect x="16" y="7" width="20" height="38" rx="7" fill="url(#gloss-${uid})"/>
      <path d="M19.4 10.4h13.2c1.1 0 1.9 1 1.6 2.05l-.9 3.1c-.2.72-.86 1.2-1.6 1.2H20.3c-.75 0-1.4-.48-1.6-1.2l-.9-3.1c-.3-1.05.5-2.05 1.6-2.05z" fill="url(#glass-${uid})"/>
      <path d="M19.9 41.6h12.2c.9 0 1.6-.75 1.5-1.6l-.3-2.2c-.1-.72-.72-1.25-1.45-1.25H20.15c-.73 0-1.35.53-1.45 1.25l-.3 2.2c-.1.85.6 1.6 1.5 1.6z" fill="#8fb4c9" opacity=".85"/>
      <rect x="17.9" y="19.4" width="1.9" height="12.6" rx=".95" fill="#0f172a" opacity=".42"/>
      <rect x="32.2" y="19.4" width="1.9" height="12.6" rx=".95" fill="#0f172a" opacity=".42"/>
      <rect x="20.4" y="19.2" width="11.2" height="13.2" rx="2.4" fill="#ffffff" opacity=".16"/>
      <path d="M26 19.2v13.2" stroke="#ffffff" stroke-width=".7" opacity=".28"/>
      <circle cx="20.6" cy="9.4" r="1.25" fill="#fffbe0"/>
      <circle cx="31.4" cy="9.4" r="1.25" fill="#fffbe0"/>
      <rect x="19.8" y="43.1" width="2.6" height="1.5" rx=".7" fill="#ff5a4d"/>
      <rect x="29.6" y="43.1" width="2.6" height="1.5" rx=".7" fill="#ff5a4d"/>
    </g>
  </svg>`;


  el.appendChild(inner);
  return el;
}



export default function CityMap({
  buses,
  selectedLineId,
  selectedBusId,
  selectedStopId,
  userLocation,
  liveLabel,
  liveBearing,
  onSelectBus,
  onSelectStop,
  onBackgroundClick,
  onStatus,
}: CityMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const readyRef = useRef(false);
  const handlers = useRef({ onSelectBus, onSelectStop, onBackgroundClick, onStatus });
  handlers.current = { onSelectBus, onSelectStop, onBackgroundClick, onStatus };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    handlers.current.onStatus?.("loading");
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [CITY_CENTER.lon, CITY_CENTER.lat],
      zoom: 12.4,
      minZoom: 10,
      maxZoom: 18,
      pitchWithRotate: false,
      dragRotate: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    (window as unknown as Record<string, unknown>)["__mobislMap"] = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    let usedFallback = false;
    const useFallback = () => {
      if (usedFallback) return;
      usedFallback = true;
      try {
        map.setStyle(FALLBACK_STYLE);
      } catch {
        handlers.current.onStatus?.("error");
      }
    };
    map.on("error", (e) => {
      const msg = String((e as unknown as { error?: Error }).error?.message ?? "");
      if (/style|positron|Failed to fetch|NetworkError|403|404/i.test(msg)) useFallback();
    });
    // Se a base vetorial não pintar em 7s (rede lenta/bloqueio no domínio publicado),
    // trocamos automaticamente para os tiles raster livres do OpenStreetMap.
    const guard = window.setTimeout(() => {
      if (!map.isStyleLoaded() || !map.loaded()) useFallback();
    }, 7000);


    const setup = () => {
      if (map.getSource("routes")) return;
      map.addSource("routes", { type: "geojson", data: routesGeoJSON() });
      map.addLayer({
        id: "routes-base",
        type: "line",
        source: "routes",
        layout: { "line-cap": "round", "line-join": "round", visibility: "none" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2, 15, 4.5],
          "line-opacity": 0.45,
        },
      });
      map.addLayer({
        id: "routes-selected",
        type: "line",
        source: "routes",
        filter: ["==", ["get", "lineId"], "__none__"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 5, 16, 9],
          "line-opacity": 0.95,
        },
      });

      // Setas de sentido sobre a rota selecionada
      try {
        if (!map.hasImage("mobisl-arrow")) map.addImage("mobisl-arrow", arrowImage());
      } catch {
        /* canvas indisponível: segue sem setas */
      }
      map.addLayer({
        id: "routes-direction",
        type: "symbol",
        source: "routes",
        filter: ["==", ["get", "lineId"], "__none__"],
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 90,
          "icon-image": "mobisl-arrow",
          "icon-size": ["interpolate", ["linear"], ["zoom"], 11, 0.42, 16, 0.7],
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      // Todas as paradas reais da cidade (OpenStreetMap) — pontinhos discretos
      map.addSource("city-stops", { type: "geojson", data: cityStopsGeoJSON() });
      map.addLayer({
        id: "city-stops-circle",
        type: "circle",
        source: "city-stops",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 1.6, 14, 2.8, 17, 4.5],
          "circle-color": "#0f6b70",
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0.35, 14, 0.6],
          "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 13, 0.6, 17, 1.4],
          "circle-stroke-color": "#ffffff",
        },
      });
      map.addLayer({
        id: "city-stops-label",
        type: "symbol",
        source: "city-stops",
        minzoom: 15.4,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 10,
          "text-offset": [0, 0.9],
          "text-anchor": "top",
          "text-font": ["Noto Sans Regular"],
          "text-optional": true,
        },
        paint: {
          "text-color": "#475569",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.6,
        },
      });

      // Paradas reais atendidas pela linha selecionada
      map.addSource("city-line-stops", { type: "geojson", data: lineCityStopsGeoJSON() });
      map.addLayer({
        id: "city-line-stops-circle",
        type: "circle",
        source: "city-line-stops",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 3.2, 14, 5, 17, 7],
          "circle-color": "#ffffff",
          "circle-stroke-width": 2.4,
          "circle-stroke-color": ["get", "color"],
        },
      });
      map.addLayer({
        id: "city-line-stops-label",
        type: "symbol",
        source: "city-line-stops",
        minzoom: 13.8,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 0.95],
          "text-anchor": "top",
          "text-font": ["Noto Sans Regular"],
          "text-optional": true,
        },
        paint: {
          "text-color": "#0f172a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      });

      map.addSource("stops", { type: "geojson", data: stopsGeoJSON() });
      // Todos os pontos da rede — sutis sobre o mapa claro
      map.addLayer({
        id: "stops-circle",
        type: "circle",
        source: "stops",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 2.2, 13, 3.4, 17, 5.5],
          "circle-color": "#ffffff",
          "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 10, 1, 16, 1.8],
          "circle-stroke-color": "#0f6b70",
          "circle-opacity": 0.9,

        },
      });
      // Área de toque generosa (invisível) para os pontos
      map.addLayer({
        id: "stops-hit",
        type: "circle",
        source: "stops",
        paint: { "circle-radius": 14, "circle-color": "#000000", "circle-opacity": 0 },
      });
      map.addLayer({
        id: "stops-label",
        type: "symbol",
        source: "stops",
        minzoom: 13.6,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.1],
          "text-anchor": "top",
          "text-font": ["Noto Sans Regular"],
        },
        paint: {
          "text-color": "#334155",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.8,
        },
      });

      // Pontos da linha selecionada — numerados na ordem do itinerário
      map.addSource("line-stops", { type: "geojson", data: lineStopsGeoJSON() });
      map.addLayer({
        id: "stops-route",
        type: "circle",
        source: "line-stops",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 13, 8, 17, 12],
          "circle-color": "#ffffff",
          "circle-stroke-width": 3,
          "circle-stroke-color": ["get", "color"],
        },
      });
      map.addLayer({
        id: "stops-route-seq",
        type: "symbol",
        source: "line-stops",
        minzoom: 12.4,
        layout: {
          "text-field": ["get", "seq"],
          "text-size": 10.5,
          "text-font": ["Noto Sans Bold"],
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#0f172a" },
      });
      map.addLayer({
        id: "stops-route-label",
        type: "symbol",
        source: "line-stops",
        minzoom: 12.2,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
          "text-font": ["Noto Sans Bold"],
        },
        paint: {
          "text-color": "#0f172a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2.2,
        },
      });

      // Origem e destino da linha selecionada
      map.addSource("endpoints", { type: "geojson", data: endpointsGeoJSON() });
      map.addLayer({
        id: "endpoints-label",
        type: "symbol",
        source: "endpoints",
        layout: {
          "text-field": ["get", "label"],
          "text-size": 12,
          "text-offset": [0, -1.8],
          "text-anchor": "bottom",
          "text-font": ["Noto Sans Bold"],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": ["get", "color"],
          "text-halo-color": "#ffffff",
          "text-halo-width": 2.4,
        },
      });

      // Ponto selecionado — anel de destaque
      map.addLayer({
        id: "stop-selected",
        type: "circle",
        source: "stops",
        filter: ["==", ["get", "id"], "__none__"],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 9, 17, 16],
          "circle-color": "#0f9b8e",
          "circle-opacity": 0.18,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#0f9b8e",
        },
      });

      const stopLayers = ["stops-hit", "stops-route", "stops-circle"];
      stopLayers.forEach((layer) => {
        map.on("click", layer, (e) => {
          const id = e.features?.[0]?.properties?.["id"] as string | undefined;
          if (id) handlers.current.onSelectStop(id);
        });
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      });
      map.on("click", (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: stopLayers });
        if (hits.length === 0) handlers.current.onBackgroundClick();
      });

      readyRef.current = true;
      handlers.current.onStatus?.("ready");

      map.resize();
    };

    map.on("load", setup);
    map.on("styledata", () => {
      if (map.isStyleLoaded()) setup();
    });


    // Garante que o mapa acompanhe o tamanho real do contêiner (iframe/preview)
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);
    const raf = requestAnimationFrame(() => map.resize());
    const onWinResize = () => map.resize();
    window.addEventListener("resize", onWinResize);

    return () => {
      window.clearTimeout(guard);
      cancelAnimationFrame(raf);

      window.removeEventListener("resize", onWinResize);
      ro.disconnect();
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sincroniza marcadores dos veículos
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const visible = selectedLineId ? buses.filter((b) => b.lineId === selectedLineId) : buses;
    const seen = new Set<string>();

    visible.forEach((bus) => {
      seen.add(bus.id);
      const selected = bus.id === selectedBusId;
      const existing = markersRef.current[bus.id];
      if (existing) {
        existing.setLngLat([bus.lon, bus.lat]);
        const el = existing.getElement();
        el.dataset['longitude'] = String(bus.lon);
        el.dataset['latitude'] = String(bus.lat);
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) inner.style.setProperty("--rot", `${bus.bearing}deg`);
        applyBusScale(el, selected);

      } else {
        const el = busElement(bus, selected);
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          handlers.current.onSelectBus(bus.id);
        });
        markersRef.current[bus.id] = new maplibregl.Marker({
          element: el,
          anchor: "center",
          offset: [0, 0],
          pitchAlignment: "viewport",
          rotationAlignment: "viewport",
          subpixelPositioning: true,
        })
          .setLngLat([bus.lon, bus.lat])
          .addTo(map);
      }
    });

    Object.keys(markersRef.current).forEach((id) => {
      if (!seen.has(id)) {
        markersRef.current[id]?.remove();
        delete markersRef.current[id];
      }
    });
  }, [buses, selectedBusId, selectedLineId]);

  // Destaque da rota selecionada + enquadramento
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const apply = () => {
      if (!map.getLayer("routes-selected")) return;
      map.setFilter("routes-selected", [
        "==",
        ["get", "lineId"],
        selectedLineId ?? "__none__",
      ]);
      // Trajetos ficam ocultos até uma linha/ônibus ser selecionado
      if (map.getLayer("routes-base")) {
        map.setLayoutProperty("routes-base", "visibility", "none");
      }

      // Setas de sentido apenas na linha selecionada
      if (map.getLayer("routes-direction")) {
        map.setFilter("routes-direction", [
          "==",
          ["get", "lineId"],
          selectedLineId ?? "__none__",
        ]);
      }

      // Pontos do trajeto em destaque (fonte dedicada, numerada)
      const line = selectedLineId ? LINES_BY_ID[selectedLineId] : undefined;
      const lineStopsSrc = map.getSource("line-stops") as maplibregl.GeoJSONSource | undefined;
      lineStopsSrc?.setData(lineStopsGeoJSON(selectedLineId));
      const endpointsSrc = map.getSource("endpoints") as maplibregl.GeoJSONSource | undefined;
      endpointsSrc?.setData(endpointsGeoJSON(selectedLineId));
      const cityLineSrc = map.getSource("city-line-stops") as
        | maplibregl.GeoJSONSource
        | undefined;
      cityLineSrc?.setData(lineCityStopsGeoJSON(selectedLineId));
      if (map.getLayer("city-stops-circle")) {
        map.setPaintProperty(
          "city-stops-circle",
          "circle-opacity",
          line
            ? 0.18
            : (["interpolate", ["linear"], ["zoom"], 11, 0.35, 14, 0.6] as unknown as number),
        );
      }
      if (map.getLayer("stops-circle")) {
        map.setPaintProperty("stops-circle", "circle-opacity", line ? 0.45 : 0.95);
      }


      if (line && !selectedBusId) {
        const coords = lineShape(line);
        const bounds = coords.reduce(
          (b, c) => b.extend(c as [number, number]),
          new maplibregl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number]),
        );
        map.fitBounds(bounds, { padding: { top: 110, bottom: 320, left: 50, right: 50 }, duration: 900 });
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("idle", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLineId]);

  // Voo até ônibus selecionado
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedBusId) return;
    const bus = buses.find((b) => b.id === selectedBusId);
    if (!bus) return;
    map.easeTo({ center: [bus.lon, bus.lat], zoom: Math.max(map.getZoom(), 14.5), duration: 800 });
    // apenas ao mudar a seleção
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusId]);

  // Voo até ponto selecionado
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (map.getLayer("stop-selected")) {
        map.setFilter("stop-selected", ["==", ["get", "id"], selectedStopId ?? "__none__"]);
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("idle", apply);
    if (!selectedStopId) return;
    const stop = STOPS.find((s) => s.id === selectedStopId);
    if (!stop) return;
    map.easeTo({ center: [stop.lon, stop.lat], zoom: Math.max(map.getZoom(), 15), duration: 800 });
  }, [selectedStopId]);


  // Localização do usuário (ou do veículo em tempo real, ex.: TESTE-1).
  // O marcador se move, mas a câmera permanece livre para o usuário explorar o mapa.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const isLive = Boolean(liveLabel);
    const prevLive = userMarkerRef.current?.getElement?.()?.dataset?.['live'] === "1";

    // Reconstrói o marcador se o tipo mudou (ponto comum <-> veículo ao vivo)
    if (userMarkerRef.current && prevLive !== isLive) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.dataset['live'] = isLive ? "1" : "0";
      if (isLive) {
        el.className = "mobisl-live-marker";
        el.innerHTML = `
          <span class="mobisl-live-ring"></span>
          <span class="mobisl-live-ring mobisl-live-ring--slow"></span>
          <span class="mobisl-live-heading" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0.5 19 12 12 8.6 5 12Z" fill="#ff4d1c" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="mobisl-live-bus" aria-hidden="true">
            <svg viewBox="0 0 52 52" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="live-bus-body" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#ff9a3d"/>
                  <stop offset="48%" stop-color="#ff4d1c"/>
                  <stop offset="100%" stop-color="#c92c08"/>
                </linearGradient>
                <filter id="live-bus-shadow" x="-60%" y="-60%" width="220%" height="220%">
                  <feDropShadow dx="0" dy="3" stdDeviation="2.7" flood-color="#111827" flood-opacity=".55"/>
                </filter>
              </defs>
              <g filter="url(#live-bus-shadow)">
                <rect x="14" y="19" width="24" height="6" rx="2.5" fill="#111827"/>
                <rect x="14" y="30" width="24" height="6" rx="2.5" fill="#111827"/>
                <rect x="15" y="5" width="22" height="42" rx="8" fill="url(#live-bus-body)" stroke="#ffffff" stroke-width="2.5"/>
                <path d="M19 9.5h14l-1.6 8H20.6L19 9.5Z" fill="#dff2ff" stroke="#ffffff" stroke-width="1"/>
                <rect x="19" y="21" width="14" height="12" rx="3" fill="#ffffff" opacity=".22"/>
                <path d="M26 21v12" stroke="#ffffff" stroke-width="1" opacity=".45"/>
                <path d="M20 42h12" stroke="#7c1804" stroke-width="3" stroke-linecap="round"/>
                <circle cx="20.5" cy="8.5" r="1.6" fill="#fff7c2"/>
                <circle cx="31.5" cy="8.5" r="1.6" fill="#fff7c2"/>
              </g>
            </svg>
          </span>
          <span class="mobisl-live-chip">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 17V6.5C6 4.6 7.8 3 10 3h4c2.2 0 4 1.6 4 3.5V17"/>
              <path d="M6 13h12M8 17v2m8-2v2"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/>
            </svg>
            ${liveLabel}
          </span>
        `;
      } else {
        el.className = "mobisl-pulse";
        el.style.cssText =
          "position:relative;width:16px;height:16px;border-radius:9999px;background:#0f6b70;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)";
      }
      userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([
        userLocation.lon,
        userLocation.lat,
      ]);
      userMarkerRef.current.addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userLocation.lon, userLocation.lat]);
    }
  }, [userLocation, liveLabel]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-label="Mapa da rede"
    />
  );
}
