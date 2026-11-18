// An ad hoc session occupies Taken without a story card. Its Sessions sidebar
// Session entry, while another project is shown, opens Open Dough's stories,
// attaches its terminal and reveals its Taken entry; Mark as done in the
// terminal renames it and takes it out of the sidebar into Recently done; Open
// terminal puts it back, through a reload. The real boundary drives the
// synthetic Claude. Its Needs input count, deletion and same-project reveal
// are ../../dashboard/frontend-tests/sessions/agent-launch-ad-hoc-sessions.spec.ts.

import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { openTakenBacklog } from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  chooseProject,
  expectProjectChoice,
  expectMembership,
  parts,
  sessionNamedBy,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  expectRevealsSince,
  recordReveals,
  revealsOf,
} from "../../dashboard/test-support/sessionNavigationJourney.ts";
import {
  expectTooltipLine,
  openSessionsSidebar,
  sessionsSidebarParts,
} from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  idleBetweenSteps,
  markDoneAnyway,
} from "../../dashboard/test-support/support/markDone.ts";
import {
  takenAdHocSession,
  startAdHocAndClose,
} from "../../dashboard/test-support/support/startedAdHocSession.ts";
test.use({ projectFolders: ["open-dough", "pygardon"] });

const openDoughStories = {
  taken: [takenStory],
  backlog: [readyStory, notRefinedStory],
};

test("its Sessions sidebar Session entry opens Open Dough's stories, the terminal and its Taken entry; Mark as done takes it out of the sidebar and Open terminal puts it back, through a reload", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  dashboard.claudeScenario("launched");
  await recordReveals(page);
  await openTakenBacklog(page, launchJourney);
  const text = "why is the CI slow on main?";
  const { button, entries, entry } = sessionsSidebarParts(page);
  const panel = terminalPanel(page);
  const active = takenAdHocSession(page, text);
  const recent = parts(page).recentlyDone.getByRole("article", {
    name: `Ad hoc session for ${text}`,
  });

  await startAdHocAndClose(page, "Open Dough", text);
  await expect(active).toHaveCount(1);
  await expect(recent).toHaveCount(0);
  const sessionId = await sessionNamedBy(active);
  await chooseProject(page, "Pygardon");
  await expectProjectChoice(page, "Pygardon");

  await test.step("the Sessions sidebar Session entry opens Open Dough's stories, its session in the terminal, and reveals its Taken entry", async () => {
    await button.click();
    await expect(entries).toHaveCount(1);
    await expectTooltipLine(entries.first(), "Open Dough · Ad hoc");
    const revealed = (await revealsOf(page)).length;
    await entry(text).click();
    await expectProjectChoice(page, "Open Dough");
    await expectMembership(page, openDoughStories);
    await expect(terminalScreenParts(panel).rows).toContainText(
      `attached ${sessionId.slice(0, 8)}`,
    );
    // Asked to be brought into view, smoothly. Whether it then stays in view
    // while the other project's stories lay out is not proven here, see the
    // same-project test below.
    await expect
      .poll(async () => (await revealsOf(page)).length)
      .toBeGreaterThan(revealed);
    await expectRevealsSince(
      page,
      revealed,
      `Ad hoc session for ${text}`,
      "smooth",
    );
    await expect(active.getByText("Shown in terminal")).toBeVisible();
    await expect(entry(text)).toHaveAttribute("aria-current", "true");
  });

  await test.step("Mark as done in the terminal takes it out of the sidebar and Recently done reads Done", async () => {
    idleBetweenSteps(dashboard, sessionId);
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
    await openTerminalControl(recent).click();
    await expect(terminalScreenParts(panel).rows).toContainText("attached");
    await expect(entries).toHaveCount(1);
    await expect(recent).toHaveCount(0);
    await expect(sessionStateOf(active)).not.toHaveText("Done");
    await expect(active).not.toContainText("Named done-");

    await page.reload();
    await expectMembership(page, openDoughStories);
    await openSessionsSidebar(page);
    await expect(entries).toHaveCount(1);
    await expectTooltipLine(entries.first(), "Open Dough · Ad hoc");
    await expect(sessionStateOf(active)).not.toHaveText("Done");
    await expect(recent).toHaveCount(0);
  });
});
