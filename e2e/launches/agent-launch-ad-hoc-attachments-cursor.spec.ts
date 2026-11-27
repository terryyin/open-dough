// Ad hoc Cursor Start session with a chosen model and only one attached
// image: the native input's first prompt is the Attached images path list
// (the numbered absolute path under the test HOME's launch-attachments
// folder), then reporting context and the Taken story line. The generic
// attachment journey is ./agent-launch-ad-hoc-attachments.spec.ts.

import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  startSessionField,
  startedSession,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  deploymentCursorTest as test,
  expect,
  keptRecord,
} from "../../dashboard/test-support/support/cursorStart.ts";
import {
  adHocDeveloperInput,
  expectAdHocReportingInput,
} from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import {
  expectCopiedAttachmentPath,
  pickImagesInDialog,
  pngA,
  writePickedImages,
} from "../../dashboard/test-support/support/launchAttachmentFixtures.ts";

test("Cursor Start session with a chosen model and only an image is admitted", async ({
  page,
  dashboard,
  origin,
  cursor,
}, testInfo) => {
  const original = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: original,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");

  const picked = writePickedImages(testInfo, [
    { name: "card.png", bytes: pngA },
  ]);

  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await dialog.getByRole("combobox", { name: "Model" }).selectOption("gpt-5.2");
  await expect(startSessionField(dialog)).toHaveValue("");

  await pickImagesInDialog(page, dialog, picked);

  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await startedSession(page);

  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const client = cursor.attaches()[0];
  if (client === undefined) {
    throw new Error("Cursor did not start a terminal client.");
  }
  await expect.poll(() => cursor.input(client.pid)).toMatch(/\r$/u);
  const prompt = cursor.input(client.pid).replace(/\r$/u, "");
  const record = keptRecord(dashboard.home);

  expect(record.request.model).toBe("gpt-5.2");

  const expectedPrefix = "Attached images:\n1. ";
  const images = adHocDeveloperInput(prompt);
  expect(images.startsWith(expectedPrefix)).toBe(true);
  const attachedPath = images.slice(expectedPrefix.length);
  expectAdHocReportingInput(prompt, images, record.request, dashboard);
  expectCopiedAttachmentPath(attachedPath, dashboard.home, "1-card.png");
  expect(record.request.attachments).toEqual([attachedPath]);
  expect(client.args).toEqual(
    expect.arrayContaining([
      "--resume",
      cursor.sessionId,
      "--model",
      "gpt-5.2",
    ]),
  );
  expect(cursor.calls().some((call) => call.args[0] === "create-chat")).toBe(
    true,
  );
});
