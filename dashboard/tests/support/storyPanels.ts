// Story B beside Story A (./storyReviewWorktree.ts) for the page's one side
// panel (../story-panel-switching.spec.ts, ../story-panel-replacement.spec.ts):
// Story B's real worktree with one committed file of its own, and its kept
// launch record, whose session ended with a final report. Also what the page
// and the machine store say of the panel's items and of a kept session.

import path from "node:path";
import { writeFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { recordsOf } from "../agentLaunchBoundary.ts";
import { otherQueuedIdentity } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";
import { storyALaunchRecord } from "./storyLaunchRecord.ts";

const storyBBranch = "claude/story-b";
export const storyBReport = "Story B's final report: one file of its own.";

// Story B's worktree off trunk, with one committed file of its own.
export function storyBWorktree(project: string) {
  const workspace = path.join(project, ".worktrees", "story-b");
  git(project, "worktree", "add", "--quiet", "-b", storyBBranch, workspace);
  writeFileSync(path.join(workspace, "story-b.txt"), "story b\n");
  git(workspace, "add", "story-b.txt");
  git(workspace, "commit", "--quiet", "-m", "story b file");
  return workspace;
}

// Story B's kept launch record: its session ended with a final report.
export function storyBLaunchRecord(workspace: string): LaunchRecord {
  const { start } = storyALaunchRecord(workspace);
  if (start === undefined) throw new Error("Story A's record has a start.");
  return {
    request: {
      source: "open-dough",
      identity: otherQueuedIdentity,
      title: "Story B",
      workflow: "execution",
      host: "claude",
    },
    session: {
      host: "claude",
      sessionId: "story-b-session",
      shortId: "story-b",
      name: "Story B",
    },
    start: {
      ...start,
      identity: otherQueuedIdentity,
      branch: storyBBranch,
    },
    completion: {
      receipt: "6f1f8e0e-3c1d-4a51-9a43-7b0c8c3f2a10",
      reference: "0b7f5f0c-5f8e-4c1c-8b8e-3d6f1a2b9c40",
      outcome: "completed",
      message: storyBReport,
      receivedAt: new Date().toISOString(),
    },
    launchedAt: new Date().toISOString(),
  };
}

// A session the synthetic `claude` lists, by its ID and short ID.
export const listed = (sessionId: string) => ({
  sessionId,
  shortId: sessionId.slice(0, 8),
});

// The panel's named items: whichever of them the page shows.
export const panelItems = (page: Page) =>
  page.getByRole("region", {
    name: /^(Terminal|Final report|Review changes)$/,
  });

// What a session's kept record says of it: its state and whether it is done.
export async function keptSession(
  dashboard: Parameters<typeof recordsOf>[0],
  sessionId: string,
) {
  const kept = (await recordsOf(dashboard, "open-dough")).find(
    (record) =>
      (record as { session: { sessionId: string } }).session.sessionId ===
      sessionId,
  ) as { doneAt?: string; sessionState?: unknown } | undefined;
  return { doneAt: kept?.doneAt, sessionState: kept?.sessionState };
}
