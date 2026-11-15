// System settings → Usage's answer: one Token index point per finished,
// priced dashboard-launched task of the chosen cohort, in end-time order, each
// with the detail the view shows when it is selected and its coverage; how
// many tasks are unpriced; the trailing moving average, the tariff version
// that weighed them, when the usage was last checked and the Model and Effort
// options the observed tasks offer (`../server/usageBoundary.ts`). The cohort
// travels as the request's query, spelled here for both sides.
import { launchWorkflowNames } from "./launchWorkflow.ts";

export const usageTokenIndexEndpoint = "/__usage/token-index";

// How many of the latest eligible tasks the moving average spans.
export const movingAverageTasks = 10;

// The launch workflows a cohort selects: the dashboard's story workflows and
// its ad hoc sessions.
export const usageWorkflows = [...launchWorkflowNames, "ad-hoc"] as const;

export type UsageWorkflow = (typeof usageWorkflows)[number];

// The launch workflow a recorded or requested name spells, if any.
export const usageWorkflowOf = (
  name: string | null,
): UsageWorkflow | undefined => usageWorkflows.find((each) => each === name);

// One tool and launch workflow, and the primary observed model and effort a
// task must have; null is the broad option (All models, Any effort).
export type TokenIndexCohort = {
  readonly tool: "codex";
  readonly workflow: UsageWorkflow;
  readonly model: string | null;
  readonly effort: string | null;
};

export const defaultCohort: TokenIndexCohort = {
  tool: "codex",
  workflow: "execution",
  model: null,
  effort: null,
};

export function tokenIndexUrl(cohort: TokenIndexCohort): string {
  const query = new URLSearchParams({ workflow: cohort.workflow });
  if (cohort.model !== null) query.set("model", cohort.model);
  if (cohort.effort !== null) query.set("effort", cohort.effort);
  return `${usageTokenIndexEndpoint}?${query.toString()}`;
}

// The cohort a request's query selects; undefined for an unknown workflow.
// Without a workflow it is Execution's.
export function requestedCohort(
  query: URLSearchParams,
): TokenIndexCohort | undefined {
  const workflow = usageWorkflowOf(
    query.get("workflow") ?? defaultCohort.workflow,
  );
  if (workflow === undefined) return undefined;
  return {
    tool: "codex",
    workflow,
    model: query.get("model"),
    effort: query.get("effort"),
  };
}

// A model by its id and the name the tariff gives it, or else its id.
export type UsageModel = { readonly id: string; readonly name: string };

// A model and effort, each null when unknown.
export type UsageSetting = {
  readonly model: UsageModel | null;
  readonly effort: string | null;
};

// How a task's session reported it ended.
export type UsageTaskOutcome = {
  readonly kind: "reported-complete" | "reported-incomplete";
  readonly attention?: boolean;
  readonly disposition?: "returned-to-backlog";
};

// The recorded gaps that show usage missing from a task
// (`../server/usageTaskGaps.ts`): a worker its root spawned with no usage
// evidence or no responses; a session of the task with no response usage or
// only unsupported counters; a response it may own that could not be
// attributed to one task; a response missing token counts; or no attributable
// response at all. A spawn whose worker cannot be told apart from others
// (`ambiguous-` or `unresolved-worker-evidence`) shows no usage missing: the
// worker's responses still join the task through their own lineage.
export const usageCoverageGaps = [
  "missing-worker-evidence",
  "incomplete-worker-evidence",
  "no-response-usage-evidence",
  "unsupported-response-counters",
  "unresolved-task-association",
  "missing-token-components",
  "no-attributable-response-usage",
] as const;

export type UsageCoverageGap = (typeof usageCoverageGaps)[number];

export const isUsageCoverageGap = (code: string): code is UsageCoverageGap =>
  (usageCoverageGaps as readonly string[]).includes(code);

// How completely the task's usage was measured: with no known gap, or
// partially, with the gaps that show missing usage.
export type UsageTaskCoverage =
  | { readonly kind: "measured" }
  | { readonly kind: "partial"; readonly gaps: readonly UsageCoverageGap[] };

export type TokenIndexTask = {
  readonly id: string;
  readonly project: { readonly id: string; readonly label: string };
  readonly identity: string | null;
  readonly title: string | null;
  readonly workflow: UsageWorkflow;
  // Null when no outcome was reported.
  readonly outcome: UsageTaskOutcome | null;
  // The reported outcome time, or else the last recorded activity.
  readonly endedAt: string;
  // What the launch asked for, and what most root responses ran with.
  readonly requested: UsageSetting;
  readonly observed: UsageSetting;
  readonly index: number;
  readonly coverage: UsageTaskCoverage;
};

export type TokenIndexAnswer = {
  readonly cohort: TokenIndexCohort;
  // The primary observed models, by id and name, and efforts of the tool's
  // finished tasks in every launch workflow, most common first.
  readonly options: {
    readonly models: readonly UsageModel[];
    readonly efforts: readonly string[];
  };
  readonly tariff: { readonly version: string; readonly label: string };
  readonly checkedAt: string;
  // Every priced task, partial ones included.
  readonly tasks: readonly TokenIndexTask[];
  // How many finished tasks of the cohort have no point because a response
  // lacks a rate under the tariff, such as an unknown model or speed tier.
  readonly unpriced: number;
  // From the tenth eligible task on, the mean of each one's latest ten
  // eligible tasks: priced and measured with no known gap.
  readonly average: readonly { readonly at: string; readonly value: number }[];
};
