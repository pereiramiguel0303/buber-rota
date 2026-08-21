import type { AccessibilityFeature, Alert, Line, Stop } from "./types";

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

export const STOPS: Stop[] = [
  // Centro / eixo histórico
  { id: "P01", name: "Praça Central", neighborhood: "Centro", lat: -29.7601, lon: -51.1478, accessibility: ["wheelchair", "visual", "audio", "priority_seats"] },
  { id: "P02", name: "Estação Centro (Trensurb)", neighborhood: "Centro", lat: -29.7643, lon: -51.1497, accessibility: A.full },
  { id: "P03", name: "Av. João Corrêa, 300", neighborhood: "Centro", lat: -29.7576, lon: -51.1451, accessibility: A.basic },
  { id: "P04", name: "Rua Independência", neighborhood: "Centro", lat: -29.7628, lon: -51.1443, accessibility: ["wheelchair", "audio"] },
  { id: "P05", name: "Mercado Público", neighborhood: "Centro", lat: -29.7657, lon: -51.1451, accessibility: A.mid },
  { id: "P06", name: "Av. Brasil, 900", neighborhood: "Centro", lat: -29.7549, lon: -51.1490, accessibility: A.basic },

  // Norte
  { id: "P10", name: "Terminal Norte", neighborhood: "Rio Branco", lat: -29.7355, lon: -51.1418, accessibility: A.full },
  { id: "P11", name: "Rio Branco Shopping", neighborhood: "Rio Branco", lat: -29.7418, lon: -51.1440, accessibility: A.mid },
  { id: "P12", name: "Rua Boqueirão", neighborhood: "Rio Branco", lat: -29.7462, lon: -51.1470, accessibility: A.basic },
  { id: "P13", name: "Bairro Norte", neighborhood: "Santos Dumont", lat: -29.7288, lon: -51.1362, accessibility: ["wheelchair"] },
  { id: "P14", name: "Escola Santos Dumont", neighborhood: "Santos Dumont", lat: -29.7326, lon: -51.1503, accessibility: A.basic },

  // Sul
  { id: "P20", name: "Bairro Sul", neighborhood: "Campina", lat: -29.7889, lon: -51.1382, accessibility: ["wheelchair", "priority_seats"] },
  { id: "P21", name: "Rua Campina", neighborhood: "Campina", lat: -29.7812, lon: -51.1420, accessibility: A.basic },
  { id: "P22", name: "Posto de Saúde Sul", neighborhood: "Vicentina", lat: -29.7742, lon: -51.1448, accessibility: A.mid },
  { id: "P23", name: "Praça Vicentina", neighborhood: "Vicentina", lat: -29.7702, lon: -51.1462, accessibility: A.basic },

  // Leste
  { id: "P30", name: "Zona Leste", neighborhood: "Fazenda São Borja", lat: -29.7692, lon: -51.1129, accessibility: ["wheelchair", "audio"] },
  { id: "P31", name: "Av. Unisinos, 200", neighborhood: "Cristo Rei", lat: -29.7729, lon: -51.1330, accessibility: A.mid },
  { id: "P32", name: "Rua Cristo Rei", neighborhood: "Cristo Rei", lat: -29.7666, lon: -51.1246, accessibility: A.basic },
  { id: "P33", name: "Parque Imperatriz", neighborhood: "Duque de Caxias", lat: -29.7601, lon: -51.1206, accessibility: A.full },

  // Universidade
  { id: "P40", name: "Campus Unisinos", neighborhood: "Cristo Rei", lat: -29.7936, lon: -51.1547, accessibility: A.full },
  { id: "P41", name: "Portaria Universidade", neighborhood: "Cristo Rei", lat: -29.7877, lon: -51.1522, accessibility: A.mid },
  { id: "P42", name: "Av. Brasil, 2500", neighborhood: "Pádua", lat: -29.7770, lon: -51.1500, accessibility: A.basic },
  { id: "P43", name: "Hospital Centenário", neighborhood: "Pádua", lat: -29.7708, lon: -51.1520, accessibility: A.full },

  // Oeste
  { id: "P50", name: "Zona Oeste", neighborhood: "Scharlau", lat: -29.7566, lon: -51.1810, accessibility: ["wheelchair", "priority_seats"] },
  { id: "P51", name: "Scharlau Centro", neighborhood: "Scharlau", lat: -29.7602, lon: -51.1706, accessibility: A.mid },
  { id: "P52", name: "Rua Theodomiro Porto", neighborhood: "Arroio da Manteiga", lat: -29.7620, lon: -51.1605, accessibility: A.basic },
  { id: "P53", name: "Ginásio Arroio", neighborhood: "Arroio da Manteiga", lat: -29.7688, lon: -51.1668, accessibility: A.basic },

  // Feitoria / nordeste
  { id: "P60", name: "Feitoria Velha", neighborhood: "Feitoria", lat: -29.7413, lon: -51.1704, accessibility: A.basic },
  { id: "P61", name: "Rua Feitoria, 1200", neighborhood: "Feitoria", lat: -29.7470, lon: -51.1620, accessibility: ["wheelchair"] },
  { id: "P62", name: "Praça da Feitoria", neighborhood: "Feitoria", lat: -29.7519, lon: -51.1552, accessibility: A.mid },

  // Terminal principal
  { id: "P70", name: "Terminal Metropolitano", neighborhood: "Centro", lat: -29.7669, lon: -51.1536, accessibility: A.full },
  { id: "P71", name: "Av. Getúlio Vargas", neighborhood: "Centro", lat: -29.7635, lon: -51.1560, accessibility: A.basic },
  { id: "P72", name: "Rodoviária", neighborhood: "Centro", lat: -29.7690, lon: -51.1440, accessibility: A.mid },
];

