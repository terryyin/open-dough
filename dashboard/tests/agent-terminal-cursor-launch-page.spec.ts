// Starting an instructed Cursor session opens the terminal on that same
// client. The page shows its output and accepts typing. There is no
// launch-wait notice and no second agent. Closing and opening again shows
// that run.
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { startSessionField } from "./launchCardPage.ts";
import { expect, test } from "./support/cursorStart.ts";
import { keptCursor } from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";

const instruction = "hold this launch";
const notice =
  "Cursor is still working on this session's launch prompt. The terminal opens when it finishes.";

test.use({ cursorScreen: "working" });

test("an instructed Cursor start shows that run and accepts typing", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const original = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: original,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await startSessionField(dialog).fill(instruction);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(
    page.getByRole("log").filter({ hasText: "Ad hoc session started" }),
  ).toBeVisible({ timeout: 20_000 });
  const recent = parts(page).recentSessions.getByRole("article");
  await expect(recent).toHaveCount(1);
  await expect(recent).toContainText("First input accepted");
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  await expect(rows).toContainText("ctrl+c to stop");
  await expect(rows).toContainText("Add a follow-up");
  await expect(rows).not.toContainText(notice);
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const pid = cursor.attaches()[0]?.pid ?? 0;
  expect(processRunning(pid)).toBe(true);
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  expect(cursor.attaches()[0]?.args).not.toContain(instruction);

  await panel.locator(".xterm-screen").click();
  await page.keyboard.type("later");
  await expect.poll(() => cursor.input(pid)).toContain("later");
  expect(cursor.attaches()).toHaveLength(1);

  await panel.getByRole("button", { name: "Close", exact: true }).click();
  await expect(panel).toHaveCount(0);
  expect(processRunning(pid)).toBe(true);
  await recent.getByRole("button", { name: "Open terminal" }).click();
  await expect(rows).toContainText("ctrl+c to stop");
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(pid);
  expect(processRunning(pid)).toBe(true);
  const recorded = keptCursor(dashboard.home);
  expect(recorded.firstInput).toMatchObject({ state: "confirmed" });
  expect(recorded.firstInput?.instruction).toContain(instruction);
});
