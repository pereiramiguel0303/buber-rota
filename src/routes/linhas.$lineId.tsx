import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bus as BusIcon, MapPin } from "lucide-react";
import {
  AccessibilityChips,
  FavoriteButton,
  LineBadge,
  SimulationTag,
  StatusPill,
  ViewOnMapLink,
} from "@/components/transit/ui";
import { ALERTS, LINES_BY_ID, STOPS_BY_ID } from "@/lib/transit/network";
import { nextBusesForLine, useBuses } from "@/lib/transit/useTransit";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/linhas/$lineId")({
  loader: ({ params }) => {
    const line = LINES_BY_ID[params.lineId];
    if (!line) throw notFound();
    return { line };
  },
  head: ({ loaderData }) => {
    const line = loaderData?.line;
    const title = line
      ? `Linha ${line.id} — ${line.origin} → ${line.destination} | MobiSL`
      : "Linha | MobiSL";
    const description = line
      ? `Rota, pontos, previsão de chegada e acessibilidade da linha ${line.id} em São Leopoldo.`
      : "Detalhes da linha de ônibus em São Leopoldo.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: LineDetail,
});

function LineDetail() {
  const { line } = Route.useLoaderData();
  const buses = useBuses();
  const { isFavorite, toggle } = useFavorites();
  const next = nextBusesForLine(line.id, buses).slice(0, 5);
  const alerts = ALERTS.filter((a) => a.lineId === line.id);

  return (
    <main className="min-h-screen pb-24">
      <header className="border-b border-border bg-card px-4 py-5">
        <Link
          to="/linhas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Linhas
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <LineBadge lineId={line.id} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight">{line.name}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {line.origin} → {line.destination}
            </p>
          </div>
          <FavoriteButton
            active={isFavorite("line", line.id)}
            onClick={() => toggle("line", line.id)}
            label={`Favoritar linha ${line.id}`}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ViewOnMapLink lineId={line.id} />
          <SimulationTag />
        </div>
      </header>

      <section className="px-4 py-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Próximos ônibus
        </h2>
        {next.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum veículo em circulação nesta linha agora.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {next.map(({ bus, etaMin }) => (
              <li
                key={bus.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                  <BusIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    to="/"
                    search={{ onibus: bus.id, linha: line.id }}
                    className="block truncate font-semibold"
                  >
                    {bus.id}
                  </Link>
                  <span className="block truncate text-xs text-muted-foreground">
                    Próx.: {STOPS_BY_ID[bus.nextStopId]?.name ?? "—"}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-lg font-bold text-primary">{etaMin} min</span>
                  <StatusPill status={bus.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-4 pb-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Itinerário • {line.stopIds.length} pontos
        </h2>
        <ol className="mt-3 space-y-1">
          {line.stopIds.map((stopId) => {
            const stop = STOPS_BY_ID[stopId];
            if (!stop) return null;
            return (
              <li key={stopId}>
                <Link
                  to="/"
                  search={{ ponto: stop.id, linha: line.id }}
                  className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-secondary/60"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{stop.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {stop.neighborhood}
                    </span>
                    <span className="mt-1 block">
                      <AccessibilityChips features={stop.accessibility} compact />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {alerts.length > 0 && (
        <section className="px-4 pb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Alertas da linha
          </h2>
          <ul className="mt-3 space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
                <p className="font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{a.since}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
