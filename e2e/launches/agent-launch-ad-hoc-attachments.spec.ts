// Start session Attach images, with no typed text: pick two PNGs, remove
// Image 1, paste a third into the instruction field as pasted.png, Start →
// the terminal opens and fake Claude's prompt is the numbered list alone, each
// path under the test HOME's launch-attachments folder holding its bytes
// (SEED-204 E1 / commitments 5b, 5c). Text before the list is
// ../../dashboard/backend-tests/launches/developer-part.spec.ts and Codex's
// ./agent-launch-ad-hoc-attachments-codex.spec.ts; pasting text and refused
// images are ../../dashboard/frontend-tests/launches/launch-attachments.spec.ts.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import type { LaunchJourney } from "../../dashboard/test-support/launchJourney.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import {
  expectCopiedAttachmentPath,
  pasteImageInField,
  pickImagesInDialog,
  pngA,
  pngB,
  writePickedImages,
} from "../../dashboard/test-support/support/launchAttachmentFixtures.ts";
import {
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import { claudeLaunch } from "../../dashboard/test-support/support/claudeLaunch.ts";
import { adHocDeveloperInput } from "../../dashboard/test-support/support/reportingInputAssertions.ts";

test.use({ projectFolders: ["open-dough"] });

const openJourney = (page: Page, launchJourney: LaunchJourney) =>
  openTakenBacklog(page, launchJourney);

test("attaching two images, removing Image 1 and pasting one with no text sends the list alone and opens the terminal", async ({
  page,
  dashboard,
  launchJourney,
}, testInfo) => {
  dashboard.claudeScenario("launched");
  await openJourney(page, launchJourney);
  const picked = writePickedImages(testInfo, [
    { name: "card-a.png", bytes: pngA },
    { name: "card-b.png", bytes: pngB },
  ]);

  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  const field = startSessionField(dialog);
  await pickImagesInDialog(page, dialog, picked);

  const list = dialog.getByRole("list", { name: "Attached images" });
  await expect(list.getByText("Image 1 · card-a.png")).toBeVisible();
  await expect(list.getByText("Image 2 · card-b.png")).toBeVisible();
  await list.getByRole("button", { name: "Remove Image 1" }).click();
  await expect(list.getByText("Image 1 · card-b.png")).toBeVisible();
  await expect(list.getByText("card-a.png")).toHaveCount(0);

  await pasteImageInField(field, pngA);
  await expect(list.getByText("Image 2 · pasted.png")).toBeVisible();
  await expect(list.locator("img")).toHaveCount(2);
  await expect(field).toHaveValue("");

  await dialog.getByRole("button", { name: "Start" }).click();
  await expect(dialog).toBeHidden();
  // Images are input but not typed text: the terminal opens.
  await expect(terminalScreenParts(terminalPanel(page)).input).toBeFocused();

  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  const prompt = adHocDeveloperInput(call?.argv.at(-1) ?? "");
  const match = /^Attached images:\n1\. (.+)\n2\. (.+)$/u.exec(prompt);
  const [, cardB = "", pasted = ""] = match ?? [];
  expectCopiedAttachmentPath(cardB, dashboard.home, "1-card-b.png");
  expectCopiedAttachmentPath(pasted, dashboard.home, "2-pasted.png");
  expect(readFileSync(cardB)).toEqual(pngB);
  expect(readFileSync(pasted)).toEqual(pngA);

  await expect
    .poll(async () => {
      const [record] = (await recordsOf(
        dashboard,
        "open-dough",
      )) as LaunchRecord[];
      return record?.request.attachments;
    })
    .toEqual([cardB, pasted]);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expect(record?.request.title).toMatch(
    /^Ad hoc work — \d{1,2} \w{3}, \d\d:\d\d$/,
  );
  expect(call && claudeLaunch(call).name).toBe(
    `Open Dough · Ad hoc · ${record?.request.title}`,
  );
  expect(record?.request.attachmentDigests).toEqual(
    [pngB, pngA].map((png) => createHash("sha256").update(png).digest("hex")),
  );
  expect(record?.request).not.toHaveProperty("instruction");
  expect(JSON.stringify(record?.request)).not.toMatch(/iVBOR/);
  expect(record?.request).not.toHaveProperty("attachmentClaims");
});
