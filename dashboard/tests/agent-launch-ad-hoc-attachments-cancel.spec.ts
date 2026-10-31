// Attach then Cancel or Escape uploads nothing and leaves no attachment
// folder; reopening shows none (SEED-204 E5 / commitments 7a, 7b, 7d).

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import type { LaunchJourney } from "./launchJourney.ts";
import { attempts } from "./agentLaunchBoundary.ts";
import {
  launchAttachmentClaimsRoot,
  launchAttachmentsRoot,
  listedMachineDirs,
  pickImagesInDialog,
  pngA,
  writePickedImages,
} from "./support/launchAttachmentFixtures.ts";

test.use({ projectFolders: ["open-dough"] });

const openJourney = (page: Page, launchJourney: LaunchJourney) =>
  openTakenBacklog(page, launchJourney);

async function attachOne(
  page: Page,
  dialog: ReturnType<typeof startSessionDialog>,
  testInfo: { outputPath: (segment: string) => string },
) {
  const picked = writePickedImages(testInfo, [
    { name: "card.png", bytes: pngA },
  ]);
  await startSessionField(dialog).fill("Why is this card clipped?");
  await pickImagesInDialog(page, dialog, picked);
  await expect(
    dialog
      .getByRole("list", { name: "Attached images" })
      .getByText("Image 1 · card.png"),
  ).toBeVisible();
}

function expectNoCarriedImages(home: string) {
  expect(listedMachineDirs(launchAttachmentsRoot(home))).toEqual([]);
  expect(listedMachineDirs(launchAttachmentClaimsRoot(home))).toEqual([]);
}

async function expectDismissClearsDraft(
  page: Page,
  dashboard: Parameters<typeof attempts>[0] & {
    home: string;
    claudeLaunchCalls: () => unknown[];
  },
  launchJourney: LaunchJourney,
  testInfo: { outputPath: (segment: string) => string },
  dismiss: (
    page: Page,
    dialog: ReturnType<typeof startSessionDialog>,
  ) => Promise<void>,
) {
  await openJourney(page, launchJourney);
  const button = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");
  await button.click();
  await attachOne(page, dialog, testInfo);

  await dismiss(page, dialog);
  await expect(dialog).toBeHidden();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await attempts(dashboard)).toEqual([]);
  expectNoCarriedImages(dashboard.home);

  await button.click();
  await expect(startSessionField(dialog)).toHaveValue("");
  await expect(
    dialog.getByRole("list", { name: "Attached images" }),
  ).toHaveCount(0);
  expectNoCarriedImages(dashboard.home);
}

test("Cancel after attaching uploads nothing; reopening shows no attachment", async ({
  page,
  dashboard,
  launchJourney,
}, testInfo) => {
  await expectDismissClearsDraft(
    page,
    dashboard,
    launchJourney,
    testInfo,
    async (page) => {
      await page.getByRole("button", { name: "Cancel" }).click();
    },
  );
});

test("Escape after attaching uploads nothing; reopening shows no attachment", async ({
  page,
  dashboard,
  launchJourney,
}, testInfo) => {
  await expectDismissClearsDraft(
    page,
    dashboard,
    launchJourney,
    testInfo,
    async (page) => {
      await page.keyboard.press("Escape");
    },
  );
});
