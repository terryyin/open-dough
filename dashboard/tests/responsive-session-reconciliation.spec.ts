// A settled start reconciles with published state
// (../src/startupReconciliation.ts): the real installed starts publish to a
// real bare origin (./support/startOrigin.ts) that the page reads as GitHub
// would, following its pushes (./committedOrigin.ts), and GitHub's comparison
// of two commits is answered from that origin's own history. Only a fully
// read snapshot of the accepted revision, or of one that contains it, returns
// the story's actions once its native outcome settled: an older snapshot
// arriving late or an unrelated revision keeps them unavailable, while the
// published stage and facts show as read. The session goes on working. Once
// reconciled, a reload reconciles it again without asking GitHub.

import { attempts } from "./agentLaunchBoundary.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { commitAnswer, rateLimitedAnswer } from "./originAnswers.ts";
import { recoveryOf } from "./responsiveRecovery.ts";
import {
  commitOn,
  expectProtected,
  openStories,
  test,
} from "./responsiveStart.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

const waiting = "Waiting for published story state";

test("a Take's older snapshot arriving late and an unrelated revision keep it protected; its accepted revision, fully read, returns the Taken actions while the session works", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(150_000);
  const before = (await origin.originGit("rev-parse", "main")).trim();
  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  const { published, story, takenStory } = await openStories(page, origin);
  const { refresh } = parts(page);

  await story.getByRole("button", { name: "Start execution" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);

  // A read asked before the Take is published answers only after it settles,
  // with the revision before it.
  published.answerWith("main", commitAnswer(before));
  const releaseRef = published.hold("main");
  await refresh.click();
  push.release();
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
  dashboard.releaseHeldClaude();
  await expect(cardSessions(story)).toHaveCount(1, { timeout: 30_000 });
  await expect(story).toContainText(waiting);
  await expectProtected(story);

  releaseRef();
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${before.slice(0, 7)}`,
  );
  await expect(story).toContainText(waiting);
  await expectProtected(story);
  await expect(takenStory).toHaveCount(0);

  // An unrelated revision is not the published Take; a comparison GitHub
  // refuses proves nothing either, and is asked again for the next read.
  const unrelated = await commitOn(origin, before);
  published.answerWith("main", commitAnswer(unrelated));
  const restoreCompare = published.answerWith("compare", rateLimitedAnswer());
  await refresh.click();
  await expect(story).toContainText(
    `GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading whether ${unrelated} contains ${accepted}.`,
  );
  await expectProtected(story);
  restoreCompare();
  await refresh.click();
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${unrelated.slice(0, 7)}`,
  );
  await expect(story).not.toContainText("GitHub limited the rate");
  await expect(story).toContainText(waiting);
  await expectProtected(story);

  // The accepted revision moves the story to Taken; its actions wait for
  // every fact of the snapshot.
  const releaseSeed = published.hold(".planning/seeds/A.md");
  published.answerWith("main", commitAnswer(accepted));
  await refresh.click();
  await expect(takenStory).toBeVisible();
  await expect(story).toHaveCount(0);
  await expect(takenStory).toContainText(waiting);
  await expectProtected(takenStory);
  releaseSeed();
  await expect(takenStory).not.toContainText(waiting);
  await expect(takenStory.getByRole("button", { disabled: true })).toHaveCount(
    0,
  );
  await expect(takenStory.locator(".card-owner")).toBeVisible();
  await expect(cardSessions(takenStory)).toHaveCount(1);
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();

  // A later revision containing it keeps them.
  const descendant = await commitOn(origin, accepted);
  published.answerWith("main", commitAnswer(descendant));
  await refresh.click();
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${descendant.slice(0, 7)}`,
  );
  await expect(takenStory.getByRole("button", { disabled: true })).toHaveCount(
    0,
  );
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
  await page.reload();
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${descendant.slice(0, 7)}`,
  );
  await expect(cardSessions(takenStory)).toHaveCount(1);
  await expect(takenStory.getByRole("button", { disabled: true })).toHaveCount(
    0,
  );
  await expect(takenStory).not.toContainText(waiting);
  await expect(recoveryOf(page)).toHaveCount(0);
  expect(published.compares).toEqual(compares);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});

test("a refinement's announcement, read before its session settles, keeps the story protected until it does, then returns its Backlog actions while the session works", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  dashboard.claudeScenario("held");
  const { published, story } = await openStories(page, origin);
  const { refresh } = parts(page);

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
  await refresh.click();
  await expect(page.getByRole("status").first()).toContainText(
    `Published work read at revision ${accepted.slice(0, 7)}`,
  );
  await expect(story.locator(".card-preparing")).toBeVisible();
  await expect(story).toContainText("Local startup in progress");
  await expectProtected(story);

  dashboard.releaseHeldClaude();
  await expect(cardSessions(story)).toHaveCount(1, { timeout: 30_000 });
  await expect(story).not.toContainText("Local startup in progress");
  await expect(story).not.toContainText(waiting);
  await expect(story.getByRole("button", { disabled: true })).toHaveCount(0);
  await expect(
    story.getByRole("button", { name: "Start refinement" }),
  ).toBeEnabled();
  expect(published.compares).toEqual([]);
});
