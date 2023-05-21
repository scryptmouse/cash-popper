import { invoke } from "@tauri-apps/api/tauri";

import { useAppState } from "../../contexts/AppState";
import { notifyError } from "../Toast";

export default function Footer() {
  const appState = useAppState();

  return (
    <footer className="fixed bottom-0 left-0 z-20 w-full p-2 bg-gray-800 border-gray-600 border-t shadow md:flex md:items-center md:justify-between md:p-6 ">
      <span className="text-sm text-gray-400 text-center dark:text-gray-400">© 2023</span>
      <button className="text-sm text-gray-400 text-center py-1 px-2 border rounded border-gray-400 disabled:opacity-50" disabled={!appState} onClick={reloadDrawers}>Reload Drawers</button>
      <span className="text-sm text-gray-400 text-center">v{appState?.version}</span>
    </footer>
  );
}

async function reloadDrawers() {
  try {
    await invoke("reload_drawers");
  } catch (err) {
    notifyError(err);
  }
}