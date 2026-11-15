// One cohort's Token index chart from the per-task usage summary
// (./usageTaskSummary.ts): each finished task of a project configured now,
// hidden ones included, in the chosen launch workflow, weighed under one
// tariff version (./tokenIndex.ts) and placed at its reported outcome time,
// or else its last recorded activity, with the trailing moving average.
// A recovered task has no open session, so it is finished; a retained
// launch is finished once it reports an outcome.
import { launchWorkflows } from "../src/launchWorkflow.ts";
import {
  movingAverageTasks,
  type TokenIndexAnswer,
  type TokenIndexTask,
} from "../src/usageTokenIndex.ts";
import { tokenIndex } from "./tokenIndex.ts";
import type { SummaryTask, UsageTaskSummary } from "./usageTaskSummary.ts";
import type { UsageTariff } from "./usageTariffs.ts";

// A retained launch records its workflow; a recovered task, the skill its
// directive invoked.
function launchWorkflowOf(workflow: string | null): string | null {
  if (workflow === null || workflow === "ad-hoc" || workflow in launchWorkflows)
    return workflow;
  return (
    Object.entries(launchWorkflows).find(
      ([, spec]) => spec.skill === workflow,
    )?.[0] ?? null
  );
}

const finished = (task: SummaryTask) =>
  task.kind === "recovered" || task.outcome !== null;

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
): TokenIndexAnswer {
  const projects = new Set(configuredProjects);
  const tasks = summary.tasks
    .filter(
      (task) =>
        task.project !== null &&
        projects.has(task.project) &&
        launchWorkflowOf(task.workflow) === "execution" &&
        finished(task),
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
    cohort: { tool: "codex", workflow: "execution" },
    tariff: { version: tariff.version, label: tariff.label },
    checkedAt: summary.checkedAt,
    tasks,
    average,
  };
}
