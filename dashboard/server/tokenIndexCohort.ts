// One cohort's Token index chart from the per-task usage summary
// (./usageTaskSummary.ts): each finished task (./tokenIndexTask.ts) of a
// project configured now, hidden ones included, in the chosen launch workflow
// and, when chosen, with that primary observed model and effort, weighed
// under one tariff version and placed at its reported outcome time, or else
// its last recorded activity, with the trailing moving average of the
// eligible ones: priced, with no recorded gap. An unpriced task has no point
// and is only counted. The Model and Effort options are the primary settings
// the finished tasks show in any launch workflow, so switching workflow keeps
// every choice on offer.
import {
  movingAverageTasks,
  type TokenIndexAnswer,
  type TokenIndexCohort,
} from "../src/usageTokenIndex.ts";
import {
  finishedTask,
  launchWorkflowOf,
  primarySetting,
  tokenIndexTask,
  usageModel,
  type UsageReading,
} from "./tokenIndexTask.ts";
import type { UsageTaskSummary } from "./usageTaskSummary.ts";

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

export function tokenIndexCohort(
  summary: UsageTaskSummary,
  reading: UsageReading,
  cohort: TokenIndexCohort,
): TokenIndexAnswer {
  const { projects, launches, tariff } = reading;
  const population = summary.tasks.flatMap((task) =>
    task.project !== null && projects.has(task.project)
      ? (finishedTask(task, launches) ?? [])
      : [],
  );
  const weighed = population
    .filter(
      (task) =>
        launchWorkflowOf(task.workflow) === cohort.workflow &&
        matches(cohort.model, primarySetting(task, "model")) &&
        matches(cohort.effort, primarySetting(task, "effort")),
    )
    .map((task) => tokenIndexTask(task, reading));
  const tasks = weighed
    .filter((task) => typeof task === "object")
    .sort(
      (a, b) =>
        Date.parse(a.endedAt) - Date.parse(b.endedAt) ||
        a.id.localeCompare(b.id),
    );
  // Partial tasks' missing usage would pull the trend down.
  const eligible = tasks.filter((task) => task.coverage.kind === "measured");
  const average = eligible.flatMap((task, at) => {
    if (at + 1 < movingAverageTasks) return [];
    const latest = eligible.slice(at + 1 - movingAverageTasks, at + 1);
    const total = latest.reduce((sum, each) => sum + each.index, 0);
    return [{ at: task.endedAt, value: total / movingAverageTasks }];
  });
  return {
    cohort,
    options: {
      models: observed(
        population.map((task) => primarySetting(task, "model")),
      ).map((id) => usageModel(id, tariff)),
      efforts: observed(
        population.map((task) => primarySetting(task, "effort")),
      ),
    },
    tariff: { version: tariff.version, label: tariff.label },
    checkedAt: summary.checkedAt,
    tasks,
    unpriced: weighed.filter((task) => task === "unpriced").length,
    average,
  };
}
