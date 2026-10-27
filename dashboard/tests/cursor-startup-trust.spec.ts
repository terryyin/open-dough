// Start's wait expires on a native-shaped unframed trust screen. The real
// page names its cause at the launch answer, Startup recovery, and entry,
// then the developer answers the kept client in the rendered terminal.
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { startSessionField } from "./launchStoryCardPage.ts";
import { recoveryOf } from "./responsiveRecovery.ts";
import { expect, test, keptRecord } from "./support/cursorStart.ts";

test.use({ cursorScreen: "trust-unframed", launchTimeoutMs: 1_500 });

test("Start and Startup recovery name workspace trust, and answering in the session terminal delivers the kept first input", async ({
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
  await startSessionField(dialog).fill("Explain the dashboard");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();

  const explanation =
    "Cursor is waiting for workspace trust. Answer the workspace trust prompt in this session's terminal to deliver the first input.";
  await expect(page.locator(".start-session-answer")).toContainText(
    explanation,
  );
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(explanation);
  const entry = parts(page).taken.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  await expect(entry).toContainText(explanation);
  await expect(entry).toContainText("First input acceptance uncertain");
  const record = keptRecord(dashboard.home);
  const instruction = record.firstInput?.instruction ?? "";
  expect(instruction).toContain("Explain the dashboard");
  expect(record.firstInput?.state).toBe("uncertain");
  const pid = cursor.attaches()[0]?.pid ?? 0;
  expect(cursor.input(pid)).toBe("");

  await entry.getByRole("button", { name: "Open terminal" }).click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText(
    "Workspace Trust Required",
  );
  await expect(panel.locator(".xterm-rows")).toContainText(
    "[a] Trust this workspace",
  );
  await panel.locator(".xterm-screen").click();
  await page.keyboard.type("a");
  await expect
    .poll(() => keptRecord(dashboard.home).firstInput)
    .toEqual({
      state: "confirmed",
      instruction,
    });
  expect(cursor.input(pid)).toBe(`a${instruction}\r`);
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(pid);
  // The page's existing session reread replaces the pending explanation.
  await page.reload();
  await expect(entry).toContainText("First input accepted");
  await expect(entry).not.toContainText(explanation);
});
