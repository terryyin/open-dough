// Cursor reopen from Recently done sessions: held attach keeps membership;
// successful attach clears the Done row; narrow overlay returns focus.
import { launch } from "./agentLaunchBoundary.ts";
import {
  keepProjectLaunchRecords,
  recentlyDoneParts,
  showThreeProjectPage,
} from "./recentlyDoneSessionsSidebarPage.ts";
import { rem } from "./boardPage.ts";
import { expect, keptRecord, test } from "./support/cursorStart.ts";
import { agentTerminalEndpoint } from "../src/agentTerminal.ts";

test.use({
  projectFolders: ["open-dough", "doughnut", "pygardon"],
  cursorScreen: "working",
});

test("a held Cursor attach from Recently done keeps Done membership", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const title = "held from recently done";
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction: title,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  await keepProjectLaunchRecords(dashboard, {
    "open-dough": [
      { ...held, doneAt: new Date(Date.now() - 60_000).toISOString() },
    ],
  });
  await showThreeProjectPage(page, origin);
  const shown = recentlyDoneParts(page);
  await shown.button.click();
  await shown.header.click();
  await page.routeWebSocket(new RegExp(agentTerminalEndpoint), () => {});
  await shown.entry(title).click();
  await expect(page.getByRole("region", { name: "Terminal" })).toBeVisible();
  await expect(shown.entry(title)).toHaveCount(1);
});

test("a successful Cursor attach from Recently done removes the Done row", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  const title = "reopen from recently done";
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction: title,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  await keepProjectLaunchRecords(dashboard, {
    "open-dough": [
      { ...held, doneAt: new Date(Date.now() - 60_000).toISOString() },
    ],
  });
  await showThreeProjectPage(page, origin);
  const shown = recentlyDoneParts(page);
  await shown.button.click();
  await shown.header.click();
  await expect(shown.entry(title)).toHaveCount(1);
  await shown.entry(title).click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText("ctrl+c to stop");
  await expect(shown.entry(title)).toHaveCount(0);
  await expect(
    shown.openEntries.getByRole("button", { name: title }),
  ).toHaveCount(1);
});

test("on a narrow window, closing the panel after a successful reopen returns focus to Sessions", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 700, height: 900 });
  const title = "narrow reopen focus return";
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction: title,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  await keepProjectLaunchRecords(dashboard, {
    "open-dough": [
      { ...held, doneAt: new Date(Date.now() - 60_000).toISOString() },
    ],
  });
  await showThreeProjectPage(page, origin);
  const shown = recentlyDoneParts(page);
  await shown.button.click();
  await expect(shown.sidebar).toBeVisible();
  await shown.header.click();
  await shown.entry(title).click();
  await expect(shown.sidebar).toBeHidden();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel.locator(".xterm-rows")).toContainText("ctrl+c to stop");
  // Overlay hide makes role queries miss the list; reopen briefly to observe
  // Done cleared into the open list, then close the overlay again.
  await shown.button.click();
  await expect(shown.entry(title)).toHaveCount(0);
  await expect(
    shown.openEntries.getByRole("button", { name: title }),
  ).toHaveCount(1);
  await shown.button.click();
  await expect(shown.sidebar).toBeHidden();
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(panel).toHaveCount(0);
  await expect(shown.button).toBeFocused();
});
