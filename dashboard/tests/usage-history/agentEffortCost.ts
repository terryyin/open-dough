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
  threads?: number | null;
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
export const costReport = (home: string, args: string[], cwd?: string) =>
  JSON.parse(
    succeeded(effortCli(home, [...args, "--json"], cwd)),
  ) as CostReport;
/** Cursor single report in JSON for one retained family root. */
export const cursorCost = (home: string, root: string, args: string[] = []) =>
  JSON.parse(
    succeeded(
      cursorCli(home, [root], ["--family", "family", "--json", ...args]),
    ),
  ) as CostReport;
/** The text after one readable label, e.g. "Warnings". */
export function readableLine(stdout: string, label: string) {
  const line = stdout.split("\n").find((row) => row.startsWith(`${label}: `));
  if (line === undefined) throw new Error(`Readable output lacks ${label}`);
  return line.slice(label.length + 2);
}
/** One labelled JSON fact from readable output, e.g. "Combined known figures". */
export const readableFact = (stdout: string, label: string): unknown =>
  JSON.parse(readableLine(stdout, label));
/** Readable agent lines state every JSON agent fact except response ids. */
export function withoutResponseIds<Agent extends { responseIds?: unknown }>(
  agent: Agent,
) {
  const stated: Partial<Agent> = { ...agent };
  delete stated.responseIds;
  return stated as Omit<Agent, "responseIds">;
}

/** The figures, agents, idle wakes and gaps a readable report states. */
export type ReadableCost = Pick<CostReport, "totals" | "idleWakeRequests"> & {
  agents: Omit<CostAgent, "responseIds">[];
  gaps: string[];
};
export function readableCost(stdout: string, idleWakeRule: string) {
  const rows = stdout.split("\n");
  const wakes = rows.find((row) => row.startsWith(`${idleWakeRule} `));
  const gaps = rows.find((row) => row.startsWith("Gaps: "));
  if (!wakes || gaps === undefined)
    throw new Error("Readable output lacks idle wakes or gaps");
  return {
    totals: readableFact(stdout, "Combined known figures") as CostTotals,
    agents: rows.flatMap((row) => {
      const agent = /^(?:coordinator|worker) .+?: (\{.*\})$/.exec(row);
      return agent?.[1] ? [JSON.parse(agent[1]) as CostAgent] : [];
    }),
    idleWakeRequests: JSON.parse(wakes.slice(idleWakeRule.length + 1)),
    gaps: gaps.slice("Gaps: ".length).split(", ").filter(Boolean),
  } satisfies ReadableCost;
}
/** The same native report as JSON and as its readable facts. */
export function costViews(home: string, args: string[], cwd?: string) {
  const json = costReport(home, args, cwd);
  const readable = readableCost(
    succeeded(effortCli(home, args, cwd)),
    json.idleWakeRule,
  );
  const stated: ReadableCost = {
    totals: json.totals,
    agents: json.agents.map(withoutResponseIds),
    idleWakeRequests: json.idleWakeRequests,
    gaps: json.gaps,
  };
  /** Readable output must state exactly the JSON facts, qualifications included. */
  return { json, readable, stated };
}
