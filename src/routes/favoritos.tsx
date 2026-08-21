import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { EmptyState, LineBadge, PageHeader, SimulationTag } from "@/components/transit/ui";
import { LINES_BY_ID, STOPS_BY_ID } from "@/lib/transit/network";
import { arrivalsForStop, useBuses } from "@/lib/transit/useTransit";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos — linhas e pontos salvos | MobiSL" },
      {
        name: "description",
        content:
          "Acesse rapidamente suas linhas e pontos de ônibus favoritos em São Leopoldo com previsão de chegada.",
      },
      { property: "og:title", content: "Favoritos — linhas e pontos salvos | MobiSL" },
      {
        property: "og:description",
        content: "Suas linhas e paradas preferidas com chegadas em tempo real.",
      },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, toggle } = useFavorites();
  const buses = useBuses();
  const lines = favorites.filter((f) => f.kind === "line");
  const stops = favorites.filter((f) => f.kind === "stop");

  return (
    <main className="min-h-screen pb-24">
      <PageHeader title="Favoritos" subtitle="Suas linhas e pontos salvos" action={<SimulationTag />} />

      {favorites.length === 0 ? (
        <EmptyState
          icon={<Star className="h-6 w-6" />}
          title="Nada salvo ainda"
          description="Toque na estrela em uma linha ou ponto para acompanhá-lo aqui."
        />
      ) : (
        <div className="space-y-6 px-4 py-5">
          {lines.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Linhas
              </h2>
              <ul className="mt-3 space-y-2">
                {lines.map((f) => {
                  const line = LINES_BY_ID[f.id];
                  if (!line) return null;
                  const fleet = buses.filter((b) => b.lineId === line.id).length;
                  return (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      <LineBadge lineId={line.id} />
                      <Link
                        to="/linhas/$lineId"
                        params={{ lineId: line.id }}
                        className="min-w-0 flex-1"
                      >
                        <span className="block truncate font-semibold">{line.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {fleet} ônibus ativos
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggle("line", line.id)}
                        className="rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                      >
                        Remover
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {stops.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Pontos
              </h2>
              <ul className="mt-3 space-y-2">
                {stops.map((f) => {
                  const stop = STOPS_BY_ID[f.id];
                  if (!stop) return null;
                  const next = arrivalsForStop(stop.id, buses).slice(0, 3);
                  return (
                    <li key={f.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-start gap-3">
                        <Link to="/" search={{ ponto: stop.id }} className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{stop.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {stop.neighborhood}
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggle("stop", stop.id)}
                          className="rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                        >
                          Remover
                        </button>
                      </div>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {next.map((a) => (
                          <li
                            key={a.busId}
                            className="inline-flex items-center gap-2 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold"
                          >
                            <LineBadge lineId={a.lineId} size="sm" />
                            {a.etaMin} min
                          </li>
                        ))}
                        {next.length === 0 && (
                          <li className="text-xs text-muted-foreground">Sem previsões agora</li>
                        )}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
