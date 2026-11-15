// Receipt since the latest return, independent of the delivery schedule and
// the freshness of its snapshot. Departed sources cannot confirm this source.
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublishedSource } from "./publishedSource.ts";

export type DashboardConnection = "awaiting" | "connected" | "disconnected";

export function useDashboardConnection(source: PublishedSource | undefined) {
  const selected = useRef(source);
  selected.current = source;
  const [connection, setConnection] = useState({
    source,
    status: "awaiting" as DashboardConnection,
  });
  const note = useCallback(
    (status: DashboardConnection) => {
      if (selected.current === source) setConnection({ source, status });
    },
    [source],
  );
  useEffect(() => {
    let hidden = document.visibilityState === "hidden";
    const returned = () => {
      if (document.visibilityState !== "hidden") note("awaiting");
    };
    const visibilityChanged = () => {
      const nowHidden = document.visibilityState === "hidden";
      if (hidden && !nowHidden) returned();
      hidden = nowHidden;
    };
    window.addEventListener("focus", returned);
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      window.removeEventListener("focus", returned);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [note]);
  return {
    connection:
      connection.source === source ? connection.status : ("awaiting" as const),
    received: useCallback(() => {
      note("connected");
    }, [note]),
    lost: useCallback(() => {
      note("disconnected");
    }, [note]),
  };
}
