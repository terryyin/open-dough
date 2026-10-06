// Start releases the dashboard while protecting its story
// (../src/LaunchDialog.tsx, ../src/launchAttempts.ts, ../src/WorkCard.tsx):
// the real installed starts against a real bare origin
// (./support/startOrigin.ts) whose `pre-receive` hook holds the published
// assignment, with the synthetic `claude` holding the native launch
// (Codex: ./responsive-session-start-codex.spec.ts). Pressing Start commits
// the request at once: Cancel and Start are unavailable, Escape does nothing,
// and the submitted choices cannot change. The dialog closes once the local
// service accepted the launch, while its work is still held; from submission
// until the startup settles, every action button on the story's card is
// unavailable while its facts and source links stay readable, and other
// stories, Refresh, and project navigation work. An unattached session gets
// the same cutoff and handoff, with progress beside its own action and no
// card. A lost acknowledgment is uncertain, never accepted success. Before
// Start, Cancel and Escape send nothing. Once settled, the story's actions
// return where the published read places it
// (./responsive-session-reconciliation.spec.ts tells how). Only the delivery
// of the acceptance answer to the page is held here; the service's admission,
// publication, and outcome are the real ones.

import { agentAcceptEndpoint } from "../src/agentLaunch.ts";
import { attempts } from "./agentLaunchBoundary.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import {
  countAcceptanceRequests,
  expectOthersWork,
  expectProtected,
  expectSubmitted,
  holdAcceptanceAnswers,
  instruction,
  openStories,
  test,
} from "./responsiveStart.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

for (const start of [
  {
    workflow: "execution",
    action: "Start execution",
    phase: "Preparing execution…",
  },
  {
    workflow: "refinement",
    action: "Start refinement",
    phase: "Preparing refinement…",
  },
] as const) {
  test(`${start.action} in Claude Code closes at acceptance while its start is held, protecting only that story`, async ({
    page,
    dashboard,
    origin,
  }) => {
    test.setTimeout(120_000);
    const push = origin.holdPushes();
    dashboard.claudeScenario("held");
    const { story, takenStory, other } = await openStories(page, origin);
    const answers = await holdAcceptanceAnswers(page);

    await story.getByRole("button", { name: start.action }).click();
    const dialog = page.getByRole("dialog", {
      name: `${start.action} in Claude Code`,
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
          workflow: start.workflow,
          identity: queuedIdentity,
          instruction,
        }),
        owned: true,
      }),
    ]);
    await expect(story).toContainText(start.phase);
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
    await expect(story).toContainText(
      `Starting ${start.workflow} in Claude Code…`,
    );
    await expectProtected(story);

    // Settled: the session is listed and the card's actions return where
    // the published read places the story.
    dashboard.releaseHeldClaude();
    const settled = start.workflow === "execution" ? takenStory : story;
    await expect(cardSessions(settled)).toHaveCount(1, { timeout: 30_000 });
    await expect(settled).not.toContainText("Local startup in progress");
    await expect(
      settled.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
}

test("before Start, Cancel and Escape send nothing and leave the story's actions available", async ({
  page,
  dashboard,
  origin,
}) => {
  const { story } = await openStories(page, origin);
  const sent = countAcceptanceRequests(page);
  const action = story.getByRole("button", { name: "Start execution" });
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });

  await action.click();
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill("never sent");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await action.click();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();

  await expect(story.getByRole("button", { disabled: true })).toHaveCount(0);
  expect(sent()).toBe(0);
  expect(await attempts(dashboard)).toEqual([]);
  expect(dashboard.claudeCalls()).toEqual([]);
});

test("a lost acknowledgment says the launch is uncertain, never accepted, and the story is protected once its attempt is read", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  const { story, takenStory, other } = await openStories(page, origin);
  // The service accepts the launch; its answer never reaches the page.
  await page.route(
    (url) => url.pathname === agentAcceptEndpoint,
    async (route) => {
      await route.fetch();
      await route.abort("connectionreset");
    },
  );

  await story.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(story.locator(".launch-problem")).toContainText(
    "Launch uncertain: The local dashboard server could not be reached, so the launch may or may not have been accepted",
  );
  await expect(story).toContainText("Local startup in progress");
  await expectProtected(story);
  await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);
  expect(await attempts(dashboard)).toHaveLength(1);

  push.release();
  dashboard.releaseHeldClaude();
  await expect(cardSessions(takenStory)).toHaveCount(1, { timeout: 30_000 });
});

test("Start session in Claude Code closes at acceptance while its launch is held, with its progress beside the action and no card", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
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
  await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1, {
    timeout: 30_000,
  });
  await expect(button).toBeEnabled();
  await expect(page.locator(".start-session-answer")).toHaveCount(0);
});
