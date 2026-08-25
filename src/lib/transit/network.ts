import { ROUTE_SHAPES } from "./shapes.generated";
import type {
  AccessibilityFeature,
  Alert,
  Direction,
  Line,
  Operator,
  Stop,
} from "./types";

/** Centro geográfico de São Leopoldo / RS */
export const CITY_CENTER = { lat: -29.7604, lon: -51.147 };
export const CITY_NAME = "São Leopoldo";

const A = {
  full: [
    "wheelchair",
    "visual",
    "audio",
    "priority_seats",
    "air_conditioning",
    "wide_space",
  ] as AccessibilityFeature[],
  basic: ["wheelchair", "priority_seats"] as AccessibilityFeature[],
  mid: ["wheelchair", "audio", "priority_seats", "air_conditioning"] as AccessibilityFeature[],
};

/**
 * Pontos de parada representativos de São Leopoldo, com coordenadas reais
 * dos terminais, estações do Trensurb, hospitais, escolas e bairros citados
 * nos quadros de horários das viações Feitoria, Sinoscap e Leopoldense.
 */
export const STOPS: Stop[] = [
  // ── Centro e eixos estruturais ──────────────────────────────────────────
  { id: "C01", name: "Praça da Prefeitura", neighborhood: "Centro", lat: -29.7601, lon: -51.1480, accessibility: A.full },
  { id: "C02", name: "Estação São Leopoldo (Trensurb)", neighborhood: "Centro", lat: -29.7607, lon: -51.1509, accessibility: A.full },
  { id: "C03", name: "Estação Rio dos Sinos (Trensurb)", neighborhood: "Rio dos Sinos", lat: -29.7712, lon: -51.1518, accessibility: A.full },
  { id: "C04", name: "Estação Unisinos (Trensurb)", neighborhood: "Cristo Rei", lat: -29.7920, lon: -51.1533, accessibility: A.full },
  { id: "C05", name: "Mercado Público", neighborhood: "Centro", lat: -29.7657, lon: -51.1451, accessibility: A.mid },
  { id: "C06", name: "Av. João Corrêa", neighborhood: "Centro", lat: -29.7576, lon: -51.1451, accessibility: A.basic },
  { id: "C07", name: "Hospital Centenário", neighborhood: "Pádua", lat: -29.7708, lon: -51.1520, accessibility: A.full },
  { id: "C08", name: "UPA São Leopoldo", neighborhood: "Feitoria", lat: -29.7452, lon: -51.1560, accessibility: A.full },
  { id: "C09", name: "Rodoviária", neighborhood: "Centro", lat: -29.7690, lon: -51.1440, accessibility: A.mid },
  { id: "C10", name: "Campus Unisinos", neighborhood: "Cristo Rei", lat: -29.7960, lon: -51.1520, accessibility: A.full },
  { id: "C11", name: "Terminal Metropolitano", neighborhood: "Centro", lat: -29.7669, lon: -51.1536, accessibility: A.full },
  { id: "C12", name: "Av. Getúlio Vargas", neighborhood: "Centro", lat: -29.7635, lon: -51.1560, accessibility: A.basic },
  { id: "C13", name: "Praça do Imigrante", neighborhood: "Centro", lat: -29.7625, lon: -51.1470, accessibility: A.mid },
  { id: "C14", name: "Av. Mauá", neighborhood: "Centro", lat: -29.7668, lon: -51.1493, accessibility: A.basic },

  // ── Região da Feitoria e nordeste ───────────────────────────────────────
  { id: "F01", name: "Terminal Feitoria", neighborhood: "Feitoria", lat: -29.7405, lon: -51.1650, accessibility: A.full },
  { id: "F02", name: "Feitoria Velha", neighborhood: "Feitoria", lat: -29.7440, lon: -51.1700, accessibility: A.basic },
  { id: "F03", name: "Feitoria Nova", neighborhood: "Feitoria Nova", lat: -29.7360, lon: -51.1600, accessibility: A.mid },
  { id: "F04", name: "Cohab Feitoria", neighborhood: "Cohab", lat: -29.7470, lon: -51.1690, accessibility: A.basic },
  { id: "F05", name: "Vila Imperatriz", neighborhood: "Imperatriz", lat: -29.7565, lon: -51.1230, accessibility: A.mid },
  { id: "F06", name: "São Geraldo", neighborhood: "São Geraldo", lat: -29.7500, lon: -51.1250, accessibility: A.basic },
  { id: "F07", name: "Loteamento Seller", neighborhood: "Seller", lat: -29.7350, lon: -51.1740, accessibility: A.basic },
  { id: "F08", name: "Jardim Cora", neighborhood: "Jardim Cora", lat: -29.7300, lon: -51.1660, accessibility: A.basic },
  { id: "F09", name: "Lomba Grande", neighborhood: "Lomba Grande", lat: -29.7115, lon: -51.0900, accessibility: A.basic },
  { id: "F10", name: "Kilombo", neighborhood: "Kilombo", lat: -29.7250, lon: -51.1120, accessibility: A.basic },
  { id: "F11", name: "Taurus", neighborhood: "Distrito Industrial", lat: -29.7320, lon: -51.1250, accessibility: A.mid },
  { id: "F12", name: "Vila Imigrante", neighborhood: "Imigrante", lat: -29.7530, lon: -51.1360, accessibility: A.basic },
  { id: "F13", name: "Parada 14", neighborhood: "Parada 14", lat: -29.7180, lon: -51.1420, accessibility: A.mid },
  { id: "F14", name: "Escola Feitoria", neighborhood: "Feitoria", lat: -29.7432, lon: -51.1613, accessibility: A.basic },
  { id: "F15", name: "Av. Feitoria, 3000", neighborhood: "Feitoria", lat: -29.7490, lon: -51.1580, accessibility: A.basic },

  // ── Região norte / Sinoscap ─────────────────────────────────────────────
  { id: "S01", name: "Vila Tereza", neighborhood: "Vila Tereza", lat: -29.7245, lon: -51.1585, accessibility: A.mid },
  { id: "S02", name: "Vila Duque", neighborhood: "Duque de Caxias", lat: -29.7480, lon: -51.1290, accessibility: A.basic },
  { id: "S03", name: "Itapema", neighborhood: "Itapema", lat: -29.7100, lon: -51.1600, accessibility: A.basic },
  { id: "S04", name: "Vila Batista", neighborhood: "Vila Batista", lat: -29.7530, lon: -51.1810, accessibility: A.mid },
  { id: "S05", name: "Santos Dumont", neighborhood: "Santos Dumont", lat: -29.7300, lon: -51.1490, accessibility: A.mid },
  { id: "S06", name: "Vila Maria", neighborhood: "Vila Maria", lat: -29.7195, lon: -51.1300, accessibility: A.basic },
  { id: "S07", name: "Cetemp", neighborhood: "Fazenda São Borja", lat: -29.7810, lon: -51.1450, accessibility: A.full },
  { id: "S08", name: "Boa Saúde", neighborhood: "Boa Saúde", lat: -29.7480, lon: -51.2030, accessibility: A.basic },
  { id: "S09", name: "Monte Blanco", neighborhood: "Monte Blanco", lat: -29.7690, lon: -51.2000, accessibility: A.basic },
  { id: "S10", name: "Gedore", neighborhood: "Distrito Industrial", lat: -29.7380, lon: -51.1180, accessibility: A.mid },
  { id: "S11", name: "Vila Paim", neighborhood: "Paim", lat: -29.7240, lon: -51.1240, accessibility: A.basic },
  { id: "S12", name: "Charrua", neighborhood: "Santa Teresa", lat: -29.7220, lon: -51.1350, accessibility: A.basic },
  { id: "S13", name: "Boa Vista", neighborhood: "Boa Vista", lat: -29.7350, lon: -51.1360, accessibility: A.basic },
  { id: "S14", name: "Santo Agostinho", neighborhood: "Santo Agostinho", lat: -29.7160, lon: -51.1520, accessibility: A.basic },
  { id: "S15", name: "Escola Santos Dumont", neighborhood: "Santos Dumont", lat: -29.7326, lon: -51.1503, accessibility: A.basic },

  // ── Região sul e oeste / Leopoldense ────────────────────────────────────
  { id: "L01", name: "Campina", neighborhood: "Campina", lat: -29.7830, lon: -51.1660, accessibility: A.mid },
  { id: "L02", name: "Vila Glória", neighborhood: "Vila Glória", lat: -29.7760, lon: -51.1730, accessibility: A.basic },
  { id: "L03", name: "Antônio Leite", neighborhood: "Campina", lat: -29.7860, lon: -51.1800, accessibility: A.basic },
  { id: "L04", name: "Scharlau", neighborhood: "Scharlau", lat: -29.7600, lon: -51.1800, accessibility: A.mid },
  { id: "L05", name: "Quimisinos", neighborhood: "Distrito Industrial Oeste", lat: -29.7700, lon: -51.1930, accessibility: A.basic },
  { id: "L06", name: "Jardim Fênix", neighborhood: "Jardim Fênix", lat: -29.7900, lon: -51.1720, accessibility: A.basic },
  { id: "L07", name: "Arroio da Manteiga", neighborhood: "Arroio da Manteiga", lat: -29.7660, lon: -51.1660, accessibility: A.basic },
  { id: "L08", name: "Pinheiro", neighborhood: "Pinheiro", lat: -29.7770, lon: -51.1580, accessibility: A.basic },
  { id: "L09", name: "Praça Vicentina", neighborhood: "Vicentina", lat: -29.7702, lon: -51.1462, accessibility: A.basic },
  { id: "L10", name: "Scharlau Centro", neighborhood: "Scharlau", lat: -29.7602, lon: -51.1706, accessibility: A.mid },
  { id: "L11", name: "Campina Baixa", neighborhood: "Campina", lat: -29.7900, lon: -51.1600, accessibility: A.basic },
];