export const STOPS_BY_ID: Record<string, Stop> = Object.fromEntries(
  STOPS.map((s) => [s.id, s]),
);

export const LINES: Line[] = [
  {
    id: "101",
    name: "Centro / Bairro Norte",
    origin: "Centro",
    destination: "Bairro Norte",
    color: "#0f9b8e",
    headwayMin: 12,
    stopIds: ["P01", "P03", "P06", "P12", "P11", "P10", "P13"],
  },
  {
    id: "102",
    name: "Centro / Bairro Sul",
    origin: "Centro",
    destination: "Bairro Sul",
    color: "#f2a33c",
    headwayMin: 15,
    stopIds: ["P01", "P04", "P72", "P23", "P22", "P21", "P20"],
  },
  {
    id: "203",
    name: "Terminal / Zona Leste",
    origin: "Terminal Metropolitano",
    destination: "Zona Leste",
    color: "#3f6fd8",
    headwayMin: 18,
    stopIds: ["P70", "P05", "P72", "P33", "P32", "P31", "P30"],
  },
  {
    id: "301",
    name: "Centro / Universidade",
    origin: "Centro",
    destination: "Campus Unisinos",
    color: "#8b5cf6",
    headwayMin: 10,
    stopIds: ["P01", "P02", "P70", "P43", "P42", "P41", "P40"],
  },
  {
    id: "302",
    name: "Centro / Terminal Norte",
    origin: "Centro",
    destination: "Terminal Norte",
    color: "#e0534f",
    headwayMin: 8,
    stopIds: ["P02", "P01", "P06", "P62", "P12", "P11", "P10"],
  },
  {
    id: "410",
    name: "Scharlau / Centro",
    origin: "Zona Oeste",
    destination: "Centro",
    color: "#1f9d55",
    headwayMin: 14,
    stopIds: ["P50", "P51", "P52", "P71", "P70", "P01", "P72"],
  },
  {
    id: "505",
    name: "Terminal / Zona Oeste",
    origin: "Terminal Metropolitano",
    destination: "Zona Oeste",
    color: "#0ea5e9",
    headwayMin: 20,
    stopIds: ["P70", "P71", "P53", "P52", "P51", "P50"],
  },
  {
    id: "606",
    name: "Feitoria / Rio Branco",
    origin: "Feitoria Velha",
    destination: "Terminal Norte",
    color: "#d946a0",
    headwayMin: 22,
    stopIds: ["P60", "P61", "P62", "P14", "P12", "P11", "P10"],
  },
];

export const LINES_BY_ID: Record<string, Line> = Object.fromEntries(
  LINES.map((l) => [l.id, l]),
);

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
    lineId: "302",
    severity: "warning",
    title: "Atraso estimado de 8 minutos",
    description:
      "Trânsito intenso na Av. Brasil sentido Terminal Norte. Intervalos podem variar.",
    since: "há 22 min",
  },
  {
    id: "AL2",
    lineId: "410",
    severity: "warning",
    title: "Desvio temporário",
    description:
      "Obra na Rua Theodomiro Porto. Veículos operam pela Av. Getúlio Vargas até nova ordem.",
    since: "há 1 h",
  },
  {
    id: "AL3",
    lineId: "505",
    severity: "critical",
    title: "Interrupção parcial da rota",
    description:
      "Trecho entre Ginásio Arroio e Scharlau Centro sem atendimento. Use a linha 410 como alternativa.",
    since: "há 35 min",
  },
  {
    id: "AL4",
    lineId: "301",
    severity: "info",
    title: "Reforço de frota no campus",
    description: "Dois veículos extras entre 17h e 19h para o Campus Unisinos.",
    since: "hoje",
  },
  {
    id: "AL5",
    lineId: "203",
    severity: "info",
    title: "Novo ponto de parada",
    description: "Parada Parque Imperatriz passa a ser atendida em ambos os sentidos.",
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
