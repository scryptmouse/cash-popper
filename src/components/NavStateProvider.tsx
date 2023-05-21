import { useMemo, useState } from "react";

import { Context } from "../contexts/NavState";

import type { PropsWithChildren } from "react";
import type { NavSection, NavState } from "../types";

export default function NavStateProvider(props: PropsWithChildren) {
  const [section, setSection] = useState<NavSection>("home");

  const state = useMemo<NavState>(
    () => ({ section, setSection }),
    [section, setSection]
  );

  return (
    <Context.Provider value={state}>
      {props.children}
    </Context.Provider>
  );
}