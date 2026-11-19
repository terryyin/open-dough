// One cohort's Token index chart from the per-task usage summary
// (./usageTaskSummary.ts): each finished task (./tokenIndexTask.ts) the
// chosen tool ran, of a project configured now, hidden ones included, in the
// chosen launch workflow and, when chosen, with that primary observed model
// and effort, weighed under one tariff version and placed at its reported
// outcome time, or else its last recorded activity, with the rolling median
// of the eligible ones: priced at listed rates, with no recorded gap, each
// observation anchored on the eligible task it ends with. An unpriced
// task has no point and is only counted. The Model and Effort options are the
// primary settings the tool's finished tasks show in any launch workflow, so
// switching workflow keeps every choice on offer.
import {
  rollingMedianTasks,
  type TokenIndexAnswer,
  type TokenIndexCohort,
} from "../src/usageTokenIndex.ts";
import {
  finishedTask,
  launchWorkflowOf,
  primarySetting,
  taskEndedAt,
  tokenIndexTask,
  usageModel,
  type UsageReading,
} from "./tokenIndexTask.ts";
import type { UsageTaskSummary } from "./usageTaskSummary.ts";
import { inUsagePeriod, type UsagePeriod } from "../src/usagePeriod.ts";

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
  period?: UsagePeriod,
): Omit<TokenIndexAnswer, "checkedAt"> {
  const { projects, launches, tariff } = reading;
  const population = summary.tasks.flatMap((task) =>
    task.host === cohort.tool &&
    task.project !== null &&
    projects.has(task.project)
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
    .map((task) => ({
      value: tokenIndexTask(task, reading),
      endedAt: taskEndedAt(task),
    }));
  const tasks = weighed
    .map(({ value }) => value)
    .filter((task) => typeof task === "object")
    .sort(
      (a, b) =>
        Date.parse(a.endedAt) - Date.parse(b.endedAt) ||
        a.id.localeCompare(b.id),
    );
  // Partial tasks' missing usage would pull the trend down; an estimated
  // rate is not the tariff's.
  const eligible = tasks.filter(
    (task) =>
      task.coverage.kind === "measured" && task.substitutions === undefined,
  );
  const median = eligible.flatMap((task, at) => {
    if (at + 1 < rollingMedianTasks) return [];
    const sorted = eligible
      .slice(at + 1 - rollingMedianTasks, at + 1)
      .map(({ index }) => index)
      .sort((a, b) => a - b);
    const middle = rollingMedianTasks / 2;
    const middleTotal = sorted
      .slice(middle - 1, middle + 1)
      .reduce((sum, value) => sum + value, 0);
    return [{ at: task.endedAt, task: task.id, value: middleTotal / 2 }];
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
    tasks: tasks.filter((task) => inUsagePeriod(task.endedAt, period)),
    unpriced: weighed.filter(
      ({ value, endedAt }) =>
        value === "unpriced" && inUsagePeriod(endedAt, period),
    ).length,
    average: median.filter(({ at }) => inUsagePeriod(at, period)),
  };
}