export const STOPS_BY_ID: Record<string, Stop> = Object.fromEntries(
  STOPS.map((s) => [s.id, s]),
);

export const OPERATORS: { id: Operator; name: string; color: string }[] = [
  { id: "Feitoria", name: "Viação Feitoria", color: "#1f9d55" },
  { id: "Sinoscap", name: "Viação Sinoscap", color: "#2563eb" },
  { id: "Leopoldense", name: "Viação Leopoldense", color: "#e07a1f" },
];

export const OPERATOR_NAME: Record<Operator, string> = {
  Feitoria: "Viação Feitoria",
  Sinoscap: "Viação Sinoscap",
  Leopoldense: "Viação Leopoldense",
};

/**
 * Linhas com os nomes exatamente como constam nos quadros de horários
 * oficiais das três viações da cidade. O itinerário é descrito no sentido
 * Bairro → Centro; o sentido Centro → Bairro percorre a mesma via ao contrário.
 */
export const LINES: Line[] = [
  // ── Viação Feitoria ─────────────────────────────────────────────────────
  { id: "feitoria", code: "FEI", name: "Feitoria", operator: "Feitoria", origin: "Terminal Feitoria", destination: "Centro", color: "#1f9d55", headwayMin: 12, stopIds: ["F01", "F14", "F15", "C08", "C06", "C01", "C02"] },
  { id: "cohab", code: "COH", name: "Cohab", operator: "Feitoria", origin: "Cohab Feitoria", destination: "Centro", color: "#2fae63", headwayMin: 20, stopIds: ["F04", "F02", "F14", "C08", "C06", "C13", "C01"] },
  { id: "imperatriz", code: "IMP", name: "Imperatriz", operator: "Feitoria", origin: "Vila Imperatriz", destination: "Centro", color: "#159c74", headwayMin: 18, stopIds: ["F05", "F06", "F12", "C06", "C13", "C01", "C02"] },
  { id: "sao-geraldo", code: "SGE", name: "São Geraldo", operator: "Feitoria", origin: "São Geraldo", destination: "Centro", color: "#3fb27a", headwayMin: 25, stopIds: ["F06", "F05", "F12", "C09", "C05", "C01"] },
  { id: "feitoria-nova", code: "FNV", name: "Feitoria Nova", operator: "Feitoria", origin: "Feitoria Nova", destination: "Centro", color: "#12855a", headwayMin: 22, stopIds: ["F03", "F01", "F14", "C08", "C06", "C01"] },
  { id: "seller", code: "SEL", name: "Seller", operator: "Feitoria", origin: "Loteamento Seller", destination: "Centro", color: "#43a047", headwayMin: 30, stopIds: ["F07", "F08", "F03", "F01", "C08", "C06", "C01"] },
  { id: "imigrante", code: "IMG", name: "Imigrante", operator: "Feitoria", origin: "Vila Imigrante", destination: "Centro", color: "#2e9e8f", headwayMin: 24, stopIds: ["F12", "F06", "C06", "C13", "C01", "C02"] },
  { id: "taurus", code: "TAU", name: "Taurus", operator: "Feitoria", origin: "Taurus", destination: "Centro", color: "#1a8f4c", headwayMin: 35, stopIds: ["F11", "S10", "F06", "F12", "C06", "C01"] },
  { id: "jardim-cora", code: "JCO", name: "Jardim Cora", operator: "Feitoria", origin: "Jardim Cora", destination: "Centro", color: "#57b894", headwayMin: 40, stopIds: ["F08", "F03", "F01", "F14", "C08", "C01"] },
  { id: "lomba-grande", code: "LGR", name: "Lomba Grande", operator: "Feitoria", origin: "Lomba Grande", destination: "Centro", color: "#0f7a45", headwayMin: 60, stopIds: ["F09", "F10", "F11", "F06", "F12", "C06", "C01"] },
  { id: "kilombo", code: "KIL", name: "Kilombo", operator: "Feitoria", origin: "Kilombo", destination: "Centro", color: "#66bb6a", headwayMin: 50, stopIds: ["F10", "F11", "S10", "F06", "C06", "C01"] },

  // ── Viação Sinoscap ─────────────────────────────────────────────────────
  { id: "sinoscap", code: "SIN", name: "Sinoscap", operator: "Sinoscap", origin: "Santos Dumont", destination: "Estação Unisinos", color: "#2563eb", headwayMin: 15, stopIds: ["S05", "S15", "C06", "C01", "C02", "C03", "C04"] },
  { id: "vila-tereza", code: "VTZ", name: "Vila Tereza", operator: "Sinoscap", origin: "Vila Tereza", destination: "Praça da Prefeitura", color: "#3b82f6", headwayMin: 20, stopIds: ["S01", "S05", "C06", "C02", "C04", "C01"] },
  { id: "industrial", code: "IND", name: "Industrial (Vila Duque)", operator: "Sinoscap", origin: "Vila Duque", destination: "Estação Unisinos", color: "#1d4ed8", headwayMin: 40, stopIds: ["S02", "S13", "F12", "C06", "C01", "C02", "C04"] },
  { id: "parada-14", code: "P14", name: "Est. Unisinos - Parada 14", operator: "Sinoscap", origin: "Parada 14", destination: "Estação Unisinos", color: "#0ea5e9", headwayMin: 30, stopIds: ["F13", "S14", "S05", "C02", "C03", "C04"] },
  { id: "itapema", code: "ITA", name: "Itapema", operator: "Sinoscap", origin: "Itapema", destination: "Estação Unisinos", color: "#38bdf8", headwayMin: 45, stopIds: ["S03", "S14", "F13", "S05", "C02", "C03", "C04"] },
  { id: "vila-batista", code: "VBS", name: "Vila Batista / Santos Dumont", operator: "Sinoscap", origin: "Vila Batista", destination: "Santos Dumont", color: "#1e40af", headwayMin: 25, stopIds: ["S04", "L10", "C12", "C02", "C01", "C06", "S15", "S05"] },
  { id: "vila-maria", code: "VMA", name: "Vila Maria", operator: "Sinoscap", origin: "Vila Maria", destination: "Estação Unisinos", color: "#4f46e5", headwayMin: 30, stopIds: ["S06", "S11", "S12", "C06", "C01", "C02", "C04"] },
  { id: "cetemp", code: "CET", name: "Cetemp", operator: "Sinoscap", origin: "Cetemp", destination: "Centro", color: "#0284c7", headwayMin: 50, stopIds: ["S07", "C03", "C14", "C05", "C01", "C02", "C04"] },
  { id: "boa-saude", code: "BSA", name: "Boa Saúde", operator: "Sinoscap", origin: "Boa Saúde", destination: "Campus Unisinos", color: "#0891b2", headwayMin: 60, stopIds: ["S08", "S09", "L04", "C12", "C02", "C04", "C10"] },
  { id: "monte-blanco", code: "MBL", name: "Monte Blanco", operator: "Sinoscap", origin: "Monte Blanco", destination: "Centro", color: "#0369a1", headwayMin: 55, stopIds: ["S09", "L04", "L10", "C12", "C11", "C01"] },
  { id: "gedore", code: "GED", name: "Gedore", operator: "Sinoscap", origin: "Gedore", destination: "Estação Unisinos", color: "#6366f1", headwayMin: 45, stopIds: ["S10", "F11", "S13", "F12", "C06", "C01", "C02", "C04"] },
  { id: "paim", code: "PAI", name: "Paim", operator: "Sinoscap", origin: "Vila Paim", destination: "Estação Unisinos", color: "#7c3aed", headwayMin: 35, stopIds: ["S11", "S06", "S12", "C06", "C01", "C02", "C04"] },

  // ── Viação Leopoldense ──────────────────────────────────────────────────
  { id: "leopoldense", code: "LEO", name: "Leopoldense", operator: "Leopoldense", origin: "Campina", destination: "Centro", color: "#e07a1f", headwayMin: 15, stopIds: ["L01", "L08", "L09", "C09", "C05", "C01", "C02"] },
  { id: "campina", code: "CAM", name: "Campina", operator: "Leopoldense", origin: "Campina Baixa", destination: "Centro", color: "#f2a33c", headwayMin: 20, stopIds: ["L11", "L01", "L08", "C07", "C11", "C01"] },
  { id: "vila-gloria", code: "VGL", name: "Vila Glória", operator: "Leopoldense", origin: "Vila Glória", destination: "Centro", color: "#d97706", headwayMin: 25, stopIds: ["L02", "L07", "L10", "C12", "C11", "C01"] },
  { id: "antonio-leite", code: "ANL", name: "Antônio Leite", operator: "Leopoldense", origin: "Antônio Leite", destination: "Centro", color: "#c2410c", headwayMin: 35, stopIds: ["L03", "L01", "L08", "C07", "C11", "C01"] },
  { id: "scharlau", code: "SCH", name: "Scharlau", operator: "Leopoldense", origin: "Scharlau", destination: "Centro", color: "#ea580c", headwayMin: 18, stopIds: ["L04", "L10", "L07", "C12", "C11", "C01", "C09"] },
  { id: "quimisinos", code: "QUI", name: "Quimisinos", operator: "Leopoldense", origin: "Quimisinos", destination: "Centro", color: "#b45309", headwayMin: 45, stopIds: ["L05", "L04", "L10", "C12", "C11", "C01"] },
  { id: "jardim-fenix", code: "JFX", name: "Jardim Fênix", operator: "Leopoldense", origin: "Jardim Fênix", destination: "Centro", color: "#f59e0b", headwayMin: 40, stopIds: ["L06", "L11", "L01", "L08", "C07", "C11", "C01"] },
];

