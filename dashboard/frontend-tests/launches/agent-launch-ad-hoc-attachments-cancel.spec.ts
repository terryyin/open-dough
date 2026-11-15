// Attach then Cancel or Escape uploads nothing and asks for no launch;
// reopening shows an empty draft with no attachment (SEED-204 E5 /
// commitments 7a, 7b, 7d). Built frontend against controlled launch boundary
// answers; what the boundary keeps of an upload is
// ../../backend-tests/launches/launch-attachment-boundary.spec.ts.

import type { Page } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../tests/support/frontendLaunchSubstitutes.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../tests/launchStoryCardPage.ts";
import {
  pickImagesInDialog,
  pngA,
  writePickedImages,
} from "../../tests/support/launchAttachmentFixtures.ts";

for (const [dismissal, dismiss] of [
  [
    "Cancel",
    (page: Page) => page.getByRole("button", { name: "Cancel" }).click(),
  ],
  ["Escape", (page: Page) => page.keyboard.press("Escape")],
] as const) {
  test(`${dismissal} after attaching uploads nothing; reopening shows no attachment`, async ({
    page,
  }, testInfo) => {
    const boundary = await installFrontendLaunchBoundary(page);
    await openFrontendTakenBacklog(page);
    const button = startSession(page, "Open Dough");
    const dialog = startSessionDialog(page, "Open Dough");
    await button.click();
    await startSessionField(dialog).fill("Why is this card clipped?");
    await pickImagesInDialog(
      page,
      dialog,
      writePickedImages(testInfo, [{ name: "card.png", bytes: pngA }]),
    );
    const attached = dialog.getByRole("list", { name: "Attached images" });
    await expect(attached.getByText("Image 1 · card.png")).toBeVisible();

    await dismiss(page);
    await expect(dialog).toBeHidden();

    await button.click();
    await expect(startSessionField(dialog)).toHaveValue("");
    await expect(attached).toHaveCount(0);
    expect(boundary.uploads()).toBe(0);
    expect(boundary.acceptances).toEqual([]);
  });
}
