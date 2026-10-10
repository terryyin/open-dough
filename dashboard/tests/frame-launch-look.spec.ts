// The launch dialogs and the agent roster's chrome in the frame's look: a
// launch dialog's text reads clearly and its fields, disclosures, and footer
// buttons are recognisable, with Start the one filled action; at a narrow
// window and at 200% zoom nothing in Start session scrolls sideways and every
// control is reachable (Start refinement's fit, with every option selected, is
// ./agent-launch-dialog-layout.spec.ts); the roster's heading and Back read
// clearly and fit a narrow and a zoomed window. Each launch dialog's
// long-title story is ./longTitleLaunch.ts; the roster's published profiles
// are ./agentRosterRecords.ts.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  expectControlContrast,
  expectReadableAndRecognisable,
  expectReadableContrast,
  narrowWindow,
  twiceZoomedWindow,
  zoomedWindow,
} from "./accessibleReading.ts";
import { publishRosterOrigins } from "./agentRosterRecords.ts";
import { rosterParts } from "./dashboardPage.ts";
import { expectDecorativeIcon } from "./frameIconControl.ts";
import { showOptions, startSession } from "./launchCardPage.ts";
import {
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
  expectNoSidewaysScrollIn,
} from "./pageLayout.ts";
import {
  openLongTitleOrigin,
  openRefinement,
  publishLongTitleOrigin,
  type LongTitleOrigin,
} from "./longTitleLaunch.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

// Every piece of text a reader reads in a dialog, and every control.
const launchDialog = {
  texts: "h2, p, label, legend, summary",
  controls: "button, select, textarea",
  hasControls: false,
};

test.describe("launch dialogs in the frame's look", () => {
  let published: LongTitleOrigin;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    published = await publishLongTitleOrigin();
  });
  test.afterAll(() => (published as LongTitleOrigin | undefined)?.cleanup());
  test.use({ projectFolders: ["open-dough"] });

  test("Start refinement's fields, disclosures, and footer read clearly, with Start the filled action", async ({
    page,
    dashboard,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const { dialog } = await openRefinement(page, dashboard.home, published);
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
    {
      name: "at a narrow window",
      viewport: narrowWindow,
      deviceScaleFactor: 1,
    },
    { name: "at 200% zoom", viewport: twiceZoomedWindow, deviceScaleFactor: 2 },
  ]) {
    test.describe(name, () => {
      test.use({ viewport, deviceScaleFactor });

      test("Start session keeps every control reachable and readable without sideways scrolling", async ({
        page,
        dashboard,
      }) => {
        await openLongTitleOrigin(page, dashboard.home, published);
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
});

test("the agent roster's heading and Back read clearly and fit a narrow and a zoomed window", async ({
  page,
}) => {
  await publishRosterOrigins(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openUntilRead(page, "/?project=doughnut&view=roster");
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
    await expectNoSidewaysScrollAndWholeText(page);
  }
});
