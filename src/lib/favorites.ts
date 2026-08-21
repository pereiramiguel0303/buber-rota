import { useCallback, useEffect, useState } from "react";

export type FavoriteKind = "line" | "stop";
export interface Favorite {
  kind: FavoriteKind;
  id: string;
}

const KEY = "mobisl.favorites.v1";

function read(): Favorite[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Favorite[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    setFavorites(read());
    const onStorage = () => setFavorites(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("mobisl:favorites", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mobisl:favorites", onStorage);
    };
  }, []);

  const toggle = useCallback((kind: FavoriteKind, id: string) => {
    const current = read();
    const exists = current.some((f) => f.kind === kind && f.id === id);
    const next = exists
      ? current.filter((f) => !(f.kind === kind && f.id === id))
      : [...current, { kind, id }];
    localStorage.setItem(KEY, JSON.stringify(next));
    setFavorites(next);
    window.dispatchEvent(new Event("mobisl:favorites"));
  }, []);

  const isFavorite = useCallback(
    (kind: FavoriteKind, id: string) => favorites.some((f) => f.kind === kind && f.id === id),
    [favorites],
  );

  return { favorites, toggle, isFavorite };
}

const PREFS_KEY = "mobisl.prefs.v1";
export interface Prefs {
  name: string;
  wheelchair: boolean;
  audioCues: boolean;
  highContrast: boolean;
  notifyDelays: boolean;
  notifyArrivals: boolean;
}
export const DEFAULT_PREFS: Prefs = {
  name: "Passageiro",
  wheelchair: false,
  audioCues: true,
  highContrast: false,
  notifyDelays: true,
  notifyArrivals: false,
};

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) });
    } catch {
      /* ignora */
    }
  }, []);

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { prefs, update };
}
