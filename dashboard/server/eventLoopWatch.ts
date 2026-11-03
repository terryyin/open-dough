// This dashboard process watching its own event loop for stalls and
// recording each one above `stallThresholdMs` in this user's incident record
// (`./incidentRecord.ts`) as a `stall` entry: the delay the runtime's
// event-loop delay histogram measured, the machine's load average, and,
// through the record, the dashboard revision and the process's age. The
// histogram samples on the runtime's own timer and costs this loop nothing;
// this watch reads it on a sparse unreferenced timer, so it never keeps the
// process alive, and the record writes asynchronously.
//
// The histogram is never reset: a reset drops the interval its timer is
// timing, so a stall that ended just before one would be lost. Each read
// takes instead the delay recorded since the last one beyond the timer's
// own cadence (`resolutionMs` per tick): within one read's span that is the
// longest stall, since only a stall can make it outlast that span.
//
// A stall's `at` is when it began: the time it was read less its delay. A
// sustained run of stalls is folded so it cannot flood the record and push
// failed reads past its bound: within each minute the first
// `writtenPerWindow` stalls are written as they are read, and the rest are
// folded into one entry (the longest delay, how many stalls, the first
// one's time) written when that minute ends or the watch stops.

import os from "node:os";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { configuredLimit } from "./configuredLimit.ts";
import { appendIncident } from "./incidentRecord.ts";

// A stall a person notices: four times the slowest response measured while
// the Sessions poll runs (130 ms), and well under the tens-of-seconds
// stalls the record exists to explain. A test that counts the record's
// entries raises it, so a loaded machine's stalls do not change the count.
const stallThresholdMs = () => configuredLimit("DOUGH_STALL_THRESHOLD_MS", 500);
const sampleMs = 250;
const resolutionMs = 20;
// The window stalls are counted in; a test that folds stalls widens it so
// a loaded machine cannot end it between them.
const windowMs = () => configuredLimit("DOUGH_STALL_WINDOW_MS", 60_000);
const writtenPerWindow = 3;

type Stall = {
  readonly at: string;
  readonly delayMs: number;
  readonly loadAverage: [number, number, number];
  readonly stalls: number;
};

type Watch = {
  readonly histogram: ReturnType<typeof monitorEventLoopDelay>;
  readonly timer: NodeJS.Timeout;
  // What the histogram had recorded at the last read: its total and count.
  recordedNs: number;
  ticks: number;
  windowStartedAt: number;
  written: number;
  folded?: Stall;
};

let watching: Watch | undefined;

// Starts watching this process's event loop, unless it is watched already,
// and returns how to stop: stopping reads the last delay and writes what
// it had folded.
export function startEventLoopWatch(): () => void {
  if (watching !== undefined) return stopEventLoopWatch;
  const histogram = monitorEventLoopDelay({ resolution: resolutionMs });
  histogram.enable();
  // Read once the runtime's own sampling timer due in the same turn has run.
  const timer = setInterval(() => setImmediate(sampleEventLoopNow), sampleMs);
  timer.unref();
  watching = {
    histogram,
    timer,
    recordedNs: 0,
    ticks: 0,
    windowStartedAt: Date.now(),
    written: 0,
  };
  return stopEventLoopWatch;
}

function stopEventLoopWatch(): void {
  const watch = watching;
  if (watch === undefined) return;
  sampleEventLoopNow();
  clearInterval(watch.timer);
  watch.histogram.disable();
  if (watch.folded !== undefined) record(watch.folded);
  watching = undefined;
}

// Reads the delay since the last read once the histogram's timer has ticked
// after any stall that just ended: what a diagnostics read waits for.
export async function sampleEventLoopSoon(): Promise<void> {
  if (watching === undefined) return;
  await new Promise((resolve) => setTimeout(resolve, resolutionMs + 5));
  sampleEventLoopNow();
}

// Reads the delay since the last read, and records it when it is a stall.
// Does nothing while no watch runs.
function sampleEventLoopNow(): void {
  const watch = watching;
  if (watch === undefined) return;
  const { histogram } = watch;
  const ticks = histogram.count;
  const recordedNs = ticks === 0 ? 0 : histogram.mean * ticks;
  const delayMs = Math.round(
    (recordedNs -
      watch.recordedNs -
      (ticks - watch.ticks) * resolutionMs * 1e6) /
      1e6,
  );
  watch.recordedNs = recordedNs;
  watch.ticks = ticks;
  const now = Date.now();
  if (now - watch.windowStartedAt >= windowMs()) {
    if (watch.folded !== undefined) record(watch.folded);
    watch.windowStartedAt = now;
    watch.written = watch.folded === undefined ? 0 : 1;
    delete watch.folded;
  }
  if (delayMs < stallThresholdMs()) return;
  const stall: Stall = {
    at: new Date(now - delayMs).toISOString(),
    delayMs,
    loadAverage: loadAverage(),
    stalls: 1,
  };
  if (watch.written < writtenPerWindow) {
    watch.written += 1;
    record(stall);
    return;
  }
  const folded = watch.folded;
  watch.folded =
    folded === undefined
      ? stall
      : {
          ...(stall.delayMs > folded.delayMs ? stall : folded),
          at: folded.at,
          stalls: folded.stalls + 1,
        };
}

function record(stall: Stall): void {
  appendIncident({ kind: "stall", ...stall });
}

function loadAverage(): [number, number, number] {
  const [one = 0, five = 0, fifteen = 0] = os
    .loadavg()
    .map((load) => Math.round(load * 100) / 100);
  return [one, five, fifteen];
}
