// Test-side reader for the documented comparison contract
// (dashboard/AGENT-EFFORT-OUTPUT.md#comparison-contract): how two groups
// compare. Types describe the public output independently of production
// types.
import { effortCli, succeeded } from "./agentEffortSelection.ts";
import {
  readableFact,
  readableLine,
  withoutResponseIds,
} from "./agentEffortCost.ts";
import type {
  CostReport,
  CostTotals,
  Figure,
  PeakInput,
} from "./agentEffortCost.ts";

export type ComparedExecution = CostReport & { label: string };
export type HostGroup = {
  host: string;
  definition: string;
  totals: CostTotals;
  workflow: Record<string, number | null> | null;
  idleWakeRequests: Figure & Record<string, unknown>;
  agents: { host: string; id: string; peakInput: PeakInput }[];
  sources: { file: string }[];
  gaps: string[];
  deduplication: string;
};
export type ComparedGroup = {
  notes: Record<string, string> | null;
  executions: ComparedExecution[];
  perHost: HostGroup[];
};
export type KnownDelta = {
  value: number;
  baseline: Figure;
  candidate: Figure;
  status: string;
};
export type Comparison = {
  format: "agent-effort-comparison-v1";
  baseline: ComparedGroup;
  candidate: ComparedGroup;
  deltas: {
    host: string;
    definition: string;
    totals: Partial<Record<keyof CostTotals, KnownDelta>>;
    workflow: Record<string, number> | null;
    idleWakeRequests: unknown;
  }[];
  warnings: string[];
};

const statedExecution = (execution: ComparedExecution) => ({
  ...execution,
  agents: execution.agents.map(withoutResponseIds),
});
/** The comparison facts a readable comparison states, in JSON form. */
function readableComparison(stdout: string) {
  const rows = stdout.split("\n");
  const side = (name: "baseline" | "candidate") => ({
    notes: readableFact(stdout, `${name} supplied notes`),
    executions: rows
      .filter((row) => row.startsWith(`${name} execution: `))
      .map(
        (row) => JSON.parse(row.slice(`${name} execution: `.length)) as unknown,
      ),
    perHost: readableFact(stdout, `${name} deduplicated group`),
  });
  return {
    claim: rows[0],
    baseline: side("baseline"),
    candidate: side("candidate"),
    deltas: readableFact(stdout, "Deltas"),
    warnings: readableLine(stdout, "Warnings").split("; ").filter(Boolean),
  };
}
/** One comparison through the actual CLI, as JSON and as readable facts. */
export function compareViews(home: string, manifest: string) {
  const json = JSON.parse(
    succeeded(effortCli(home, ["--comparison", manifest, "--json"])),
  ) as Comparison;
  const readable = readableComparison(
    succeeded(effortCli(home, ["--comparison", manifest])),
  );
  const side = (group: ComparedGroup) => ({
    notes: group.notes,
    executions: group.executions.map(statedExecution),
    perHost: group.perHost,
  });
  /** Readable output must state exactly the JSON facts and caveats. */
  const stated = {
    claim:
      "Exploratory agent effort comparison; no automatic improvement or causal claim",
    baseline: side(json.baseline),
    candidate: side(json.candidate),
    deltas: json.deltas,
    warnings: json.warnings.flatMap((warning) => warning.split("; ")),
  };
  return { json, readable, stated };
}
