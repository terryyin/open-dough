// One task of the Token index chart (./tokenIndexCohort.ts), from its
// per-task usage summary (./usageTaskSummary.ts) and what its launch record
// says now (./retainedUsageTasks.ts). A task is finished once it has a
// reported outcome or its launch is marked done; a recovered task has no open
// session, so it is finished. A launch's record is read at request time, so a
// launch marked done or reporting after the summary was derived is finished
// without rederiving it. A finished task's point carries the detail the view
// shows when it is selected: its story, project, launch workflow, outcome,
// end time, requested and primary observed model and effort, its index under
// one tariff version (./tokenIndex.ts) and its coverage, with the recorded
// gaps that make it partial, and any model weighed at a substitute's rates.
import { launchWorkflowNames, launchWorkflows } from "../src/launchWorkflow.ts";
import {
  usageWorkflowOf,
  type TokenIndexTask,
  type UsageModel,
  type UsageSetting,
  type UsageWorkflow,
} from "../src/usageTokenIndex.ts";
import type { RetainedLaunchEnd } from "./retainedUsageTasks.ts";
import { tokenIndex } from "./tokenIndex.ts";
import type { SummaryTask } from "./usageTaskSummary.ts";
import type { UsageTariff } from "./usageTariffs.ts";

// What a cohort is read against: the projects configured now, hidden ones
// included, by id with their labels; each retained launch's end as its record
// says now, by task id; and the tariff version that weighs the tasks.
export type UsageReading = {
  readonly projects: ReadonlyMap<string, string>;
  readonly launches: ReadonlyMap<string, RetainedLaunchEnd>;
  readonly tariff: UsageTariff;
};

// A launch records its workflow when known, otherwise the recovered skill;
// a recovered-only task records the skill its directive invoked.
export function launchWorkflowOf(
  workflow: string | null,
): UsageWorkflow | undefined {
  return (
    usageWorkflowOf(workflow) ??
    launchWorkflowNames.find((name) => launchWorkflows[name].skill === workflow)
  );
}

// The value most of the task's root conversation responses ran with, counted
// by response; workers do not decide it, and a tie leaves it unknown (null).
export function primarySetting(
  task: SummaryTask,
  setting: "model" | "effort",
): string | null {
  const counts = new Map<string | null, number>();
  for (const group of task.usage)
    if (group.root)
      counts.set(
        group[setting],
        (counts.get(group[setting]) ?? 0) + group.responses,
      );
  const [first, second] = [...counts].sort((a, b) => b[1] - a[1]);
  return first !== undefined && (second === undefined || first[1] > second[1])
    ? first[0]
    : null;
}

// The task with the outcome its launch record reports now, if any, when it
// is finished; undefined while it is not.
export function finishedTask(
  task: SummaryTask,
  launches: UsageReading["launches"],
): SummaryTask | undefined {
  const launch = task.kind === "launch" ? launches.get(task.id) : undefined;
  const outcome = launch?.outcome ?? task.outcome;
  const ended =
    task.kind === "recovered" ||
    outcome !== null ||
    (launch?.doneAt ?? null) !== null;
  return ended ? { ...task, outcome } : undefined;
}

// A model by its id and the name the tariff gives it, or else its id.
export function usageModel(id: string, tariff: UsageTariff): UsageModel {
  return { id, name: tariff.models[id]?.name ?? id };
}

function setting(
  model: string | null,
  effort: string | null,
  tariff: UsageTariff,
): UsageSetting {
  return { model: model === null ? null : usageModel(model, tariff), effort };
}

// The reported outcome time, or the last activity when no outcome was reported.
export const taskEndedAt = (task: SummaryTask): string | null =>
  task.outcome?.at ?? task.lastActivityAt;

// The finished task's point and detail, partial when its recorded gaps show
// usage missing; "unpriced" when a response has no rate under the tariff;
// undefined when it cannot be placed.
export function tokenIndexTask(
  task: SummaryTask,
  { projects, tariff }: UsageReading,
): TokenIndexTask | "unpriced" | undefined {
  const weighed = tokenIndex(task.usage, tariff);
  if (weighed === undefined) return "unpriced";
  const { index, substitutes } = weighed;
  const endedAt = taskEndedAt(task);
  const label = task.project === null ? undefined : projects.get(task.project);
  const workflow = launchWorkflowOf(task.workflow);
  if (
    endedAt === null ||
    task.project === null ||
    label === undefined ||
    workflow === undefined
  )
    return undefined;
  const { kind, attention, disposition } = task.outcome ?? {};
  return {
    id: task.id,
    project: { id: task.project, label },
    identity: task.identity,
    title: task.title,
    workflow,
    outcome:
      kind === undefined
        ? null
        : {
            kind,
            ...(attention === undefined ? {} : { attention }),
            ...(disposition === undefined ? {} : { disposition }),
          },
    endedAt,
    requested: setting(task.requested.model, task.requested.effort, tariff),
    observed: setting(
      primarySetting(task, "model"),
      primarySetting(task, "effort"),
      tariff,
    ),
    index,
    ...(substitutes.size === 0
      ? {}
      : {
          substitutions: [...substitutes].map(([model, substitute]) => ({
            model: usageModel(model, tariff),
            substitute: usageModel(substitute, tariff),
          })),
        }),
    coverage:
      task.gaps.length === 0
        ? { kind: "measured" }
        : { kind: "partial", gaps: task.gaps },
  };
}
