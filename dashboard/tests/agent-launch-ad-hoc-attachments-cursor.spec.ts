// Ad hoc Cursor Start session with one attached image: the first prompt's
// developer part ends with the same Attached images path list as Claude and
// Codex (typed text, blank line, then the numbered absolute path under the
// test HOME's launch-attachments folder), then reporting context.

import { publishCommittedOrigin } from "./committedOrigin.ts";
import { startSessionField, startedSession } from "./launchStoryCardPage.ts";
import {
  deploymentCursorTest as test,
  expect,
  keptRecord,
} from "./support/cursorStart.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import {
  expectCopiedAttachmentPath,
  pickImagesInDialog,
  pngA,
  writePickedImages,
} from "./support/launchAttachmentFixtures.ts";

test.setTimeout(120_000);

test("Cursor Start session with one attached image ends the prompt's developer part with its copied path", async ({
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

  const text = "Why is this card clipped?";
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await expect(dialog).toHaveAccessibleName(
    "Start a session in Open Dough in Cursor",
  );
  await startSessionField(dialog).fill(text);

  await pickImagesInDialog(page, dialog, picked);
  await expect(
    dialog
      .getByRole("list", { name: "Attached images" })
      .getByText("Image 1 · card.png"),
  ).toBeVisible();

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

  const expectedPrefix = `${text}\n\nAttached images:\n1. `;
  expect(prompt.startsWith(expectedPrefix)).toBe(true);
  const rest = prompt.slice(expectedPrefix.length);
  const [attachedPath, reporting, ...extra] = rest.split("\n\n");
  expect(extra).toEqual([]);
  expectCopiedAttachmentPath(attachedPath ?? "", dashboard.home, "1-card.png");
  expectReportingBlock(reporting, record.request, dashboard);
  expect(record.request.attachments).toEqual([attachedPath]);
});
