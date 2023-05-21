import { createContext, useContext } from "react";
import type { NavSection, NavState } from "../types";

const DEFAULT_CONTEXT: NavState = Object.freeze({
  section: "home",
  setSection(section: NavSection) {
    /* intentionally left blank */
  }
});

export const Context = createContext<NavState>(DEFAULT_CONTEXT);

export function useNavState() {
  return useContext(Context);
}