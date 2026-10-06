// A Backlog card's Starts on the committed story-stages origin: they share
// the card's launch group's line when the card is wide enough, and wrap in
// reading order, by keyboard, at 420px and the 200% zoom proxy, before Inspect
// story in the inspection group; a cancelled launch dialog returns the
// keyboard to its Start, and Tab moves on. A noted Start shows its note only
// in the frame's styled tooltip, on hover and on keyboard focus, and as its
// accessible description, announced once; its dialog says "This story is …".
// A Start without a note has no tooltip. A clickable noted Start on a
// story-stages preparing revision keeps a look distinct from a disabled Start
// on the same page, in light and dark schemes. Each Start leads with its
// workflow's decorative glyph, noted or disabled alike, and Inspect story
// leads with a decorative chevron that turns while its detail is open.
// Backlog-card launch behavior on a committed origin is ./agent-launch-card.spec.ts;
// the page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import {
  cardLaunchActions,
  expectActionGlyph,
  expectChevronTurns,
  inspectionGroup,
  launchGroup,
} from "./cardControls.ts";
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

const notReadyNote = "Not marked Ready for execution";
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
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("share the launch group's line at 1440px and wrap in reading order, by keyboard, at 420px and 200% zoom", async ({
    page,
    dashboard,
  }) => {
    const { card, action, settled } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    await settled();
    const startsOf = (title: string) =>
      cardLaunchActions.map((name) =>
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
      await openStoryStagesJourney(page, stagesJourney);
    await show(stagesJourney.preparing);
    // The preparing card's credited human arrives after the page settles and
    // lengthens its Preparing line, moving its Starts; wait for it so a hover
    // stays on the Start it is aimed at.
    await expect(
      card(readyStory).locator(".card-preparing .owner-human-name"),
    ).toBeVisible();

    const notedRefine = action(readyStory, "Refinement");
    const notedExec = action(notRefinedStory, "Execution");
    const notes = [
      [notedRefine, "Start refinement", beingPreparedNote, readyStory],
      [notedExec, "Start execution", notReadyNote, notRefinedStory],
    ] as const;
    for (const [noted, name, note, title] of notes) {
      await expect(noted).toBeEnabled();
      await expect(launchGroup(card(title)).getByText(note)).toBeHidden();
      await expectNoteTooltip(noted, name, note);
      await expectActionGlyph(noted, name, startGlyphs[name]);
      // The launch dialog still states the note in words.
      await noted.click();
      const dialog = page.getByRole("dialog", {
        name: `${name} in Claude Code`,
      });
      await expect(dialog).toContainText(
        `This story is ${note.charAt(0).toLowerCase()}${note.slice(1)}.`,
      );
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
