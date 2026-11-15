// One cohort's Token index chart from the per-task usage summary
// (./usageTaskSummary.ts): each finished task of a project configured now,
// hidden ones included, in the chosen launch workflow and, when chosen, with
// that primary observed model and effort, weighed under one tariff version
// (./tokenIndex.ts) and placed at its reported outcome time, or else its last
// recorded activity, with the trailing moving average. A recovered task has
// no open session, so it is finished; a retained launch is finished once it
// reports an outcome. The Model and Effort options are the primary settings
// the finished tasks show in any launch workflow, so switching workflow keeps
// every choice on offer.
import { launchWorkflowNames, launchWorkflows } from "../src/launchWorkflow.ts";
import {
  movingAverageTasks,
  usageWorkflowOf,
  type TokenIndexAnswer,
  type TokenIndexCohort,
  type TokenIndexTask,
  type UsageWorkflow,
} from "../src/usageTokenIndex.ts";
import { tokenIndex } from "./tokenIndex.ts";
import type { SummaryTask, UsageTaskSummary } from "./usageTaskSummary.ts";
import type { UsageTariff } from "./usageTariffs.ts";

// A retained launch records its workflow; a recovered task, the skill its
// directive invoked.
function launchWorkflowOf(workflow: string | null): UsageWorkflow | undefined {
  return (
    usageWorkflowOf(workflow) ??
    launchWorkflowNames.find((name) => launchWorkflows[name].skill === workflow)
  );
}

const finished = (task: SummaryTask) =>
  task.kind === "recovered" || task.outcome !== null;

// The value most of the task's root conversation responses ran with, counted
// by response; workers do not decide it, and a tie leaves it unknown (null).
function primarySetting(
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

const matches = (chosen: string | null, primary: string | null) =>
  chosen === null || chosen === primary;

// Each known value, most common first, then by name.
function observed(values: readonly (string | null)[]): string[] {
  const counts = new Map<string, number>();
  for (const value of values)
    if (value !== null) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value]) => value);
}

function point(
  task: SummaryTask,
  tariff: UsageTariff,
): TokenIndexTask | undefined {
  const index = tokenIndex(task.usage, tariff);
  const endedAt = task.outcome?.at ?? task.lastActivityAt;
  if (index === undefined || endedAt === null || task.project === null)
    return undefined;
  return {
    id: task.id,
    project: task.project,
    identity: task.identity,
    title: task.title,
    endedAt,
    index,
  };
}

export function tokenIndexCohort(
  summary: UsageTaskSummary,
  configuredProjects: readonly string[],
  tariff: UsageTariff,
  cohort: TokenIndexCohort,
): TokenIndexAnswer {
  const projects = new Set(configuredProjects);
  const population = summary.tasks.filter(
    (task) =>
      task.project !== null && projects.has(task.project) && finished(task),
  );
  const tasks = population
    .filter(
      (task) =>
        launchWorkflowOf(task.workflow) === cohort.workflow &&
        matches(cohort.model, primarySetting(task, "model")) &&
        matches(cohort.effort, primarySetting(task, "effort")),
    )
    .flatMap((task) => point(task, tariff) ?? [])
    .sort(
      (a, b) =>
        Date.parse(a.endedAt) - Date.parse(b.endedAt) ||
        a.id.localeCompare(b.id),
    );
  const average = tasks.flatMap((task, at) => {
    if (at + 1 < movingAverageTasks) return [];
    const latest = tasks.slice(at + 1 - movingAverageTasks, at + 1);
    const total = latest.reduce((sum, each) => sum + each.index, 0);
    return [{ at: task.endedAt, value: total / movingAverageTasks }];
  });
  return {
    cohort,
    options: {
      models: observed(
        population.map((task) => primarySetting(task, "model")),
      ).map((id) => ({ id, name: tariff.models[id]?.name ?? id })),
      efforts: observed(
        population.map((task) => primarySetting(task, "effort")),
      ),
    },
    tariff: { version: tariff.version, label: tariff.label },
    checkedAt: summary.checkedAt,
    tasks,
    average,
  };
}
