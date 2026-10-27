// Backlog Starts share their launch row or wrap in reading order before Inspect
// story, at 420px and the 200% zoom proxy. Cancelling returns focus to Start;
// Tab continues. A note appears in the styled tooltip on hover/focus and in
// its accessible description once; the dialog says “This story is …”.
// Unnoted Starts have no tooltip. Noted, disabled, and preparing Starts retain
// distinct light/dark appearances and decorative workflow glyphs; Inspect
// story's chevron turns with its detail. The committed story-columns origin
// and synthetic Claude match ./agent-launch-story-card.spec.ts; no real host runs.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import {
  storyCardLaunchActions,
  expectActionGlyph,
  expectChevronTurns,
  inspectionGroup,
  launchGroup,
} from "./storyCardControls.ts";
import {
  expectEscapeReturnsThenTabMovesOn,
  expectFocusedAndIndicated,
  narrowWindow,
  twiceZoomedWindow,
} from "./accessibleReading.ts";
import {
  expectInReadingOrder,
  expectNoSidewaysScrollAndWholeText,
  expectOnOneLine,
  expectOnOneLineWhenRoom,
} from "./pageLayout.ts";
import { tooltipOf } from "./frameIconControl.ts";

test.use({ projectFolders: ["open-dough"] });

const notReadyNote = "Not assessed as ready";
const beingPreparedNote = "Being prepared";
// The glyph each Start leads with.
const startGlyphs = {
  "Start execution": "play",
  "Start refinement": "pencil-line",
} as const;

// A noted Start at rest shows no note on its card; hovered, or reached with
// the keyboard, it shows the note in the frame's styled tooltip, hidden from
// assistive technology because the note is already its description.
async function expectNoteTooltip(start: Locator, name: string, note: string) {
  const page = start.page();
  const tip = tooltipOf(start, note);
  await expect(start).toHaveAccessibleName(name);
  await expect(start).toHaveAccessibleDescription(note);
  await page.mouse.move(0, 0);
  await start.blur();
  await expect(tip).toBeHidden();
  // The tooltip hangs below its Start, so a Start that wrapping leaves at the
  // window's bottom edge is first brought to the middle, leaving the tooltip
  // room to show whole.
  await start.evaluate((node) => {
    node.scrollIntoView({ block: "center" });
  });
  await start.hover();
  await expect(tip).toBeVisible();
  await expect(tip).toBeInViewport({ ratio: 1 });
  await expect(tip.locator("xpath=..")).toHaveClass(/\bframe-tooltip\b/);
  await expect(tip.locator("xpath=..")).toHaveAttribute("aria-hidden", "true");
  await page.mouse.move(0, 0);
  await expect(tip).toBeHidden();
  await start.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(start).toBeFocused();
  await expect(tip).toBeVisible();
  await start.blur();
  await expect(tip).toBeHidden();
}

const launchPaint = (button: Locator) =>
  button.evaluate((node) => {
    const style = getComputedStyle(node);
    return { color: style.color, borderColor: style.borderColor };
  });

test.describe("a Backlog card's Starts", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("share the launch group's line at 1440px and wrap in reading order, by keyboard, at 420px and 200% zoom", async ({
    page,
    dashboard,
  }) => {
    const { card, action, settled } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    await settled();
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
    const readyStart = action(readyStory, "Execution");
    await readyStart.hover();
    await expect(readyStart).toHaveAccessibleDescription("");
    await expect(
      launchGroup(card(readyStory)).locator(".frame-tooltip"),
    ).toHaveCount(0);
    const notedLaunches = launchGroup(card(notRefinedStory));
    await expect(notedLaunches.getByText(notReadyNote)).toBeHidden();
    await expectOnOneLineWhenRoom(notedLaunches, startsOf(notRefinedStory));
    const execution = action(notRefinedStory, "Execution");
    const refinement = action(notRefinedStory, "Refinement");
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
      // The keyboard walks the launch group, then the inspection group, and
      // a cancelled Start returns it to that Start.
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
    expect(dashboard.claudeLaunchCalls()).toHaveLength(0);
  });

  test("a clickable noted Start does not look disabled in light and dark schemes", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, action, settled, show, launch } =
      await openStoryColumnsJourney(page, columnsJourney);
    await show(columnsJourney.preparing);
    // The preparing card's credited human arrives after the page settles and
    // lengthens its Preparing line, moving its Starts; wait for it so a hover
    // stays on the Start it is aimed at.
    await expect(
      card(readyStory).locator(".story-card-preparing .owner-human-name"),
    ).toBeVisible();

    const notedRefine = action(readyStory, "Refinement");
    const notedExec = action(notRefinedStory, "Execution");
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

    await launch(takenStory, "Execution");
    await settled();
    const disabled = action(takenStory, "Execution");
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
