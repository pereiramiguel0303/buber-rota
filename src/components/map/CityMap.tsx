import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { CITY_CENTER, LINES, LINES_BY_ID, STOPS, lineShape } from "@/lib/transit/network";
import type { FeatureCollection } from "geojson";
import type { Bus } from "@/lib/transit/types";

export interface CityMapProps {
  buses: Bus[];
  selectedLineId?: string | undefined;
  selectedBusId?: string | undefined;
  selectedStopId?: string | undefined;
  userLocation?: { lat: number; lon: number } | null | undefined;
  onSelectBus: (id: string) => void;
  onSelectStop: (id: string) => void;
  onBackgroundClick: () => void;
}

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    basemap: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO",
    },
  },
  layers: [
    { id: "basemap", type: "raster", source: "basemap", paint: { "raster-brightness-min": 0.02 } },
  ],
};

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
      },
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
    })),
  };
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
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="body-${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${light}"/>
        <stop offset="100%" stop-color="${dark}"/>
      </linearGradient>
      <filter id="sh-${uid}" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1.6" stdDeviation="1.9" flood-color="#0b2b33" flood-opacity="0.45"/>
      </filter>
    </defs>
    <g filter="url(#sh-${uid})">
      <ellipse cx="24" cy="26" rx="11" ry="16" fill="#0b2b33" opacity=".15"/>
      <rect x="15" y="7" width="18" height="34" rx="6" fill="url(#body-${uid})"
        stroke="#ffffff" stroke-width="2"/>
      <path d="M18 10.8h12a1.2 1.2 0 0 1 1.14 1.56l-.76 2.4a1.2 1.2 0 0 1-1.14.84H18.76a1.2 1.2 0 0 1-1.14-.84l-.76-2.4A1.2 1.2 0 0 1 18 10.8z"
        fill="#eaf7ff" opacity="0.95"/>
      <rect x="17.8" y="18" width="12.4" height="12" rx="2" fill="#ffffff" opacity="0.2"/>
      <path d="M18 20.5h12M18 24h12M18 27.5h12" stroke="#ffffff" stroke-width=".8" opacity=".34"/>
      <rect x="18" y="34.4" width="12" height="3.4" rx="1.5" fill="#0b2b33" opacity="0.34"/>
      <rect x="13.7" y="15" width="2" height="6" rx="1" fill="#163b42"/>
      <rect x="32.3" y="15" width="2" height="6" rx="1" fill="#163b42"/>
      <rect x="13.7" y="29" width="2" height="6" rx="1" fill="#163b42"/>
      <rect x="32.3" y="29" width="2" height="6" rx="1" fill="#163b42"/>
      <circle cx="19" cy="9.8" r="1.15" fill="#fff8d8"/>
      <circle cx="29" cy="9.8" r="1.15" fill="#fff8d8"/>
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
  onSelectBus,
  onSelectStop,
  onBackgroundClick,
}: CityMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const readyRef = useRef(false);
  const handlers = useRef({ onSelectBus, onSelectStop, onBackgroundClick });
  handlers.current = { onSelectBus, onSelectStop, onBackgroundClick };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [CITY_CENTER.lon, CITY_CENTER.lat],
      zoom: 12.4,
      minZoom: 10,
      maxZoom: 18,
      pitchWithRotate: false,
      dragRotate: false,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      map.addSource("routes", { type: "geojson", data: routesGeoJSON() });
      map.addLayer({
        id: "routes-base",
        type: "line",
        source: "routes",
        layout: { "line-cap": "round", "line-join": "round" },
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

      map.addSource("stops", { type: "geojson", data: stopsGeoJSON() });
      // Todos os pontos da rede — sempre visíveis, discretos no tema escuro
      map.addLayer({
        id: "stops-circle",
        type: "circle",
        source: "stops",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 2.6, 13, 4.2, 17, 7.5],
          "circle-color": "#0b0d10",
          "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 10, 1.4, 16, 3],
          "circle-stroke-color": "#8f9aa6",
          "circle-opacity": 0.95,
        },
      });
      // Pontos do trajeto selecionado — destacados
      map.addLayer({
        id: "stops-route",
        type: "circle",
        source: "stops",
        filter: ["==", ["get", "id"], "__none__"],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 4, 13, 6, 17, 10],
          "circle-color": "#ffffff",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#12161b",
        },
      });
      map.addLayer({
        id: "stops-label",
        type: "symbol",
        source: "stops",
        minzoom: 14.2,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-offset": [0, 1.1],
          "text-anchor": "top",
          "text-font": ["Open Sans Regular"],
        },
        paint: {
          "text-color": "#d7dee6",
          "text-halo-color": "#05070a",
          "text-halo-width": 1.6,
        },
      });
      map.addLayer({
        id: "stops-route-label",
        type: "symbol",
        source: "stops",
        minzoom: 12.4,
        filter: ["==", ["get", "id"], "__none__"],
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
          "text-font": ["Open Sans Semibold"],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#05070a",
          "text-halo-width": 2,
        },
      });

      const stopLayers = ["stops-route", "stops-circle"];
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
      map.resize();
    });

    // Garante que o mapa acompanhe o tamanho real do contêiner (iframe/preview)
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);
    const raf = requestAnimationFrame(() => map.resize());
    const onWinResize = () => map.resize();
    window.addEventListener("resize", onWinResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onWinResize);
      ro.disconnect();
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};
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
      map.setPaintProperty("routes-base", "line-opacity", selectedLineId ? 0.12 : 0.4);

      // Pontos do trajeto em destaque
      const line = selectedLineId ? LINES_BY_ID[selectedLineId] : undefined;
      const stopFilter: maplibregl.FilterSpecification = line
        ? ["in", ["get", "id"], ["literal", line.stopIds]]
        : ["==", ["get", "id"], "__none__"];
      ["stops-route", "stops-route-label"].forEach((id) => {
        if (map.getLayer(id)) map.setFilter(id, stopFilter);
      });
      if (map.getLayer("stops-route")) {
        map.setPaintProperty("stops-route", "circle-stroke-color", line?.color ?? "#12161b");
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
    if (!map || !selectedStopId) return;
    const stop = STOPS.find((s) => s.id === selectedStopId);
    if (!stop) return;
    map.easeTo({ center: [stop.lon, stop.lat], zoom: Math.max(map.getZoom(), 15), duration: 800 });
  }, [selectedStopId]);

  // Localização do usuário
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "mobisl-pulse";
      el.style.cssText =
        "position:relative;width:16px;height:16px;border-radius:9999px;background:#0f6b70;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)";
      userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([
        userLocation.lon,
        userLocation.lat,
      ]);
      userMarkerRef.current.addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userLocation.lon, userLocation.lat]);
    }
    map.easeTo({ center: [userLocation.lon, userLocation.lat], zoom: 14.5, duration: 900 });
  }, [userLocation]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-label="Mapa da rede"
    />
  );
}
