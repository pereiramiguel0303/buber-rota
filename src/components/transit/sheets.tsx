import { Link } from "@tanstack/react-router";
import { Gauge, MapPin, Navigation, X } from "lucide-react";
import type { ReactNode } from "react";
import { LINES_BY_ID, STOPS_BY_ID, linesForStop } from "@/lib/transit/network";
import type { Bus } from "@/lib/transit/types";
import { arrivalsForStop, nextBusesForLine } from "@/lib/transit/useTransit";
import { useFavorites } from "@/lib/favorites";
import {
  AccessibilityChips,
  FavoriteButton,
  LineBadge,
  StatusPill,
  SimulationTag,
} from "./ui";

export function SheetShell({
  children,
  onClose,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <section
      role="dialog"
      aria-label={title}
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 max-h-[62vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card shadow-[var(--shadow-sheet)] duration-300 animate-in slide-in-from-bottom"
    >
      <div className="sticky top-0 z-10 bg-card/95 px-4 pt-3 backdrop-blur">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-border" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-4 pb-24 pt-3">{children}</div>
    </section>
  );
}

export function BusSheet({ bus, onClose, onSelectLine }: { bus: Bus; onClose: () => void; onSelectLine: (id: string) => void }) {
  const line = LINES_BY_ID[bus.lineId];
  const nextStop = STOPS_BY_ID[bus.nextStopId];

  return (
    <SheetShell title={`Ônibus ${bus.id}`} onClose={onClose}>
      <div className="flex items-start gap-3">
        <LineBadge lineId={bus.lineId} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold tracking-tight">{bus.id}</h2>
          <p className="truncate text-sm text-muted-foreground">
            Linha {bus.lineId} → {bus.destination}
          </p>
        </div>
        <StatusPill status={bus.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric icon={<Gauge className="h-4 w-4" />} label="Velocidade" value={`${bus.speed} km/h`} />
        <Metric
          icon={<Navigation className="h-4 w-4" />}
          label="Chegada estimada"
          value={`${bus.etaMin} min`}
        />
        <div className="col-span-2 rounded-2xl border border-border bg-secondary/40 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Próxima parada
          </p>
          <p className="mt-1 flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4 text-primary" />
            {nextStop?.name ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold">Acessibilidade do veículo</h3>
        <AccessibilityChips features={bus.accessibility} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectLine(bus.lineId)}
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Ver rota da linha
        </button>
        <Link
          to="/linhas/$lineId"
          params={{ lineId: bus.lineId }}
          className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-semibold"
        >
          Detalhes da linha {line?.id}
        </Link>
        <SimulationTag />
      </div>
    </SheetShell>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

export function StopSheet({
  stopId,
  buses,
  onClose,
  onSelectLine,
}: {
  stopId: string;
  buses: Bus[];
  onClose: () => void;
  onSelectLine: (id: string) => void;
}) {
  const stop = STOPS_BY_ID[stopId];
  const { isFavorite, toggle } = useFavorites();
  if (!stop) return null;
  const arrivals = arrivalsForStop(stopId, buses);

  return (
    <SheetShell title={`Ponto ${stop.name}`} onClose={onClose}>
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
          <MapPin className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold tracking-tight">{stop.name}</h2>
          <p className="truncate text-sm text-muted-foreground">{stop.neighborhood}</p>
        </div>
        <FavoriteButton
          active={isFavorite("stop", stop.id)}
          onClick={() => toggle("stop", stop.id)}
          label="Favoritar ponto"
        />
      </div>

      <h3 className="mb-2 mt-4 text-sm font-semibold">Próximas chegadas</h3>
      <ul className="space-y-2">
        {arrivals.slice(0, 6).map((a) => (
          <li key={`${a.busId}-${a.lineId}`}>
            <button
              type="button"
              onClick={() => onSelectLine(a.lineId)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:bg-secondary/50"
            >
              <LineBadge lineId={a.lineId} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {LINES_BY_ID[a.lineId]?.destination}
                </span>
                <span className="block truncate text-xs text-muted-foreground">{a.busId}</span>
              </span>
              <span className="shrink-0 text-base font-bold text-primary">{a.etaMin} min</span>
            </button>
          </li>
        ))}
        {arrivals.length === 0 && (
          <li className="text-sm text-muted-foreground">Sem previsões no momento.</li>
        )}
      </ul>

      <h3 className="mb-2 mt-4 text-sm font-semibold">Linhas que atendem</h3>
      <div className="flex flex-wrap gap-2">
        {linesForStop(stop.id).map((l) => (
          <LineBadge key={l.id} lineId={l.id} size="sm" />
        ))}
      </div>

      <h3 className="mb-2 mt-4 text-sm font-semibold">Acessibilidade do ponto</h3>
      <AccessibilityChips features={stop.accessibility} />
    </SheetShell>
  );
}

export function LineSheet({
  lineId,
  buses,
  onClose,
  onSelectBus,
  onSelectStop,
}: {
  lineId: string;
  buses: Bus[];
  onClose: () => void;
  onSelectBus: (id: string) => void;
  onSelectStop: (id: string) => void;
}) {
  const line = LINES_BY_ID[lineId];
  const { isFavorite, toggle } = useFavorites();
  if (!line) return null;
  const fleet = buses.filter((b) => b.lineId === lineId);
  const upcoming = nextBusesForLine(lineId, buses).slice(0, 4);

  return (
    <SheetShell title={`Linha ${line.id}`} onClose={onClose}>
      <div className="flex items-start gap-3">
        <LineBadge lineId={line.id} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold tracking-tight">Linha {line.id}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {line.origin} → {line.destination}
          </p>
        </div>
        <FavoriteButton
          active={isFavorite("line", line.id)}
          onClick={() => toggle("line", line.id)}
          label="Favoritar linha"
        />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        <strong className="text-foreground">{fleet.length}</strong> ônibus em circulação •
        intervalo médio {line.headwayMin} min
      </p>

      <h3 className="mb-2 mt-4 text-sm font-semibold">Próximos ônibus</h3>
      <ul className="space-y-2">
        {upcoming.map(({ bus, etaMin }) => (
          <li key={bus.id}>
            <button
              type="button"
              onClick={() => onSelectBus(bus.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left hover:bg-secondary/50"
            >
              <span aria-hidden className="text-lg">🚌</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{bus.id}</span>
              <span className="shrink-0 font-bold text-primary">{etaMin} min</span>
            </button>
          </li>
        ))}
      </ul>

      <h3 className="mb-2 mt-4 text-sm font-semibold">Itinerário</h3>
      <ol className="relative ml-1 border-l-2 border-dashed border-border pl-5">
        {line.stopIds.map((id) => {
          const stop = STOPS_BY_ID[id]!;
          return (
            <li key={id} className="relative pb-3 last:pb-0">
              <span
                className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-card"
                style={{ backgroundColor: line.color }}
              />
              <button
                type="button"
                onClick={() => onSelectStop(id)}
                className="text-left text-sm font-medium hover:text-primary"
              >
                {stop.name}
                <span className="block text-xs font-normal text-muted-foreground">
                  {stop.neighborhood}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-center gap-2">
        <Link
          to="/linhas/$lineId"
          params={{ lineId: line.id }}
          className="inline-flex h-11 items-center rounded-full border border-border px-5 text-sm font-semibold"
        >
          Página da linha
        </Link>
        <SimulationTag />
      </div>
    </SheetShell>
  );
}

export function NearbySheet({
  items,
  buses,
  onClose,
  onSelectStop,
}: {
  items: { stop: { id: string; name: string; neighborhood: string }; distanceM: number }[];
  buses: Bus[];
  onClose: () => void;
  onSelectStop: (id: string) => void;
}) {
  return (
    <SheetShell title="Transportes próximos" onClose={onClose}>
      <h2 className="text-xl font-bold tracking-tight">Transportes próximos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pontos ordenados pela distância da sua localização.
      </p>
      <ul className="mt-4 space-y-3">
        {items.map(({ stop, distanceM }) => {
          const arrivals = arrivalsForStop(stop.id, buses).slice(0, 3);
          return (
            <li key={stop.id} className="rounded-2xl border border-border bg-card p-3">
              <button
                type="button"
                onClick={() => onSelectStop(stop.id)}
                className="flex w-full items-center gap-2 text-left"
              >
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate font-semibold">{stop.name}</span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {distanceM >= 1000 ? `${(distanceM / 1000).toFixed(1)} km` : `${distanceM} m`}
                </span>
              </button>
              <ul className="mt-2 space-y-1.5">
                {arrivals.map((a) => (
                  <li key={a.busId} className="flex items-center gap-2 text-sm">
                    <LineBadge lineId={a.lineId} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                      {LINES_BY_ID[a.lineId]?.destination}
                    </span>
                    <span className="font-semibold text-primary">{a.etaMin} min</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </SheetShell>
  );
}
