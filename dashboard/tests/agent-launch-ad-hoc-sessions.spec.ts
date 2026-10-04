// An ad hoc session, which no card lists, is findable, doneable and
// reopenable like any story's session, on the committed origin of
// ./agent-launch-card.spec.ts (./launchJourney.ts): its sidebar entry opens
// its project's stories and its terminal and brings its Recent sessions entry
// into view; Mark as done in the terminal takes it out of the sidebar and
// reads Done in Recent sessions, whose Open terminal puts it back, through a
// reload; a blocked session reads "Needs input" and counts as needing
// attention; and with the listing unreadable its record can be deleted, the
// keyboard moving to the next Recent sessions entry. How the session starts is
// ./agent-launch-ad-hoc.spec.ts and how a story's sessions do the same is
// ./session-sidebar-navigation-cases.spec.ts, ./agent-terminal-done.spec.ts
// and ./agent-launch-recent-delete.spec.ts. The page's own dashboard server
// drives the synthetic `claude` (./fixtures/fake-claude); the real one is
// never reached.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchCardPage.ts";
import {
  expectMembership,
  parts,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishLaunchJourney,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import {
  expectRevealsSince,
  recordReveals,
  revealsOf,
} from "./sessionNavigationJourney.ts";
import { expectSessionShown } from "./sessionStatePace.ts";
import {
  expectSidebarSessionShown,
  expectTooltipLine,
  sidebarParts,
} from "./sessionSidebarPage.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough", "pygardon"] });

const openDoughStories = {
  taken: [takenStory],
  backlog: [readyStory, notRefinedStory],
};

// Starts an ad hoc session on the selected project and closes the terminal
// it opens at once.
async function startAndClose(page: Page, project: string, text: string) {
  const dialog = startSessionDialog(page, project);
  await startSession(page, project).click();
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start" }).click();
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel).toHaveCount(1);
  await expect(panel.locator(".xterm-rows")).toContainText("attached");
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(panel).toHaveCount(0);
}

const recentOf = (page: Page, text: string) =>
  parts(page).recentSessions.getByRole("article", {
    name: `Ad hoc session for ${text}`,
  });

test("its sidebar entry opens Open Dough's stories, the terminal and its Recent sessions entry; Mark as done takes it out of the sidebar and Open terminal puts it back, through a reload", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await recordReveals(page);
  await openTakenBacklog(page, journey);
  const text = "why is the CI slow on main?";
  const { project } = parts(page);
  const { button, entries, entry } = sidebarParts(page);
  const panel = page.getByRole("region", { name: "Terminal" });
  const recent = recentOf(page, text);

  await startAndClose(page, "Open Dough", text);
  await expect(recent).toHaveCount(1);
  const sessionId = await sessionNamedBy(recent);
  await project.getByRole("radio", { name: "Pygardon", exact: true }).check();
  await expect(project.getByRole("radio", { name: "Pygardon" })).toBeChecked();

  await test.step("the sidebar entry opens Open Dough's stories, its session in the terminal, and reveals its Recent sessions entry", async () => {
    await button.click();
    await expect(entries).toHaveCount(1);
    await expectTooltipLine(entries.first(), "Open Dough · Ad hoc");
    await entry(text).click();
    await expect(
      project.getByRole("radio", { name: "Open Dough", exact: true }),
    ).toBeChecked();
    await expectMembership(page, openDoughStories);
    await expect(panel.locator(".xterm-rows")).toContainText(
      `attached ${sessionId.slice(0, 8)}`,
    );
    // Asked to be brought into view, smoothly. Whether it then stays in view
    // while the other project's stories lay out is not proven here, see the
    // same-project test below.
    await expect
      .poll(async () => (await revealsOf(page)).length)
      .toBeGreaterThan(0);
    await expectRevealsSince(page, 0, `Ad hoc session for ${text}`, "smooth");
    await expect(recent.getByText("Shown in terminal")).toBeVisible();
    await expect(entry(text)).toHaveAttribute("aria-current", "true");
  });

  await test.step("Mark as done in the terminal takes it out of the sidebar and Recent sessions reads Done", async () => {
    await panel.getByRole("button", { name: "Mark as done" }).click();
    await expect(panel).toHaveCount(0);
    await expect(entries).toHaveCount(0);
    await expect(sessionStateOf(recent)).toHaveText("Done");
    await expect(recent).toContainText(
      `Named done-Open Dough · Ad hoc · ${text}`,
    );
    await expect(recent).not.toContainText("Shown in terminal");
  });

  await test.step("Open terminal reopens it into the sidebar, and a reload keeps it there", async () => {
    await recent.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    await expect(entries).toHaveCount(1);
    await expect(sessionStateOf(recent)).not.toHaveText("Done");
    await expect(recent).not.toContainText("Named done-");

    await page.reload();
    await expectMembership(page, openDoughStories);
    if ((await button.getAttribute("aria-expanded")) !== "true") {
      await button.click();
    }
    await expect(entries).toHaveCount(1);
    await expectTooltipLine(entries.first(), "Open Dough · Ad hoc");
    await expect(sessionStateOf(recent)).not.toHaveText("Done");
  });
});

