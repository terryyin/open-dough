// Real installed starts publish to the bare origin read through GitHub fixtures.
// A fully read accepted snapshot or descendant restores actions after native
// startup settles; older and unrelated snapshots keep protection. The session
// keeps working, and reconciliation survives reload without another comparison.
// See ../../dashboard/src/startupReconciliation.ts and ../../dashboard/test-support/support/startOrigin.ts.

import { attempts } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { nextAcceptedAttemptId } from "../../dashboard/test-support/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/test-support/acceptedAttempts.ts";
import {
  passTimeUntilAsked,
  passTimeUntilChecked,
  pausePageClock,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  givePageItsTurns,
  reloadUntilRead,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { storyCardSessions } from "../../dashboard/test-support/dashboardPage.ts";
import { openSessionStartReason } from "../../dashboard/src/agentLaunch.ts";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { publishMain } from "../../dashboard/test-support/committedOriginRepo.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { expectServedHomesReach } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  commitAnswer,
  noConnection,
  rateLimitedAnswer,
} from "../../dashboard/test-support/originAnswers.ts";
import { recoveryOf } from "../../dashboard/test-support/responsiveRecovery.ts";
import {
  commitOn,
  expectProtected,
  openStories,
  openStory,
  test,
} from "../../dashboard/test-support/responsiveStart.ts";
import { credit } from "../../dashboard/test-support/agentCredit.ts";

const openSessionDescription = new RegExp(
  openSessionStartReason.replace(/[.]/g, "\\."),
);

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

const waiting = "Waiting for published story state";

test("a Take's older snapshot arriving late and an unrelated revision keep it protected; its accepted revision, fully read, returns the Taken actions while the session works", async ({
  page,
  dashboard,
  origin,
}) => {
  const before = (await origin.originGit("rev-parse", "main")).trim();
  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  await pausePageClock(page);
  expectServedHomesReach(dashboard.github, defaultRepository, before);
  const { published, story, takenStory } = await openStory(page, origin);

  await story.getByRole("button", { name: "Start execution" }).click();
  const acceptance = nextAcceptedAttemptId(page);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  const attemptId = await acceptance;
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);

  // A check asked before the Take is published, and the fresh read the
  // start's settling asks, answer only after it settles, with the revision
  // before it. Release the held Claude with the push so launch settles while
  // publication is observed, and release the held tip so the stale read can
  // finish while the session appears — instead of waiting for each in turn.
  const restoreMain = published.answerWith("main", commitAnswer(before));
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
  expectServedHomesReach(dashboard.github, published.repository, accepted);
  expect((await attempts(dashboard))[0]?.publication).toEqual({
    kind: "published",
    revision: accepted,
  });
  expect((await settledOutcome(dashboard, attemptId)).kind).toBe("launched");
  await givePageItsTurns(page);
  await expect(storyCardSessions(story)).toHaveCount(1);
  await expect(story).toContainText(waiting);
  await expectProtected(story);

  // The held REST request completes at its earlier pin after the native Take.
  releaseRef();
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${before.slice(0, 7)}`,
  );
  await expect(story).toContainText(waiting);
  await expectProtected(story);
  await expect(takenStory).toHaveCount(0);
  restoreMain();

  // An unrelated revision is not the published Take; a comparison that
  // fails proves nothing either, and is asked again for the next read.
  const unrelated = await commitOn(origin, before);
  publishMain(origin.origin, unrelated);
  expectServedHomesReach(dashboard.github, published.repository, unrelated);
  const restoreCompare = published.answerWith("compare", noConnection);
  await passTimeUntilChecked(page);
  await expect(story).toContainText(
    `The local GitHub CLI could not reach GitHub while reading whether ${unrelated} contains ${accepted}.`,
  );
  await expectProtected(story);
  restoreCompare();
  // Tip is still the unrelated revision; only a reload forces the compare
  // again once the failure answer is restored.
  await reloadUntilRead(page);
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${unrelated.slice(0, 7)}`,
  );
  await expect(story).not.toContainText("could not reach GitHub");
  await expect(story).toContainText(waiting);
  await expectProtected(story);

  // The accepted revision moves the story to Taken; its actions wait for
  // every fact of the snapshot.
  const releaseSeed = published.hold(".planning/seeds/A.md");
  publishMain(origin.origin, accepted);
  expectServedHomesReach(dashboard.github, published.repository, accepted);
  await passTimeUntilChecked(page);
  await expect(takenStory).toBeVisible();
  await expect(story).toHaveCount(0);
  // Profiles now arrive independently; their known assignment still cannot
  // reconcile a snapshot whose canonical preparation remains unread.
  await expect(credit(credit(takenStory).owner).line).toContainText(
    "Claude Code",
  );
  await expect(takenStory).toContainText(waiting);
  await expectProtected(takenStory);
  releaseSeed();
  await expect(takenStory).not.toContainText(waiting);
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();

  // A later revision containing it keeps them.
  const descendant = await commitOn(origin, accepted);
  publishMain(origin.origin, descendant);
  expectServedHomesReach(dashboard.github, published.repository, descendant);
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
  const before = (await origin.originGit("rev-parse", "main")).trim();
  expectServedHomesReach(dashboard.github, defaultRepository, before);
  const { published, story } = await openStories(page, origin);

  await story.getByRole("button", { name: "Start refinement" }).click();
  const acceptance = nextAcceptedAttemptId(page);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  const attemptId = await acceptance;
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.publication.kind, {
      timeout: 30_000,
    })
    .toBe("published");
  const accepted = (await origin.originGit("rev-parse", "main")).trim();

  // The announcement is read while the session is still starting.
  expectServedHomesReach(dashboard.github, published.repository, accepted);
  await passTimeUntilChecked(page);
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${accepted.slice(0, 7)}`,
  );
  await expect(credit(story).preparing).toBeVisible();
  await expect(story).toContainText("Local startup in progress");
  await expectProtected(story);

  dashboard.releaseHeldClaude();
  expect((await settledOutcome(dashboard, attemptId)).kind).toBe("launched");
  await givePageItsTurns(page);
  await expect(storyCardSessions(story)).toHaveCount(1);
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
