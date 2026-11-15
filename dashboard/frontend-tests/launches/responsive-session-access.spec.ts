// A story's keyboard start under reduced motion against a controlled launch
// boundary and machine read (../../src/StoryCard.tsx,
// ../../src/StartupAnnouncer.tsx, ../../src/StartupStatus.tsx): focus moves
// to the protected card, with every unavailable action described. The
// startup's status stays apart from the column, highlight and inspection; its
// marks join the highlight and the open detail. Progress animates only
// without reduced motion. Each transition is announced once, a Take published
// while the start still runs takes the protection to Taken, and settling
// presents the session without taking the keyboard from a task begun
// meanwhile. An unattached session's keyboard start is
// ./responsive-session-access-unattached.spec.ts; the real held starts, their
// publication and settling are
// ../../../e2e/launches/responsive-session-start.spec.ts.

import { parts, storyCardSessions } from "../../tests/dashboardPage.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { tabTo } from "../../tests/accessibleReading.ts";
import { backlogLaunchers } from "../../tests/launchStoryCardPage.ts";
import { notRefinedStory, readyStory } from "../../tests/launchJourney.ts";
import { passCheckPace } from "../../tests/pageRequestNotes.ts";
import {
  countMachineReads,
  indicatorOf,
  inspectByKeyboard,
  marksOf,
  recordAnnouncements,
} from "../../tests/responsiveAccess.ts";
import { startupUnavailable as unavailable } from "../../tests/responsiveStart.ts";
import {
  emptyArea,
  expectInspected,
  expectSelected,
} from "../../tests/storyCardSelection.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { frontendAttempt } from "../../tests/support/frontendLaunchAttempts.ts";
import { installFrontendLaunchBoundary } from "../../tests/support/frontendLaunchSubstitutes.ts";
import { frontendStoryLaunch } from "../../tests/support/frontendServiceState.ts";

const reason = new RegExp(unavailable.replace(/[.]/g, "\\."));
const inProgress = `${readyStory}: execution start, local startup in progress.`;
const waiting = `${readyStory}: execution start settled on this machine; waiting for published story state.`;
const reconciled = `${readyStory}: execution start reconciled with published story state.`;
// The revision at which the start publishes its Take.
const takeRevision = "7".repeat(40);

test("a keyboard start under reduced motion hands the keyboard to the story's card, says why its actions are unavailable, announces each transition once, and leaves a task begun meanwhile focused when it settles", async ({
  page,
  frontendServices,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await pausePageClockAt(page, new Date());
  const attempt = frontendAttempt(frontendServices);
  const boundary = await installFrontendLaunchBoundary(page, {
    accept: attempt.accept,
  });
  await openFrontendTakenBacklog(page);
  const { card } = backlogLaunchers(page);
  const story = card(readyStory);
  const other = card(notRefinedStory);
  const takenStory = parts(page).taken.getByRole("article", {
    name: readyStory,
    exact: true,
  });
  const announced = await recordAnnouncements(page);
  const reads = countMachineReads(page);

  // The startup's marks join the open detail and the highlight.
  const hide = await inspectByKeyboard(page, story);
  await expect(hide).toHaveAttribute("aria-expanded", "true");
  await emptyArea(story).click();
  await expectSelected(story, true);

  const start = story.getByRole("button", { name: "Start execution" });
  await expect(start).toBeEnabled();
  await start.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await expect(
    dialog.getByRole("textbox", { name: "Instruction (optional)" }),
  ).toBeFocused();
  await page.keyboard.type("Keep this exact instruction.");
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

  // Published while the start still runs: the protection follows the story
  // to Taken, and reads that find it still in progress say nothing.
  const readsBefore = reads();
  attempt.publish(takeRevision);
  await boundary.tellChanged();
  await passCheckPace(page);
  await expect(takenStory).toContainText(unavailable);
  await expect.poll(reads).toBeGreaterThan(readsBefore);
  expect(await announced()).toEqual([inProgress]);
  await expect(otherHide).toBeFocused();

  // Settled: the session is presented on the card; the keyboard stays.
  attempt.launch(frontendStoryLaunch("executing", readyStory).please());
  await boundary.tellChanged();
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
