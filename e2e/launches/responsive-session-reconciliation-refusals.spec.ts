// A settled start that published nothing, or whose session was refused,
// reconciles with published state too (../../dashboard/src/startupReconciliation.ts),
// against the same real bare origin and installed starts as
// ./responsive-session-reconciliation.spec.ts. A start that published nothing
// -- refused because origin changed meanwhile, or a one-shot that publishes
// nothing by design -- waits for a fresh read asked after it settled, never
// for a publication; a Take whose session was refused waits for that Take.
// Afterwards the card offers what the read story allows, with the launch's
// answer kept on it.

import { attempts } from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  storyCardSessions,
  expectSettledPage,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import { expectStartNote } from "../../dashboard/tests/storyCardControls.ts";
import { openSessionStartReason } from "../../dashboard/src/agentLaunch.ts";
import { nextAcceptedAttemptId } from "../../dashboard/tests/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/tests/acceptedAttempts.ts";
import { untilPageRequestsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";
import { expect } from "../../dashboard/tests/dashboardTest.ts";
import { commitAnswer } from "../../dashboard/tests/originAnswers.ts";
import { removeQueuedStory } from "../../dashboard/tests/responsiveRecovery.ts";
import {
  expectProtected,
  openStories,
  test,
} from "../../dashboard/tests/responsiveStart.ts";
import { radio } from "../../dashboard/tests/support/sessionDialog.ts";
import type { StartOrigin } from "../../dashboard/tests/support/startOrigin.ts";
import {
  storyA,
  storyB,
} from "../../Distribution/tests/support/queued-repository.mjs";

const openSessionDescription = new RegExp(
  openSessionStartReason.replace(/[.]/g, "\\."),
);

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

const waiting = "Waiting for published story state";

// Starts Story A's execution while the page still shows the revision before
// `change`, which another writer makes meanwhile.
async function startAfter(
  page: Parameters<typeof openStories>[0],
  origin: StartOrigin,
  change: () => Promise<unknown>,
) {
  const before = (await origin.originGit("rev-parse", "main")).trim();
  const opened = await openStories(page, origin);
  const restore = opened.published.answerWith("main", commitAnswer(before));
  await change();
  await opened.story.getByRole("button", { name: "Start execution" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  restore();
  return opened;
}

test("a start refused because another agent took the story meanwhile publishes nothing, and a fresh read shows it Taken with the answer kept", async ({
  page,
  dashboard,
  origin,
}) => {
  let agent = "";
  const { published, takenStory } = await startAfter(page, origin, async () => {
    ({ agent } = await origin.publishTake({
      agent: "Yui",
      story: storyA,
      queued: [storyB],
      mode: "story-branch",
    }));
  });

  await expect(takenStory).toBeVisible({ timeout: 30_000 });
  await expect(takenStory.locator(".launch-problem")).toContainText(
    "Launch failed: Taken by",
  );
  await expectSettledPage(page);
  await expect(takenStory).not.toContainText(waiting);
  await expect(takenStory.getByRole("button", { disabled: true })).toHaveCount(
    0,
  );
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  expect(agent).not.toBe("");
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({
      publication: { kind: "none" },
      outcome: expect.objectContaining({ kind: "failed" }),
    }),
  ]);
  expect(published.compares).toEqual([]);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
});

test("a start refused because another writer removed the story publishes nothing, and a fresh read leaves no card locked", async ({
  page,
  dashboard,
  origin,
}) => {
  const { other } = await startAfter(page, origin, () =>
    removeQueuedStory(origin),
  );

  await expect(
    parts(page).board.getByRole("article", { name: "Story A" }),
  ).toHaveCount(0, { timeout: 30_000 });
  await expectSettledPage(page);
  await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);
  await expect(
    other.getByRole("button", { name: "Start execution" }),
  ).toBeEnabled();
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({
      publication: { kind: "none" },
      outcome: expect.objectContaining({ kind: "failed" }),
    }),
  ]);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
});

test("a one-shot refinement publishes nothing: once its session settles, a fresh read asked afterwards holds Starts for the open session", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("held");
  const { published, story } = await openStories(page, origin);

  await story.getByRole("button", { name: "Start refinement" }).click();
  const dialog = page.getByRole("dialog");
  await radio(dialog, "Tracking", "One-shot").check();
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.publication.kind, {
      timeout: 30_000,
    })
    .toBe("none");

  // The fresh read is held: settling alone returns nothing.
  const releaseRef = published.hold("main");
  dashboard.releaseHeldClaude();
  await expect(storyCardSessions(story)).toHaveCount(1, { timeout: 30_000 });
  await expect(story).toContainText(waiting);
  await expectProtected(story);

  releaseRef();
  await expectSettledPage(page);
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

test("a Take whose session is refused reconciles with that Take: its Taken card keeps the answer and offers the kept start's continuation", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("refused");
  const { story, takenStory } = await openStories(page, origin);

  const acceptance = nextAcceptedAttemptId(page);
  await story.getByRole("button", { name: "Start execution" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  const attemptId = await acceptance;
  await settledOutcome(dashboard, attemptId);
  await untilPageRequestsAnswered(page);

  await expect(takenStory).toBeVisible({ timeout: 30_000 });
  await expect(takenStory.locator(".launch-problem")).toContainText(
    "Launch failed: Claude Code refused",
  );
  await expectSettledPage(page);
  await expectStartNote(
    takenStory,
    "Start execution",
    "Started here, no session yet",
  );
  await expect(takenStory.getByRole("button", { disabled: true })).toHaveCount(
    0,
  );
  await expect(
    takenStory.getByRole("button", { name: "Start execution" }),
  ).toBeEnabled();
  expect(
    (await attempts(dashboard)).map(({ publication }) => publication),
  ).toEqual([
    {
      kind: "published",
      revision: (await origin.originGit("rev-parse", "main")).trim(),
    },
  ]);
});
