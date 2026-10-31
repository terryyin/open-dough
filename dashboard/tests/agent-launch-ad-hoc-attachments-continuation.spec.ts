// Unconfirmed Codex first input continued from Startup recovery resends the
// same Attached images paths while those files still exist (SEED-204 E7 /
// commitments 9a, 9c, 9d, 9e).

import { existsSync, readFileSync } from "node:fs";
import { attempts } from "./agentLaunchBoundary.ts";
import { openTakenBacklog, startSessionField } from "./launchStoryCardPage.ts";
import { recoveryOf } from "./responsiveRecovery.ts";
import {
  expectCopiedAttachmentPath,
  launchAttachmentClaimsRoot,
  launchAttachmentsRoot,
  listedMachineDirs,
  pickImagesInDialog,
  pngA,
  writePickedImages,
} from "./support/launchAttachmentFixtures.ts";
import { expect, stored, test } from "./support/codexLaunch.ts";

test.setTimeout(120_000);
test.use({ projectFolders: ["open-dough"] });

test("unconfirmed Codex first input continued from Startup recovery resends the same attachment paths", async ({
  page,
  dashboard,
  codexProtocol,
  launchJourney,
}, testInfo) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.refuseInput = true;

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
  await startSessionField(dialog).fill(text);
  await pickImagesInDialog(page, dialog, picked);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();

  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind)
    .toBe("uncertain");
  await expect
    .poll(() => {
      try {
        return stored(dashboard.home)[0]?.firstInput?.state;
      } catch {
        return undefined;
      }
    })
    .toBe("awaiting");
  const [uncertain] = await attempts(dashboard);
  const saved = stored(dashboard.home)[0];
  const attachments = saved?.request.attachments ?? [];
  expect(attachments).toHaveLength(1);
  const [attachedPath] = attachments;
  if (attachedPath === undefined) throw new Error("Missing attachment path.");
  expectCopiedAttachmentPath(attachedPath, dashboard.home, "1-card.png");
  expect(readFileSync(attachedPath)).toEqual(pngA);
  const firstInput = saved?.firstInput;
  expect(firstInput).toMatchObject({ state: "awaiting" });
  expect(
    firstInput !== undefined &&
      "instruction" in firstInput &&
      typeof firstInput.instruction === "string"
      ? firstInput.instruction
      : "",
  ).toContain(attachedPath);

  const recovery = recoveryOf(page);
  await expect(recovery).toContainText("Startup needs reconciliation");
  native.refuseInput = false;
  await recovery
    .getByRole("button", {
      name: "Continue session start of Ad hoc session",
    })
    .click();
  await expect(recoveryOf(page)).toHaveCount(0, { timeout: 30_000 });

  await expect
    .poll(() => native.calls.filter((call) => call.method === "turn/start"))
    .toHaveLength(2);
  const turns = native.calls.filter((call) => call.method === "turn/start");
  expect(turns[1]?.params).toEqual(turns[0]?.params);
  const resent = turns[1]?.params["input"] as
    Array<{ type: string; text?: string }> | undefined;
  expect(resent?.[0]?.text).toContain(attachedPath);
  expect(existsSync(attachedPath)).toBe(true);
  expect(readFileSync(attachedPath)).toEqual(pngA);
  expect(listedMachineDirs(launchAttachmentsRoot(dashboard.home))).toHaveLength(
    1,
  );
  expect(listedMachineDirs(launchAttachmentClaimsRoot(dashboard.home))).toEqual(
    [],
  );
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({
      id: uncertain?.id,
      outcome: expect.objectContaining({ kind: "launched" }),
    }),
  ]);
});
