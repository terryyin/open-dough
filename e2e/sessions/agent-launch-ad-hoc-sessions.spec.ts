// An ad hoc session lives on its published Taken story card. Its Sessions sidebar
// Session entry, while another project is shown, opens Open Dough's stories,
// attaches its terminal and reveals its Taken entry; Mark as done in the
// terminal renames it and takes it out of the sidebar into the card's Done history; Open
// terminal puts it back, through a reload. The real boundary drives the
// synthetic Claude. Its Needs input count, deletion and same-project reveal
// are ../../dashboard/frontend-tests/sessions/agent-launch-ad-hoc-sessions.spec.ts.

import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { publishCommittedMembership } from "../../dashboard/test-support/localTakenSessions.ts";
import { pygardonRepository } from "../../dashboard/test-support/pygardonProject.ts";
import {
  chooseProject,
  shownDoneSessionEntriesOf,
  expectProjectChoice,
  expectMembership,
  parts,
  sessionEntriesIn,
  sessionNamedBy,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
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
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import { catalogOrigin } from "../../dashboard/test-support/support/catalogProjectOrigin.ts";
test.use({
  projectFolders: ["open-dough", "pygardon"],
});

test("its Sessions sidebar Session entry opens Open Dough's stories, the terminal and its Taken entry; Mark as done takes it out of the sidebar and Open terminal puts it back, through a reload", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  await recordReveals(page);
  await openInstalledStoryBoard(page, catalogOrigin(dashboard.home));
  const text = "why is the CI slow on main?";
  const openDoughStories = { taken: [text], backlog: ["Story A", "Story B"] };
  const { button, entries, entry } = sessionsSidebarParts(page);
  const panel = terminalPanel(page);
  const active = takenAdHocSession(page, text);
  const recent = parts(page).recentlyDone;

  await startAdHocAndClose(page, "Open Dough", text);
  await expect(active).toHaveCount(1);
  await expect(sessionEntriesIn(recent)).toHaveCount(0);
  const sessionId = await sessionNamedBy(active);
  publishCommittedMembership(page, pygardonRepository);
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
    await expectRevealsSince(page, revealed, text, "smooth");
    await expect(active.getByText("Shown in terminal")).toBeVisible();
    await expect(entry(text)).toHaveAttribute("aria-current", "true");
  });

  await test.step("Mark as done in the terminal takes it out of the sidebar and the owning story's history reads Done", async () => {
    idleBetweenSteps(dashboard, sessionId);
    await markDoneAnyway(panel);
    await expect(panel).toHaveCount(0);
    await expect(entries).toHaveCount(0);
    const closed = await shownDoneSessionEntriesOf(page, text);
    await expect(sessionStateOf(closed)).toHaveText("Done");
    await expect(closed).toContainText(
      `Named done-Open Dough · Ad hoc · ${text}`,
    );
    await expect(closed).not.toContainText("Shown in terminal");
    await expect(sessionEntriesIn(recent)).toHaveCount(0);
  });

  await test.step("Open terminal reopens it into the sidebar, and a reload keeps it there", async () => {
    await openTerminalControl(
      await shownDoneSessionEntriesOf(page, text),
    ).click();
    await expect(terminalScreenParts(panel).rows).toContainText("attached");
    await expect(entries).toHaveCount(1);
    await expect(sessionEntriesIn(recent)).toHaveCount(0);
    await expect(sessionStateOf(active)).not.toHaveText("Done");
    await expect(active).not.toContainText("Named done-");

    await page.reload();
    await expectMembership(page, openDoughStories);
    await openSessionsSidebar(page);
    await expect(entries).toHaveCount(1);
    await expectTooltipLine(entries.first(), "Open Dough · Ad hoc");
    await expect(sessionStateOf(active)).not.toHaveText("Done");
    await expect(sessionEntriesIn(recent)).toHaveCount(0);
  });
});
