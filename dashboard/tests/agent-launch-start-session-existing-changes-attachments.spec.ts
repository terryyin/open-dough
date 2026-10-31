// Default main Existing changes keeps attached images through Back; Continue
// with existing changes sends them once, copied under launch-attachments
// (SEED-204 E6 / commitments 7e, 7f).

import { realpathSync, readFileSync } from "node:fs";
import { attempts, recordsOf } from "./agentLaunchBoundary.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import {
  dirty,
  existingChangesHeading as heading,
  status,
} from "./support/defaultCheckoutChanges.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog, originMain, radio } from "./support/sessionDialog.ts";
import {
  defaultMainSession,
  defaultMainStart,
  recordStarts,
  sessionBlock,
} from "./support/startSessionLanding.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  expectCopiedAttachmentPath,
  launchAttachmentClaimsRoot,
  launchAttachmentsRoot,
  listedMachineDirs,
  pickImagesInDialog,
  pngA,
  writePickedImages,
} from "./support/launchAttachmentFixtures.ts";

const text = "Explain how launch records are stored";

test("existing changes Back keeps images; Continue sends them copied once", async ({
  page,
  dashboard,
  origin,
}, testInfo) => {
  const starts = recordStarts(origin);
  await openBacklog(page, origin);
  const before = await originMain(origin);
  dirty(origin.project);
  const changes = status(origin.project);

  const picked = writePickedImages(testInfo, [
    { name: "card.png", bytes: pngA },
  ]);
  const button = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");
  await button.click();
  const instruction = startSessionField(dialog);
  await instruction.fill(text);
  await pickImagesInDialog(page, dialog, picked);
  const list = dialog.getByRole("list", { name: "Attached images" });
  await expect(list.getByText("Image 1 · card.png")).toBeVisible();
  const autoLand = radio(dialog, "After checks", "Automatically land");
  await autoLand.check();

  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await start.click();

  const warning = dialog.getByRole("heading", { name: heading });
  await expect(warning).toBeFocused();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await attempts(dashboard)).toEqual([]);
  expect(listedMachineDirs(launchAttachmentsRoot(dashboard.home))).toEqual([]);
  expect(listedMachineDirs(launchAttachmentClaimsRoot(dashboard.home))).toEqual(
    [],
  );

  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(start).toBeFocused();
  await expect(instruction).toHaveValue(text);
  await expect(list.getByText("Image 1 · card.png")).toBeVisible();
  await expect(autoLand).toBeChecked();
  await expect(warning).toHaveCount(0);
  expect(status(origin.project)).toBe(changes);

  dashboard.claudeScenario("launched");
  await start.click();
  await expect(warning).toBeFocused();
  await dialog
    .getByRole("button", { name: "Continue with existing changes" })
    .click();
  await expect(dialog).toBeHidden();

  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  await expect
    .poll(async () => {
      const [record] = (await recordsOf(
        dashboard,
        "open-dough",
      )) as LaunchRecord[];
      return record?.establishedSession;
    })
    .toEqual(defaultMainSession(origin.project, "auto-land", before));
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(origin.project));
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  const session = defaultMainSession(origin.project, "auto-land", before);
  const [block, reporting, developer, images] = (call?.argv.at(-1) ?? "").split(
    "\n\n",
  );
  expect(block).toBe(sessionBlock(session));
  expectReportingBlock(reporting, record?.request, dashboard);
  expect(developer).toBe(text);
  const expectedPrefix = "Attached images:\n1. ";
  expect(images?.startsWith(expectedPrefix)).toBe(true);
  const attachedPath = images?.slice(expectedPrefix.length) ?? "";
  expectCopiedAttachmentPath(attachedPath, dashboard.home, "1-card.png");
  expect(readFileSync(attachedPath)).toEqual(pngA);
  expect(listedMachineDirs(launchAttachmentsRoot(dashboard.home))).toHaveLength(
    1,
  );
  expect(listedMachineDirs(launchAttachmentClaimsRoot(dashboard.home))).toEqual(
    [],
  );
  expect(record?.request.attachments).toEqual([attachedPath]);
  expect(starts().map(({ argv }) => argv)).toEqual([
    defaultMainStart(origin.project, "auto-land"),
  ]);
});