export const LINES_BY_ID: Record<string, Line> = Object.fromEntries(
  LINES.map((l) => [l.id, l]),
);

export const LINES_BY_OPERATOR: { operator: Operator; name: string; lines: Line[] }[] =
  OPERATORS.map((o) => ({
    operator: o.id,
    name: o.name,
    lines: LINES.filter((l) => l.operator === o.id),
  }));

/** Rótulo do sentido conforme os quadros oficiais. */
export function directionLabel(line: Line, direction: Direction) {
  return direction === "bairro-centro"
    ? `${line.origin} → ${line.destination}`
    : `${line.destination} → ${line.origin}`;
}

export function directionTitle(direction: Direction) {
  return direction === "bairro-centro" ? "Bairro - Centro" : "Centro - Bairro";
}

/** Itinerário na ordem do sentido escolhido. */
export function stopsInDirection(line: Line, direction: Direction): string[] {
  return direction === "bairro-centro" ? line.stopIds : [...line.stopIds].reverse();
}

/** Polilinha da rota traçada sobre as ruas reais da cidade. */
export function lineShape(line: Line): [number, number][] {
  const shape = ROUTE_SHAPES[line.id];
  if (shape) return shape.coords;
  return line.stopIds.map((id) => {
    const s = STOPS_BY_ID[id]!;
    return [s.lon, s.lat];
  });
}

