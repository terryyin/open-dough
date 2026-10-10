// Story A's launch record naming its worktree (./storyReviewWorktree.ts),
// written into the machine store as a launch would keep it.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { queuedIdentity } from "./startOrigin.ts";
import { branch } from "./storyReviewWorktree.ts";

// Story A's launch record, its start naming the worktree, of the session
// given, as one the synthetic `claude` lists.
export function storyALaunchRecord(
  workspace: string,
  { sessionId, shortId } = { sessionId: "story-a-session", shortId: "story-a" },
): LaunchRecord {
  return {
    request: {
      source: "open-dough",
      identity: queuedIdentity,
      title: "Story A",
      workflow: "execution",
      host: "claude",
    },
    session: {
      host: "claude",
      sessionId,
      shortId,
      name: "Story A",
    },
    start: {
      identity: queuedIdentity,
      publisherId: "a1b2c3",
      workspace,
      branch,
      mode: "story-branch",
      remote: "origin",
      target: "main",
      publishedSha: "b2".repeat(20),
    },
    launchedAt: new Date().toISOString(),
  };
}

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
