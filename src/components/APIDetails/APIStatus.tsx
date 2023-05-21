import { useCallback } from "react";
import toast from "react-hot-toast";
import classNames from "classnames";
import { useAPIState } from "../../contexts/APIState";

import "./APIStatus.css";

export default function APIStatus() {
  const { recheck, status } = useAPIState();

  const ping = useCallback(async () => {
    let id;
  
    try {
      id = toast.loading("Pinging API", {
        duration: Infinity,
        className: "bg-slate-600 text-white",
        id: "ping-api",
        position: "bottom-right",
      });

      await recheck();
    } finally {
      toast.dismiss(id);
    }
  }, [recheck]);

  return (
    <span
      className={classNames("api-status--badge", {
        checking: status === "checking",
        error: status === "error",
        running: status === "running",
        unknown: status === "unknown",
      })}
      onClick={status !== "checking" ? ping : undefined}
      title="Click to ping the API and double-check that it is running"
    >
      {status}
    </span>
  );

  /*
  if (status === "running") {
    return (
      <span onClick={ping} className="bg-green-100 text-green-800  dark:bg-green-900 dark:text-green-300">RUNNING</span>
    );
  } else if (status === "error") {
    return (
      <span onClick={ping} className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">ERROR</span>
    );
  } else if (status === "checking") {
    return (
      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">CHECKING</span>
    );
  }

  return (
    <span onClick={ping} className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">UNKNOWN</span>
  );
    */
}

export type Status = "unknown" | "running" | "error";

async function checkAPIStatus(url: string | null | undefined): Promise<Status> {
  if (!url) {
    return "unknown";
  }

  const response = await fetch(url);

  if (response.status === 200) {
    const body = await response.text();

    if (body.includes("Cash Popper")) {
      return "running";
    }
  }

  return "error";
}