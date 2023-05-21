import { createContext, useContext } from "react";

import type { AppState, CashDrawer } from "../types";

export const Context = createContext<AppState | null>(null);

export function useAppState(): AppState | null {
  return useContext(Context);
}

const DEFAULT_CASH_DRAWERS: readonly CashDrawer[] = Object.freeze<CashDrawer[]>([]);

export function useCashDrawers(): readonly CashDrawer[] {
  const state = useAppState();

  return state?.cash_drawers ?? DEFAULT_CASH_DRAWERS;
}