// The launch dialogs and the agent roster's chrome in the frame's look: a
// launch dialog's text reads clearly and its fields, disclosures, and footer
// buttons are recognisable, with Start the one filled action; at a narrow
// window and at 200% zoom nothing in Start session scrolls sideways and every
// control is reachable (Start refinement's fit, with every option selected, is
// ../launches/agent-launch-dialog-layout.spec.ts); the roster's heading and
// Back read clearly and fit a narrow and a zoomed window.

import type { Locator } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { answerCatalogProjects } from "../../tests/support/frontendCatalogProjects.ts";
import {
  expectControlContrast,
  expectReadableAndRecognisable,
  expectReadableContrast,
  narrowWindow,
  twiceZoomedWindow,
  zoomedWindow,
} from "../../tests/accessibleReading.ts";
import { rosterParts } from "../../tests/dashboardPage.ts";
import { expectDecorativeIcon } from "../../tests/frameIconControl.ts";
import { showOptions, startSession } from "../../tests/launchStoryCardPage.ts";
import { openLongTitleRefinement } from "../../tests/longTitleLaunch.ts";
import {
  compactProjectSelectCut,
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
  expectNoSidewaysScrollIn,
} from "../../tests/pageLayout.ts";

// Every piece of text a reader reads in a dialog, and every control.
const launchDialog = {
  texts: "h2, p, label, legend, summary",
  controls: "button, select, textarea",
  hasControls: false,
};

test("Start refinement's fields, disclosures, and footer read clearly, with Start the filled action", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const { dialog } = await openLongTitleRefinement(page, frontendServices);
  await showOptions(dialog);
  await dialog.locator("summary", { hasText: "Command details" }).click();
  for (const summary of await dialog.locator("summary").all())
    await expectDecorativeIcon(summary);
  await expectReadableAndRecognisable(dialog, launchDialog);

  const start = dialog.getByRole("button", { name: "Start", exact: true });
  const cancel = dialog.getByRole("button", { name: "Cancel" });
  const fill = (button: Locator) =>
    button.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await fill(start)).not.toBe(await fill(cancel));
});

for (const { name, viewport, deviceScaleFactor } of [
  { name: "at a narrow window", viewport: narrowWindow, deviceScaleFactor: 1 },
  { name: "at 200% zoom", viewport: twiceZoomedWindow, deviceScaleFactor: 2 },
]) {
  test.describe(name, () => {
    test.use({ viewport, deviceScaleFactor });

    test("Start session keeps every control reachable and readable without sideways scrolling", async ({
      page,
    }) => {
      await openFrontendTakenBacklog(page);
      await startSession(page, "Open Dough").click();
      const session = page.getByRole("dialog", {
        name: "Start a session in Open Dough in Claude Code",
      });
      await expect(session).toBeVisible();
      await expectNoSidewaysScrollIn(page, session);
      await expectEveryControlReachable(session);
      await expectReadableAndRecognisable(session, launchDialog);
    });
  });
}

test("the agent roster's heading and Back read clearly and fit a narrow and a zoomed window", async ({
  page,
  frontendServices,
}) => {
  await answerCatalogProjects(page, frontendServices);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?project=doughnut&view=roster");
  const { roster, back, members } = rosterParts(page);
  const heading = roster.getByRole("heading", { name: "Agent roster" });
  await expect(heading).toBeFocused();
  await expect(members.first()).toBeVisible();

  await expect(back).toHaveText("Back to stories");
  await expectDecorativeIcon(back);
  await expectReadableContrast(back);
  await expectControlContrast(back);
  await expectReadableContrast(heading);
  await expectReadableContrast(roster.locator(".roster-source"));

  for (const size of [narrowWindow, zoomedWindow]) {
    await page.setViewportSize(size);
    await expect(back).toBeVisible();
    await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  }
});
