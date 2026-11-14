// Report persisted facts in explicit, disjoint accounting populations. Retained
// provenance gaps are not a count of currently missing fields or scan failures.
import { readConfiguredUsageProjects } from "./configuredProjectDocument.ts";
import type {
  UsageHistory,
  UsageObservation,
  UsageTask,
  UsageGap,
} from "./usageRecords.ts";

const categories = [
  "uncachedInput",
  "cacheRead",
  "cacheWrite",
  "output",
] as const;
function counts(values: string[]) {
  const result: Record<string, number> = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
}
function earliest(values: (string | null | undefined)[]) {
  return (
    values.filter((value): value is string => Boolean(value)).sort()[0] ?? null
  );
}
function usage(observations: UsageObservation[]) {
  const tokens: Record<string, number | null> = {};
  const unmeasured: Record<string, number> = {};
  for (const category of categories) {
    const measured = observations.flatMap((item) =>
      item.tokens[category] === null ? [] : [item.tokens[category]],
    );
    tokens[category] = measured.length
      ? measured.reduce((sum, value) => sum + value, 0)
      : null;
    unmeasured[category] = observations.length - measured.length;
  }
  return {
    observations: observations.length,
    tokens,
    unmeasured,
    responseCoverage: {
      measured: observations.filter((item) => item.coverage === "measured")
        .length,
      partial: observations.filter((item) => item.coverage === "partial")
        .length,
      unavailable: observations.filter(
        (item) => item.coverage === "unavailable",
      ).length,
    },
    earliestUsage: earliest(observations.map((item) => item.at)),
  };
}
export function usageImportSummary(
  history: UsageHistory,
  home: string,
  since: number,
  scanGaps: UsageGap[],
) {
  const projects = readConfiguredUsageProjects(home);
  const configured = new Set(projects.map((project) => project.id));
  const inWindow = (at: string | null | undefined) =>
    Boolean(at && Date.parse(at) >= since);
  const observations = Object.values(history.observations).filter((item) =>
    inWindow(item.at),
  );
  const associated = new Set(
    observations.flatMap((item) => {
      const id = history.associations[item.id]?.taskId;
      return id ? [id] : [];
    }),
  );
  const tasks = Object.values(history.tasks);
  const work = tasks.filter(
    (task) =>
      inWindow(task.launchedAt) ||
      inWindow(task.lastActivityAt) ||
      associated.has(task.id),
  );
  const unresolvedWindowTasks = tasks.filter(
    (task) =>
      !task.launchedAt && !task.lastActivityAt && !associated.has(task.id),
  ).length;
  function population(selected: UsageTask[]) {
    const ids = new Set(selected.map((task) => task.id));
    const responses = observations.filter((item) => {
      const id = history.associations[item.id]?.taskId;
      return Boolean(id && ids.has(id));
    });
    const responsesByTask = new Map<string, UsageObservation[]>();
    for (const response of responses) {
      const id = history.associations[response.id]?.taskId;
      if (!id) continue;
      const owned = responsesByTask.get(id);
      if (owned) owned.push(response);
      else responsesByTask.set(id, [response]);
    }
    const taskCoverage = { measured: 0, partial: 0, unavailable: 0 };
    for (const task of selected) {
      const owned = responsesByTask.get(task.id) ?? [];
      const coverage =
        owned.length && owned.every((item) => item.coverage === "measured")
          ? "measured"
          : owned.some((item) => item.coverage !== "unavailable")
            ? "partial"
            : "unavailable";
      taskCoverage[coverage]++;
    }
    return {
      tasks: selected.length,
      ...usage(responses),
      taskCoverage,
      byHost: Object.fromEntries(
        (["codex", "claude"] as const).map((host) => [
          host,
          {
            tasks: selected.filter((task) => task.host === host).length,
            ...usage(responses.filter((item) => item.host === host)),
          },
        ]),
      ),
      kinds: {
        launch: selected.filter((task) => task.kind === "launch").length,
        recovered: selected.filter((task) => task.kind === "recovered").length,
      },
      origins: {
        dashboard: selected.filter((task) => task.origin === "dashboard")
          .length,
        native: selected.filter((task) => task.origin === "native").length,
        unknown: selected.filter((task) => task.origin === "unknown").length,
      },
      earliestTaskStart: earliest(selected.map((task) => task.launchedAt)),
      firstInWindowActivity: earliest([
        ...selected.map((task) =>
          inWindow(task.launchedAt) ? task.launchedAt : null,
        ),
        ...responses.map((item) => item.at),
        ...selected.map((task) =>
          inWindow(task.lastActivityAt) ? task.lastActivityAt : null,
        ),
      ]),
      missingTaskFields: Object.fromEntries(
        (
          [
            "project",
            "workflow",
            "identity",
            "title",
            "launchedAt",
            "outcome",
          ] as const
        ).map((field) => [
          field,
          selected.filter(
            (task) => task[field] === null || task[field] === undefined,
          ).length,
        ]),
      ),
      taskGapProvenance: counts(selected.flatMap((task) => task.gaps)),
      observationGaps: counts(responses.flatMap((item) => item.gaps)),
      associationGaps: counts(
        responses.flatMap((item) => history.associations[item.id]?.gaps ?? []),
      ),
    };
  }
  return {
    configuredProjects: projects.map(({ id, repository, hidden }) => ({
      id,
      repository,
      hidden: Boolean(hidden),
    })),
    configuredWork: population(
      work.filter(
        (task) => task.project !== null && configured.has(task.project),
      ),
    ),
    unknownProjectWork: population(
      work.filter((task) => task.project === null),
    ),
    outOfRosterWork: population(
      work.filter(
        (task) => task.project !== null && !configured.has(task.project),
      ),
    ),
    unassignedUsage: usage(
      observations.filter((item) => !history.associations[item.id]?.taskId),
    ),
    outsideWindowTasks: tasks.length - work.length - unresolvedWindowTasks,
    unresolvedWindowTasks,
    undatedObservations: Object.values(history.observations).filter(
      (item) => !item.at,
    ).length,
    currentScanGaps: counts(scanGaps.map((gap) => gap.code)),
    retainedGapProvenance: counts(history.gaps.map((gap) => gap.code)),
  };
}
