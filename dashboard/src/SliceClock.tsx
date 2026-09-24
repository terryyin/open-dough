// How long ago a Taken card's current slice started: from the start its
// commit times recorded (`./sliceClockStart.ts`) until the page's now,
// ticking as page time passes. Ticking reads nothing. It measures time since the last
// recorded plan update or the Take, not evidence that an agent is active.

import { useEffect, useState } from "react";
import type { SliceClock as Clock } from "./sliceClockStart";

// Often enough that a shown minute is never more than a few seconds stale.
const tickMs = 5_000;

const minuteMs = 60_000;

// Elapsed time in whole minutes, hours, and days, as a card says it.
function elapsedWords(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / minuteMs);
  if (minutes < 1) {
    return "less than 1 min";
  }
  if (minutes < 60) {
    return `${String(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${String(hours)} h ${String(minutes % 60)} min`;
  }
  return `${String(Math.floor(hours / 24))} d ${String(hours % 24)} h`;
}

function Started({ at, takeRecorded }: { at: Date; takeRecorded: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    const ticking = setInterval(() => {
      setNow(Date.now());
    }, tickMs);
    return () => {
      clearInterval(ticking);
    };
  }, [at]);
  return (
    <p className="slice-clock">
      Current slice started{" "}
      <time dateTime={at.toISOString()} title={at.toLocaleString()}>
        {elapsedWords(now - at.getTime())} ago
      </time>
      {!takeRecorded &&
        " (measured from the last plan commit; no agent profile records the Take)"}
    </p>
  );
}

export function SliceClock({ clock }: { clock: Clock | undefined }) {
  if (clock === undefined) {
    return null;
  }
  switch (clock.status) {
    case "loading":
      return <p className="slice-clock quiet">Reading current slice time…</p>;
    case "unavailable":
      return (
        <p className="slice-clock preparation-problem">
          Current slice time unavailable: {clock.problem}
        </p>
      );
    case "started":
      return <Started at={clock.at} takeRecorded={clock.takeRecorded} />;
  }
}
