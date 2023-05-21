import { useCallback, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { Context } from "../contexts/AppState";

import type { PropsWithChildren } from "react";
import type { AppState } from "../types";

import APIStateProvider from "./APIStateProvider";

export default function AppStateProvider({ children }: PropsWithChildren) {
  const [appState, setAppState] = useState<AppState | null>(null);

  const fetchAppState = useCallback(async function() {
    try {
      const state = await invoke<AppState>("get_app_state");

      setAppState(state)
    } catch (error) {
      console.info("Problem fetching app state");
      console.error(error)
    }
  }, [setAppState]);

  useEffect(function initialFetch() {
    fetchAppState();
  }, [setAppState])

  useEffect(function listenForStateChange() {
    const unlisten = listen<AppState>("app-state-changed", (event) => {
      console.debug("app-state-changed");
      console.dir(event.payload);
      setAppState(event.payload);
    });

    return function() {
      unlisten.then((actually_unlisten) => actually_unlisten());
    };
  }, [setAppState]);

  return (
    <Context.Provider value={appState}>
      <APIStateProvider>
        {children}
      </APIStateProvider>
    </Context.Provider>
  )
}