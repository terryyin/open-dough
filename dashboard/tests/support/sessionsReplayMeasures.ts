// What the Sessions replay (../../backend-tests/sessions/sessions-replay.spec.ts) measures on
// a running boundary server; ./sessionsReplayTable.ts prints them.
//
// Event-loop time is the server's own: run with a stall threshold of 1 ms and
// a 1 ms window, its event-loop watch (../../server/eventLoopWatch.ts)
// records every 250 ms sample's delay -- how far the runtime's 20 ms
// histogram timer fired late in total since the last sample -- in the
// incident record, so the samples ending during a poll, or within one
// sample period after it, sum to the time the loop was held while it ran.
// That sum is a lower bound: work split into chunks shorter than the
// timer's own 20 ms cadence delays no tick. Even a quiet loop's timer fires
// a little late on a busy machine, so quiet seconds without polls measure
// the floor, and each span's time is also shown net of that floor's rate
// over the span. The trivial request, sent on
// its own connection to a path no boundary answers, is how long anything
// else waits meanwhile; it is sent from a process of its own.
//
// Every sessions ask accepts gzip as a browser does, and its size is the
// bytes transferred, read before decoding; its decoded size is the same
// JSON's unencoded, as a caller refusing gzip receives it
// (../../backend-tests/sessions/agent-launch-sessions-encoding.spec.ts).

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import {
  sessionsAudienceParameter,
  sessionsHistoryAudience,
  sessionsRevisionHeader,
} from "../../src/machineSessionsRevision.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { rawRequest } from "./rawHttp.ts";
import { incidentEntries, type RecordedStall } from "./readDiagnostics.ts";

// The watch's sampling period (../../server/eventLoopWatch.ts).
const samplePeriodMs = 250;
const trivialEveryMs = 10;
const trafficScript = fileURLToPath(
  new URL("./sessionsReplayTraffic.mjs", import.meta.url),
);

export const replayWatchEnvironment = {
  DOUGH_STALL_THRESHOLD_MS: "1",
  DOUGH_STALL_WINDOW_MS: "1",
  // The record never prunes during a replay, so pruning costs it nothing.
  DOUGH_INCIDENT_RECORD_ENTRIES: String(10_000_000),
  DOUGH_INCIDENT_RECORD_BYTES: String(2 ** 30),
} as const;

export type Asked = {
  readonly from: number;
  readonly until: number;
  readonly wallMs: number;
  // The bytes transferred, and the JSON's own once decoded.
  readonly bytes: number;
  readonly decodedBytes: number;
  readonly encoding: string;
  readonly body: string;
};

// What a browser's `fetch` accepts.
const browserEncodings = "gzip, deflate, br, zstd";

// The sessions answer to a viewer holding `held`, if any, timed from send
// to the last byte received; the history's when `history`.
export async function askSessions(
  server: DashboardServer,
  held?: string,
  history = false,
): Promise<Asked> {
  const from = Date.now();
  const started = performance.now();
  const response = await rawRequest({
    url: `${server.baseURL}/__agent-launch${history ? `?${sessionsAudienceParameter}=${sessionsHistoryAudience}` : ""}`,
    headers: {
      Origin: server.origin,
      "Accept-Encoding": browserEncodings,
      ...(held === undefined ? {} : { [sessionsRevisionHeader]: held }),
    },
  });
  const wallMs = performance.now() - started;
  if (response.status !== 200)
    throw new Error(`The sessions answer was ${String(response.status)}`);
  const encoding = response.headers["content-encoding"];
  const decoded = encoding === "gzip" ? gunzipSync(response.raw) : response.raw;
  if (encoding !== undefined && encoding !== "gzip")
    throw new Error(`The sessions answer was encoded ${String(encoding)}`);
  return {
    from,
    until: Date.now(),
    wallMs,
    bytes: response.raw.length,
    decodedBytes: decoded.length,
    encoding: typeof encoding === "string" ? encoding : "identity",
    body: decoded.toString("utf8"),
  };
}

export const revisionOf = (body: string) =>
  (JSON.parse(body) as { revision: string }).revision;

// Trivial requests sent every 10 ms from a process of their own
// (./sessionsReplayTraffic.mjs), once it is ready; the returned stop
// answers each one's latency.
export async function trivialTraffic(
  server: DashboardServer,
): Promise<() => Promise<number[]>> {
  const child = spawn(
    process.execPath,
    [
      trafficScript,
      `${server.baseURL}/__sessions-replay-trivial`,
      String(trivialEveryMs),
    ],
    { stdio: ["pipe", "pipe", "inherit"] },
  );
  let printed = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    printed += chunk;
  });
  const ended = new Promise<void>((resolve) => {
    child.once("close", () => {
      resolve();
    });
  });
  while (!printed.startsWith("ready\n")) {
    if (child.exitCode !== null)
      throw new Error("The trivial traffic ended early");
    await pause(5);
  }
  return async () => {
    child.stdin.end("stop\n");
    await ended;
    return JSON.parse(printed.slice("ready\n".length)) as number[];
  };
}

export const pause = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// The event-loop time the server's watch measured in a span, and how long
// a stretch its samples covered.
export type LoopTime = { readonly loopMs: number; readonly coveredMs: number };

// The event-loop time the server's watch measured in each span.
export async function loopTimes(
  machine: string,
  spans: readonly { readonly from: number; readonly until: number }[],
): Promise<LoopTime[]> {
  // The last sample after the latest span, and its asynchronous write.
  await pause(samplePeriodMs * 2 + 100);
  const samples = incidentEntries(machine)
    .filter((entry): entry is RecordedStall => entry.kind === "stall")
    .map((stall) => ({
      delayMs: stall.delayMs,
      sampledAt: Date.parse(stall.at) + stall.delayMs,
    }));
  return spans.map(({ from, until }) => ({
    loopMs: samples
      .filter(
        ({ sampledAt }) =>
          sampledAt > from && sampledAt <= until + samplePeriodMs,
      )
      .reduce((total, { delayMs }) => total + delayMs, 0),
    coveredMs: until - from + samplePeriodMs,
  }));
}
