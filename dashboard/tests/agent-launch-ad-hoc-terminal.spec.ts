// A confirmed ad hoc launch opens its session in the page's terminal at once,
// on the committed origin of ./agent-launch-card.spec.ts (./launchJourney.ts):
// the keyboard is in the terminal, its toolbar names the label, "Ad hoc
// session" and the session id, what is typed reaches the session, a polite
// status says it started, the session's entry and sidebar entry show it, and
// the page does not scroll. Close detaches only and returns the keyboard to
// Start session. The synthetic `claude` (./fixtures/fake-claude) echoes what
// is typed; the real one is never reached.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog, startSessionField } from "./launchCardPage.ts";
import { parts, sessionNamedBy } from "./dashboardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

// While withheld, the page reads every launch attempt of this machine as still
// starting, though its session may already be listed: the window between the
// service keeping a session's record and noting its attempt launched.
// Releasing lets the next read see the launched outcome.
async function withholdLaunchOutcomes(page: Page) {
  let withheld = true;
  await page.route("**/__agent-launch", async (route) => {
    if (route.request().method() !== "GET" || !withheld) {
      await route.continue();
      return;
    }
    // Fetched outside the page, so its same-origin mark is restated.
    const response = await route.fetch({
      headers: {
        ...route.request().headers(),
        "sec-fetch-site": "same-origin",
      },
    });
    const body = (await response.json()) as {
      attempts?: Record<string, unknown>[];
    };
    for (const attempt of body.attempts ?? []) {
      delete attempt["outcome"];
      delete attempt["settledAt"];
    }
    await route.fulfill({ response, json: body });
  });
  return () => {
    withheld = false;
  };
}

// Starts an ad hoc session with launch outcomes withheld, and opens its
// listed entry's terminal while Start session still says it is starting.
async function openWhileStarting(page: Page) {
  const release = await withholdLaunchOutcomes(page);
  await openTakenBacklog(page, journey);
  const dialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Claude Code",
  });
  const panel = page.getByRole("region", { name: "Terminal" });
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  await dialog.getByRole("button", { name: "Start" }).click();
  const entry = parts(page).taken.locator(".session-entry");
  await expect(entry).toHaveCount(1, { timeout: 20_000 });
  const sessionId = await sessionNamedBy(entry);
  await expect(
    page.getByText("Starting a session in Open Dough"),
  ).toBeVisible();
  const openTerminal = entry.getByRole("button", { name: "Open terminal" });
  await openTerminal.click();
  await expect(panel).toHaveCount(1);
  return { release, panel, sessionId, openTerminal };
}

for (const text of ["why is the CI slow on main?", ""]) {
  test(`starting ${text === "" ? "with an empty field" : "with text"} opens the session in the terminal with the keyboard in it, and Close returns the keyboard to Start session`, async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    await openTakenBacklog(page, journey);
    const button = page.getByRole("button", {
      name: "Start session in Open Dough",
    });
    const dialog = page.getByRole("dialog", {
      name: "Start a session in Open Dough in Claude Code",
    });
    const panel = page.getByRole("region", { name: "Terminal" });
    const rows = panel.locator(".xterm-rows");
    const { taken } = parts(page);

    await page.evaluate(() => {
      window.scrollTo(0, 40);
    });
    await button.click();
    await expect(dialog).toBeVisible();
    // Where the page is once the dialog is open; the launch does not move it.
    const scroll = await page.evaluate(() => window.scrollY);
    if (text !== "") {
      await startSessionField(dialog).fill(text);
    }
    await dialog.getByRole("button", { name: "Start" }).click();

    const entry = taken.locator(".session-entry");
    await expect(entry).toHaveCount(1);
    const sessionId = await sessionNamedBy(entry);
    const title = await entry.getByRole("heading", { level: 3 }).textContent();
    await expect(panel).toHaveCount(1);
    await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
      title ?? "",
    );
    await expect(panel).toContainText(`Ad hoc session ${sessionId}`);
    await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
    await expect(panel.locator(".xterm-helper-textarea")).toBeFocused();
    await page.keyboard.type("hello there");
    await page.keyboard.press("Enter");
    await expect(rows).toContainText("echo hello there");

    await expect(parts(page).adHocStarted).toBeVisible();
    await expect(entry).toContainText("Shown in terminal");
    expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
    const { button: sessions, entries } = sidebarParts(page);
    await sessions.click();
    await expect(entries.first().getByRole("button")).toHaveAttribute(
      "aria-current",
      "true",
    );

    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toHaveCount(0);
    await expect(button).toBeFocused();
    await expect(entry).not.toContainText("Shown in terminal");
    await expect(
      entry.getByRole("button", { name: "Open terminal" }),
    ).toBeVisible();
    expect(dashboard.claudeAttaches().map((attach) => attach.id)).toEqual([
      sessionId.slice(0, 8),
    ]);
  });
}

test("a terminal the developer closed while its session started stays closed once it starts, and Open terminal still opens it", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  const { release, panel, sessionId, openTerminal } =
    await openWhileStarting(page);
  const rows = panel.locator(".xterm-rows");
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(panel).toHaveCount(0);
  await expect(openTerminal).toBeFocused();
  const attaches = dashboard.claudeAttaches().length;

  release();
  await expect(parts(page).adHocStarted).toBeVisible({ timeout: 20_000 });
  // The announcement and a presentation would come in the same render.
  await expect(panel).toHaveCount(0);
  await expect(openTerminal).toBeFocused();
  expect(dashboard.claudeAttaches()).toHaveLength(attaches);

  await openTerminal.click();
  await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
  await page.keyboard.type("hello there");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo hello there");
  expect(
    new Set(dashboard.claudeAttaches().map((attach) => attach.id)),
  ).toEqual(new Set([sessionId.slice(0, 8)]));
});

test("a terminal the developer reopened while its session started stays open, attached as it was, once it starts", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  const { release, panel, sessionId, openTerminal } =
    await openWhileStarting(page);
  const rows = panel.locator(".xterm-rows");
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(panel).toHaveCount(0);
  await openTerminal.click();
  await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
  await page.keyboard.type("still here");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo still here");
  const shown = await rows.textContent();
  const attaches = dashboard.claudeAttaches().length;

  release();
  await expect(parts(page).adHocStarted).toBeVisible({ timeout: 20_000 });
  await expect(panel).toHaveCount(1);
  await expect(rows).toHaveText(shown ?? "");
  // Nothing attached the session again.
  expect(dashboard.claudeAttaches()).toHaveLength(attaches);
});
