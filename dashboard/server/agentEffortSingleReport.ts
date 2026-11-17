// Public single-report projection documented in
// dashboard/AGENT-EFFORT.md#single-report-contract. Internal report results
// reach JSON and readable output only through these explicit mappings.
import type { nativeEffortSummary } from "./agentEffortNativeSummary.ts";
import type { cursorEffortReport } from "./agentEffortCursor.ts";

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
  totals: agent.totals,
  observedSettings: agent.observedSettings,
  sources: agent.sources,
  responseIds: agent.responseIds,
  peakInput: agent.peakInput,
  idleWakeRequests: agent.idleWakeRequests,
});
const cursorAgent = (agent: CursorReport["agents"][number]) => ({
  id: agent.id,
  role: agent.role,
  provenance: agent.provenance,
  sources: agent.sources,
  workflow: agent.workflow,
  totals: agent.totals,
  requestedSettings: agent.requestedSettings,
  observedSettings: agent.observedSettings,
  observedSettingsCoverage: agent.observedSettingsCoverage,
  peakInput: agent.peakInput,
  idleWakeRequests: agent.idleWakeRequests,
});
const nativeOutput = (report: NativeReport) => ({
  format: report.format,
  scope: report.scope,
  host: report.host,
  selection: nativeSelection(report.selection),
  definition: report.definition,
  accounting: report.accounting,
  requestedSettings: report.requestedSettings,
  guidanceVersion: {
    value: report.guidanceVersion.value,
    provenance: report.guidanceVersion.provenance,
    evidence: report.guidanceVersion.evidence,
  },
  sources: report.sources,
  unownedResponses: report.unownedResponses,
  totals: report.totals,
  threads: report.threads,
  agents: report.agents.map(nativeAgent),
  gaps: report.gaps,
  peakInput: report.peakInput,
  peakInputRule: report.peakInputRule,
  idleWakeRequests: report.idleWakeRequests,
  idleWakeRule: report.idleWakeRule,
});
const cursorOutput = (report: CursorReport) => ({
  format: report.format,
  scope: report.scope,
  host: report.host,
  selection: cursorSelection(report.selection),
  definition: report.definition,
  accounting: report.accounting,
  requestedSettings: report.requestedSettings,
  observedSettings: report.observedSettings,
  observedSettingsCoverage: report.observedSettingsCoverage,
  guidanceVersion: {
    value: report.guidanceVersion.value,
    provenance: report.guidanceVersion.provenance,
  },
  sources: report.sources,
  totals: report.totals,
  agents: report.agents.map(cursorAgent),
  workflow: report.workflow,
  peakInput: report.peakInput,
  peakInputRule: report.peakInputRule,
  idleWakeRequests: report.idleWakeRequests,
  idleWakeRule: report.idleWakeRule,
  gaps: report.gaps,
});
export const singleReportOutput = (report: SingleReport) =>
  report.host === "cursor"
    ? cursorOutput(report)
    : nativeOutput(report as NativeReport);

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
      `${agent.role} ${agent.id}: ${JSON.stringify({ ...agent, responseIds: undefined })}`,
    );
  lines.push(`Gaps: ${output.gaps.join(", ")}`);
  return lines.join("\n");
}
