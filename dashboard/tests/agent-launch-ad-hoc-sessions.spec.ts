// Ad hoc sessions occupy Taken without a story card. Sidebar selection opens
// their project/terminal; Done moves them to Recently done and reopen survives reload.
// Blocked sessions count as needing attention; deletion under an unread native
// listing returns focus to the next Taken entry. The real boundary drives fake Claude.
// Related journeys: ./agent-launch-ad-hoc.spec.ts, ./session-sidebar-navigation-cases.spec.ts,
// ./agent-terminal-done.spec.ts, ./agent-launch-recent-delete.spec.ts (./fixtures/fake-claude).

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
import { showColumn } from "./dashboardColumnsPage.ts";
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
import { markDoneAnyway } from "./support/markDone.ts";

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

const localOf = (page: Page, text: string) =>
  parts(page).taken.getByRole("article", {
    name: `Ad hoc session for ${text}`,
  });

test("its sidebar entry opens Open Dough's stories, the terminal and its Taken entry; Mark as done takes it out of the sidebar and Open terminal puts it back, through a reload", async ({
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
  const active = localOf(page, text);
  const recent = parts(page).recentlyDone.getByRole("article", {
    name: `Ad hoc session for ${text}`,
  });

  await startAndClose(page, "Open Dough", text);
  await expect(active).toHaveCount(1);
  await expect(recent).toHaveCount(0);
  const sessionId = await sessionNamedBy(active);
  await project.getByRole("radio", { name: "Pygardon", exact: true }).check();
  await expect(project.getByRole("radio", { name: "Pygardon" })).toBeChecked();

  await test.step("the sidebar entry opens Open Dough's stories, its session in the terminal, and reveals its Taken entry", async () => {
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
    await expect(active.getByText("Shown in terminal")).toBeVisible();
    await expect(entry(text)).toHaveAttribute("aria-current", "true");
  });

  await test.step("Mark as done in the terminal takes it out of the sidebar and Recently done reads Done", async () => {
    await markDoneAnyway(panel);
    await expect(panel).toHaveCount(0);
    await expect(entries).toHaveCount(0);
    await expect(sessionStateOf(recent)).toHaveText("Done");
    await expect(recent).toContainText(
      `Named done-Open Dough · Ad hoc · ${text}`,
    );
    await expect(recent).not.toContainText("Shown in terminal");
  });

  await test.step("Open terminal reopens it into the sidebar, and a reload keeps it there", async () => {
    await showColumn(page, "Recently done");
    await recent.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    await expect(entries).toHaveCount(1);
    await expect(recent).toHaveCount(0);
    await expect(sessionStateOf(active)).not.toHaveText("Done");
    await expect(active).not.toContainText("Named done-");

    await page.reload();
    await expectMembership(page, openDoughStories);
    if ((await button.getAttribute("aria-expanded")) !== "true") {
      await button.click();
    }
    await expect(entries).toHaveCount(1);
    await expectTooltipLine(entries.first(), "Open Dough · Ad hoc");
    await expect(sessionStateOf(active)).not.toHaveText("Done");
    await expect(recent).toHaveCount(0);
  });
});

test("a blocked ad hoc session reads Needs input in Taken and the sidebar, and the sidebar counts it", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, journey);
  const text = "what is blocking us?";
  const { button, entries, badge } = sidebarParts(page);
  const local = localOf(page, text);

  await startAndClose(page, "Open Dough", text);
  const sessionId = await sessionNamedBy(local);
  await expectSessionShown(local, "Working", false);
  dashboard.claudeSessionBecomes(sessionId, "blocked", "input needed");
  await page.reload();
  await expectMembership(page, openDoughStories);

  await expectSessionShown(local, "Needs input: input needed", true);
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

test("with the listing unreadable, an ad hoc session's record can be deleted from Taken, leaving the sidebar and moving the keyboard to the next entry", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, journey);
  const { entries, button } = sidebarParts(page);
  const older = localOf(page, "the older question");
  const newer = localOf(page, "the newer question");

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
  await showColumn(page, "Taken");
  await newer.getByRole("button", { name: "Delete record…" }).click();
  await newer
    .getByRole("button", { name: "Delete record", exact: true })
    .click();

  await expect(newer).toHaveCount(0);
  await expect(entries).toHaveCount(1);
  await expect(entries.first()).toContainText("the older question");
  await expect(older).toBeFocused();
  await older.getByRole("button", { name: "Delete record…" }).click();
  await older
    .getByRole("button", { name: "Delete record", exact: true })
    .click();
  await expect(older).toHaveCount(0);
  await expect(
    parts(page).taken.getByRole("article", { name: takenStory, exact: true }),
  ).toBeFocused();
});

test("with Open Dough already shown, its sidebar entry brings its Taken entry into view", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  // Beside the open sidebar, the local Taken entry starts outside this viewport.
  await page.setViewportSize({ width: 700, height: 600 });
  await openTakenBacklog(page, journey);
  const text = "where is this entry?";
  const { button, entry } = sidebarParts(page);
  const local = localOf(page, text);

  await startAndClose(page, "Open Dough", text);
  await button.click();
  await expect(local).not.toBeInViewport();
  await entry(text).click();
  // The single column beside the sidebar and terminal moves to Taken.
  await expect(page.getByRole("region", { name: "Terminal" })).toHaveCount(1);

  await expect(local).toBeInViewport();
  await expect(local.getByText("Shown in terminal")).toBeVisible();
});
