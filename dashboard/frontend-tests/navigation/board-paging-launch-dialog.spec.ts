// A launch dialog opened from a card in a shown Board Column leaves the
// view where the developer put it: the dialog lies within that card's column,
// wherever the window shows it, so opening it, leaving it, and reloading keep
// the same columns showing. How focus and Sessions sidebar choices show a
// hidden column is ./board-paging.spec.ts and
// ./board-paging-sessions-sidebar.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { expectSettledPage, parts } from "../../test-support/dashboardPage.ts";
import { expectView, showColumn } from "../../test-support/boardPage.ts";
import { takenIdentity, takenStory } from "../../test-support/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  sessionsSidebarParts,
  sessionsSidebarTitleCut,
} from "../../test-support/sessionsSidebarPage.ts";
import { scrollsOnItsOwn } from "../../test-support/sidePanelWidthPage.ts";

test.use({ viewport: { width: 1100, height: 900 } });

test("opening and leaving Start execution on a shown Taken card keeps the view on Taken and Recently done", async ({
  page,
  frontendServices,
}) => {
  // The Taken story's execution start, kept for its Start to resume.
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .keepingStarts({
        host: "claude",
        workflow: "execution",
        source: "open-dough",
        identity: takenIdentity,
        workspace: "/tmp/board-paging-launch-dialog",
        branch: "claude/taken",
      })
      .please(),
  );
  await openFrontendTakenBacklog(page);
  const takenStoryCard = parts(page).taken.getByRole("article", {
    name: takenStory,
  });
  const startExecution = takenStoryCard.getByRole("button", {
    name: "Start execution",
  });
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await sessionsSidebarParts(page).button.click();
  await showColumn(page, "Recently done");
  // The sidebar's entries are cut by design, read whole by their tooltip.
  const expectTakenAndRecentlyDone = () =>
    expectView(
      page,
      ["Taken", "Recently done"],
      ["Backlog 2 entries"],
      [...scrollsOnItsOwn, sessionsSidebarTitleCut],
    );
  await expectTakenAndRecentlyDone();

  await test.step("while the dialog is open", async () => {
    await startExecution.click();
    await expect(dialog).toBeVisible();
    // Focus has entered the dialog, so the view has heard it.
    await expect(dialog.locator(":focus")).toHaveCount(1);
    await expectTakenAndRecentlyDone();
  });

  await test.step("after Escape", async () => {
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expectTakenAndRecentlyDone();
  });

  await test.step("after a reload", async () => {
    await page.reload();
    await expectSettledPage(page);
    await expect(takenStoryCard).toBeVisible();
    await expectTakenAndRecentlyDone();
  });
});
