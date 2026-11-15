// System settings → Usage's answer: one Token index point per finished
// dashboard-launched task of the chosen cohort, in end-time order, with the
// trailing moving average, the tariff version that weighed them, when the
// usage was last checked and the Model and Effort options the observed tasks
// offer (`../server/usageBoundary.ts`). The cohort travels as the request's
// query, spelled here for both sides.
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

export type TokenIndexTask = {
  readonly id: string;
  readonly project: string;
  readonly identity: string | null;
  readonly title: string | null;
  // The reported outcome time, or else the last recorded activity.
  readonly endedAt: string;
  readonly index: number;
};

export type TokenIndexAnswer = {
  readonly cohort: TokenIndexCohort;
  // The primary observed models, by id and name, and efforts of the tool's
  // finished tasks in every launch workflow, most common first.
  readonly options: {
    readonly models: readonly { readonly id: string; readonly name: string }[];
    readonly efforts: readonly string[];
  };
  readonly tariff: { readonly version: string; readonly label: string };
  readonly checkedAt: string;
  readonly tasks: readonly TokenIndexTask[];
  // From the tenth task on, the mean of each task's latest ten.
  readonly average: readonly { readonly at: string; readonly value: number }[];
};
