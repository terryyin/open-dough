// How long ago a Taken card's current slice started: from the start its
// commit times recorded (`./sliceClockStart.ts`) until the page's now,
// ticking as page time passes. Ticking reads nothing. It measures time since the last
// recorded plan update or the Take, not evidence that an agent is active.
// Once the plan records its execution as complete, that last plan update is
// the completion commit, and the same clock says how long ago it completed.

import { useEffect, useState, type ReactNode } from "react";
import type { SliceClock as Clock } from "./sliceClockStart.ts";

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

// "N min ago" from `at`, advancing with page time.
function Ago({ at }: { at: Date }) {
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
    <time dateTime={at.toISOString()} title={at.toLocaleString()}>
      {elapsedWords(now - at.getTime())} ago
    </time>
  );
}

type Started = Extract<Clock, { status: "started" }>;

// A card's clock line: while its start is read, when it cannot be, and once
// started, the words `started` gives it.
function ClockLine({
  clock,
  reading,
  unavailable,
  started,
}: {
  clock: Clock | undefined;
  reading: string;
  unavailable: string;
  started: (clock: Started) => ReactNode;
}) {
  if (clock === undefined) {
    return null;
  }
  switch (clock.status) {
    case "loading":
      return <p className="slice-clock quiet">{reading}</p>;
    case "unavailable":
      return (
        <p className="slice-clock preparation-problem">
          {unavailable}: {clock.problem}
        </p>
      );
    case "started":
      return <p className="slice-clock">{started(clock)}</p>;
  }
}

export function SliceClock({ clock }: { clock: Clock | undefined }) {
  return (
    <ClockLine
      clock={clock}
      reading="Reading current slice time…"
      unavailable="Current slice time unavailable"
      started={({ at, takeRecorded }) => (
        <>
          Current slice started <Ago at={at} />
          {!takeRecorded &&
            " (measured from the last plan commit; no agent profile records the Take)"}
        </>
      )}
    />
  );
}

// How long ago the plan's completion commit, its last commit at the source,
// was made: the same start, read the same way. A completion commit is always
// a plan commit, so a Take without a profile needs no note here.
export function CompletionClock({ clock }: { clock: Clock | undefined }) {
  return (
    <ClockLine
      clock={clock}
      reading="Reading completion time…"
      unavailable="Completion time unavailable"
      started={({ at }) => (
        <>
          Completed <Ago at={at} />
        </>
      )}
    />
  );
}
