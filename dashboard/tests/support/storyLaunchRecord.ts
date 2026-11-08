// Story A's launch record naming its worktree (./storyReviewWorktree.ts),
// kept in the machine launch store (./launchStore.ts).

import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { keepLaunchRecords } from "./launchStore.ts";
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

// Story A's kept launch record, its start naming the worktree.
export const keepLaunchRecord = (
  dashboard: DashboardServer,
  workspace: string,
) => {
  keepLaunchRecords(dashboard, [storyALaunchRecord(workspace)]);
};
