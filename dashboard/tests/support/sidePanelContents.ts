// Story B beside Story A (./storyReviewWorktree.ts) for the page's one side
// panel (../../../e2e/navigation/side-panel-content-switching.spec.ts, ../../../e2e/navigation/side-panel-content-replacement.spec.ts):
// Story B's real worktree with one committed file of its own, and its kept
// launch record, a kept session without an attention message, or a Codex
// session whose saved workspace is gone, so that its final report is Codex's
// native final report alone. Also what the page and the machine store say of
// the panel's items, the review reads, and a kept session.

import path from "node:path";
import { writeFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { recordsOf } from "../agentLaunchBoundary.ts";
import type { FakeCodex } from "./fakeCodexTypes.ts";
import { keepFinalReport } from "./retainedReport.ts";
import { otherQueuedIdentity } from "./startOrigin.ts";
import { git } from "./storyReviewWorktree.ts";

export const storyBBranch = "claude/story-b";
// Story B's Codex native final report, kept in the native fixture's history.
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

// Story B's kept launch record: a kept session holding no attention message,
// launched now.
export const storyBLaunchRecord = (workspace: string): LaunchRecord =>
  makeMe.aLaunchRecord
    .executing({ identity: otherQueuedIdentity, title: "Story B" })
    .onStoryBranch({ workspace, branch: storyBBranch })
    .inClaudeSession({ sessionId: "story-b-session", shortId: "story-b" })
    .launchedAt(new Date().toISOString())
    .please();

// A Codex session whose saved workspace, retired beside `workspace`, is gone,
// its native final report `report` kept in the native fixture's history: the
// side panel reads that report from Codex alone.
export function retiredCodexSession(
  native: FakeCodex,
  workspace: string,
  report: string,
) {
  const retired = path.join(
    workspace,
    "..",
    `${path.basename(workspace)}-retired`,
  );
  keepFinalReport(native, retired, report);
  return {
    sessionId: native.threadId,
    continuation: {
      workspace: retired,
      endpoint: `unix://${native.env["FAKE_CODEX_SOCKET"]}`,
    },
  };
}

// A session the synthetic `claude` lists, by its ID and short ID.
export const listed = (sessionId: string) => ({
  sessionId,
  shortId: sessionId.slice(0, 8),
});

// Every review read the page asks from now on, by the story it names.
export function storyReviewReads(page: Page) {
  const reads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === storyReviewEndpoint)
      reads.push(url.searchParams.get("identity") ?? "");
  });
  return reads;
}

// The panel's named items: whichever of them the page shows.
export const sidePanelContents = (page: Page) =>
  page.getByRole("region", {
    name: /^(Terminal|Final report|Story review)$/,
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
