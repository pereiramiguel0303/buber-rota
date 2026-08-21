import { createSimulationProvider } from "./simulation";
import type { TransitProvider } from "./types";

/**
 * Ponto único de troca da fonte de dados.
 * Para plugar o hardware real (GPS NEO-6M -> Arduino Mega -> Firebase),
 * basta substituir esta linha por `createFirebaseProvider()`.
 */
export const transitProvider: TransitProvider = createSimulationProvider();
