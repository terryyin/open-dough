// Start session Attach images refusals: PDF, oversized PNG, and a sixth image
// each name their reason; instruction, other images and Session choices stay
// (SEED-204 E4 / commitments 4b.3, 11a–11g).

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import type { LaunchJourney } from "./launchJourney.ts";
import {
  launchAttachmentLimitBytes,
  launchAttachmentMaxCount,
  launchAttachmentTooLarge,
  launchAttachmentTooMany,
  launchAttachmentUnsupportedType,
} from "../src/launchAttachments.ts";
import {
  pickImagesInDialog,
  pngA,
  pngB,
  writePickedImages,
} from "./support/launchAttachmentFixtures.ts";

test.use({ projectFolders: ["open-dough"] });

const openJourney = (page: Page, launchJourney: LaunchJourney) =>
  openTakenBacklog(page, launchJourney);

test("PDF, oversized PNG and a sixth image are refused with reasons while the draft stays", async ({
  page,
  launchJourney,
}, testInfo) => {
  await openJourney(page, launchJourney);

  const text = "Why is this card clipped?";
  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  await startSessionField(dialog).fill(text);

  const keptPaths = writePickedImages(testInfo, [
    { name: "card.png", bytes: pngA },
  ]);
  await pickImagesInDialog(page, dialog, keptPaths);

  const list = dialog.getByRole("list", { name: "Attached images" });
  await expect(list.getByText("Image 1 · card.png")).toBeVisible();

  const refusedPaths = writePickedImages(testInfo, [
    { name: "notes.pdf", bytes: Buffer.from("%PDF-1.4") },
    {
      name: "huge.png",
      bytes: Buffer.alloc(launchAttachmentLimitBytes + 1, 0),
    },
  ]);
  await pickImagesInDialog(page, dialog, refusedPaths);

  const refused = dialog.getByRole("alert", { name: "Refused images" });
  await expect(refused).toContainText(
    `notes.pdf · ${launchAttachmentUnsupportedType}`,
  );
  await expect(refused).toContainText(`huge.png · ${launchAttachmentTooLarge}`);
  await expect(list.getByText("Image 1 · card.png")).toBeVisible();
  await expect(list.locator("img")).toHaveCount(1);
  await expect(startSessionField(dialog)).toHaveValue(text);
  await expect(dialog.getByRole("combobox", { name: "Host" })).toHaveValue(
    "claude",
  );
  await expect(
    dialog.getByRole("radio", { name: "Default main" }),
  ).toBeChecked();
  await expect(
    dialog.getByRole("radio", { name: "Wait for review" }),
  ).toBeChecked();

  const sixthBatch = writePickedImages(
    testInfo,
    [...Array(launchAttachmentMaxCount).keys()].map((index) => ({
      name: `extra-${String(index)}.png`,
      bytes: index % 2 === 0 ? pngA : pngB,
    })),
  );
  await pickImagesInDialog(page, dialog, sixthBatch);

  await expect(list.locator("img")).toHaveCount(launchAttachmentMaxCount);
  await expect(list.getByText("Image 1 · card.png")).toBeVisible();
  await expect(list.getByText("Image 5 · extra-3.png")).toBeVisible();
  await expect(refused).toContainText(
    `extra-4.png · ${launchAttachmentTooMany}`,
  );
  await expect(startSessionField(dialog)).toHaveValue(text);
  await expect(
    dialog.getByRole("radio", { name: "Default main" }),
  ).toBeChecked();
});
