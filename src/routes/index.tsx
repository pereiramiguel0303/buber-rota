import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Crosshair, Locate, Radar, Search, X } from "lucide-react";
import { Suspense, lazy, useMemo, useState } from "react";
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
      { title: "MobiSL — Ônibus em tempo real em São Leopoldo" },
      {
        name: "description",
        content:
          "Acompanhe a frota de ônibus de São Leopoldo no mapa: linhas, rotas, pontos, previsão de chegada, acessibilidade e alertas.",
      },
      { property: "og:title", content: "MobiSL — Ônibus em tempo real em São Leopoldo" },
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

  const results = useMemo(() => searchNetwork(query, buses), [query, buses]);
  const selectedBus = buses.find((b) => b.id === search.onibus);

  const setSelection = (patch: MapSearch) => {
    setShowNearby(false);
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
            userLocation={coords}
            onSelectBus={(id) =>
              setSelection({ onibus: id, linha: buses.find((b) => b.id === id)?.lineId })
            }
            onSelectStop={(id) => setSelection({ ponto: id, linha: search.linha })}
            onBackgroundClick={() => setSelection({})}
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

      {/* Contador da frota */}
      <div className="absolute bottom-24 left-3 z-20 rounded-2xl border border-border bg-card/95 px-3 py-2 text-xs shadow-[var(--shadow-float)] backdrop-blur">
        <p className="font-semibold">
          {search.linha ? `Linha ${search.linha}` : `Rede de ${CITY_NAME}`}
        </p>
        <p className="text-muted-foreground">
          {(search.linha ? buses.filter((b) => b.lineId === search.linha) : buses).length} ônibus ao
          vivo
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
          onClose={() => setSelection({ linha: search.linha })}
          onSelectLine={(id) => setSelection({ linha: id })}
        />
      )}
      {!showNearby && !selectedBus && search.ponto && (
        <StopSheet
          stopId={search.ponto}
          buses={buses}
          onClose={() => setSelection({ linha: search.linha })}
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
