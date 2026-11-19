// System settings → Usage's answer: one Token index point per finished,
// priced dashboard-launched task of the chosen cohort, in end-time order, each
// with the detail the view shows when it is selected and its coverage; how
// many tasks are unpriced; the rolling median, the tariff version
// that weighed them, when the usage was last checked and the Model and Effort
// options the observed tasks offer (`../server/usageBoundary.ts`). The cohort
// travels as the request's query, spelled here for both sides. Refresh
// answers the new check time.
import { launchWorkflowNames } from "./launchWorkflow.ts";
import type { UsagePeriod } from "./usagePeriod.ts";

export const usageTokenIndexEndpoint = "/__usage/token-index";
export const usageRefreshEndpoint = "/__usage/refresh";

export type UsageRefreshAnswer = { readonly checkedAt: string };

// How many of the latest eligible tasks the rolling median spans.
export const rollingMedianTasks = 10;

// The launch workflows a cohort selects: the dashboard's story workflows and
// its ad hoc sessions.
export const usageWorkflows = [...launchWorkflowNames, "ad-hoc"] as const;

export type UsageWorkflow = (typeof usageWorkflows)[number];

// The launch workflow a recorded or requested name spells, if any.
export const usageWorkflowOf = (
  name: string | null,
): UsageWorkflow | undefined => usageWorkflows.find((each) => each === name);

// The tools whose dashboard launches a cohort selects, by host identity.
export const usageTools = ["codex", "claude"] as const;

export type UsageTool = (typeof usageTools)[number];

export const usageToolOf = (name: string | null): UsageTool | undefined =>
  usageTools.find((each) => each === name);

// One tool and launch workflow, and the primary observed model and effort a
// task must have; null is the broad option (All models, Any effort).
export type TokenIndexCohort = {
  readonly tool: UsageTool;
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

export function tokenIndexUrl(
  cohort: TokenIndexCohort,
  period?: UsagePeriod,
): string {
  const query = new URLSearchParams({
    tool: cohort.tool,
    workflow: cohort.workflow,
  });
  if (cohort.model !== null) query.set("model", cohort.model);
  if (cohort.effort !== null) query.set("effort", cohort.effort);
  if (period !== undefined) {
    query.set("from", period.from);
    query.set("until", period.until);
  }
  return `${usageTokenIndexEndpoint}?${query.toString()}`;
}

// The cohort a request's query selects; undefined for an unknown tool or
// workflow. Without them it is Codex's and Execution's.
export function requestedCohort(
  query: URLSearchParams,
): TokenIndexCohort | undefined {
  const tool = usageToolOf(query.get("tool") ?? defaultCohort.tool);
  const workflow = usageWorkflowOf(
    query.get("workflow") ?? defaultCohort.workflow,
  );
  if (tool === undefined || workflow === undefined) return undefined;
  return {
    tool,
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
// only unsupported counters; a Claude session whose root transcript has no
// response usage; a response it may own that could not be attributed to one
// task; a response missing token counts; or no attributable response at all.
// Claude's background work that never reaches transcripts
// (`auxiliary-usage-not-covered`) is one cohort note (`./UsageToolSummary.tsx`),
// not a task's gap. A spawn whose worker cannot be told apart from others
// (`ambiguous-` or `unresolved-worker-evidence`) shows no usage missing: the
// worker's responses still join the task through their own lineage.
export const usageCoverageGaps = [
  "missing-worker-evidence",
  "incomplete-worker-evidence",
  "no-response-usage-evidence",
  "unsupported-response-counters",
  "missing-root-transcript-usage",
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

// A model the tariff does not list, weighed at the substitute's rates until
// the rate card is updated.
export type UsageSubstitution = {
  readonly model: UsageModel;
  readonly substitute: UsageModel;
};

// Each distinct actual model of the tasks, with its substitute, once.
export function usageSubstitutions(
  tasks: readonly TokenIndexTask[],
): UsageSubstitution[] {
  const each = new Map<string, UsageSubstitution>();
  for (const task of tasks)
    for (const substitution of task.substitutions ?? [])
      each.set(substitution.model.id, substitution);
  return [...each.values()];
}

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
  // Present when part or all of the index is estimated at substitute rates.
  readonly substitutions?: readonly UsageSubstitution[];
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
  // When usage was last checked; null before any import.
  readonly checkedAt: string | null;
  // Priced tasks in the requested period (all history without bounds), including partial ones.
  readonly tasks: readonly TokenIndexTask[];
  // How many finished tasks of the cohort have no point because a response
  // lacks a rate under the tariff, such as an absent model or a speed tier.
  readonly unpriced: number;
  // From the tenth eligible task on, the median of each one's latest ten
  // eligible tasks: priced and measured with no known gap. Earlier history still
  // contributes; only observations in the requested period are returned.
  // Keep the existing wire name for the trend. Each observation names the
  // eligible task it ends with (`task`), completed at `at`.
  readonly average: readonly {
    readonly at: string;
    readonly task: string;
    readonly value: number;
  }[];
};
