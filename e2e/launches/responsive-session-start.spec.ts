// Start releases the dashboard while protecting its story
// (../../dashboard/src/LaunchDialog.tsx, ../../dashboard/src/launchAttempts.ts,
// ../../dashboard/src/StoryCard.tsx):
// the real installed starts against a real bare origin
// (../../dashboard/test-support/support/startOrigin.ts) whose `pre-receive` hook holds the published
// assignment, with the synthetic `claude` holding the native launch
// (Codex: ./responsive-session-start-codex.spec.ts). Pressing Start commits
// the request at once: Cancel and Start are unavailable, Escape does nothing,
// and the submitted choices cannot change. The dialog closes once the local
// service accepted the launch, while its work is still held; from submission
// until the startup settles, every action button on the story's card is
// unavailable while its facts and source links stay readable, and other
// stories, Refresh, and project navigation work. An execution's story stays
// protected as its Take moves it to Taken. An unattached session gets
// the same cutoff and handoff, with progress beside its own action and no
// card. A lost acknowledgment, and Cancel or Escape before Start, are
// ../../dashboard/frontend-tests/launches/startup-recovery.spec.ts
// and ../../dashboard/frontend-tests/launches/story-card-launch-dialogs.spec.ts.
// Once settled, the story's actions
// return where the published read places it
// (./responsive-session-reconciliation.spec.ts tells how). Only the delivery
// of the acceptance answer to the page is held here; the service's admission,
// publication, and outcome are the real ones.

import { attempts } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  storyCardSessions,
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  expect,
  pausePageClockAt,
} from "../../dashboard/test-support/dashboardTest.ts";
import { passCheckPace } from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  expectOthersWork,
  expectProtected,
  expectSubmitted,
  holdAcceptanceAnswers,
  instruction,
  openStories,
  openStory,
  test,
} from "../../dashboard/test-support/responsiveStart.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

test("Start refinement in Claude Code commits at Start and closes at acceptance while its start is held, protecting only that story", async ({
  page,
  dashboard,
  origin,
}) => {
  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  const { story, other } = await openStories(page, origin);
  const answers = await holdAcceptanceAnswers(page);

  await story.getByRole("button", { name: "Start refinement" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill(instruction);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  // Committed at once, before any answer reaches the page.
  await expectSubmitted(page, dialog);
  await expect(
    dialog.getByRole("textbox", { name: "Instruction (optional)" }),
  ).toHaveValue(instruction);
  await answers.reached;
  await expectSubmitted(page, dialog);

  // Accepted: the dialog closes while the published assignment is held.
  answers.release();
  await expect(dialog).toBeHidden();
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({
      request: expect.objectContaining({
        workflow: "refinement",
        identity: queuedIdentity,
        instruction,
      }),
      owned: true,
    }),
  ]);
  await expect(story).toContainText("Preparing refinement…");
  await expect(story).toContainText("Local startup in progress");
  await expectProtected(story);
  await expectOthersWork(page, other, story);
  await expectProtected(story);

  // The native launch is held next; the story stays protected.
  push.release();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.publication.kind, {
      timeout: 30_000,
    })
    .toBe("published");
  await expect(story).toContainText("Starting refinement in Claude Code…");
  await expectProtected(story);

  // Settled: the session is listed and the card's actions return.
  dashboard.releaseHeldClaude();
  await expect(storyCardSessions(story)).toHaveCount(1, { timeout: 30_000 });
  await expect(story).not.toContainText("Local startup in progress");
  await expect(
    story.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});

test("Start execution in Claude Code keeps its story protected as its Take moves it to Taken, until its session settles", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("held");
  await pausePageClockAt(page, new Date());
  const { story, takenStory } = await openStory(page, origin);

  await story.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.publication.kind, {
      timeout: 30_000,
    })
    .toBe("published");
  await expect(story).toContainText("Starting execution in Claude Code…");
  await expectProtected(story);

  // The next check reads the published Take: the card moves, still protected.
  await passCheckPace(page);
  await expect(takenStory).toContainText("Local startup in progress");
  await expectProtected(takenStory);
  await expect(story).toHaveCount(0);

  // Settled: the session is listed and the Taken card's actions return.
  dashboard.releaseHeldClaude();
  await expect(storyCardSessions(takenStory)).toHaveCount(1, {
    timeout: 30_000,
  });
  await expect(takenStory).not.toContainText("Local startup in progress");
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});

test("Start session in Claude Code closes at acceptance while its launch is held, with its progress beside the action and no card", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("held");
  const { story, other } = await openStories(page, origin);
  const { backlog, taken } = parts(page);
  const answers = await holdAcceptanceAnswers(page);
  const button = page.getByRole("button", {
    name: "Start session in Open Dough",
  });

  await button.click();
  const dialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Claude Code",
  });
  await dialog.getByRole("textbox").fill("why is CI slow?");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expectSubmitted(page, dialog);
  await answers.reached;
  answers.release();

  await expect(dialog).toBeHidden();
  await expect(button).toBeDisabled();
  await expect(page.locator(".start-session-answer")).toContainText(
    "Starting a session in Open Dough… Local startup in progress.",
  );
  // Ad hoc feedback stays beside its action: no card, no story protected.
  await expect(backlog.getByRole("article")).toHaveCount(2);
  await expect(taken.getByRole("article")).toHaveCount(0);
  await expect(story.getByRole("button", { disabled: true })).toHaveCount(0);
  await expectOthersWork(page, other, story);
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({
      request: expect.objectContaining({ workflow: "ad-hoc" }),
      publication: { kind: "none" },
      owned: true,
    }),
  ]);

  dashboard.releaseHeldClaude();
  await expect(sessionEntriesIn(parts(page).taken)).toHaveCount(1, {
    timeout: 30_000,
  });
  await expect(button).toBeEnabled();
  await expect(page.locator(".start-session-answer")).toHaveCount(0);
});
