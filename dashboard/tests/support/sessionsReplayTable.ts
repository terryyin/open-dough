// How the Sessions replay (../boundary/sessions-replay.spec.ts) prints what
// it measured (./sessionsReplayMeasures.ts): one table, a measure a row,
// beside the baseline the replay measured before the story changed the
// observation (three runs at f1e43552 on 2026-11-03, load 8–15), or, for
// the transferred bytes and viewers asking at once, before full answers were
// gzip-encoded (three runs at e69e74cf7 on 2026-11-04, load 3–6), and the
// targets.

import type { Asked, LoopTime } from "./sessionsReplayMeasures.ts";

function percentile(values: readonly number[], at: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return (
    sorted[Math.min(sorted.length - 1, Math.ceil(at * sorted.length) - 1)] ??
    NaN
  );
}

const median = (values: readonly number[]) => percentile(values, 0.5);
const ms = (value: number) => `${String(Math.round(value))} ms`;
const range = (values: readonly number[]) =>
  `${ms(median(values))} (${ms(Math.min(...values))}–${ms(Math.max(...values))})`;
const mb = (bytes: number) => `${(bytes / 1e6).toFixed(2)} MB`;
const kb = (bytes: number) => `${(bytes / 1e3).toFixed(1)} kB`;
// A full answer's transferred bytes beside its decoded JSON's.
const sent = ({ bytes, decodedBytes, encoding }: Asked) =>
  `${kb(bytes)} ${encoding} of ${mb(decodedBytes)} JSON, ${String(Math.round((1 - bytes / decodedBytes) * 100))}% fewer`;

export type ReplayReport = {
  readonly scale: string;
  readonly loadAverage: readonly number[];
  readonly startupMs: number;
  readonly cold: Asked;
  readonly workspaces: number;
  readonly regular: Asked;
  readonly unchangedWallMs: readonly number[];
  readonly unchangedLoop: readonly LoopTime[];
  readonly unchangedBytes: number;
  readonly idleLoop: readonly LoopTime[];
  readonly history: Asked;
  readonly unchangedHistoryWallMs: readonly number[];
  readonly unchangedHistoryLoop: readonly LoopTime[];
  readonly unchangedHistoryBytes: number;
  readonly change: Asked;
  readonly changeLoop: LoopTime;
  readonly changeRevisionChanged: boolean;
  // The session entries that differ from the cold answer's, and the
  // answer's other fields that do.
  readonly changeRecordsDiffering: readonly string[];
  readonly changeFieldsDiffering: readonly string[];
  readonly trivialDuringPolls: readonly number[];
  readonly trivialIdle: readonly number[];
  // Each round's full answers to viewers asking at once after a change.
  readonly concurrentViewers: number;
  readonly concurrent: readonly (readonly Asked[])[];
  readonly concurrentLoop: readonly LoopTime[];
  readonly trivialDuringConcurrent: readonly number[];
};

