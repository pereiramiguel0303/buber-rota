import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Radio, Satellite } from "lucide-react";
import { PageHeader, SimulationTag } from "@/components/transit/ui";
import { CITY_NAME, LINES, STOPS } from "@/lib/transit/network";
import { DEFAULT_PREFS, usePrefs } from "@/lib/favorites";
import { transitProvider } from "@/lib/transit/provider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil e acessibilidade | MobiSL" },
      {
        name: "description",
        content:
          "Ajuste preferências de acessibilidade, notificações e veja a fonte de dados da rede de São Leopoldo.",
      },
      { property: "og:title", content: "Perfil e acessibilidade | MobiSL" },
      {
        property: "og:description",
        content: "Preferências de acessibilidade, notificações e status da fonte de dados.",
      },
    ],
  }),
  component: ProfilePage,
});

const TOGGLES = [
  { key: "wheelchair", label: "Priorizar veículos acessíveis", hint: "Destaca ônibus com rampa e espaço para cadeira" },
  { key: "audioCues", label: "Avisos sonoros", hint: "Leitura em voz alta das próximas chegadas" },
  { key: "highContrast", label: "Alto contraste", hint: "Aumenta o contraste de textos e ícones" },
  { key: "notifyDelays", label: "Notificar atrasos", hint: "Alertas quando uma linha favorita atrasar" },
  { key: "notifyArrivals", label: "Notificar chegada", hint: "Aviso quando o ônibus estiver a 3 minutos" },
] as const;

function ProfilePage() {
  const { prefs, update } = usePrefs();

  return (
    <main className="min-h-screen pb-24">
      <PageHeader title="Perfil" subtitle={`Preferências e dados da rede`} action={<SimulationTag />} />

      <section className="px-4 py-5">
        <label className="block">
          <span className="text-sm font-semibold">Como devemos te chamar?</span>
          <input
            value={prefs.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder={DEFAULT_PREFS.name}
            className="mt-2 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary"
          />
        </label>
      </section>

      <section className="px-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Acessibilidade e notificações
        </h2>
        <ul className="mt-3 space-y-2">
          {TOGGLES.map((t) => {
            const active = prefs[t.key];
            return (
              <li key={t.key}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  onClick={() => update({ [t.key]: !active })}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{t.label}</span>
                    <span className="block text-xs text-muted-foreground">{t.hint}</span>
                  </span>
                  <span
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                      active ? "bg-primary" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-card transition-transform",
                        active ? "translate-x-[22px]" : "translate-x-0.5",
                      )}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="px-4 py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fonte de dados
        </h2>
        <div className="mt-3 space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <Radio className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Provedor ativo: {transitProvider.id}</p>
              <p className="text-xs text-muted-foreground">
                {LINES.length} linhas • {STOPS.length} pontos • rede de {CITY_NAME}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <Satellite className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Hardware previsto</p>
              <p className="text-xs text-muted-foreground">
                Arduino Mega + GPS NEO-6M enviando latitude, longitude, velocidade e rumo para o
                Realtime Database.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
            <Cpu className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Troca da camada de dados</p>
              <p className="text-xs text-muted-foreground">
                Basta implementar a interface TransitProvider com o Firebase e substituir o provedor
                simulado — telas e mapa continuam iguais.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
