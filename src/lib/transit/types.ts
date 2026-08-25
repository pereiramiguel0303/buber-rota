export type AccessibilityFeature =
  | "wheelchair"
  | "visual"
  | "audio"
  | "guide_dog"
  | "priority_seats"
  | "air_conditioning"
  | "wide_space";

export type BusStatus = "operating" | "delayed" | "stopped" | "out_of_service";

/** Viações que operam o transporte público de São Leopoldo. */
export type Operator = "Feitoria" | "Sinoscap" | "Leopoldense";

/** Sentido operacional conforme os quadros de horários oficiais. */
export type Direction = "bairro-centro" | "centro-bairro";

export interface Stop {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lon: number;
  accessibility: AccessibilityFeature[];
}

export interface Line {
  id: string;
  /** Sigla curta usada nos selos da interface. */
  code: string;
  /** Nome oficial da linha (quadro de horários). */
  name: string;
  operator: Operator;
  /** Extremidade "bairro" do itinerário. */
  origin: string;
  /** Extremidade "centro" do itinerário. */
  destination: string;
  color: string;
  /** Itinerário no sentido Bairro → Centro. */
  stopIds: string[];
  headwayMin: number;
}

export interface Bus {
  id: string;
  lineId: string;
  destination: string;
  direction: Direction;
  lat: number;
  lon: number;
  bearing: number;
  speed: number;
  status: BusStatus;
  nextStopId: string;
  etaMin: number;
  occupancy: number;
  accessibility: AccessibilityFeature[];
}

export interface Alert {
  id: string;
  lineId: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  since: string;
}

export interface TransitSnapshot {
  buses: Bus[];
}

/**
 * Fonte de dados da rede. Hoje: simulação local.
 * Futuro: Firebase Realtime Database alimentado por GPS NEO-6M + Arduino Mega
 * (nós /onibus, /linhas, /pontos, /rotas, /acessibilidade, /alertas).
 */
export interface TransitProvider {
  readonly id: string;
  getLines(): Line[];
  getStops(): Stop[];
  getAlerts(): Alert[];
  /** Assina atualizações de posição dos veículos. Retorna função de cancelamento. */
  subscribeBuses(onChange: (buses: Bus[]) => void): () => void;
}