/** Índice, na polilinha, de cada ponto de parada da linha. */
export function lineStopIndexes(line: Line): number[] {
  return ROUTE_SHAPES[line.id]?.stopIdx ?? line.stopIds.map((_, i) => i);
}

export function linesForStop(stopId: string): Line[] {
  return LINES.filter((l) => l.stopIds.includes(stopId));
}

export const ALERTS: Alert[] = [
  {
    id: "AL1",
    lineId: "vila-tereza",
    severity: "warning",
    title: "Atraso estimado de 8 minutos",
    description:
      "Trânsito intenso na Av. João Corrêa no sentido Bairro - Centro. Intervalos podem variar.",
    since: "há 22 min",
  },
  {
    id: "AL2",
    lineId: "scharlau",
    severity: "warning",
    title: "Desvio temporário",
    description:
      "Obra na Rua Theodomiro Porto. Os veículos operam pela Av. Getúlio Vargas até nova ordem.",
    since: "há 1 h",
  },
  {
    id: "AL3",
    lineId: "boa-saude",
    severity: "critical",
    title: "Interrupção parcial da rota",
    description:
      "Trecho entre Monte Blanco e Scharlau sem atendimento. Use a linha Scharlau como alternativa.",
    since: "há 35 min",
  },
  {
    id: "AL4",
    lineId: "parada-14",
    severity: "info",
    title: "Reforço de frota",
    description:
      "Dois veículos extras entre 17h e 19h no sentido Parada 14 - Est. Unisinos.",
    since: "hoje",
  },
  {
    id: "AL5",
    lineId: "feitoria",
    severity: "info",
    title: "Novo ponto de parada",
    description: "A UPA São Leopoldo passa a ser atendida em ambos os sentidos.",
    since: "ontem",
  },
];

export const ACCESSIBILITY_LABELS: Record<
  AccessibilityFeature,
  { icon: string; label: string }
> = {
  wheelchair: { icon: "♿", label: "Cadeira de rodas" },
  visual: { icon: "🦯", label: "Deficiência visual" },
  audio: { icon: "🔊", label: "Informações sonoras" },
  guide_dog: { icon: "🦮", label: "Cão-guia" },
  priority_seats: { icon: "🪑", label: "Assentos preferenciais" },
  air_conditioning: { icon: "❄️", label: "Ar-condicionado" },
  wide_space: { icon: "♿", label: "Espaço interno amplo" },
};
