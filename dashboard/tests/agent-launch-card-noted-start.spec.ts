// A Backlog card's Starts on the committed story-stages origin: they share
// the card's launch group's line, each note beside the Start it describes,
// when the card is wide enough, and wrap in reading order, by keyboard, at
// 420px and the 200% zoom proxy, before Inspect story in the inspection group.
// A clickable noted Start on a story-stages preparing revision keeps a look
// distinct from a disabled Start on the same page, in light and dark schemes.
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

test.use({ projectFolders: ["open-dough"] });

const notReadyNote = "Not marked Ready for execution";
const beingPreparedNote = "Being prepared";

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
    dashboard.claudeScenario("launched");
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
    const note = launchGroup(card(notRefinedStory)).getByText(notReadyNote);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expectOnOneLine(startsOf(readyStory));
    // The noted card's line holds both Starts and the note only where this
    // platform's text leaves it room; the note follows the Start it
    // describes, before the next one, either way.
    const notedLaunches = launchGroup(card(notRefinedStory));
    await expectOnOneLineWhenRoom(notedLaunches, startsOf(notRefinedStory));
    const execution = action(notRefinedStory, "Execution");
    const refinement = action(notRefinedStory, "Refinement");
    await expectInReadingOrder(notedLaunches, [execution, note, refinement]);

    for (const window of [narrowWindow, twiceZoomedWindow]) {
      await page.setViewportSize(window);
      await expectNoSidewaysScrollAndWholeText(page);
      for (const title of [readyStory, notRefinedStory])
        await expectInReadingOrder(card(title), [
          ...startsOf(title),
          inspect(title),
        ]);
      await expectInReadingOrder(card(notRefinedStory), [
        execution,
        note,
        refinement,
      ]);
      // The keyboard walks the launch group, then the inspection group;
      // a cancelled Start and a closed detail return it usefully.
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
      await page.keyboard.press("Enter");
      const hide = inspectionGroup(card(notRefinedStory)).getByRole("button", {
        name: "Hide detail",
      });
      await expectFocusedAndIndicated(page, hide);
      await page.keyboard.press("Enter");
      await expectFocusedAndIndicated(page, card(notRefinedStory));
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

    const notedRefine = action(readyStory, "Refinement");
    const notedExec = action(notRefinedStory, "Execution");
    await expect(notedRefine).toBeEnabled();
    await expect(notedRefine).toHaveAccessibleDescription(beingPreparedNote);
    await expect(
      card(readyStory).getByText(beingPreparedNote, { exact: true }),
    ).toBeVisible();
    await expect(notedExec).toBeEnabled();
    await expect(notedExec).toHaveAccessibleDescription(notReadyNote);
    await expect(
      card(notRefinedStory).getByText(notReadyNote, { exact: true }),
    ).toBeVisible();

    await launch(takenStory, "Execution");
    await settled();
    const disabled = action(takenStory, "Execution");
    await expect(disabled).toBeDisabled();
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

    await expect(
      card(readyStory).getByText(beingPreparedNote, { exact: true }),
    ).toBeVisible();
    await expect(
      card(notRefinedStory).getByText(notReadyNote, { exact: true }),
    ).toBeVisible();
  });
});
