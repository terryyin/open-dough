// A settled start reconciles with published state
// (../../src/startupReconciliation.ts): the real installed starts publish to a
// real bare origin (../support/startOrigin.ts) that the page reads as GitHub
// would, following its pushes (../committedOrigin.ts), and GitHub's comparison
// of two commits is answered from that origin's own history. Only a fully
// read snapshot of the accepted revision, or of one that contains it, returns
// the story's actions once its native outcome settled: an older snapshot
// arriving late or an unrelated revision keeps them unavailable, while the
// published column and facts show as read. The session goes on working. Once
// reconciled, a reload reconciles it again without asking GitHub.

import type { Locator } from "@playwright/test";
import { attempts } from "../agentLaunchBoundary.ts";
import {
  passTimeUntilAsked,
  passTimeUntilChecked,
  pausePageClock,
} from "../autoRefreshJourney.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts, storyCardSessions } from "../dashboardPage.ts";
import { openUntilRead, reloadUntilRead } from "../pageRequestNotes.ts";
import { openSessionStartReason } from "../../src/agentLaunch.ts";
import { expect } from "../dashboardTest.ts";
import {
  commitAnswer,
  noConnection,
  rateLimitedAnswer,
} from "../originAnswers.ts";
import { recoveryOf } from "../responsiveRecovery.ts";
import {
  commitOn,
  expectProtected,
  openStories,
  test,
} from "../responsiveStart.ts";

const openSessionDescription = new RegExp(
  openSessionStartReason.replace(/[.]/g, "\\."),
);

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

const waiting = "Waiting for published story state";

// After one full expectProtected, later protection states only recheck that
// Taken actions stay unavailable — source-link detail was already observed.
async function expectActionsUnavailable(card: Locator) {
  await expect(card.getByRole("button", { disabled: false })).toHaveCount(1);
  await expect(
    card.getByRole("button", { name: "Inspect story" }),
  ).toBeDisabled();
}

test("a Take's older snapshot arriving late and an unrelated revision keep it protected; its accepted revision, fully read, returns the Taken actions while the session works", async ({
  page,
  dashboard,
  origin,
}) => {
  const before = (await origin.originGit("rev-parse", "main")).trim();
  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  await pausePageClock(page);
  // This journey never uses Story B; skip waiting for it after the board loads.
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: before,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await openUntilRead(page);
  const { backlog, taken } = parts(page);
  const story = backlog.getByRole("article", { name: "Story A" });
  const takenStory = taken.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await expect(story).toBeVisible();

  await story.getByRole("button", { name: "Start execution" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);

  // A check asked before the Take is published, and the fresh read the
  // start's settling asks, answer only after it settles, with the revision
  // before it. Release the held Claude with the push so launch settles while
  // publication is observed, and release the held tip so the stale read can
  // finish while the session appears — instead of waiting for each in turn.
  published.answerWith("main", commitAnswer(before));
  const releaseRef = published.hold("main");
  await passTimeUntilAsked(page);
  push.release();
  dashboard.releaseHeldClaude();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.publication, {
      timeout: 30_000,
    })
    .toMatchObject({ kind: "published" });
  const accepted = (await origin.originGit("rev-parse", "main")).trim();
  expect((await attempts(dashboard))[0]?.publication).toEqual({
    kind: "published",
    revision: accepted,
  });
  releaseRef();
  await expect(storyCardSessions(story)).toHaveCount(1, { timeout: 30_000 });
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${before.slice(0, 7)}`,
  );
  await expect(story).toContainText(waiting);
  await expectProtected(story);
  await expect(takenStory).toHaveCount(0);

  // An unrelated revision is not the published Take; a comparison that
  // fails proves nothing either, and is asked again for the next read.
  const unrelated = await commitOn(origin, before);
  published.answerWith("main", commitAnswer(unrelated));
  const restoreCompare = published.answerWith("compare", noConnection);
  await passTimeUntilChecked(page);
  await expect(story).toContainText(
    `The local GitHub CLI could not reach GitHub while reading whether ${unrelated} contains ${accepted}.`,
  );
  await expectActionsUnavailable(story);
  restoreCompare();
  // Tip is still the unrelated revision; only a reload forces the compare
  // again once the failure answer is restored.
  await reloadUntilRead(page);
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${unrelated.slice(0, 7)}`,
  );
  await expect(story).not.toContainText("could not reach GitHub");
  await expect(story).toContainText(waiting);
  await expectActionsUnavailable(story);

  // The accepted revision moves the story to Taken; its actions wait for
  // every fact of the snapshot.
  const releaseSeed = published.hold(".planning/seeds/A.md");
  published.answerWith("main", commitAnswer(accepted));
  await passTimeUntilChecked(page);
  await expect(takenStory).toBeVisible();
  await expect(story).toHaveCount(0);
  // Profiles now arrive independently; their known assignment still cannot
  // reconcile a snapshot whose canonical preparation remains unread.
  await expect(
    takenStory.locator(".story-card-owner .owner-line"),
  ).toContainText("Claude Code");
  await expect(takenStory).toContainText(waiting);
  await expectActionsUnavailable(takenStory);
  releaseSeed();
  await expect(takenStory).not.toContainText(waiting);
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();

  // A later revision containing it keeps them.
  const descendant = await commitOn(origin, accepted);
  published.answerWith("main", commitAnswer(descendant));
  await passTimeUntilChecked(page);
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${descendant.slice(0, 7)}`,
  );
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  const compares = [
    `${accepted}...${before}`,
    `${accepted}...${unrelated}`,
    `${accepted}...${unrelated}`,
  ];
  expect(published.compares).toEqual(compares);

  // Reconciled, it stays so on this machine: a reload asks GitHub nothing
  // again, even while GitHub would refuse the comparison.
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.reconciledAt)
    .toBeDefined();
  published.answerWith("compare", rateLimitedAnswer());
  await reloadUntilRead(page);
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${descendant.slice(0, 7)}`,
  );
  await expect(storyCardSessions(takenStory)).toHaveCount(1);
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  await expect(takenStory).not.toContainText(waiting);
  await expect(recoveryOf(page)).toHaveCount(0);
  expect(published.compares).toEqual(compares);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});

test("a refinement's announcement, read before its session settles, keeps the story protected until it does, then holds Starts for the open session while it works", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("held");
  await pausePageClock(page);
  const { published, story } = await openStories(page, origin);

  await story.getByRole("button", { name: "Start refinement" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.publication.kind, {
      timeout: 30_000,
    })
    .toBe("published");
  const accepted = (await origin.originGit("rev-parse", "main")).trim();

  // The announcement is read while the session is still starting.
  await passTimeUntilChecked(page);
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${accepted.slice(0, 7)}`,
  );
  await expect(story.locator(".story-card-preparing")).toBeVisible();
  await expect(story).toContainText("Local startup in progress");
  await expectProtected(story);

  dashboard.releaseHeldClaude();
  await expect(storyCardSessions(story)).toHaveCount(1, { timeout: 30_000 });
  await expect(story).not.toContainText("Local startup in progress");
  await expect(story).not.toContainText(waiting);
  const startRefinement = story.getByRole("button", {
    name: "Start refinement",
  });
  const startExecution = story.getByRole("button", {
    name: "Start execution",
  });
  await expect(startRefinement).toBeDisabled();
  await expect(startExecution).toBeDisabled();
  await expect(startRefinement).toHaveAccessibleDescription(
    openSessionDescription,
  );
  await expect(startExecution).toHaveAccessibleDescription(
    openSessionDescription,
  );
  await expect(
    story.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  expect(published.compares).toEqual([]);
});
