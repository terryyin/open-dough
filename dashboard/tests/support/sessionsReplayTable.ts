// How the Sessions replay (../boundary/sessions-replay.spec.ts) prints what
// it measured (./sessionsReplayMeasures.ts): one table, a measure a row,
// beside the story's targets.

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
  readonly changeWallMs: number;
  readonly changeLoop: LoopTime;
  readonly changeRevisionChanged: boolean;
  // The session entries that differ from the cold answer's, and the
  // answer's other fields that do.
  readonly changeRecordsDiffering: readonly string[];
  readonly changeFieldsDiffering: readonly string[];
  readonly trivialDuringPolls: readonly number[];
  readonly trivialIdle: readonly number[];
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
  const rows: [string, string, string][] = [
    ["Scale", report.scale, "~1,000 records and attempts"],
    [
      "Load average (1/5/15 min)",
      report.loadAverage.map((load) => load.toFixed(2)).join(" "),
      "—",
    ],
    ["Startup (start to listening)", ms(report.startupMs), "—"],
    [
      "First full answer, cold",
      `${ms(report.cold.wallMs)}, ${mb(report.cold.bytes)}`,
      "≤ 300 ms",
    ],
    ["Workspaces found (Git reads)", String(report.workspaces), "—"],
    ["Full answer, warm (no revision held)", ms(report.regular.wallMs), "—"],
    ["Regular answer size", mb(report.regular.bytes), "live overview only"],
    [
      "Unchanged poll, wall (median, range)",
      range(report.unchangedWallMs),
      "≤ 250 ms",
    ],
    ["Unchanged poll, event-loop time", loop(report.unchangedLoop), "≤ 20 ms"],
    ["Unchanged poll, answer size", `${String(report.unchangedBytes)} B`, "—"],
    [
      "Quiet 1 s without polls, event-loop time",
      range(report.idleLoop.map(({ loopMs }) => loopMs)),
      "—",
    ],
    [
      "One state change, wall",
      ms(report.changeWallMs),
      "≤ 250 ms + one listing",
    ],
    ["One state change, event-loop time", loop([report.changeLoop]), "—"],
    [
      "One state change, revision changed",
      String(report.changeRevisionChanged),
      "true",
    ],
    [
      "One state change, records differing",
      `${String(report.changeRecordsDiffering.length)}: ${report.changeRecordsDiffering.join(", ")}`,
      "1: the changed session",
    ],
    [
      "One state change, other fields differing",
      report.changeFieldsDiffering.length === 0
        ? "none"
        : report.changeFieldsDiffering.join(", "),
      "none",
    ],
    [
      "Trivial request during polls",
      trivial(report.trivialDuringPolls),
      "p99 ≤ 20 ms",
    ],
    ["Trivial request without polls", trivial(report.trivialIdle), "—"],
  ];
  const widths = [0, 1, 2].map((column) =>
    Math.max(...rows.map((row) => row[column]?.length ?? 0)),
  );
  const line = (row: readonly string[]) =>
    `| ${row.map((cell, column) => cell.padEnd(widths[column] ?? 0)).join(" | ")} |`;
  return [
    line(["Measure", "Replay", "Target"]),
    `|${widths.map((width) => "-".repeat(width + 2)).join("|")}|`,
    ...rows.map(line),
  ].join("\n");
}
