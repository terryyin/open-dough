// Nested single-report figure, peak, wake, settings and workflow facts are
// mapped key by key so an internal rename cannot reach the public output.
type Figure = {
  value: number | null;
  status: string;
  missingRequests?: number;
  missingComponents?: {
    uncachedInput: number;
    cachedInput: number;
    cacheWrite: number;
  };
};
export const figure = (fact: Figure) => ({
  value: fact.value,
  status: fact.status,
  missingRequests: fact.missingRequests,
  missingComponents: fact.missingComponents && {
    uncachedInput: fact.missingComponents.uncachedInput,
    cachedInput: fact.missingComponents.cachedInput,
    cacheWrite: fact.missingComponents.cacheWrite,
  },
});
type Known = Pick<Figure, "value" | "status">;
type Totals = Record<
  | "totalTokens"
  | "requests"
  | "totalInput"
  | "uncachedInput"
  | "cachedInput"
  | "cacheWrite"
  | "cacheWrite5m"
  | "cacheWrite1h"
  | "output",
  Figure
> & { reasoningOutput?: Figure };
export const totals = (facts: Totals) => ({
  totalTokens: figure(facts.totalTokens),
  requests: figure(facts.requests),
  totalInput: figure(facts.totalInput),
  uncachedInput: figure(facts.uncachedInput),
  cachedInput: figure(facts.cachedInput),
  cacheWrite: figure(facts.cacheWrite),
  cacheWrite5m: figure(facts.cacheWrite5m),
  cacheWrite1h: figure(facts.cacheWrite1h),
  output: figure(facts.output),
  reasoningOutput: facts.reasoningOutput && figure(facts.reasoningOutput),
});
type Peak = Known & {
  observedRequests?: number;
  missingInputRequests?: number;
  coverage?: string;
};
export const peakInput = (peak: Peak) => ({
  value: peak.value,
  status: peak.status,
  observedRequests: peak.observedRequests,
  missingInputRequests: peak.missingInputRequests,
  coverage: peak.coverage,
});
type Wakes = Known & {
  classifiedRequests?: number;
  unclassifiedRequests?: number;
  progressRequests?: number;
  mixedResultRequests?: number;
  clockOnlyRequests?: number;
  coverage?: string;
};
export const idleWakes = (wakes: Wakes) => ({
  value: wakes.value,
  status: wakes.status,
  classifiedRequests: wakes.classifiedRequests,
  unclassifiedRequests: wakes.unclassifiedRequests,
  progressRequests: wakes.progressRequests,
  mixedResultRequests: wakes.mixedResultRequests,
  clockOnlyRequests: wakes.clockOnlyRequests,
  coverage: wakes.coverage,
});
type Setting = {
  model: string | null;
  effort: string | null;
  serviceTier: string | null;
};
export const observedSettings = (
  settings: (Setting & { requests: number })[],
) =>
  settings.map((setting) => ({
    model: setting.model,
    effort: setting.effort,
    serviceTier: setting.serviceTier,
    requests: setting.requests,
  }));
export const settingsCoverage = (
  coverage: Setting & { status: string; coverage: string },
) => ({
  model: coverage.model,
  effort: coverage.effort,
  serviceTier: coverage.serviceTier,
  status: coverage.status,
  coverage: coverage.coverage,
});
type WorkflowCounts = Record<(typeof workflowCounts)[number], number | null>;
const workflowCounts = [
  "transcripts",
  "bytes",
  "rows",
  "toolCalls",
  "readCalls",
  "skillReads",
  "planReads",
  "taskCalls",
  "awaitShellCalls",
  "todoWriteCalls",
  "dynamicToolCalls",
  "missingResults",
  "identifiedToolCalls",
  "unidentifiedToolCallRows",
  "conflictingToolCallIds",
] as const;
const counts = (workflow: WorkflowCounts) =>
  Object.fromEntries(workflowCounts.map((key) => [key, workflow[key]]));
export const agentWorkflow = (
  workflow: WorkflowCounts & {
    toolCallRule: string;
    sources: { kind: string; file: string }[];
    gaps: string[];
  },
) => ({
  ...counts(workflow),
  toolCallRule: workflow.toolCallRule,
  sources: workflow.sources.map((source) => ({
    kind: source.kind,
    file: source.file,
  })),
  gaps: workflow.gaps,
});
export const reportWorkflow = (
  workflow: WorkflowCounts & {
    workers: number | null;
    status: string;
    coverage: string;
  },
) => ({
  ...counts(workflow),
  workers: workflow.workers,
  status: workflow.status,
  coverage: workflow.coverage,
});
type Source = {
  kind: string;
  file: string;
  line?: number | undefined;
  repository?: string | undefined;
  revision?: string | undefined;
};
export const sources = (facts: Source[]) =>
  facts.map((source) => ({
    kind: source.kind,
    file: source.file,
    line: source.line,
    repository: source.repository,
    revision: source.revision,
  }));
type Requested = {
  model?: string | undefined;
  effort?: string | undefined;
  approvalPolicy?: string | undefined;
  sandbox?: string | undefined;
  serviceTier?: string | undefined;
  options?: string[] | undefined;
  policy?:
    | {
        tracking?: string | undefined;
        workspace?: string | undefined;
        landing?: string | undefined;
      }
    | undefined;
};
/** Launch-requested settings; Cursor and unlaunched families report null. */
export const requestedSettings = (requested: Requested | null) =>
  requested && {
    model: requested.model,
    effort: requested.effort,
    approvalPolicy: requested.approvalPolicy,
    sandbox: requested.sandbox,
    serviceTier: requested.serviceTier,
    options: requested.options,
    policy: requested.policy && {
      tracking: requested.policy.tracking,
      workspace: requested.policy.workspace,
      landing: requested.policy.landing,
    },
  };
/** A comparison group's deduplicated Cursor workflow counts. */
export const groupWorkflow = (
  workflow: Partial<WorkflowCounts> & { workers: number | null },
) => ({
  ...Object.fromEntries(
    workflowCounts.map((key) => [key, workflow[key] ?? null]),
  ),
  workers: workflow.workers,
});
