import { createContext, useContext } from "react";
import type { APIState, APIStatus } from "../types";

const DEFAULT_CONTEXT: APIState = Object.freeze({
  recheck: async () => "unknown" as APIStatus,
  status: "unknown",
  url: null,
});

export const Context = createContext<APIState>(DEFAULT_CONTEXT);

export function useAPIState() {
  return useContext(Context);
}