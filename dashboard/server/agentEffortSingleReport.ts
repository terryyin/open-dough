// Public single-report projection documented in
// dashboard/AGENT-EFFORT.md#single-report-contract. Internal report results
// reach JSON and readable output only through these explicit mappings.
import type { nativeEffortSummary } from "./agentEffortNativeSummary.ts";
import type { cursorEffortReport } from "./agentEffortCursor.ts";
import {
  agentWorkflow,
  idleWakes,
  observedSettings,
  peakInput,
  requestedSettings,
  reportWorkflow,
  settingsCoverage,
  sources,
  totals,
} from "./agentEffortSingleReportFacts.ts";

type NativeReport = Awaited<ReturnType<typeof nativeEffortSummary>>;
type CursorReport = Exclude<
  ReturnType<typeof cursorEffortReport>,
  { selections: unknown }
>;
export type SingleReport = NativeReport | CursorReport;

const nativeSelection = (selection: NativeReport["selection"]) => ({
  kind: selection.kind,
  taskId: selection.taskId,
  identity: selection.identity,
  rootSessionId: selection.rootSessionId,
  rootTurnId: selection.rootTurnId,
  nativeTurns: selection.nativeTurns,
  from: selection.from,
  until: selection.until,
  projectScope: selection.projectScope,
  boundary: selection.boundary,
});
const cursorSelection = (selection: CursorReport["selection"]) => ({
  kind: selection.kind,
  rootSessionId: selection.rootSessionId,
  from: selection.from,
  until: selection.until,
  appliedBoundary: {
    kind: selection.appliedBoundary.kind,
    from: selection.appliedBoundary.from,
    until: selection.appliedBoundary.until,
    nativeTurnBoundary: selection.appliedBoundary.nativeTurnBoundary,
  },
  boundary: selection.boundary,
});
const nativeAgent = (agent: NativeReport["agents"][number]) => ({
  id: agent.id,
  sessionId: agent.sessionId,
  agentId: agent.agentId,
  role: agent.role,
  provenance: agent.provenance,
  totals: totals(agent.totals),
  observedSettings: observedSettings(agent.observedSettings),
  sources: sources(agent.sources),
  responseIds: agent.responseIds,
  peakInput: peakInput(agent.peakInput),
  idleWakeRequests: idleWakes(agent.idleWakeRequests),
});
const cursorAgent = (agent: CursorReport["agents"][number]) => ({
  id: agent.id,
  role: agent.role,
  provenance: agent.provenance,
  sources: sources(agent.sources),
  workflow: agentWorkflow(agent.workflow),
  totals: totals(agent.totals),
  requestedSettings: requestedSettings(agent.requestedSettings),
  observedSettings: observedSettings(agent.observedSettings),
  observedSettingsCoverage: settingsCoverage(agent.observedSettingsCoverage),
  peakInput: peakInput(agent.peakInput),
  idleWakeRequests: idleWakes(agent.idleWakeRequests),
});
const nativeOutput = (report: NativeReport) => ({
  format: report.format,
  scope: report.scope,
  host: report.host,
  selection: nativeSelection(report.selection),
  definition: report.definition,
  accounting: report.accounting,
  requestedSettings: requestedSettings(report.requestedSettings),
  guidanceVersion: {
    value: report.guidanceVersion.value,
    provenance: report.guidanceVersion.provenance,
    evidence: report.guidanceVersion.evidence,
  },
  sources: sources(report.sources),
  unownedResponses: report.unownedResponses.map((response) => ({
    id: response.id,
    sessionId: response.sessionId,
    agentId: response.agentId,
    turnId: response.turnId,
    rootTurnId: response.rootTurnId,
    sources: sources(response.sources),
    gaps: response.gaps,
  })),
  totals: totals(report.totals),
  threads: report.threads,
  agents: report.agents.map(nativeAgent),
  gaps: report.gaps,
  peakInput: report.peakInput,
  peakInputRule: report.peakInputRule,
  idleWakeRequests: idleWakes(report.idleWakeRequests),
  idleWakeRule: report.idleWakeRule,
});
const cursorOutput = (report: CursorReport) => ({
  format: report.format,
  scope: report.scope,
  host: report.host,
  selection: cursorSelection(report.selection),
  definition: report.definition,
  accounting: report.accounting,
  requestedSettings: requestedSettings(report.requestedSettings),
  observedSettings: observedSettings(report.observedSettings),
  observedSettingsCoverage: settingsCoverage(report.observedSettingsCoverage),
  guidanceVersion: {
    value: report.guidanceVersion.value,
    provenance: report.guidanceVersion.provenance,
  },
  sources: sources(report.sources),
  totals: totals(report.totals),
  agents: report.agents.map(cursorAgent),
  workflow: reportWorkflow(report.workflow),
  peakInput: report.peakInput,
  peakInputRule: report.peakInputRule,
  idleWakeRequests: idleWakes(report.idleWakeRequests),
  idleWakeRule: report.idleWakeRule,
  gaps: report.gaps,
});
export const singleReportOutput = (report: SingleReport) =>
  report.host === "cursor"
    ? cursorOutput(report)
    : nativeOutput(report as NativeReport);

/** Readable agent lines state every JSON agent fact except response ids. */
export const readableAgent = <Agent extends object>(agent: Agent) => ({
  ...agent,
  responseIds: undefined,
});

/** Readable lines present the same facts and caveats as the JSON output. */
export function renderSingleReport(report: SingleReport) {
  const output = singleReportOutput(report);
  const lines = [
    `${output.host} agent effort (${output.definition})`,
    `Selection: ${JSON.stringify(output.selection)}`,
    output.accounting,
    `Requested settings: ${JSON.stringify(output.requestedSettings)}`,
    `Guidance version: ${JSON.stringify(output.guidanceVersion)}`,
  ];
  if ("observedSettingsCoverage" in output)
    lines.push(
      `Observed settings coverage: ${JSON.stringify(output.observedSettingsCoverage)}`,
    );
  lines.push(
    output.peakInputRule,
    `${output.idleWakeRule} ${JSON.stringify(output.idleWakeRequests)}`,
    `Combined known figures: ${JSON.stringify(output.totals)}`,
  );
  if ("workflow" in output)
    lines.push(`Workflow: ${JSON.stringify(output.workflow)}`);
  for (const agent of output.agents)
    lines.push(
      `${agent.role} ${agent.id}: ${JSON.stringify(readableAgent(agent))}`,
    );
  lines.push(`Gaps: ${output.gaps.join(", ")}`);
  return lines.join("\n");
}