test("a blocked ad hoc session reads Needs input in Recent sessions and the sidebar, and the sidebar counts it", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, journey);
  const text = "what is blocking us?";
  const { button, entries, badge } = sidebarParts(page);
  const recent = recentOf(page, text);

  await startAndClose(page, "Open Dough", text);
  const sessionId = await sessionNamedBy(recent);
  await expectSessionShown(recent, "Working", false);
  dashboard.claudeSessionBecomes(sessionId, "blocked", "input needed");
  await page.reload();
  await expectMembership(page, openDoughStories);

  await expectSessionShown(recent, "Needs input: input needed", true);
  await expect(badge).toHaveText("1");
  await expect(badge).toHaveAccessibleName("1 session needs attention");
  await button.click();
  await expect(badge).toHaveText("1");
  await expectSidebarSessionShown(
    entries.first(),
    "Needs input: input needed",
    "needs-input",
  );
});

test("with the listing unreadable, an ad hoc session's record can be deleted from Recent sessions, leaving the sidebar and moving the keyboard to the next entry", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, journey);
  const { entries, button } = sidebarParts(page);
  const older = recentOf(page, "the older question");
  const newer = recentOf(page, "the newer question");

  await startAndClose(page, "Open Dough", "the older question");
  await expect(older).toHaveCount(1);
  await startAndClose(page, "Open Dough", "the newer question");
  await expect(newer).toHaveCount(1);
  dashboard.claudeListingFails(true);
  await page.reload();
  await expectMembership(page, openDoughStories);
  await button.click();
  await expect(entries).toHaveCount(2);

  const unknown = "State unknown: Claude Code's session list could not be read";
  await expect(sessionStateOf(newer)).toHaveText(unknown);
  await newer.getByRole("button", { name: "Delete record…" }).click();
  await newer
    .getByRole("button", { name: "Delete record", exact: true })
    .click();

  await expect(newer).toHaveCount(0);
  await expect(entries).toHaveCount(1);
  await expect(entries.first()).toContainText("the older question");
  await expect(older).toBeFocused();
});

test("with Open Dough already shown, its sidebar entry brings its Recent sessions entry into view", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  // A window short enough that Recent sessions starts below it.
  await page.setViewportSize({ width: 1280, height: 600 });
  await openTakenBacklog(page, journey);
  const text = "where is this entry?";
  const { button, entry } = sidebarParts(page);
  const recent = recentOf(page, text);

  await startAndClose(page, "Open Dough", text);
  await expect(recent).not.toBeInViewport();
  await button.click();
  await entry(text).click();

  await expect(recent).toBeInViewport();
  await expect(recent.getByText("Shown in terminal")).toBeVisible();
});