// The report as a table, one measure a row, with the story's targets.
export function replayTable(report: ReplayReport): string {
  const trivial = (values: readonly number[]) =>
    `p99 ${ms(percentile(values, 0.99))}, p50 ${ms(median(values))}, max ${ms(Math.max(...values))} (n=${String(values.length)})`;
  const floorRate =
    report.idleLoop.reduce((total, { loopMs }) => total + loopMs, 0) /
    report.idleLoop.reduce((total, { coveredMs }) => total + coveredMs, 0);
  const net = ({ loopMs, coveredMs }: LoopTime) =>
    Math.max(0, loopMs - floorRate * coveredMs);
  const loop = (spans: readonly LoopTime[]) =>
    `${range(spans.map(({ loopMs }) => loopMs))}; net ${range(spans.map(net))}`;
  const rows: [string, string, string, string][] = [
    ["Scale", "same seed", report.scale, "~1,000 records and attempts"],
    [
      "Load average (1/5/15 min)",
      "8–15",
      report.loadAverage.map((load) => load.toFixed(2)).join(" "),
      "—",
    ],
    ["Startup (start to listening)", "237–274 ms", ms(report.startupMs), "—"],
    [
      "First full answer after start",
      "764–1,125 ms, 9.90 MB",
      `${ms(report.cold.wallMs)}, ${sent(report.cold)}`,
      "≥ 70% fewer, ≤ 650.0 kB",
    ],
    ["Workspaces found (Git reads)", "—", String(report.workspaces), "—"],
    [
      "Full answer, warm (no revision held)",
      "377–451 ms",
      ms(report.regular.wallMs),
      "≤ 300 ms",
    ],
    [
      "Regular answer, bytes sent",
      "9.90 MB; 2.03 MB identity (e69e74cf7)",
      sent(report.regular),
      "≥ 70% fewer, ≤ 650.0 kB",
    ],
    [
      "Unchanged poll, wall (median, range)",
      "325–376 ms (313–501 ms)",
      range(report.unchangedWallMs),
      "≤ 250 ms",
    ],
    [
      "Unchanged poll, event-loop time",
      "170–195 ms; net 142–168 ms",
      loop(report.unchangedLoop),
      "≤ 20 ms",
    ],
    [
      "Unchanged poll, answer size",
      "—",
      `${String(report.unchangedBytes)} B`,
      "—",
    ],
    [
      "History ask, first full answer",
      "63–95 ms, 9.88 MB identity (e69e74cf7)",
      `${ms(report.history.wallMs)}, ${sent(report.history)}`,
      "≥ 70% fewer",
    ],
    [
      "Unchanged history ask, wall (median, range)",
      "none",
      range(report.unchangedHistoryWallMs),
      "as unchanged poll",
    ],
    [
      "Unchanged history ask, event-loop time",
      "none",
      loop(report.unchangedHistoryLoop),
      "as unchanged poll",
    ],
    [
      "Unchanged history ask, answer size",
      "none",
      `${String(report.unchangedHistoryBytes)} B`,
      "as unchanged poll",
    ],
    [
      "Quiet 1 s without polls, event-loop time",
      "54–61 ms",
      range(report.idleLoop.map(({ loopMs }) => loopMs)),
      "—",
    ],
    [
      "One state change, wall",
      "335–425 ms",
      ms(report.change.wallMs),
      "≤ 250 ms + one listing",
    ],
    [
      "One state change, bytes sent",
      "2.03 MB identity (e69e74cf7)",
      sent(report.change),
      "≥ 70% fewer, ≤ 650.0 kB",
    ],
    ["One state change, event-loop time", "—", loop([report.changeLoop]), "—"],
    [
      "One state change, revision changed",
      "—",
      String(report.changeRevisionChanged),
      "true",
    ],
    [
      "One state change, records differing",
      "—",
      `${String(report.changeRecordsDiffering.length)}: ${report.changeRecordsDiffering.join(", ")}`,
      "1: the changed session",
    ],
    [
      "One state change, other fields differing",
      "—",
      report.changeFieldsDiffering.length === 0
        ? "none"
        : report.changeFieldsDiffering.join(", "),
      "none",
    ],
    [
      "Trivial request during polls",
      "p99 158–203 ms",
      trivial(report.trivialDuringPolls),
      "p99 ≤ 20 ms",
    ],
    [
      "Trivial request without polls",
      "p99 3–9 ms",
      trivial(report.trivialIdle),
      "—",
    ],
    [
      `${String(report.concurrentViewers)} viewers at once after a change, wall (median, range)`,
      "56–57 ms (54–62 ms) (e69e74cf7)",
      range(report.concurrent.flat().map(({ wallMs }) => wallMs)),
      "—",
    ],
    [
      `${String(report.concurrentViewers)} viewers at once after a change, event-loop time`,
      "17–26 ms; net 0–2 ms (e69e74cf7)",
      loop(report.concurrentLoop),
      "—",
    ],
    [
      `${String(report.concurrentViewers)} viewers at once after a change, bytes sent`,
      "2.03 MB identity (e69e74cf7)",
      sent(report.concurrent[0]?.[0] ?? report.change),
      "≥ 70% fewer, ≤ 650.0 kB",
    ],
    [
      "Trivial request during viewers at once",
      "p99 12–14 ms (e69e74cf7)",
      trivial(report.trivialDuringConcurrent),
      "—",
    ],
  ];
  const widths = [0, 1, 2, 3].map((column) =>
    Math.max(...rows.map((row) => row[column]?.length ?? 0)),
  );
  const line = (row: readonly string[]) =>
    `| ${row.map((cell, column) => cell.padEnd(widths[column] ?? 0)).join(" | ")} |`;
  return [
    line(["Measure", "Before (f1e43552 unless named)", "Replay", "Target"]),
    `|${widths.map((width) => "-".repeat(width + 2)).join("|")}|`,
    ...rows.map(line),
  ].join("\n");
}
