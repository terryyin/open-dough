import { useEffect, useId, useState } from "react";
import type { DashboardConnection } from "./dashboardConnection.ts";
import { prefersReducedMotion } from "./reducedMotion.ts";
import "./product-mark.css";

const kneadDurationMs = 3780; // Keep in sync with the SVG's one-shot timeline.

type Playback = {
  connection: DashboardConnection | undefined;
  run: number;
  phase: "still" | "loading" | "playing";
};

// Open Dough's own mark: the product's identity at the start of every
// top-level view. On a configured dashboard it is the visual of the Sessions
// toggle (`decorative`); on the unconfigured banner and in System settings it
// is a passive image named "Open Dough". It is the accepted icon export the
// browser tab uses (../server/brandAssetPlugin.ts), drawn at twice its CSS
// size for sharp high-density screens. No view shows the product's name as
// text beside it; the selected project's name lives in the project selector.
export function ProductMark({
  decorative = false,
  connection,
}: {
  // When true, the mark is the Sessions control's visual: hidden from
  // assistive technology so only that control's name is announced.
  readonly decorative?: boolean;
  readonly connection?: DashboardConnection | undefined;
} = {}) {
  const instance = useId();
  const [playback, setPlayback] = useState<Playback>({
    connection,
    run: 0,
    phase: "still",
  });
  if (playback.connection !== connection) {
    const play =
      playback.connection === "awaiting" &&
      connection === "connected" &&
      !prefersReducedMotion();
    setPlayback({
      connection,
      run: playback.run + Number(play),
      phase: play ? "loading" : "still",
    });
  }
  useEffect(() => {
    if (playback.phase !== "playing") return;
    const timer = window.setTimeout(() => {
      setPlayback((current) =>
        current === playback ? { ...current, phase: "still" } : current,
      );
    }, kneadDurationMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [playback]);

  // A fresh image resource restarts the SVG on a later connection attempt.
  const animation =
    playback.phase === "still"
      ? undefined
      : `/opendough-knead.svg?play=${encodeURIComponent(`${instance}-${String(playback.run)}`)}`;
  const changePhase = (phase: Playback["phase"]) => {
    setPlayback((current) =>
      current === playback ? { ...current, phase } : current,
    );
  };
  return (
    <img
      key={playback.run}
      className="product-mark"
      src={animation ?? "/icon-64.png"}
      onLoad={
        playback.phase === "loading"
          ? () => {
              changePhase("playing");
            }
          : undefined
      }
      onError={
        animation
          ? () => {
              changePhase("still");
            }
          : undefined
      }
      alt={decorative ? "" : "Open Dough"}
      width={32}
      height={32}
      draggable={false}
      aria-hidden={decorative ? true : undefined}
    />
  );
}
