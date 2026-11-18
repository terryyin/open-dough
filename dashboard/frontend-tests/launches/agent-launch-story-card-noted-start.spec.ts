// Backlog Starts against controlled answers: they share their launch row or
// wrap in reading order before Inspect story, at 420px and the 200% zoom
// proxy. Cancelling returns focus to Start; Tab continues. A note appears in
// the styled tooltip on hover/focus and in its accessible description once;
// the dialog says "This story is …". Unnoted Starts have no tooltip. Noted,
// disabled, and preparing Starts retain distinct light/dark appearances and
// decorative workflow glyphs; Inspect story's chevron turns with its detail.
// Starting a story launches the synthetic host in
// ../../../e2e/launches/agent-launch-story-card.spec.ts.

import type { Locator } from "@playwright/test";
import {
  expectEscapeReturnsThenTabMovesOn,
  expectFocusedAndIndicated,
  narrowWindow,
  twiceZoomedWindow,
} from "../../test-support/accessibleReading.ts";
import { credit } from "../../test-support/agentCredit.ts";
import { expectSettledPage } from "../../test-support/dashboardPage.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
} from "../../test-support/launchJourney.ts";
import { backlogLaunchers } from "../../test-support/launchStoryCardPage.ts";
import {
  expectInReadingOrder,
  expectNoSidewaysScrollAndWholeText,
  expectOnOneLine,
  expectOnOneLineWhenRoom,
} from "../../test-support/pageLayout.ts";
import {
  storyCardLaunchActions,
  expectActionGlyph,
  expectChevronTurns,
  expectNoteTooltip,
  inspectionGroup,
  launchGroup,
} from "../../test-support/storyCardControls.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import {
  frontendStoryLaunch,
  putFrontendStories,
} from "../../test-support/support/frontendServiceState.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const notReadyNote = "Not assessed as ready";
const beingPreparedNote = "Being prepared";
// The glyph each Start leads with.
const startGlyphs = {
  "Start execution": "play",
  "Start refinement": "pencil-line",
} as const;

const launchPaint = (button: Locator) =>
  button.evaluate((node) => {
    const style = getComputedStyle(node);
    return { color: style.color, borderColor: style.borderColor };
  });

test.describe("a Backlog card's Starts", () => {
  test("share the launch group's line at 1440px and wrap in reading order, by keyboard, at 420px and 200% zoom", async ({
    page,
  }) => {
    const boundary = await installFrontendLaunchBoundary(page);
    await openFrontendTakenBacklog(page);
    const { card, start, refine } = backlogLaunchers(page);
    const startsOf = (title: string) =>
      storyCardLaunchActions.map((name) =>
        launchGroup(card(title)).getByRole("button", { name }),
      );
    const inspect = (title: string) =>
      inspectionGroup(card(title)).getByRole("button", {
        name: "Inspect story",
      });
    await page.setViewportSize({ width: 1440, height: 900 });
    await expectOnOneLine(startsOf(readyStory));
    for (const title of [readyStory, notRefinedStory])
      for (const [name, glyph] of Object.entries(startGlyphs))
        await expectActionGlyph(
          launchGroup(card(title)).getByRole("button", { name }),
          name,
          glyph,
        );
    await expectChevronTurns(card(readyStory));
    // A Ready story's Starts carry no note, so neither has a tooltip.
    const readyStart = start(readyStory);
    await readyStart.hover();
    await expect(readyStart).toHaveAccessibleDescription("");
    await expect(
      launchGroup(card(readyStory)).locator(".frame-tooltip"),
    ).toHaveCount(0);
    const notedLaunches = launchGroup(card(notRefinedStory));
    await expect(notedLaunches.getByText(notReadyNote)).toBeHidden();
    await expectOnOneLineWhenRoom(notedLaunches, startsOf(notRefinedStory));
    const execution = start(notRefinedStory);
    const refinement = refine(notRefinedStory);
    await expectInReadingOrder(notedLaunches, [execution, refinement]);

    for (const window of [narrowWindow, twiceZoomedWindow]) {
      await page.setViewportSize(window);
      await expectNoSidewaysScrollAndWholeText(page);
      for (const title of [readyStory, notRefinedStory])
        await expectInReadingOrder(card(title), [
          ...startsOf(title),
          inspect(title),
        ]);
      await expect(notedLaunches.getByText(notReadyNote)).toBeHidden();
      // A cancelled Start returns focus to its launch action, and Tab moves
      // to Inspect story.
      await execution.focus();
      await page.keyboard.press("Tab");
      await expectFocusedAndIndicated(page, refinement);
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", {
        name: "Start refinement in Claude Code",
      });
      await expect(dialog).toBeVisible();
      await expectEscapeReturnsThenTabMovesOn(page, {
        opener: refinement,
        dialog,
        next: inspect(notRefinedStory),
      });
    }
    expect(boundary.acceptances).toEqual([]);
  });

  test("a clickable noted Start does not look disabled in light and dark schemes", async ({
    page,
    frontendServices,
  }) => {
    // Every story queued: the Ready one being prepared, and the one listed
    // first with its execution session open on this machine.
    putFrontendStories(frontendServices, { taken: [], preparing: readyStory });
    frontendServices.answerMachine(
      makeMe.aMachineAnswer
        .observingOpen(frontendStoryLaunch("executing", takenStory).please())
        .please(),
    );
    await page.goto("/");
    await expectSettledPage(page, {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    });
    const { card, start, refine } = backlogLaunchers(page);
    // The preparing card's credited human lengthens its Preparing line,
    // moving its Starts; wait for it so a hover stays on the Start it is
    // aimed at.
    await expect(
      credit(credit(card(readyStory)).preparing).humanName,
    ).toBeVisible();

    const notedRefine = refine(readyStory);
    const notedExec = start(notRefinedStory);
    const notes = [
      [
        notedRefine,
        "Start refinement",
        beingPreparedNote,
        readyStory,
        "This story is being prepared.",
      ],
      [
        notedExec,
        "Start execution",
        notReadyNote,
        notRefinedStory,
        "This story is not assessed as ready.",
      ],
    ] as const;
    for (const [noted, name, note, title, sentence] of notes) {
      await expect(noted).toBeEnabled();
      await expect(launchGroup(card(title)).getByText(note)).toBeHidden();
      await expectNoteTooltip(noted, name, note);
      await expectActionGlyph(noted, name, startGlyphs[name]);
      // The launch dialog still states the note in words.
      await noted.click();
      const dialog = page.getByRole("dialog", {
        name: `${name} in Claude Code`,
      });
      await expect(dialog).toContainText(sentence);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }

    // At rest again: the last noted Start clicked keeps the pointer, and
    // Escape returned the keyboard to it.
    await page.mouse.move(0, 0);
    await notedExec.blur();

    // The open session leaves its story's Start unavailable.
    const disabled = start(takenStory);
    await expect(disabled).toBeDisabled();
    await expectActionGlyph(disabled, "Start execution", "play");
    await expect(notedRefine).toBeEnabled();
    await expect(notedExec).toBeEnabled();

    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      const disabledPaint = await launchPaint(disabled);
      for (const noted of [notedRefine, notedExec]) {
        const paint = await launchPaint(noted);
        expect(paint.color, `${scheme} noted text color`).not.toBe(
          disabledPaint.color,
        );
        expect(paint.borderColor, `${scheme} noted border color`).not.toBe(
          disabledPaint.borderColor,
        );
      }
    }

    for (const [noted, , note, title] of notes) {
      await expect(noted).toHaveAccessibleDescription(note);
      await expect(launchGroup(card(title)).getByText(note)).toBeHidden();
    }
  });
});
