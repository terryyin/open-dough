// Startup status and focus stay usable by keyboard and without motion
// (../src/launchDialogLauncher.ts, ../src/protectedFrame.ts,
// ../src/StartupAnnouncer.tsx, ../src/agent-launch.css), against the same
// real bare origin and installed starts as ./responsive-session-start.spec.ts.
// A start submitted by keyboard under reduced motion hands the keyboard to
// what says the startup -- the story's card, or Start session's progress --
// never to its unavailable action. The card and each of its unavailable
// actions are described by why; the status words stand apart from the
// story's stage and selection, and the pending frame's dashed edge joins the
// selection and "Shown in terminal" marks without replacing them. Its
// indicator moves only while the startup progresses and the developer has
// not asked for reduced motion. Each transition is announced politely once,
// however many reads find it unchanged. A startup that settles after the
// developer moved on presents its session -- in the terminal, for Start
// session -- without taking the keyboard from their new task. Static states:
// ./responsiveRecovery.ts (`expectStaticallyProtected`).

import { cardSessions, parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import {
  countMachineReads,
  indicatorOf,
  inspectByKeyboard,
  marksOf,
  recordAnnouncements,
  tabTo,
} from "./responsiveAccess.ts";
import { startExecution } from "./responsiveRecovery.ts";
import { instruction, openStories, test } from "./responsiveStart.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

const unavailable =
  "Local startup in progress; this story's actions are unavailable until it settles.";
// Said by a protected card and each of its unavailable actions.
const reason = new RegExp(unavailable.replace(/[.]/g, "\\."));
const inProgress = "Story A: execution start, local startup in progress.";
const waiting =
  "Story A: execution start settled on this machine; waiting for published story state.";
const reconciled =
  "Story A: execution start reconciled with published story state.";

test("a keyboard start under reduced motion hands the keyboard to the story's card, says why its actions are unavailable, announces each transition once, and leaves a task begun meanwhile focused when it settles", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  const { story, takenStory, other } = await openStories(page, origin);
  const announced = await recordAnnouncements(page);
  const reads = countMachineReads(page);

  // Selected first, by keyboard: the startup's marks join the selection's.
  const hide = await inspectByKeyboard(page, story);
  await expect(hide).toHaveAttribute("aria-expanded", "true");

  const start = story.getByRole("button", { name: "Start execution" });
  // Focus does not wait for the canonical dependency and machine reads.
  await expect(start).toBeEnabled();
  await start.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await expect(
    dialog.getByRole("textbox", { name: "Instruction (optional)" }),
  ).toBeFocused();
  await page.keyboard.type(instruction);
  await tabTo(page, dialog.getByRole("button", { name: "Start", exact: true }));
  await page.keyboard.press("Enter");

  // Handed off: the keyboard is on the card, which says what is under way,
  // not on its unavailable Start.
  await expect(dialog).toBeHidden();
  await expect(story).toBeFocused();
  await expect(story).toHaveAccessibleDescription(reason);
  for (const action of [
    start,
    story.getByRole("button", { name: "Start refinement" }),
    hide,
  ]) {
    await expect(action).toBeDisabled();
    await expect(action).toHaveAccessibleDescription(reason);
  }
  await expect(
    other.getByRole("button", { name: "Start execution" }),
  ).not.toHaveAccessibleDescription(/Local startup/);

  // The status is the startup's own, apart from the stage and selection.
  const status = story.locator(".card-startup-status");
  await expect(status).toContainText(unavailable);
  await expect(status).not.toContainText(/Backlog|Taken|detail/);
  await expect(takenStory).toHaveCount(0);
  await expect(hide).toHaveAttribute("aria-expanded", "true");
  const marks = await marksOf(story);
  expect(marks.classes).toEqual(
    expect.arrayContaining(["card-selected", "card-starting"]),
  );
  expect(marks.edge).toBe("dashed");
  expect(marks.edgeColor).toBe(marks.accent);

  // Progressing: a still indicator under reduced motion, moving without it.
  const indicator = story.locator(".card-startup-progressing");
  expect(await indicatorOf(indicator)).toEqual({
    shown: true,
    animation: "none",
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await indicatorOf(indicator)).toEqual({
    shown: true,
    animation: "card-startup-pulse",
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(announced).toEqual([inProgress]);

  // A task begun meanwhile.
  const otherHide = await inspectByKeyboard(page, other);

  // Published while the native launch is held: the protection follows the
  // story to Taken, and reads that find it still in progress say nothing.
  const readsBefore = reads();
  push.release();
  await expect(takenStory).toContainText(unavailable, { timeout: 30_000 });
  await expect.poll(reads).toBeGreaterThan(readsBefore);
  expect(await announced()).toEqual([inProgress]);
  await expect(otherHide).toBeFocused();

  // Settled: the session is presented on the card; the keyboard stays.
  dashboard.releaseHeldClaude();
  await expect(cardSessions(takenStory)).toHaveCount(1, { timeout: 30_000 });
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  await expect.poll(async () => (await announced()).at(-1)).toBe(reconciled);
  await expect(otherHide).toBeFocused();
  await expect(cardSessions(takenStory)).not.toBeFocused();
  const said = await announced();
  expect(said[0]).toBe(inProgress);
  expect(new Set(said).size).toBe(said.length);
  for (const words of said)
    expect([inProgress, waiting, reconciled]).toContain(words);
});

test("a keyboard Start session hands the keyboard to its progress, and its session later opens in the terminal without taking the keyboard from a task begun meanwhile", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  dashboard.claudeScenario("held");
  const { other } = await openStories(page, origin);
  const button = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  const progressWords =
    "Starting a session in Open Dough… Local startup in progress.";

  await button.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Claude Code",
  });
  await page.keyboard.type("why is CI slow?");
  await tabTo(page, dialog.getByRole("button", { name: "Start", exact: true }));
  await page.keyboard.press("Enter");

  await expect(dialog).toBeHidden();
  const progress = page.locator(".start-session-answer");
  await expect(progress).toHaveText(progressWords);
  await expect(progress).toBeFocused();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAccessibleDescription(progressWords);

  const otherHide = await inspectByKeyboard(page, other);

  dashboard.releaseHeldClaude();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel).toHaveCount(1, { timeout: 30_000 });
  await expect(
    parts(page).recentSessions.getByRole("article").first(),
  ).toContainText("Shown in terminal");
  await expect(
    page.getByRole("log").filter({ hasText: "Ad hoc session started" }),
  ).toBeVisible();
  await expect(otherHide).toBeFocused();
  await expect(button).toBeEnabled();
});

