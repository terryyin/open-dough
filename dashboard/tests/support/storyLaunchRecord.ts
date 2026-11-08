// Story A's launch record naming its worktree (./storyReviewWorktree.ts),
// kept in the machine launch store (./launchStore.ts).

import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { branch } from "./storyReviewWorktree.ts";

// Story A's execution in the session given, as one the synthetic `claude`
// lists, launched now; callers state what its start established.
export const storyALaunch = (
  { sessionId, shortId } = { sessionId: "story-a-session", shortId: "story-a" },
) =>
  makeMe.aLaunchRecord
    .executing({ identity: queuedIdentity, title: "Story A" })
    .inClaudeSession({ sessionId, shortId })
    .launchedAt(new Date().toISOString());

// Story A's launch record, its start naming the worktree, of the session
// given.
export const storyALaunchRecord = (
  workspace: string,
  session?: { sessionId: string; shortId: string },
): LaunchRecord =>
  storyALaunch(session).onStoryBranch({ workspace, branch }).please();

// Story A's kept launch record, its start naming the worktree.
export const keepLaunchRecord = (
  dashboard: DashboardServer,
  workspace: string,
) => {
  keepLaunchRecords(dashboard, [storyALaunchRecord(workspace)]);
};
