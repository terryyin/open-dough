// Published Done stories for progressive Board reads, with optional nested native sessions.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { keepLaunchRecords } from "./support/launchStore.ts";
import {
  publishedFiles,
  repository,
  workspaceEntry,
} from "./recentlyDoneRecords.ts";

export { repository };
export const doneDirectory = ".planning/done";

const hour = 60 * 60_000;

// One entry of Recently done, by its place in the newest-first list.
export type ProgressiveEntry = {
  readonly place: number;
  readonly title: string;
  readonly path: string;
  readonly identity: string;
};

export const entryName = (entry: ProgressiveEntry) => entry.title;

const labelAt = (place: number) => String(place).padStart(2, "0");

export function progressiveStories(count: number): ProgressiveEntry[] {
  return [...Array(count).keys()].map((index) => {
    const place = index + 1;
    const label = labelAt(place);
    const identity = `SEED-2${label}#progressive-${label}`;
    return {
      place,
      identity,
      title: `Finish progressive story ${label}`,
      path: `${doneDirectory}/${doneRecordFileName(identity)}`,
    };
  });
}

// The time an entry's completion or launch is placed at, before `now`.
export const placedAt = (now: number, place: number) =>
  new Date(now - place * hour - 30 * 60_000).toISOString();

// The published files: the backlog queuing the workspace story, each story's
// done record, the files `beside` names by repository path, and, once a story
// is done, the done catalog completion rebuilds from them.
export function publishedWithCatalog(
  now: number,
  entries: readonly ProgressiveEntry[],
  beside: Readonly<Record<string, string>> = {},
  workspaceTaken = false,
): Record<string, string> {
  const stories = entries.map(({ identity, title, place }) =>
    makeMe.aDoneRecord
      .with({
        identity,
        title,
        completedAt: placedAt(now, place),
        developer: "Terry Yin",
      })
      .please(),
  );
  return publishedFiles({
    ...(workspaceTaken && { backlog: { taken: [workspaceEntry] } }),
    ...(stories.length > 0 && { doneRecords: stories }),
    files: beside,
  });
}

// Keeps a story's nested Done sessions and any other explicit session fixtures.
export function keepProgressiveSessions(
  dashboard: DashboardServer,
  now: number,
  entries: readonly ProgressiveEntry[],
  nestedIn?: number,
  {
    also = [],
    source = "open-dough",
    checkout = dashboard.home,
  }: {
    readonly also?: readonly LaunchRecord[];
    readonly source?: string;
    readonly checkout?: string;
  } = {},
) {
  // A `claude` session the synthetic `claude` lists by this name, started
  // when its launch was.
  const listed = (name: string, launchedAt: string) => ({
    sessionId: dashboard.claudeListsSession({
      name,
      cwd: checkout,
      startedAt: Date.parse(launchedAt),
    }),
  });
  const doneAt = new Date(now - 10 * 60_000).toISOString();
  const records: LaunchRecord[] = entries.flatMap((entry): LaunchRecord[] => {
    if (entry.place !== nestedIn) return [];
    const story = { identity: entry.identity, title: entry.title, source };
    return [
      makeMe.aLaunchRecord.refining(story),
      makeMe.aLaunchRecord.executing(story),
      makeMe.aLaunchRecord.executing(story),
    ].map((launch, index) => {
      const launchedAt = placedAt(now, 60 + index);
      return launch
        .inClaudeSession(listed(entry.title, launchedAt))
        .launchedAt(launchedAt)
        .markedDoneAt(doneAt)
        .please();
    });
  });
  keepLaunchRecords(dashboard, [...records, ...also], source);
}