test("a refinement settling on its card leaves a task begun meanwhile focused; starting the card again keeps its Shown in terminal mark beside its own, its session's actions unavailable and said why, while the terminal works", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  dashboard.claudeScenario("held");
  const { story, other } = await openStories(page, origin);
  await story.getByRole("button", { name: "Start refinement" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await expect(story).toBeFocused();
  // The card stays in the Backlog, where its session is listed on settling.
  const otherHide = await inspectByKeyboard(page, other);
  dashboard.releaseHeldClaude();
  const entry = cardSessions(story);
  await expect(entry).toHaveCount(1, { timeout: 30_000 });
  await expect(
    story.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled({ timeout: 30_000 });
  await expect(otherHide).toBeFocused();
  await entry.getByRole("button", { name: "Open terminal" }).click();
  await expect(entry).toContainText("Shown in terminal");

  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  await startExecution(page, story);
  await expect(story).toContainText(unavailable);
  await expect(entry).toContainText("Shown in terminal");
  const marks = await marksOf(story);
  expect(marks.classes).toEqual(
    expect.arrayContaining(["in-terminal", "card-starting"]),
  );
  expect(marks.edge).toBe("dashed");
  expect(marks.outline).toBe("solid");
  const markDone = entry.getByRole("button", { name: "Mark as done" });
  await expect(markDone).toBeDisabled();
  await expect(markDone).toHaveAccessibleDescription(reason);
  // The terminal's own controls keep their contract.
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.getByRole("button", { name: "Close" })).toBeEnabled();
  // Recent sessions lists the same session outside the frame, available.
  await expect(
    parts(page).recentSessions.getByRole("button", { disabled: true }),
  ).toHaveCount(0);

  push.release();
  dashboard.releaseHeldClaude();
  const { taken } = parts(page);
  const takenStory = taken.getByRole("article", { name: "Story A" });
  await expect(cardSessions(takenStory)).toHaveCount(2, { timeout: 30_000 });
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  await expect(takenStory).toContainText("Shown in terminal");
});
