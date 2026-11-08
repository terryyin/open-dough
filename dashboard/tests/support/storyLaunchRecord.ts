// The machine store's kept launch records, written as launches would keep
// them, and Story A's record naming its worktree (./storyReviewWorktree.ts).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { branch } from "./storyReviewWorktree.ts";

// Story A's launch record, its start naming the worktree, of the session
// given, as one the synthetic `claude` lists, launched now.
export const storyALaunchRecord = (
  workspace: string,
  { sessionId, shortId } = { sessionId: "story-a-session", shortId: "story-a" },
): LaunchRecord =>
  makeMe.aLaunchRecord
    .executing({ identity: queuedIdentity, title: "Story A" })
    .onStoryBranch({ workspace, branch })
    .inClaudeSession({ sessionId, shortId })
    .launchedAt(new Date().toISOString())
    .please();

const launchStore = (dashboard: DashboardServer) =>
  path.join(dashboard.home, ".open-dough/dashboard/agent-launches.json");

// The kept launch records of every project, by project, written into the
// machine store as one whole replacement.
export async function keepProjectLaunchRecords(
  dashboard: DashboardServer,
  byProject: Readonly<Record<string, readonly LaunchRecord[]>>,
) {
  const store = launchStore(dashboard);
  await mkdir(path.dirname(store), { recursive: true });
  await writeFile(store, JSON.stringify(byProject));
}

// Appends `records` to the project `source`'s records already kept in the
// machine store, leaving every other project's as kept.
export async function keepMoreLaunchRecords(
  dashboard: DashboardServer,
  records: readonly LaunchRecord[],
  source = "open-dough",
) {
  const kept = JSON.parse(
    await readFile(launchStore(dashboard), "utf8"),
  ) as Record<string, readonly LaunchRecord[]>;
  await keepProjectLaunchRecords(dashboard, {
    ...kept,
    [source]: [...(kept[source] ?? []), ...records],
  });
}

// The kept launch records of the project `source`, written into the machine
// store.
export const keepLaunchRecords = (
  dashboard: DashboardServer,
  records: readonly LaunchRecord[],
  source = "open-dough",
) => keepProjectLaunchRecords(dashboard, { [source]: records });

// Story A's kept launch record, its start naming the worktree.
export const keepLaunchRecord = (
  dashboard: DashboardServer,
  workspace: string,
) => keepLaunchRecords(dashboard, [storyALaunchRecord(workspace)]);
