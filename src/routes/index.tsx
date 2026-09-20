import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Crosshair, Locate, Radar, Search, X } from "lucide-react";
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { BusSheet, LineSheet, NearbySheet, StopSheet } from "@/components/transit/sheets";
import { LineBadge } from "@/components/transit/ui";
import { CITY_NAME, LINES } from "@/lib/transit/network";
import {
  nearbyStops,
  searchNetwork,
  useBuses,
  useUserLocation,
} from "@/lib/transit/useTransit";

const CityMap = lazy(() => import("@/components/map/CityMap"));

interface MapSearch {
  linha?: string | undefined;
  onibus?: string | undefined;
  ponto?: string | undefined;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): MapSearch => ({
    linha: typeof search["linha"] === "string" ? (search["linha"] as string) : undefined,
    onibus: typeof search["onibus"] === "string" ? (search["onibus"] as string) : undefined,
    ponto: typeof search["ponto"] === "string" ? (search["ponto"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "BUBER — Passageiros | Ônibus em tempo real em São Leopoldo" },
      {
        name: "description",
        content:
          "Acompanhe a frota de ônibus de São Leopoldo no mapa: linhas, rotas, pontos, previsão de chegada, acessibilidade e alertas.",
      },
      { property: "og:title", content: "BUBER — Passageiros | Ônibus em tempo real em São Leopoldo" },
      {
        property: "og:description",
        content: "Mapa vivo da rede de transporte público com frota, rotas e previsões.",
      },
    ],
  }),
  component: MapPage,
});

function MapSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-secondary/50">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Radar className="h-8 w-8 animate-pulse text-primary" />
        <p className="text-sm font-medium">Carregando a rede de {CITY_NAME}…</p>
      </div>
    </div>
  );
}

function MapPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const buses = useBuses();
  const { coords, locate } = useUserLocation();
  const [query, setQuery] = useState("");
  const [showNearby, setShowNearby] = useState(false);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");

  // Localização em tempo real vinda do Firebase (GPS NEO-6M -> Arduino Mega),
  // em vez da geolocalização do navegador.
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [liveBearing, setLiveBearing] = useState<number | null>(null);
  const [showLiveInfo, setShowLiveInfo] = useState(false);
  const [liveStats, setLiveStats] = useState<{
    speedKmh: number;
    status: string;
    precisao: number | null;
    updatedAt: number | null;
  } | null>(null);

  const lastSnappedRef = useRef<{ lat: number; lon: number } | null>(null);
  const bearingRef = useRef<number | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const { onValue, ref } = await import("firebase/database");
      const { db } = await import("@/lib/firebase");
      const { snapToRoad, distanceMeters, bearingBetween, smoothBearing } = await import(
        "@/lib/transit/snap"
      );
      if (cancelled) return;

      const busRef = ref(db, "onibus/TESTE-1");
      unsubscribe = onValue(busRef, (snapshot) => {
        const data = snapshot.val() as
          | {
              latitude?: number | string;
              longitude?: number | string;
              velocidade?: number | string;
              status?: string;
              precisao?: number | string;
              timestamp?: number | string;
            }
          | null;
        if (!data) return;

        const speedRaw = Number.parseFloat(String(data.velocidade));
        const precisaoRaw = Number.parseFloat(String(data.precisao));
        const tsRaw = Number(data.timestamp);
        setLiveStats({
          // O GPS envia a velocidade em m/s — convertemos para km/h.
          speedKmh: Number.isFinite(speedRaw) ? Math.max(0, speedRaw) * 3.6 : 0,
          status: data.status ?? "online",
          precisao: Number.isFinite(precisaoRaw) ? precisaoRaw : null,
          updatedAt: Number.isFinite(tsRaw) ? tsRaw : null,
        });

        const lat = Number.parseFloat(String(data.latitude));
        const lon = Number.parseFloat(String(data.longitude));
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

        void (async () => {
          // Encaixa o ponto bruto do GPS na rua mais próxima.
          const snapped = await snapToRoad({ lat, lon });
          if (cancelled) return;

          const prev = lastSnappedRef.current;
          if (prev) {
            const moved = distanceMeters(prev, snapped);
            // Só recalcula o rumo quando houve deslocamento real (evita tremer parado).
            if (moved >= 5) {
              const raw = bearingBetween(prev, snapped);
              const next = smoothBearing(bearingRef.current, raw);
              bearingRef.current = next;
              setLiveBearing(next);
            }
            if (moved < 1.5) return;
          }
          lastSnappedRef.current = snapped;
          setUserLocation(snapped);
        })();
      });
    })();

    // Limpeza: cancela o listener do Firebase ao desmontar (evita vazamento).
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);



  const results = useMemo(() => searchNetwork(query, buses), [query, buses]);
  const selectedBus = buses.find((b) => b.id === search.onibus);

  const setSelection = (patch: MapSearch) => {
    setShowNearby(false);
    setShowLiveInfo(false);
    void navigate({ search: () => patch });
  };

  const nearby = useMemo(
    () => nearbyStops(coords ?? { lat: -29.7604, lon: -51.147 }),
    [coords],
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-secondary">
      <ClientOnly fallback={<MapSkeleton />}>
        <Suspense fallback={<MapSkeleton />}>
          <CityMap
            buses={buses}
            selectedLineId={search.linha}
            selectedBusId={search.onibus}
            selectedStopId={search.ponto}
            userLocation={userLocation ?? coords}
            liveLabel={userLocation ? "TESTE-1" : undefined}
            liveBearing={liveBearing}
            onSelectBus={(id) =>
              setSelection({ onibus: id, linha: buses.find((b) => b.id === id)?.lineId })
            }
            onSelectStop={(id) => setSelection({ ponto: id, linha: search.linha })}
            onBackgroundClick={() => setSelection({})}
            onLiveClick={() => {
              setShowNearby(false);
              setShowLiveInfo(true);
            }}
            onStatus={setMapStatus}
          />

        </Suspense>
      </ClientOnly>

      {/* Barra superior */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 p-3">
        <div className="pointer-events-auto mx-auto max-w-xl">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/95 p-2 shadow-[var(--shadow-float)] backdrop-blur">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Radar className="h-5 w-5" />
            </div>
            <label className="sr-only" htmlFor="busca">
              Pesquisar linha, ônibus, ponto ou bairro
            </label>
            <input
              id="busca"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Linha, ônibus, ponto ou bairro"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar pesquisa"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </div>

          {results.length > 0 && (
            <ul className="mt-2 max-h-72 overflow-y-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-float)]">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelection({
                        linha: r.lineId,
                        onibus: r.busId,
                        ponto: r.stopId,
                      });
                    }}
                    className="flex w-full items-center gap-3 border-b border-border p-3 text-left last:border-0 hover:bg-secondary/60"
                  >
                    {r.lineId ? (
                      <LineBadge lineId={r.lineId} size="sm" />
                    ) : (
                      <span className="grid h-7 w-11 place-items-center rounded-xl bg-secondary text-xs">
                        📍
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{r.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {r.subtitle}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!query && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {LINES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelection({ linha: search.linha === l.id ? undefined : l.id })}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur transition-colors ${
                    search.linha === l.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card/95"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  {l.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações flutuantes */}
      <div className="absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          onClick={locate}
          aria-label="Localizar minha posição"
          className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card text-primary shadow-[var(--shadow-float)]"
        >
          <Crosshair className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            locate();
            setShowNearby(true);
            void navigate({ search: () => ({}) });
          }}
          aria-label="Transportes perto de mim"
          className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card text-primary shadow-[var(--shadow-float)]"
        >
          <Locate className="h-5 w-5" />
        </button>
      </div>

      {/* Estado do mapa */}
      {mapStatus !== "ready" && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-secondary/60 backdrop-blur-[1px]">
          <div className="rounded-2xl border border-border bg-card/95 px-4 py-3 text-center shadow-[var(--shadow-float)]">
            {mapStatus === "loading" ? (
              <p className="flex items-center gap-2 text-sm font-medium">
                <Radar className="h-4 w-4 animate-pulse text-primary" />
                Carregando mapa…
              </p>
            ) : (
              <p className="max-w-[16rem] text-sm font-medium">
                Não foi possível carregar o mapa. Verifique sua conexão e tente novamente.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Contador da frota */}
      <div className="absolute bottom-24 left-3 z-20 rounded-2xl border border-border bg-card/95 px-3 py-2 text-xs shadow-[var(--shadow-float)] backdrop-blur">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <span
            className={`h-2 w-2 rounded-full ${
              mapStatus === "ready"
                ? "animate-pulse bg-emerald-500"
                : mapStatus === "loading"
                  ? "bg-amber-400"
                  : "bg-red-500"
            }`}
          />
          {mapStatus === "ready" ? "Rede ao vivo" : mapStatus === "loading" ? "Conectando" : "Indisponível"}
        </p>
        <p className="mt-0.5 font-semibold">
          {search.linha ? `Linha ${search.linha}` : CITY_NAME}
        </p>
        <p className="text-muted-foreground">
          {(search.linha ? buses.filter((b) => b.lineId === search.linha) : buses).length} ônibus em
          operação
        </p>
      </div>

      {/* Painéis inferiores */}
      {showNearby && (
        <NearbySheet
          items={nearby}
          buses={buses}
          onClose={() => setShowNearby(false)}
          onSelectStop={(id) => setSelection({ ponto: id })}
        />
      )}
      {!showNearby && selectedBus && (
        <BusSheet
          bus={selectedBus}
          onClose={() => setSelection({})}
          onSelectLine={(id) => setSelection({ linha: id })}
        />
      )}
      {!showNearby && !selectedBus && search.ponto && (
        <StopSheet
          stopId={search.ponto}
          buses={buses}
          onClose={() => setSelection({})}
          onSelectLine={(id) => setSelection({ linha: id })}
        />
      )}

      {!showNearby && !selectedBus && !search.ponto && search.linha && (
        <LineSheet
          lineId={search.linha}
          buses={buses}
          onClose={() => setSelection({})}
          onSelectBus={(id) => setSelection({ onibus: id, linha: search.linha })}
          onSelectStop={(id) => setSelection({ ponto: id, linha: search.linha })}
        />
      )}
    </div>
  );
}
