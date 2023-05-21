import { useCallback, useMemo } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import type { AppState, CashDrawer } from "../../types";
import { notifyError } from "../Toast";

import "./CashDrawerListItem.css";

export default function CashDrawerListItem({ drawer, appState }: Props) {
  const { path } = drawer;

  const openDrawer = useCallback(async function() {
    try {
      await invoke("open_drawer", { path });
    } catch (err) {
      notifyError(err);
    }
  }, [path]);

  const setDefault = useCallback(async function() {
    try {
      await invoke("set_default_drawer", { path });
    } catch (err) {
      notifyError(err);
    }
  }, [path]);

  const isDefault = useMemo<boolean>(function() {
    const { default_cash_drawer: defaultCashDrawer } = appState;

    return defaultCashDrawer?.path === drawer.path;
  }, [appState, drawer]);

  return (
    <div className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3">
      <article className="cash-drawer-list--item">
        <header className="flex items-center justify-between leading-tight p-2 md:p-4">
          <h3 className="text-xl font-bold font-mono">{drawer.path}</h3>
          <DefaultBadge isDefault={isDefault} />
        </header>
        <div className="cash-drawer-list--item-detail-wrapper">
          <dl className="cash-drawer-list--item-details">
            <div className="cash-drawer-list--item-detail-row">
              <dt className="cash-drawer-list--item-detail-label">Product</dt>
              <dd className="cash-drawer-list--item-detail-value">{drawer.product}</dd>
            </div>
            <div className="cash-drawer-list--item-detail-row">
              <dt className="cash-drawer-list--item-detail-label">Serial #</dt>
              <dd className="cash-drawer-list--item-detail-value">{drawer.serial_number}</dd>
            </div>
          </dl>
        </div>
        <footer className="cash-drawer-list--item-footer">
          <button className="cash-drawer-list--item-action" onClick={openDrawer}>Open</button>
          <button className="cash-drawer-list--item-action" disabled={isDefault} onClick={setDefault}>Set Default</button>
        </footer>
      </article>
    </div>
  );
}

interface Props {
  appState: AppState;
  drawer: CashDrawer;
}

function DefaultBadge({ isDefault }: DefaultBadgeProps) {
  if (!isDefault) {
    return null;
  }

  return (
    <h4 className="cash-drawer-list--default-badge">Default</h4>
  );
}

interface DefaultBadgeProps {
  isDefault?: boolean | null;
}