import { useAppState } from "../../contexts/AppState";

import Item from "./CashDrawerListItem";

import "./CashDrawerList.css";

import type { PropsWithChildren } from "react";

export default function CashDrawerList() {
  const appState = useAppState();

  if (!appState) {
    return <DrawerError message="Waiting for state to load." />
  }

  if (appState.cash_drawers.length === 0) {
    return <DrawerError message="No cash drawers detected. Check your USB connections." />
  }

  return (
    <Container>
      <Drawers>
        {appState.cash_drawers.map((drawer, key) => <Item key={key} drawer={drawer} appState={appState} />)}
      </Drawers>
    </Container>
  );
}

function Container(props: PropsWithChildren) {
  return (
    <div className="cash-drawer-list--container">
      <header className="container my-6 mx-auto px-4 md:px-12 mb-0 md:pb-0">
        <h2 className="pl-3 text-xl font-bold">Available Cash Drawers</h2>
      </header>
      {props.children}
    </div>
  );
}

interface DrawerErrorProps {
  message: string;
}

function DrawerError(props: PropsWithChildren<DrawerErrorProps>) {
  return (
    <Container>
      <p>{props.message}</p>
    </Container>
  );
}

function Drawers(props: PropsWithChildren) {
  return (
    <div className="container my-6 mx-auto px-4 md:px-12 mt-1">
      <div className="flex flex-wrap -mx-1 lg:-mx-4">
        {props.children}
      </div>
    </div>
  );
}