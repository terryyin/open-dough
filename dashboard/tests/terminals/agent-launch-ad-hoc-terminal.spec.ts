// A confirmed ad hoc launch with nothing typed opens its session in the page's
// terminal at once, on the committed origin of ../launches/agent-launch-story-card.spec.ts (../launchJourney.ts):
// the keyboard is in the terminal, its toolbar names the label, "Ad hoc
// session" and the session id, what is typed reaches the session, the project
// actions row stays quiet (no success log), the session's entry and Sessions
// sidebar Session entry show it, and the Board does not scroll. Close detaches
// only and returns the keyboard to Start session. The synthetic `claude`
// (./fixtures/fake-claude) echoes what is typed; the real one is never reached.

import { expect, test } from "../dashboardTest.ts";
import { terminalPanel, terminalScreenParts } from "../terminalScreenPage.ts";
import {
  expectQuietAdHocActionsRow,
  openTakenBacklog,
  startSessionField,
} from "../launchStoryCardPage.ts";
import { parts, sessionNamedBy } from "../dashboardPage.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { openWhileStarting } from "../support/adHocTerminalStartup.ts";

test.use({ projectFolders: ["open-dough"] });

// Accepted cost: one real ad hoc launch, the only full proof that a session
// started with nothing typed opens in the terminal at once with the keyboard
// in it. Its arguments are proved in
// ../../backend-tests/launches/agent-launch-ad-hoc-boundary.spec.ts.
test("starting with nothing typed opens the session in the terminal with the keyboard in it, and Close returns the keyboard to Start session", async ({
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
  const panel = terminalPanel(page);
  const { rows } = terminalScreenParts(panel);
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
  await expect(startSessionField(dialog)).toHaveValue("");
  await dialog.getByRole("button", { name: "Start" }).click();

  const entry = taken.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  const sessionId = await sessionNamedBy(entry);
  const title = await entry.getByRole("heading", { level: 3 }).textContent();
  await expect(panel).toHaveCount(1);
  await expect(terminalScreenParts(panel).heading).toHaveText(title ?? "");
  await expect(panel.locator(".side-panel-names p")).toHaveText(
    "Ad hoc session",
  );
  await expect(rows).toContainText(`attached ${sessionId.slice(0, 8)}`);
  await expect(terminalScreenParts(panel).input).toBeFocused();
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
  const { release, panel, shows, sessionId, openTerminal, terminalSockets } =
    await openWhileStarting(page, launchJourney);
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(panel).toHaveCount(0);
  await expect(openTerminal).toBeFocused();
  const attachments = terminalSockets.length;

  await release();
  await expectQuietAdHocActionsRow(page);
  // Progress cleared without a presentation: the developer already closed it.
  await expect(panel).toHaveCount(0);
  await expect(openTerminal).toBeFocused();
  // No second page attachment was requested. Native startup may have logged
  // the original, already closed process after the Close above.
  expect(terminalSockets).toHaveLength(attachments);

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
  const {
    release,
    panel,
    rows,
    shows,
    sessionId,
    openTerminal,
    terminalSockets,
  } = await openWhileStarting(page, launchJourney);
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(panel).toHaveCount(0);
  await openTerminal.click();
  await shows(`attached ${sessionId.slice(0, 8)}`);
  await page.keyboard.type("still here");
  await page.keyboard.press("Enter");
  await shows("echo still here");
  const shown = await rows.textContent();
  const attachments = terminalSockets.length;

  await release();
  await expectQuietAdHocActionsRow(page);
  await expect(panel).toHaveCount(1);
  await expect(rows).toHaveText(shown ?? "");
  // The same page attachment remains open; launch confirmation added none.
  expect(terminalSockets).toHaveLength(attachments);
});
