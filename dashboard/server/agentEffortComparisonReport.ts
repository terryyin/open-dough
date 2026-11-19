// Public comparison output of compareAgentEffort.ts. Internal group
// results reach JSON and readable output only through these explicit
// mappings; each execution reuses the single-report projection.
import type { compareEffort } from "./agentEffortComparison.ts";
import {
  readableAgent,
  singleReportOutput,
} from "./agentEffortSingleReport.ts";
import {
  figure,
  groupWorkflow,
  idleWakes,
  peakInput,
  sources,
  totals,
} from "./agentEffortSingleReportFacts.ts";

type Comparison = Awaited<ReturnType<typeof compareEffort>>;
type Group = Comparison["baseline"];
type Delta = Comparison["deltas"][number];

const hostGroup = (host: Group["perHost"][number]) => ({
  host: host.host,
  definition: host.definition,
  totals: totals(host.totals),
  workflow: host.workflow && groupWorkflow(host.workflow),
  idleWakeRequests: idleWakes(host.idleWakeRequests),
  agents: host.agents.map((agent) => ({
    host: agent.host,
    id: agent.id,
    peakInput: peakInput(agent.peakInput),
  })),
  sources: sources(host.sources),
  gaps: host.gaps,
  deduplication: host.deduplication,
});
const group = (side: Group) => ({
  notes: side.notes,
  executions: side.executions.map(({ label, ...report }) => ({
    label,
    ...singleReportOutput(report),
  })),
  perHost: side.perHost.map(hostGroup),
});
const delta = (difference: Delta) => ({
  host: difference.host,
  definition: difference.definition,
  totals: Object.fromEntries(
    Object.entries(difference.totals).map(([metric, known]) => [
      metric,
      {
        value: known.value,
        baseline: figure(known.baseline),
        candidate: figure(known.candidate),
        status: known.status,
      },
    ]),
  ),
  workflow: difference.workflow,
  idleWakeRequests: difference.idleWakeRequests && {
    value: difference.idleWakeRequests.value,
    baseline: idleWakes(difference.idleWakeRequests.baseline),
    candidate: idleWakes(difference.idleWakeRequests.candidate),
  },
});
export const comparisonOutput = (comparison: Comparison) => ({
  format: comparison.format,
  baseline: group(comparison.baseline),
  candidate: group(comparison.candidate),
  deltas: comparison.deltas.map(delta),
  warnings: comparison.warnings,
});

/** Readable lines state the same facts and caveats as the JSON output. */
export function renderComparison(comparison: Comparison) {
  const output = comparisonOutput(comparison);
  const lines = [
    "Exploratory agent effort comparison; no automatic improvement or causal claim",
  ];
  for (const name of ["baseline", "candidate"] as const) {
    const side = output[name];
    lines.push(`${name} supplied notes: ${JSON.stringify(side.notes)}`);
    for (const execution of side.executions)
      lines.push(
        `${name} execution: ${JSON.stringify({
          ...execution,
          agents: execution.agents.map(readableAgent),
        })}`,
      );
    lines.push(`${name} deduplicated group: ${JSON.stringify(side.perHost)}`);
  }
  lines.push(
    `Deltas: ${JSON.stringify(output.deltas)}`,
    `Warnings: ${output.warnings.join("; ")}`,
  );
  return lines.join("\n");
}
