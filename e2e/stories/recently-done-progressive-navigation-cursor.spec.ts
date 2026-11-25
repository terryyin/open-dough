import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
// A Running Cursor sessions row the runner still holds, for a session whose
// retained Done record belongs to the published story at ordinal 27, chosen from another
// project: Open Dough's stories show, Recently done extends exactly through
// the entry, reading only the records through it, and the entry is brought
// into view -- at once, as reduced motion asks -- only once they are read.
// Closing its terminal with the row hidden returns the keyboard to that
// entry. The terminal's connection is held, so attaching does not reopen the
// session meanwhile. The runner and cursor-agent are the fixture
// ../../../e2e/sessions/cursor-runner-sessions.spec.ts uses; the publication and the other
// sessions are ../recentlyDoneProgressiveJourney.ts's. The page reads this
// machine's sessions before the project's done catalog, so the first ten
// published stories are read once.

import { agentTerminalEndpoint } from "../../dashboard/src/agentTerminal.ts";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import { launch } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { terminalPanel } from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  chooseProject,
  expectProjectChoice,
  parts,
  sessionEntryShowing,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import { rem } from "../../dashboard/test-support/boardPage.ts";
import {
  expectEntries,
  shownEntries,
} from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { recordsAsked } from "../../dashboard/test-support/recentlyDoneProgressivePage.ts";
import {
  destination,
  openedWithHeldPublishedStory,
  publishedNames,
  publishedPaths,
} from "../../dashboard/test-support/recentlyDoneProgressiveJourney.ts";
import {
  expectRevealsSince,
  recordReveals,
  revealsOf,
} from "../../dashboard/test-support/sessionNavigationJourney.ts";
import { openRunningList } from "../../dashboard/test-support/runningCursorList.ts";
import {
  expect,
  keptRecord,
  test,
} from "../../dashboard/test-support/support/cursorStart.ts";
import { publishOnePygardonStory } from "../../dashboard/test-support/pygardonProject.ts";

const instruction = "hold this done session";

test.use({
  projectFolders: ["open-dough"],
  cursorScreen: "working",
});

test("choosing a Running Cursor sessions row from Pygardon reveals its published Done story once entries 1 to 27 are read, and closing its terminal returns the keyboard to the session", async ({
  afterGitHubStops,
  page,
  dashboard,
  cursor,
}) => {
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction,
  });
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  const held = keptRecord(dashboard.home);
  // The terminal never connects, so the session stays done.
  await page.routeWebSocket(new RegExp(agentTerminalEndpoint), () => {});
  await publishOnePygardonStory(page, afterGitHubStops);
  await recordReveals(page);
  // The project's done catalog answers only once this machine's sessions
  // are read into the sidebar.
  let releaseCatalog: () => void = () => undefined;
  const catalogHeld = new Promise<void>((resolve) => {
    releaseCatalog = resolve;
  });
  await page.route(
    (url) =>
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("done") === "catalog",
    async (route) => {
      await catalogHeld;
      await route.fallback();
    },
  );
  let release: () => void = releaseCatalog;
  try {
    const view = await openedWithHeldPublishedStory(
      page,
      dashboard,
      afterGitHubStops,
      instruction,
      held,
    );
    release = () => {
      releaseCatalog();
      view.release();
    };
    await expect(page.locator("#sessions-sidebar")).toContainText(
      "No sessions launched from this dashboard are open.",
    );
    releaseCatalog();
    const { github, recent } = view;
    const { backlog } = parts(page);
    const entry = view.destinationCard;
    const session = sessionEntryShowing(
      entry,
      `cursor:${held.session.sessionId}`,
    );
    await expect(entry).toHaveCount(0);
    // The first ten entries' records are read before Pygardon is chosen:
    // leaving Open Dough abandons a read still under way, which returning
    // would otherwise ask for again.
    await expectEntries(recent, publishedNames(10));
    expect(recordsAsked(github).toSorted()).toEqual(
      publishedPaths(10).toSorted(),
    );
    await chooseProject(page, "Pygardon");
    await expect(backlog).toContainText("A Pygardon story");

    const { button, heldRows } = await openRunningList(page);
    const row = heldRows(/Open Dough/);
    await expect(row).toContainText("Execution");
    const before = (await revealsOf(page)).length;
    await row.click();

    await test.step("Open Dough's Recently done lists entries through 27 at once, asking only for their records, and brings none into view while the held one is read", async () => {
      await expectProjectChoice(page, "Open Dough");
      await view.showsPendingDestination();
      await expect(shownEntries(recent)).toHaveCount(destination);
      await expect
        .poll(() => recordsAsked(github).toSorted())
        .toEqual(publishedPaths(destination).toSorted());
      expect((await revealsOf(page)).slice(before)).toEqual([]);
    });

    await test.step("once it is read, the entry is brought into view at once, and nothing older is read", async () => {
      view.release();
      await expect
        .poll(async () => (await revealsOf(page)).length)
        .toBeGreaterThan(before);
      await expectRevealsSince(
        page,
        before,
        standaloneSessionName("Execution", instruction),
        "auto",
      );
      await expect(session).toBeInViewport();
      await expect(shownEntries(recent)).toHaveCount(destination);
      await expect(
        shownEntries(recent).nth(destination - 2),
      ).toHaveAccessibleName(publishedNames(destination - 1).at(-1) ?? "");
      expect(recordsAsked(github).toSorted()).toEqual(
        publishedPaths(destination).toSorted(),
      );
    });

    await test.step("with the row hidden, closing its terminal returns the keyboard to the story’s retained session", async () => {
      await button.click();
      await expect(row).toHaveCount(0);
      const terminal = terminalPanel(page);
      await closeSidePanel(terminal, { using: "mouse" });
      await expect(terminal).toHaveCount(0);
      await expect(session).toBeFocused();
    });
  } finally {
    release();
  }
});
