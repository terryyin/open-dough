// Keyboard/reduced-motion startup journeys use the real bare origin and
// installed starts from ./responsive-session-start.spec.ts. Focus transfers to
// the protected card or Start session progress, with unavailable actions
// described, while Select story stays available. Status stays distinct from
// Column, highlight, and inspection; pending marks join the highlight, open
// detail, and Shown in terminal. Progress animates only without reduced
// motion. Transitions announce once; settling presents the session without
// stealing focus from a newer task. Static protection is in responsiveRecovery.ts;
// a refinement settling, then starting again, is in
// ./responsive-session-refinement-restart.spec.ts.

import { storyCardSessions, parts } from "../dashboardPage.ts";
import { expect, pausePageClockAt } from "../dashboardTest.ts";
import { passCheckPace } from "../pageRequestNotes.ts";
import {
  countMachineReads,
  indicatorOf,
  inspectByKeyboard,
  marksOf,
  recordAnnouncements,
  tabTo,
} from "../responsiveAccess.ts";
import {
  expectInspected,
  expectSelected,
  selectStory,
} from "../storyCardSelection.ts";
import {
  instruction,
  openStories,
  startupUnavailable as unavailable,
  test,
} from "../responsiveStart.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

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
  await page.emulateMedia({ reducedMotion: "reduce" });
  const push = origin.holdPushes();
  await pausePageClockAt(page, new Date());
  dashboard.claudeScenario("held");
  const { story, takenStory, other } = await openStories(page, origin);
  const announced = await recordAnnouncements(page);
  const reads = countMachineReads(page);

  // Inspected and selected first, by keyboard: the startup's marks join the
  // open detail and the highlight.
  const hide = await inspectByKeyboard(page, story);
  await expect(hide).toHaveAttribute("aria-expanded", "true");
  await selectStory(story).focus();
  await page.keyboard.press("Space");
  await expectSelected(story, true);

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
  // Selecting is no protected action.
  await expect(selectStory(story)).toBeEnabled();
  await expect(selectStory(story)).not.toHaveAccessibleDescription(reason);

  // The status is the startup's own, apart from the column and selection.
  const status = story.locator(".story-card-startup-status");
  await expect(status).toContainText(unavailable);
  await expect(status).not.toContainText(/Backlog|Taken|detail/);
  await expect(takenStory).toHaveCount(0);
  await expectInspected(story, true);
  const marks = await marksOf(story);
  expect(marks.classes).toEqual(
    expect.arrayContaining(["story-card-selected", "story-card-starting"]),
  );
  expect(marks.edge).toBe("dashed");
  expect(marks.edgeColor).toBe(marks.accent);

  // Progressing: a still indicator under reduced motion, moving without it.
  const indicator = story.locator(".story-card-startup-progressing");
  expect(await indicatorOf(indicator)).toEqual({
    shown: true,
    animation: "none",
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await indicatorOf(indicator)).toEqual({
    shown: true,
    animation: "story-card-startup-pulse",
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(announced).toEqual([inProgress]);

  // A task begun meanwhile.
  const otherHide = await inspectByKeyboard(page, other);

  // Published while the native launch is held: the protection follows the
  // story to Taken, and reads that find it still in progress say nothing.
  const readsBefore = reads();
  push.release();
  await expect.poll(() => origin.takenProfiles()).toHaveLength(1);
  await passCheckPace(page);
  await expect(takenStory).toContainText(unavailable);
  await expect.poll(reads).toBeGreaterThan(readsBefore);
  expect(await announced()).toEqual([inProgress]);
  await expect(otherHide).toBeFocused();

  // Settled: the session is presented on the card; the keyboard stays.
  dashboard.releaseHeldClaude();
  await expect(storyCardSessions(takenStory)).toHaveCount(1);
  // Its detail stayed open while another card's opened.
  await expect(
    takenStory.getByRole("button", { name: "Hide detail" }),
  ).toBeEnabled();
  await expectInspected(takenStory, true);
  await expect.poll(async () => (await announced()).at(-1)).toBe(reconciled);
  await expect(otherHide).toBeFocused();
  await expect(storyCardSessions(takenStory)).not.toBeFocused();
  const said = await announced();
  expect(said[0]).toBe(inProgress);
  expect(new Set(said).size).toBe(said.length);
  for (const words of said)
    expect([inProgress, waiting, reconciled]).toContain(words);
});

// A session started with nothing typed opens in the terminal; one started
// with typed text presents nothing. Neither moves the keyboard from a task
// begun during the startup.
for (const typed of ["", "why is CI slow?"]) {
  const presented =
    typed === ""
      ? "its session later opens in the terminal without taking"
      : "its instructed session later starts with no terminal and without taking";
  test(`a keyboard Start session hands the keyboard to its progress, and ${presented} the keyboard from a task begun meanwhile`, async ({
    page,
    dashboard,
    origin,
  }) => {
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
    await page.keyboard.type(typed);
    await tabTo(
      page,
      dialog.getByRole("button", { name: "Start", exact: true }),
    );
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
    // The startup has ended once Start session is offered again.
    await expect(button).toBeEnabled({ timeout: 30_000 });
    await expect(panel).toHaveCount(typed === "" ? 1 : 0);
    const entry = parts(page).taken.locator(".session-entry").first();
    if (typed === "") await expect(entry).toContainText("Shown in terminal");
    else await expect(entry).not.toContainText("Shown in terminal");
    await expect(parts(page).adHocStarted).toHaveCount(0);
    await expect(otherHide).toBeFocused();
  });
}
