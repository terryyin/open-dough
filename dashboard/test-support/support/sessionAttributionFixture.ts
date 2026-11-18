// Shared Board fixture for session-attribution.spec.ts: preparing journey,
// four kept launch records at distinct saved revisions, and settled overview.

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { storyCardSessions, parts } from "../dashboardPage.ts";
import {
  publishPreparingJourney,
  storyC,
  type PreparingJourney,
} from "../preparingJourney.ts";
import { openUntilRead, reloadUntilRead } from "../pageRequestNotes.ts";
import { keepLaunchRecords } from "./launchStore.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { DashboardServer } from "./dashboardServer.ts";
import { collectAuthenticatedReads } from "./historicalCreditReads.ts";

export type SessionAttributionFixture = {
  readonly journey: PreparingJourney;
  readonly reused: string;
  readonly unreadableRevision: string;
  readonly authenticatedReads: string[];
  readonly show: (revision: string) => Promise<void>;
  readonly sessionId: string;
  readonly matchingId: string;
  readonly card: Locator;
  readonly original: Locator;
  readonly legacySession: Locator;
  readonly missing: Locator;
  readonly duplicate: Locator;
  readonly historical: string;
  readonly unknown: string;
};

export async function openSessionAttributionBoard(
  page: Page,
  dashboard: DashboardServer,
  afterGitHubStops: (cleanup: () => void | Promise<void>) => void,
): Promise<SessionAttributionFixture> {
  const journey = await publishPreparingJourney();
  afterGitHubStops(journey.cleanup);
  const reused = await journey.reuseRefiner();
  const unreadableRevision = "ff".repeat(20);
  const authenticatedReads = collectAuthenticatedReads(page);
  const show = async (revision: string) => {
    execFileSync("git", [
      "-C",
      journey.origin,
      "update-ref",
      "refs/heads/main",
      revision,
    ]);
    await reloadUntilRead(page);
  };
  const workspace = path.join(
    dashboard.home,
    "git/open-dough/.worktrees/c-refine",
  );
  mkdirSync(workspace, { recursive: true });
  const sessionId = dashboard.claudeListsSession({
    name: storyC,
    cwd: workspace,
    startedAt: Date.now(),
  });
  // Story C's refinements in its preparation workspace: the
  // original asked for Fable; the others for claude-opus-5-5, one whose
  // preparation recorded no published revision, one whose published revision
  // cannot be read, and one, listed, that completed.
  const refinement = (model: string) =>
    makeMe.aLaunchRecord
      .refining({ identity: "SEED-C#c", title: storyC })
      .requestingModel(model);
  const preparation = {
    workspace,
    branch: "claude/c-refine",
    agent: journey.preparers.refining,
  };
  const published = {
    ...preparation,
    publishedSha: journey.refiningAllocation,
  };
  const record = refinement("Fable")
    .inClaudeSession({ sessionId })
    .onStoryBranch(published)
    .please();
  const legacy = refinement("claude-opus-5-5")
    .inClaudeSession({ sessionId: "22222222-aaaa-bbbb-cccc-000000000002" })
    .onStoryBranch(preparation)
    .please();
  const unreadable = refinement("claude-opus-5-5")
    .inClaudeSession({ sessionId: "33333333-aaaa-bbbb-cccc-000000000003" })
    .onStoryBranch({ ...preparation, publishedSha: unreadableRevision })
    .please();
  const matchingId = dashboard.claudeListsSession({
    name: storyC,
    cwd: workspace,
    startedAt: Date.now(),
  });
  const matching = refinement("claude-opus-5-5")
    .inClaudeSession({ sessionId: matchingId })
    .onStoryBranch(published)
    .completedWith({ message: "Ready for slice planning" })
    .please();
  keepLaunchRecords(dashboard, [record, legacy, unreadable, matching]);
  execFileSync("git", [
    "-C",
    journey.origin,
    "update-ref",
    "refs/heads/main",
    journey.announced,
  ]);
  await publishCommittedOrigin(page, {
    repoDir: journey.origin,
    revision: journey.announced,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: storyC });
  return {
    journey,
    reused,
    unreadableRevision,
    authenticatedReads,
    show,
    sessionId,
    matchingId,
    card,
    original: storyCardSessions(card).filter({ hasText: sessionId }),
    legacySession: storyCardSessions(card).filter({ hasText: "22222222" }),
    missing: storyCardSessions(card).filter({ hasText: "33333333" }),
    duplicate: storyCardSessions(card).filter({ hasText: matchingId }),
    historical: `Session assignment: ${journey.preparers.refining} · Integration Checkout · Claude Code`,
    unknown: `Session assignment: ${journey.preparers.refining} · Human developer unknown · Claude Code`,
  };
}
