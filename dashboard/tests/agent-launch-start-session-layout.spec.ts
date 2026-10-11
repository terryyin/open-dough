// The Start session dialog's reading order and fit, with no story title to
// stretch it: the text takes the keyboard first, Host and Model follow, then
// the Session group with After checks, the closed Command details, and
// Cancel and Start with the line of what Start does always in view. With
// Automatically land chosen, whose line is the longest, and Command details
// open, nothing scrolls sideways and every control is reachable at 320 CSS
// pixels and at 200% zoom (./accessibleReading.ts's twiceZoomedWindow), where
// the choices of After checks wrap under their legend rather than widen the
// dialog.

import type { Page } from "@playwright/test";
import { twiceZoomedWindow } from "./accessibleReading.ts";
import { expect, test } from "./dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchCardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import {
  box,
  expectEveryControlReachable,
  expectNoSidewaysScrollIn,
} from "./pageLayout.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const effects =
  "Default main · Automatically land The session runs in this project's folder on default main, with its existing changes; verified results land on origin without another review. Pressing Start authorizes that push.";

async function openStartSession(page: Page) {
  await openTakenBacklog(page, journey);
  await startSession(page, "Open Dough").click();
  return startSessionDialog(page, "Open Dough");
}

test("the text comes first, then Host and Model, the Session group, Command details, Cancel and Start", async ({
  page,
}) => {
  const dialog = await openStartSession(page);
  await expect(startSessionField(dialog)).toBeFocused();
  const details = dialog.locator("summary", { hasText: "Command details" });
  const where = dialog.getByText(
    "The session runs in this project's folder on default main, with its existing changes.",
    { exact: true },
  );
  await expect(where).toBeHidden();
  for (const next of [
    dialog.getByRole("button", { name: "Record", exact: true }),
    dialog.getByRole("combobox", { name: "Host" }),
    dialog.getByRole("combobox", { name: "Model" }),
    dialog.getByRole("radio", { name: "Wait for review" }),
    details,
    dialog.getByRole("button", { name: "Cancel" }),
    dialog.getByRole("button", { name: "Start", exact: true }),
  ]) {
    await page.keyboard.press("Tab");
    await expect(next).toBeFocused();
  }
  // Start session has no command line; its details say where it runs.
  await details.click();
  await expect(where).toBeVisible();
  await expect(dialog.locator("code")).toHaveCount(0);
});

for (const { name, viewport, deviceScaleFactor, wrapped } of [
  {
    name: "at 320 CSS pixels",
    viewport: { width: 320, height: 640 },
    deviceScaleFactor: 1,
    wrapped: true,
  },
  {
    name: "at 200% zoom",
    viewport: twiceZoomedWindow,
    deviceScaleFactor: 2,
    wrapped: false,
  },
]) {
  test.describe(name, () => {
    test.use({ viewport, deviceScaleFactor });

    test("with Automatically land chosen and Command details open, nothing scrolls sideways, every control is reachable, and the line beside Start stays in view", async ({
      page,
    }) => {
      const dialog = await openStartSession(page);
      const group = dialog.getByRole("group", { name: "After checks" });
      const review = group.getByRole("radio", { name: "Wait for review" });
      const land = group.getByRole("radio", { name: "Automatically land" });
      await land.check();
      await dialog.locator("summary", { hasText: "Command details" }).click();
      await expect(
        dialog.getByText("Its first message carries the established session"),
      ).toBeVisible();

      // The two choices share a row where it fits, and wrap where it does not.
      const [first, second] = [await box(review), await box(land)];
      if (wrapped) expect(second.y).toBeGreaterThan(first.y);
      else expect(second.y).toBe(first.y);

      await expectNoSidewaysScrollIn(page, dialog);
      await expectEveryControlReachable(dialog);
      const start = dialog.getByRole("button", { name: "Start", exact: true });
      await expect(start).toHaveAccessibleDescription(effects);
      for (const kept of [
        start,
        dialog.getByRole("button", { name: "Cancel" }),
        dialog.getByText("Pressing Start authorizes that push."),
      ])
        await expect(kept).toBeInViewport({ ratio: 1 });
    });
  });
}
