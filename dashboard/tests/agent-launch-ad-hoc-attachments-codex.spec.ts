// Ad hoc Codex Start session with one attached image: the turn/start text
// item ends with the same Attached images path list as Claude's developer
// part (typed text, blank line, then the numbered absolute path under the
// test HOME's launch-attachments folder).

import { test, expect, stored } from "./support/codexLaunch.ts";
import { openTakenBacklog, startSessionField } from "./launchStoryCardPage.ts";
import {
  expectCopiedAttachmentPath,
  pickImagesInDialog,
  pngA,
  writePickedImages,
} from "./support/launchAttachmentFixtures.ts";

test.setTimeout(120_000);

test.use({ projectFolders: ["open-dough", "pygardon"] });

test("Codex Start session with one attached image ends the text input with its copied path", async ({
  page,
  dashboard,
  codexProtocol,
  launchJourney,
}, testInfo) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");

  await openTakenBacklog(page, launchJourney);
  const picked = writePickedImages(testInfo, [
    { name: "card.png", bytes: pngA },
  ]);

  const text = "Why is this card clipped?";
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("codex");
  await expect(dialog).toHaveAccessibleName(
    "Start a session in Open Dough in Codex",
  );
  await startSessionField(dialog).fill(text);

  await pickImagesInDialog(page, dialog, picked);
  await expect(
    dialog
      .getByRole("list", { name: "Attached images" })
      .getByText("Image 1 · card.png"),
  ).toBeVisible();

  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();

  await expect
    .poll(() => native.calls.filter((call) => call.method === "turn/start"))
    .toHaveLength(1);
  const [turn] = native.calls.filter((call) => call.method === "turn/start");
  const input = turn?.params["input"] as
    Array<{ type: string; text?: string }> | undefined;
  expect(input?.[0]?.type).toBe("text");
  const prompt = input?.[0]?.text ?? "";
  const expectedPrefix = `${text}\n\nAttached images:\n1. `;
  expect(prompt.startsWith(expectedPrefix)).toBe(true);
  // Ad hoc without an established session may still append reporting after
  // the developer part; the list is the end of that part.
  const afterPrefix = prompt.slice(expectedPrefix.length);
  const attachedPath = afterPrefix.split("\n\n")[0] ?? "";
  expectCopiedAttachmentPath(attachedPath, dashboard.home, "1-card.png");
  expect(stored(dashboard.home)[0]?.request.attachments).toEqual([
    attachedPath,
  ]);
});
