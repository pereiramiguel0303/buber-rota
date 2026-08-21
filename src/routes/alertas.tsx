import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { LineBadge, PageHeader, SimulationTag } from "@/components/transit/ui";
import { ALERTS, LINES_BY_ID } from "@/lib/transit/network";
import { cn } from "@/lib/utils";
import type { Alert } from "@/lib/transit/types";

export const Route = createFileRoute("/alertas")({
  head: () => ({
    meta: [
      { title: "Alertas e ocorrências do transporte | MobiSL" },
      {
        name: "description",
        content:
          "Atrasos, desvios e interrupções nas linhas de ônibus de São Leopoldo, além de canais de segurança.",
      },
      { property: "og:title", content: "Alertas e ocorrências do transporte | MobiSL" },
      {
        property: "og:description",
        content: "Acompanhe atrasos, desvios e interrupções da rede em tempo real.",
      },
    ],
  }),
  component: AlertsPage,
});

const SEVERITY: Record<
  Alert["severity"],
  { label: string; className: string; icon: typeof Info }
> = {
  info: { label: "Informação", className: "bg-primary/10 text-primary", icon: Info },
  warning: { label: "Atenção", className: "bg-warning/20 text-warning-foreground", icon: AlertTriangle },
  critical: { label: "Crítico", className: "bg-destructive/12 text-destructive", icon: ShieldAlert },
};

const FILTERS = ["todos", "critical", "warning", "info"] as const;
const FILTER_LABEL: Record<(typeof FILTERS)[number], string> = {
  todos: "Todos",
  critical: "Críticos",
  warning: "Atenção",
  info: "Informações",
};

function AlertsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("todos");
  const alerts = ALERTS.filter((a) => filter === "todos" || a.severity === filter);

  return (
    <main className="min-h-screen pb-24">
      <PageHeader
        title="Alertas"
        subtitle={`${ALERTS.length} ocorrências na rede`}
        action={<SimulationTag />}
      />

      <div className="flex gap-2 overflow-x-auto px-4 py-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>

      <ul className="space-y-3 px-4">
        {alerts.map((a) => {
          const meta = SEVERITY[a.severity];
          const Icon = meta.icon;
          const line = LINES_BY_ID[a.lineId];
          return (
            <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                    meta.className,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </span>
                <LineBadge lineId={a.lineId} size="sm" />
                <span className="ml-auto text-xs text-muted-foreground">{a.since}</span>
              </div>
              <h2 className="mt-3 font-semibold">{a.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
              {line && (
                <Link
                  to="/linhas/$lineId"
                  params={{ lineId: line.id }}
                  className="mt-3 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-semibold"
                >
                  Ver linha {line.id}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <section className="mt-6 px-4">
        <div className="rounded-2xl border border-border bg-secondary/60 p-4">
          <h2 className="font-semibold">Segurança</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Em caso de emergência a bordo, acione o motorista e ligue para os canais oficiais.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="tel:190"
              className="inline-flex h-11 items-center rounded-full bg-destructive px-5 text-sm font-semibold text-destructive-foreground"
            >
              Emergência 190
            </a>
            <a
              href="tel:156"
              className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold"
            >
              Ouvidoria 156
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
