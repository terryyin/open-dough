// Reconstruct task units without inventing an operational LaunchRecord. Native
// identity is stable while titles, revisions and corroborating sources enrich it.
import path from "node:path";
import { readConfiguredUsageProjects } from "./configuredProjectDocument.ts";
import type { ConfiguredProject } from "./projectConfiguration.ts";
import {
  historicalUsageStory,
  usageGit,
  usageRevisionAt,
} from "./historicalUsageStory.ts";
import { nativeTaskKey } from "./nativeTaskActivity.ts";
import type { NativeTaskFact } from "./nativeTaskFacts.ts";
import { canonicalUsageTasks } from "./usageTaskReconciliation.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import type {
  UsageObservation,
  UsageSource,
  UsageTask,
} from "./usageRecords.ts";

function repositoryName(value: string | undefined) {
  return value
    ?.replace(/^git@github\.com:/i, "")
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\.git\/?$/, "")
    .replace(/\/$/, "")
    .toLowerCase();
}
async function projectFor(
  fact: NativeTaskFact,
  projects: readonly ConfiguredProject[],
) {
  const recorded = repositoryName(fact.repository);
  const origin =
    recorded ??
    (fact.cwd
      ? repositoryName(
          await usageGit(fact.cwd, ["remote", "get-url", "origin"]),
        )
      : undefined);
  if (origin) {
    const matches = projects.filter(
      (project) => repositoryName(project.repository) === origin,
    );
    return {
      project: matches.length === 1 ? matches[0] : undefined,
      unrelated: matches.length === 0,
    };
  }
  const common = fact.cwd
    ? await usageGit(fact.cwd, [
        "rev-parse",
        "--path-format=absolute",
        "--git-common-dir",
      ])
    : undefined;
  const matches: ConfiguredProject[] = [];
  for (const project of projects) {
    if (fact.cwd && path.resolve(fact.cwd) === path.resolve(project.localPath))
      matches.push(project);
    else if (
      common &&
      common ===
        (await usageGit(project.localPath, [
          "rev-parse",
          "--path-format=absolute",
          "--git-common-dir",
        ]))
    )
      matches.push(project);
  }
  return {
    project: matches.length === 1 ? matches[0] : undefined,
    unrelated: false,
  };
}
export async function recoveredUsageTasks(
  home: string,
  facts: NativeTaskFact[],
  activities: ReadonlyMap<string, UsageObservation[]>,
  since: number,
  excluded?: (fact: NativeTaskFact) => void,
): Promise<UsageTask[]> {
  const projects = readConfiguredUsageProjects(home);
  const tasks: UsageTask[] = [];
  for (const fact of facts) {
    const activity = activities.get(nativeTaskKey(fact)) ?? [];
    if (!(fact.at && Date.parse(fact.at) >= since) && activity.length === 0)
      continue;
    const mapped = await projectFor(fact, projects);
    if (mapped.unrelated) {
      excluded?.(fact);
      continue;
    }
    const conflictingProject = Boolean(
      fact.projectHint &&
      mapped.project &&
      fact.projectHint !== mapped.project.id,
    );
    const project = conflictingProject ? undefined : mapped.project;
    const fieldSources: Record<string, UsageSource[]> = {
      host: [fact.source],
      sessionId: [fact.source],
      rootTurnId: [fact.source],
      origin: [fact.source],
    };
    const context = fact.contextSource ?? fact.source;
    const gaps = [
      ...(conflictingProject ? ["contradictory-project-evidence"] : []),
      "retained-native-evidence-only",
      ...(fact.outcome ? [] : ["task-outcome-unknown"]),
    ];
    if (project)
      fieldSources["project"] = [
        context,
        {
          kind: "history",
          file: path.join(
            home,
            ".open-dough/dashboard/projects-production.json",
          ),
        },
      ];
    else gaps.push("unresolved-project");
    const revision =
      fact.revision ??
      (fact.cwd ? await usageRevisionAt(fact.cwd, fact.at) : undefined);
    const story =
      project && revision && fact.storyReference
        ? await historicalUsageStory(project, revision, fact.storyReference)
        : undefined;
    if (story) {
      fieldSources["identity"] = [
        fact.source,
        context,
        ...(fact.revisionSource ? [fact.revisionSource] : []),
        ...story.sources,
      ];
      if (story.title)
        fieldSources["title"] = [
          fact.source,
          context,
          ...(fact.revisionSource ? [fact.revisionSource] : []),
          ...story.sources,
        ];
    } else if (fact.storyReference)
      gaps.push(
        revision
          ? "unresolved-historical-story"
          : "missing-historical-revision",
      );
    if (!fact.workflow) gaps.push("workflow-unknown");
    if (!story) gaps.push("story-identity-unknown");
    if (!story?.title) gaps.push("story-title-unknown");
    if (fact.origin === "unknown") gaps.push("origin-unknown");
    if (!fact.at) gaps.push("task-start-unknown");
    if (Object.keys(fact.requested).length === 0)
      gaps.push("requested-settings-unknown");
    if (fact.workflow) fieldSources["workflow"] = [fact.source];
    if (fact.at) fieldSources["launchedAt"] = [fact.source];
    for (const key of Object.keys(fact.requested))
      fieldSources[`requested.${key}`] = [fact.source];
    if (fact.outcomeSource) fieldSources["outcome"] = [fact.outcomeSource];
    if (fact.reference) fieldSources["launchReference"] = [fact.source];
    const times = activity
      .flatMap((item) =>
        item.lastAt ? [item.lastAt] : item.at ? [item.at] : [],
      )
      .sort();
    const last = times.at(-1);
    if (last)
      fieldSources["lastActivityAt"] = activity
        .filter((item) => item.at === last || item.lastAt === last)
        .flatMap((item) =>
          item.measurements.map((measurement) => measurement.source),
        );
    tasks.push({
      id: JSON.stringify([fact.host, fact.sessionId, fact.turnId]),
      kind: "recovered",
      project: project?.id ?? null,
      host: fact.host,
      sessionId: fact.sessionId,
      rootTurnId: fact.turnId,
      nativeTurns: [fact.turnId],
      workflow: fact.workflow,
      identity: story?.identity ?? null,
      title: story?.title ?? null,
      launchedAt: fact.at ?? null,
      ...(last ? { lastActivityAt: last } : {}),
      outcome: fact.outcome ?? null,
      origin: conflictingProject ? "unknown" : fact.origin,
      ...(fact.reference ? { launchReference: fact.reference } : {}),
      requested: fact.requested,
      fieldSources,
      sources: uniqueFacts(Object.values(fieldSources).flat()),
      gaps,
    });
  }
  return canonicalUsageTasks(tasks);
}
