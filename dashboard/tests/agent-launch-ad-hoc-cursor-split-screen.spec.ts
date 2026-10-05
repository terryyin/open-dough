// A pasted Cursor instruction is accepted when the terminal delivers each
// screen in two reads. The working frame's content arrives before its end,
// so the instruction is pasted on that ready content. The frame's end then
// arrives, then the paste chip's cleared screen, and only later the chip.
// The cleared screen shows neither the chip nor the empty composer, and the
// frame that ended before it showed the composer, so the launch keeps
// waiting for the chip. The page shows the first input accepted from its
// first answer, and the kept record is confirmed when the launch returns.

import { publishCommittedOrigin } from "./committedOrigin.ts";
import { startSessionField, startedSession } from "./launchCardPage.ts";
import {
  expect,
  keptRecord,
  workingCursorTest,
} from "./support/cursorStart.ts";

const test = workingCursorTest.extend({ cursorSplitPaintMs: 300 });

test("a pasted Cursor instruction delivered in split screens is shown as accepted", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await startSessionField(dialog).fill("why is the CI slow?");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const recent = await startedSession(page);
  await expect(recent).toContainText("First input accepted");
  await expect(recent).toContainText("Ad hoc session started in Cursor");
  await expect(recent).not.toContainText("First input acceptance uncertain");
  // Acceptance was kept before the launch returned, so one read shows it.
  const kept = keptRecord(dashboard.home).firstInput;
  expect(kept?.state).toBe("confirmed");
  const client = cursor.attaches()[0];
  if (client === undefined) {
    throw new Error("Cursor did not start a terminal client.");
  }
  await expect.poll(() => cursor.input(client.pid)).toMatch(/\r$/u);
  const prompt = cursor.input(client.pid).replace(/\r$/u, "");
  expect(prompt.split("\n\n")[0]).toBe("why is the CI slow?");
  expect(kept).toEqual({ state: "confirmed", instruction: prompt });
});
