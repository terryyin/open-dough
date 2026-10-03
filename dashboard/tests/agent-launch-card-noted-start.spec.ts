// A clickable noted Start on a story-stages preparing revision: its look stays
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

test.use({ projectFolders: ["open-dough"] });

const notReadyNote = "Not marked Ready for execution";
const beingPreparedNote = "Being prepared";

const launchPaint = (button: Locator) =>
  button.evaluate((node) => {
    const style = getComputedStyle(node);
    return { color: style.color, borderColor: style.borderColor };
  });

test.describe("a clickable noted Start", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("does not look disabled in light and dark schemes", async ({
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
