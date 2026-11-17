// A Sessions sidebar choice whose story card lies in a hidden Board
// Column shows that column, then brings the card into view as it does in a
// shown one, and the Board reaches the Column's whole length again. That a
// choice shows a local Taken entry hidden the same way
// is ../../../e2e/sessions/sessions-sidebar-navigation-cases.spec.ts and
// ../sessions/agent-launch-ad-hoc-sessions.spec.ts; how focus shows a hidden
// column is ./board-paging.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { cardSession } from "../../tests/support/frontendCardSessions.ts";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendServiceSubstitutes.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { terminalPanel } from "../../tests/terminalScreenPage.ts";
import { notRefinedStory, readyStory } from "../../tests/launchJourney.ts";
import {
  sessionsSidebarParts,
  sessionsSidebarTitleCut,
} from "../../tests/sessionsSidebarPage.ts";
import {
  expectRevealsSince,
  recordReveals,
  revealsOf,
} from "../../tests/sessionNavigationJourney.ts";
import {
  expectEndsWithShown,
  expectView,
  showColumn,
} from "../../tests/boardPage.ts";
import { box, expectTopBarsShareHeight } from "../../tests/pageLayout.ts";
import { scrollsOnItsOwn } from "../../tests/sidePanelWidthPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("a session whose story card is hidden shows its column and brings the card into view", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observing(
        cardSession(
          "Execution",
          readyStory,
          makeMe.aSessionState.loaded("working").please(),
        ),
      )
      .please(),
  );
  await installAttachedTerminalSubstitute(page);
  await recordReveals(page);
  await openFrontendTakenBacklog(page);
  const card = (title: string) =>
    parts(page).backlog.getByRole("article", { name: title, exact: true });
  const { button, entry } = sessionsSidebarParts(page);
  const panel = terminalPanel(page);
  await button.click();

  await test.step("beside the sidebar, the developer shows Recently done, hiding Backlog", async () => {
    await showColumn(page, "Recently done");
    await expect(card(readyStory)).not.toBeInViewport();
  });

  await test.step("choosing the story's session shows Backlog, the one column beside the terminal, with its card in view", async () => {
    const revealed = (await revealsOf(page)).length;
    await entry(readyStory).click();
    await expect(panel.getByRole("heading")).toHaveText(readyStory);
    await expectTopBarsShareHeight(page, 3);
    // The sidebar's entries and panel header title truncate by design
    // (./SidePanelTitle.tsx); read whole by tooltip / disclosure.
    await expectView(
      page,
      ["Backlog"],
      ["Taken 1 entry"],
      [...scrollsOnItsOwn, sessionsSidebarTitleCut, ".side-panel-title-toggle"],
    );
    await expect(card(readyStory)).toBeInViewport();
    await expectRevealsSince(page, revealed, readyStory, "smooth");
    await expect(card(readyStory).getByText("Shown in terminal")).toBeVisible();
  });

  await test.step("Backlog has its whole length back: read to the page's end, its last card ends the page", async () => {
    const { x, y, width } = await box(card(readyStory));
    await page.mouse.move(x + width / 2, y + 1);
    await expectEndsWithShown(page, ["Backlog"]);
    await expect(card(notRefinedStory)).toBeInViewport({ ratio: 1 });
  });
});
