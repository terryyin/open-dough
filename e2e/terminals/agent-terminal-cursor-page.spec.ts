import { closeSidePanel } from "../../dashboard/tests/sidePanelFrame.ts";
// The page's Close leaves a working Cursor turn running. Reopening the
// terminal shows that same turn still working. Session switch closes the
// same socket; this page has one Cursor session, so Close is the control
// the developer uses here.
import { keptLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { showColumn } from "../../dashboard/tests/boardPage.ts";
import { startSessionField } from "../../dashboard/tests/launchStoryCardPage.ts";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import {
  expect,
  workingCursorTest as test,
} from "../../dashboard/tests/support/cursorStart.ts";
import { waitUntil } from "../../dashboard/tests/support/waitUntil.ts";
import { processRunning } from "../../dashboard/tests/support/processGroup.ts";
import { startedSessionTerminal } from "../../dashboard/tests/support/startedSessionTerminal.ts";
import {
  openTerminalControl,
  terminalScreenParts,
} from "../../dashboard/tests/terminalScreenPage.ts";

const instruction = "keep this turn running";

function keptRecord(home: string): LaunchRecord {
  const [record] = keptLaunchRecords(home);
  if (!record || !("session" in record) || record.session.host !== "cursor") {
    throw new Error("The recorded session is not Cursor.");
  }
  return record;
}

test("closing a working Cursor terminal and reopening it shows the same turn", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
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
  const recent = parts(page).taken.locator(".session-entry");
  // Close while the startup still goes on could see the start present the
  // session's terminal again.
  const panel = await startedSessionTerminal(page, recent);
  await expect(parts(page).adHocStarted).toHaveCount(0);
  const record = keptRecord(dashboard.home);
  const open = openTerminalControl(recent, { exact: false });
  const { rows } = terminalScreenParts(panel);
  // The started session's terminal opens beside the page, which then shows
  // one column.
  await expect(
    panel.getByRole("button", { name: "Prompts", exact: true }),
  ).toBeVisible();
  await showColumn(page, "Taken");
  await open.click();
  await expect(rows).toContainText("ctrl+c to stop");
  await expect(rows).toContainText("Add a follow-up");
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const pid = cursor.attaches()[0]?.pid ?? 0;
  expect(processRunning(pid)).toBe(true);

  await closeSidePanel(panel);
  await expect(panel).toHaveCount(0);
  const ended = await waitUntil(
    () => !processRunning(pid) || cursor.signals(pid).includes("SIGHUP"),
    { timeoutMs: 300 },
  );
  expect(ended).toBe(false);
  expect(processRunning(pid)).toBe(true);
  expect(cursor.signals(pid)).not.toContain("SIGHUP");
  expect(cursor.attaches()).toHaveLength(1);

  await open.click();
  await expect(rows).toContainText("ctrl+c to stop");
  await expect(rows).toContainText("Add a follow-up");
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(pid);
  expect(processRunning(pid)).toBe(true);
  await page.keyboard.type("still");
  await expect.poll(() => cursor.input(pid)).toContain("still");
  expect(keptRecord(dashboard.home).session).toEqual(record.session);
});
