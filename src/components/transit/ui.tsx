import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { ACCESSIBILITY_LABELS, LINES_BY_ID } from "@/lib/transit/network";
import type { AccessibilityFeature, BusStatus } from "@/lib/transit/types";
import { cn } from "@/lib/utils";

export function LineBadge({
  lineId,
  size = "md",
}: {
  lineId: string;
  size?: "sm" | "md" | "lg";
}) {
  const color = LINES_BY_ID[lineId]?.color ?? "#0f9b8e";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-bold tracking-tight text-white",
        size === "sm" && "h-7 min-w-11 px-2 text-xs",
        size === "md" && "h-9 min-w-14 px-2.5 text-sm",
        size === "lg" && "h-12 min-w-16 px-3 text-lg",
      )}
      style={{ backgroundColor: color }}
    >
      {lineId}
    </span>
  );
}

const STATUS_MAP: Record<BusStatus, { label: string; className: string; dot: string }> = {
  operating: { label: "Em operação", className: "bg-success/12 text-success", dot: "bg-success" },
  delayed: { label: "Com atraso", className: "bg-warning/18 text-warning-foreground", dot: "bg-warning" },
  stopped: { label: "Parado", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  out_of_service: {
    label: "Fora de operação",
    className: "bg-destructive/12 text-destructive",
    dot: "bg-destructive",
  },
};

export function StatusPill({ status }: { status: BusStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        s.className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function AccessibilityChips({
  features,
  compact = false,
}: {
  features: AccessibilityFeature[];
  compact?: boolean;
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {features.map((f) => {
        const meta = ACCESSIBILITY_LABELS[f];
        return (
          <li
            key={f}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
          >
            <span aria-hidden>{meta.icon}</span>
            {!compact && <span>{meta.label}</span>}
            {compact && <span className="sr-only">{meta.label}</span>}
          </li>
        );
      })}
    </ul>
  );
}

export function FavoriteButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors",
        active
          ? "border-accent bg-accent/20 text-accent-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-secondary",
      )}
    >
      <Star className={cn("h-5 w-5", active && "fill-current")} />
    </button>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-card px-4 py-5">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-sm px-6 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ViewOnMapLink({ lineId }: { lineId: string }) {
  return (
    <Link
      to="/"
      search={{ linha: lineId }}
      className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
    >
      Ver rota no mapa
    </Link>
  );
}

export function SimulationTag() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
      dados simulados
    </span>
  );
}
