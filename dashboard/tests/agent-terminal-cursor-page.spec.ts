// The page's Close leaves a working Cursor turn running. Reopening the
// terminal shows that same turn still working. Session switch closes the
// same socket; this page has one Cursor session, so Close is the control
// the developer uses here.
import path from "node:path";
import { readFileSync } from "node:fs";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { startSessionField } from "./launchCardPage.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { expect, workingCursorTest as test } from "./support/cursorStart.ts";
import { waitUntil } from "./support/dashboardServer.ts";
import { processRunning } from "./support/processGroup.ts";

const instruction = "keep this turn running";

function keptRecord(home: string): LaunchRecord {
  const kept = JSON.parse(
    readFileSync(
      path.join(home, ".open-dough", "dashboard", "agent-launches.json"),
      "utf8",
    ),
  ) as Record<string, LaunchRecord[]>;
  const [record] = kept["open-dough"] ?? [];
  if (record?.session.host !== "cursor") {
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
  // The start presents its session's terminal once it has launched; Close
  // before then would see that presentation open the panel again.
  await expect(parts(page).adHocStarted).toBeVisible({ timeout: 20_000 });

  const recent = parts(page).recentSessions.getByRole("article");
  await expect(recent).toHaveCount(1);
  const record = keptRecord(dashboard.home);
  const open = recent.getByRole("button", { name: "Open terminal" });
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  await open.click();
  await expect(rows).toContainText("ctrl+c to stop");
  await expect(rows).toContainText("Add a follow-up");
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const pid = cursor.attaches()[0]?.pid ?? 0;
  expect(processRunning(pid)).toBe(true);

  await panel.getByRole("button", { name: "Close", exact: true }).click();
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
