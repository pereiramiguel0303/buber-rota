import { createFileRoute, Link } from "@tanstack/react-router";
import { Bus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, LineBadge, PageHeader, SimulationTag } from "@/components/transit/ui";
import { CITY_NAME, LINES } from "@/lib/transit/network";
import { useBuses } from "@/lib/transit/useTransit";

export const Route = createFileRoute("/linhas/")({
  head: () => ({
    meta: [
      { title: "Linhas de ônibus de São Leopoldo | MobiSL" },
      {
        name: "description",
        content:
          "Lista completa das linhas de ônibus de São Leopoldo com frota ativa, intervalo médio, origem e destino.",
      },
      { property: "og:title", content: "Linhas de ônibus de São Leopoldo | MobiSL" },
      {
        property: "og:description",
        content: "Consulte todas as linhas, a frota em circulação e o intervalo médio.",
      },
    ],
  }),
  component: LinesPage,
});

function LinesPage() {
  const buses = useBuses();
  const [query, setQuery] = useState("");

  const lines = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LINES.filter((l) =>
      `${l.id} ${l.name} ${l.origin} ${l.destination}`.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <main className="min-h-screen pb-24">
      <PageHeader
        title="Linhas"
        subtitle={`Rede de ${CITY_NAME} • ${LINES.length} linhas`}
        action={<SimulationTag />}
      />

      <div className="px-4 py-4">
        <label className="relative block">
          <span className="sr-only">Buscar linha</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por número, bairro ou destino"
            className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      {lines.length === 0 ? (
        <EmptyState
          icon={<Bus className="h-6 w-6" />}
          title="Nenhuma linha encontrada"
          description="Tente buscar por outro número, bairro ou destino."
        />
      ) : (
        <ul className="space-y-3 px-4">
          {lines.map((line) => {
            const fleet = buses.filter((b) => b.lineId === line.id);
            return (
              <li key={line.id}>
                <Link
                  to="/linhas/$lineId"
                  params={{ lineId: line.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
                >
                  <LineBadge lineId={line.id} size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{line.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {line.origin} → {line.destination}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {fleet.length} ônibus ativos • a cada {line.headwayMin} min •{" "}
                      {line.stopIds.length} pontos
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
