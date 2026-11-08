// Story A's launch record naming its worktree (./storyReviewWorktree.ts),
// written into the machine store as a launch would keep it.

import { mkdir, writeFile } from "node:fs/promises";
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

// The kept launch records of the project `source`, written into the machine
// store.
export async function keepLaunchRecords(
  dashboard: DashboardServer,
  records: readonly LaunchRecord[],
  source = "open-dough",
) {
  const store = path.join(
    dashboard.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  await mkdir(path.dirname(store), { recursive: true });
  await writeFile(store, JSON.stringify({ [source]: records }));
}

// Story A's kept launch record, its start naming the worktree.
export const keepLaunchRecord = (
  dashboard: DashboardServer,
  workspace: string,
) => keepLaunchRecords(dashboard, [storyALaunchRecord(workspace)]);
