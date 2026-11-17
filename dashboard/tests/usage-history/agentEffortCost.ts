// Test-side reader for the documented single-report contract
// (dashboard/AGENT-EFFORT.md#single-report-contract): what one execution
// cost. Types describe the public output independently of production types.
import { cursorCli, effortCli, succeeded } from "./agentEffortSelection.ts";
import type { ReportedSelection } from "./agentEffortSelection.ts";

export type Figure = { value: number | null; status: string };
export type CostTotals = Record<
  | "requests"
  | "totalInput"
  | "cachedInput"
  | "uncachedInput"
  | "cacheWrite"
  | "cacheWrite5m"
  | "cacheWrite1h"
  | "output"
  | "reasoningOutput"
  | "totalTokens",
  Figure
>;
export type ObservedSetting = {
  model: string | null;
  effort: string | null;
  serviceTier: string | null;
  requests: number;
};
export type PeakInput = Figure & {
  observedRequests?: number;
  missingInputRequests?: number;
  coverage?: string;
};
export type WorkflowFacts = Record<string, unknown> & {
  workers?: number | null;
  status?: string;
  coverage?: string;
};
export type CostAgent = {
  id: string;
  sessionId?: string;
  agentId?: string | null;
  role: "coordinator" | "worker";
  provenance: string;
  totals: CostTotals;
  observedSettings: ObservedSetting[];
  sources: { file: string }[];
  requestedSettings?: Record<string, unknown> | null;
  observedSettingsCoverage?: Record<string, unknown>;
  responseIds?: string[];
  peakInput: PeakInput;
  idleWakeRequests: unknown;
  workflow?: WorkflowFacts;
};
export type CostReport = ReportedSelection & {
  format: "agent-effort-v1";
  scope: string;
  host: "codex" | "claude" | "cursor";
  selection: ReportedSelection["selection"] & {
    kind: string;
    taskId?: string | null;
    identity?: string | null;
    rootSessionId: string;
    rootTurnId?: string | null;
    projectScope?: string;
  };
  definition: string;
  accounting: string;
  requestedSettings: Record<string, unknown> | null;
  guidanceVersion: { value: string | null; provenance: string };
  sources: { file: string }[];
  unownedResponses?: unknown[];
  observedSettings?: ObservedSetting[];
  observedSettingsCoverage?: Record<string, unknown>;
  totals: CostTotals;
  agents: CostAgent[];
  workflow?: WorkflowFacts;
  peakInput: null;
  peakInputRule: string;
  idleWakeRequests: unknown;
  idleWakeRule: string;
};

/** Native single report in JSON through the actual CLI. */
export const costReport = (home: string, args: string[]) =>
  JSON.parse(succeeded(effortCli(home, [...args, "--json"]))) as CostReport;
/** Cursor single report in JSON for one retained family root. */
export const cursorCost = (home: string, root: string, args: string[] = []) =>
  JSON.parse(
    succeeded(
      cursorCli(home, [root], ["--family", "family", "--json", ...args]),
    ),
  ) as CostReport;
/** One labelled JSON fact from readable output, e.g. "Combined known figures". */
export function readableFact(stdout: string, label: string): unknown {
  const line = stdout.split("\n").find((row) => row.startsWith(`${label}: `));
  if (!line) throw new Error(`Readable output lacks ${label}`);
  return JSON.parse(line.slice(label.length + 2));
}
