// A confirmed ad hoc launch opens its session in the page's terminal at once,
// on the committed origin of ../launches/agent-launch-story-card.spec.ts (../launchJourney.ts):
// the keyboard is in the terminal, its toolbar names the label, "Ad hoc
// session" and the session id, what is typed reaches the session, the project
// actions row stays quiet (no success log), the session's entry and Sessions
// sidebar Session entry show it, and the Board does not scroll. Close detaches
// only and returns the keyboard to Start session. The synthetic `claude`
// (./fixtures/fake-claude) echoes what is typed; the real one is never reached.

import type { Page } from "@playwright/test";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import { sessionsAudienceParameter } from "../../src/machineSessionsRevision.ts";
import { expect, pausePageClockAt, test } from "../dashboardTest.ts";
import {
  expectQuietAdHocActionsRow,
  openTakenBacklog,
  startSessionField,
} from "../launchStoryCardPage.ts";
import type { LaunchJourney } from "../launchJourney.ts";
import { parts, sessionNamedBy } from "../dashboardPage.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { watchRecordReads } from "../sessionStatePace.ts";

test.setTimeout(120_000);

test.use({ projectFolders: ["open-dough"] });

// While withheld, the page reads every launch attempt of this machine as still
// starting, though its session may already be listed: the window between the
// service keeping a session's record and noting its attempt launched. That
// holds for the sessions history too, where a settled ad hoc attempt goes.
// Releasing lets the next read see the launched outcome.
async function withholdLaunchOutcomes(page: Page) {
  let withheld = true;
  const sessionsRead = (url: URL) => url.pathname === agentLaunchEndpoint;
  await page.route(sessionsRead, async (route) => {
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
      revision?: string;
      historyRevision?: string;
    };
    for (const attempt of body.attempts ?? []) {
      delete attempt["outcome"];
      delete attempt["settledAt"];
    }
    // The withheld answer is not the observation it was taken from, so the
    // page holds no revision and every read is answered in full. A withheld
    // history is named apart from the history it was taken from, by the
    // regular answer too: the page keeps it without asking again until the
    // release names the real one.
    const history = new URL(route.request().url()).searchParams.has(
      sessionsAudienceParameter,
    );
    if (history) body.revision = `withheld-${body.revision ?? ""}`;
    else delete body.revision;
    if (body.historyRevision !== undefined)
      body.historyRevision = `withheld-${body.historyRevision}`;
    await route.fulfill({ response, json: body });
  });
  return () => {
    withheld = false;
  };
}

// Starts an ad hoc session with launch outcomes withheld, and opens its
// listed entry's terminal while Start session still says it is starting.
// Page time stands still, so `release` lets exactly one more read of the
// machine's sessions see the launched outcome, and the terminal writes and
// draws what reached it only as page time passes: `shows` lets one steady
// pace pass at a time, each with its read answered, until it shows `text`.
async function openWhileStarting(page: Page, launchJourney: LaunchJourney) {
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  const stopWithholding = await withholdLaunchOutcomes(page);
  const release = async () => {
    stopWithholding();
    await passOnePace();
  };
  await openTakenBacklog(page, launchJourney);
  const dialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Claude Code",
  });
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  const shows = async (text: string) => {
    for (let pace = 0; pace < 3; pace += 1) {
      await passOnePace();
      if ((await rows.textContent())?.includes(text)) return;
    }
    expect(await rows.textContent()).toContain(text);
  };
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  await dialog.getByRole("button", { name: "Start" }).click();
  const entry = parts(page).taken.locator(".session-entry");
  await expect(entry).toHaveCount(1, { timeout: 20_000 });
  const sessionId = await sessionNamedBy(entry);
  await expect(
    parts(page).projectActions.getByText("Local startup in progress."),
  ).toBeVisible();
  const openTerminal = entry.getByRole("button", { name: "Open terminal" });
  await openTerminal.click();
  await expect(panel).toHaveCount(1);
  return { release, panel, rows, shows, sessionId, openTerminal };
}

