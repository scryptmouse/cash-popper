import { useCallback, useEffect, useMemo, useState } from "react";
import { Context } from "../contexts/APIState";
import { useAppState } from "../contexts/AppState";
import { isPongResponse } from "../types.guard";

import type { PropsWithChildren } from "react";
import type { APIState, APIStatus } from "../types";

export default function APIStateProvider(props: PropsWithChildren) {
  const appState = useAppState();

  const url = appState?.api_url;

  const [status, setStatus] = useState<APIStatus>("unknown");

  const recheck = useCallback(async function() {
    try {
      setStatus("checking");

      const status = await checkAPIStatus(url);

      setStatus(status);

      return status;
    } catch (err) {
      console.error("Problem reading API Status");
      console.error(err);

      setStatus("error");

      return "error";
    }
  }, [setStatus, url]);

  useEffect(function watchAPIStatus() {
    recheck();
  }, [recheck]);

  const state = useMemo<APIState>(
    () => ({
      recheck,
      status,
      url,
    }),
    [recheck, status, url]
  );

  return (
    <Context.Provider value={state}>
      {props.children}
    </Context.Provider>
  );
}

async function checkAPIStatus(url: string | null | undefined): Promise<APIStatus> {
  if (!url) {
    return "unknown";
  }

  const pingURL = new URL("/ping", url);

  const response = await fetch(pingURL);

  if (response.status === 200) {
    const pong = await response.text();

    if (isPongResponse(pong)) {
      return "running";
    }
  }

  return Promise.reject(new Error("Got invalid PONG"));
}