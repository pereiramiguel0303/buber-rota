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
  sources: {
    basemap: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap © CARTO",
    },
  },
  layers: [{ id: "basemap", type: "raster", source: "basemap" }],
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
      properties: { id: s.id, name: s.name, lines: s.id },
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
  if (inner) inner.style.setProperty("--scale", selected ? "1.35" : "1");
}

/** Mini modelo 3D de ônibus (visto de cima, em CSS 3D), rotacionado pelo rumo. */
function busElement(bus: Bus, selected: boolean) {
  const color = LINES_BY_ID[bus.lineId]?.color ?? "#0f9b8e";
  const top = shade(color, 0.12);
  const dark = shade(color, -0.22);

  const el = document.createElement("button");
  el.className = "mobisl-bus";
  el.setAttribute("aria-label", `Ônibus ${bus.id}, linha ${bus.lineId}`);
  el.style.cssText =
    "all:unset;cursor:pointer;width:46px;height:46px;display:grid;place-items:center;perspective:220px;";

  const inner = document.createElement("div");
  inner.style.cssText = `--scale:${selected ? 1.35 : 1};--rot:${bus.bearing}deg;
    width:22px;height:40px;position:relative;transform-style:preserve-3d;
    transform:rotateX(52deg) rotate(var(--rot)) scale(var(--scale));
    transition:transform .35s linear;`;

  inner.innerHTML = `
    <div style="position:absolute;inset:2px -3px -6px 3px;background:rgba(10,30,35,.32);
      filter:blur(4px);border-radius:12px;transform:translateZ(-6px)"></div>
    <div style="position:absolute;inset:0;border-radius:8px;background:linear-gradient(180deg,${top},${dark});
      border:1.5px solid rgba(255,255,255,.9);box-shadow:0 6px 14px rgba(15,40,50,.35);overflow:hidden">
      <div style="position:absolute;top:2px;left:2px;right:2px;height:8px;border-radius:5px 5px 3px 3px;
        background:linear-gradient(180deg,rgba(220,245,255,.95),rgba(150,200,215,.75))"></div>
      <div style="position:absolute;bottom:2px;left:2px;right:2px;height:5px;border-radius:3px;
        background:rgba(255,255,255,.35)"></div>
      <div style="position:absolute;top:12px;left:2px;right:2px;height:1.5px;background:rgba(255,255,255,.55)"></div>
      <div style="position:absolute;top:16px;left:0;width:2px;height:9px;background:rgba(20,40,45,.5)"></div>
      <div style="position:absolute;top:16px;right:0;width:2px;height:9px;background:rgba(20,40,45,.5)"></div>
    </div>`;

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
      map.addLayer({
        id: "stops-circle",
        type: "circle",
        source: "stops",
        minzoom: 12,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 3.5, 16, 7],
          "circle-color": "#ffffff",
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#0f6b70",
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
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        },
        paint: {
          "text-color": "#134e52",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.6,
        },
      });

      map.on("click", "stops-circle", (e) => {
        const id = e.features?.[0]?.properties?.["id"] as string | undefined;
        if (id) handlers.current.onSelectStop(id);
      });
      map.on("mouseenter", "stops-circle", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "stops-circle", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: ["stops-circle"] });
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
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) inner.style.setProperty("--rot", `${bus.bearing}deg`);
        applyBusScale(el, selected);

      } else {
        const el = busElement(bus, selected);
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          handlers.current.onSelectBus(bus.id);
        });
        markersRef.current[bus.id] = new maplibregl.Marker({ element: el })
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
      map.setPaintProperty("routes-base", "line-opacity", selectedLineId ? 0.15 : 0.45);
      if (selectedLineId) {
        const coords = lineShape(LINES_BY_ID[selectedLineId]!);
        const bounds = coords.reduce(
          (b, c) => b.extend(c as [number, number]),
          new maplibregl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number]),
        );
        map.fitBounds(bounds, { padding: { top: 110, bottom: 320, left: 50, right: 50 }, duration: 900 });
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("idle", apply);
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