test("starting with text opens the session in the terminal with the keyboard in it, and Close returns the keyboard to Start session", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, launchJourney);
  const button = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  const dialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Claude Code",
  });
  const panel = page.getByRole("region", { name: "Terminal" });
  const rows = panel.locator(".xterm-rows");
  const { taken } = parts(page);

  // A window short enough that the Board scrolls well past 40 px both
  // before the launch and once the terminal shares the window with it,
  // whatever the fonts make its length, so a kept position is the page's
  // own and not one the window forces.
  await page.setViewportSize({ width: 1280, height: 480 });
  await page.locator(".board-scroll").evaluate((region) => {
    region.scrollTo(0, 40);
  });
  await button.click();
  await expect(dialog).toBeVisible();
  // Where the page is once the dialog is open; the launch does not move it.
  const scroll = await page
    .locator(".board-scroll")
    .evaluate((region) => region.scrollTop);
  expect(scroll).toBeGreaterThan(0);
  await startSessionField(dialog).fill("why is the CI slow on main?");
  await dialog.getByRole("button", { name: "Start" }).click();

  const entry = taken.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  const sessionId = await sessionNamedBy(entry);
  const title = await entry.getByRole("heading", { level: 3 }).textContent();
  await expect(panel).toHaveCount(1);
  await expect(panel.getByRole("heading", { level: 2 })).toHaveText(
    title ?? "",
  );
  await expect(panel.locator(".side-panel-names p")).toHaveText(
    "Ad hoc session",
  );
  await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
  await expect(panel.locator(".xterm-helper-textarea")).toBeFocused();
  await page.keyboard.type("hello there");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo hello there");

  await expect(parts(page).adHocStarted).toHaveCount(0);
  await expect(entry).toContainText("Shown in terminal");
  expect(
    await page.locator(".board-scroll").evaluate((region) => region.scrollTop),
  ).toBe(scroll);
  const { button: sessions, entries } = sessionsSidebarParts(page);
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

test("a terminal the developer closed while its session started stays closed once it starts, and Open terminal still opens it", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  const { release, panel, shows, sessionId, openTerminal } =
    await openWhileStarting(page, launchJourney);
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(panel).toHaveCount(0);
  await expect(openTerminal).toBeFocused();
  const attaches = dashboard.claudeAttaches().length;

  await release();
  await expectQuietAdHocActionsRow(page);
  // Progress cleared without a presentation: the developer already closed it.
  await expect(panel).toHaveCount(0);
  await expect(openTerminal).toBeFocused();
  expect(dashboard.claudeAttaches()).toHaveLength(attaches);

  await openTerminal.click();
  await shows(`attached ${sessionId.slice(0, 8)}`);
  await page.keyboard.type("hello there");
  await page.keyboard.press("Enter");
  await shows("echo hello there");
  expect(
    new Set(dashboard.claudeAttaches().map((attach) => attach.id)),
  ).toEqual(new Set([sessionId.slice(0, 8)]));
});

test("a terminal the developer reopened while its session started stays open, attached as it was, once it starts", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  const { release, panel, rows, shows, sessionId, openTerminal } =
    await openWhileStarting(page, launchJourney);
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(panel).toHaveCount(0);
  await openTerminal.click();
  await shows(`attached ${sessionId.slice(0, 8)}`);
  await page.keyboard.type("still here");
  await page.keyboard.press("Enter");
  await shows("echo still here");
  const shown = await rows.textContent();
  const attaches = dashboard.claudeAttaches().length;

  await release();
  await expectQuietAdHocActionsRow(page);
  await expect(panel).toHaveCount(1);
  await expect(rows).toHaveText(shown ?? "");
  // Nothing attached the session again.
  expect(dashboard.claudeAttaches()).toHaveLength(attaches);
});
