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
import { keepLaunchRecords } from "./storyLaunchRecord.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
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
  const record = {
    request: {
      source: "open-dough",
      identity: "SEED-C#c",
      title: storyC,
      workflow: "refinement",
      host: "claude",
      model: "Fable",
    },
    session: {
      host: "claude",
      sessionId,
      shortId: sessionId.slice(0, 8),
      name: storyC,
    },
    preparation: {
      identity: "SEED-C#c",
      workspace,
      branch: "claude/c-refine",
      remote: "origin",
      target: "main",
      agent: journey.preparers.refining,
      publishedSha: journey.refiningAllocation,
    },
    launchedAt: new Date().toISOString(),
  } satisfies LaunchRecord;
  const legacy: LaunchRecord = {
    ...record,
    request: { ...record.request, model: "claude-opus-5-5" },
    session: {
      host: "claude",
      name: storyC,
      sessionId: "22222222-aaaa-bbbb-cccc-000000000002",
      shortId: "22222222",
    },
    preparation: { ...record.preparation, publishedSha: undefined },
  };
  const unreadable: LaunchRecord = {
    ...record,
    request: { ...record.request, model: "claude-opus-5-5" },
    session: {
      host: "claude",
      name: storyC,
      sessionId: "33333333-aaaa-bbbb-cccc-000000000003",
      shortId: "33333333",
    },
    preparation: { ...record.preparation, publishedSha: unreadableRevision },
  };
  const matchingId = dashboard.claudeListsSession({
    name: storyC,
    cwd: workspace,
    startedAt: Date.now(),
  });
  const matching: LaunchRecord = {
    ...record,
    request: { ...record.request, model: "claude-opus-5-5" },
    session: {
      host: "claude",
      name: storyC,
      sessionId: matchingId,
      shortId: matchingId.slice(0, 8),
    },
    completion: {
      receipt: "44444444-aaaa-4bbb-8ccc-000000000005",
      reference: "44444444-aaaa-4bbb-8ccc-000000000006",
      outcome: "completed",
      message: "Ready for slice planning",
      receivedAt: new Date().toISOString(),
    },
  };
  await keepLaunchRecords(dashboard, [record, legacy, unreadable, matching]);
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
