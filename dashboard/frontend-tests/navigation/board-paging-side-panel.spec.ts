// The Board's own width decides how many Board Columns show, so the side
// panel opening and closing pages them as a window would: beside it a 54rem
// Board shows two columns and a column paging control naming the hidden one,
// a move slides the view, and the chosen position comes back where the width
// allows it. How a narrow window pages the columns is ./board-paging.spec.ts;
// that an active story's session adds no Recently done entry is
// ../sessions/recently-done-active-story-sessions.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { takenStoryWorkingSession } from "../../tests/support/frontendCardSessions.ts";
import { terminalPanel } from "../../tests/terminalScreenPage.ts";
import { closeSidePanel } from "../../tests/sidePanelFrame.ts";
import { box } from "../../tests/pageLayout.ts";
import {
  columns,
  columnPagingControl,
  expectStoryCardsKeepTheirShare,
  expectView,
  recordSlides,
  rem,
  slidesOf,
  type ColumnName,
} from "../../tests/boardPage.ts";
import { scrollsOnItsOwn } from "../../tests/sidePanelWidthPage.ts";

// A 108rem window, which the side panel leaves a 54rem Board.
test.use({ viewport: { width: 108 * rem, height: 900 } });

test("beside the side panel a 54rem Board shows two columns and pages between them; a wider Board shows all three and gives the view back", async ({
  page,
  frontendServices,
}) => {
  const { openTerminal } = await takenStoryWorkingSession(
    page,
    frontendServices,
  );
  await openFrontendTakenBacklog(page);
  const terminal = terminalPanel(page);
  // The view, beside a terminal whose screen scrolls on its own; the panel
  // header title truncates by design with disclosure (./SidePanelTitle.tsx).
  const expectShown = (
    shown: readonly ColumnName[],
    controls: readonly string[],
  ) =>
    expectView(page, shown, controls, [
      ...scrollsOnItsOwn,
      ".side-panel-title-toggle",
    ]);
  await recordSlides(page);

  await test.step("a 108rem Board shows all three and no column paging control", async () => {
    await expectShown(columns, []);
  });

  await test.step("the side panel opens, leaving 54rem: Backlog and Taken fill the Board, and the right control names Recently done", async () => {
    await openTerminal();
    expect((await box(page.locator(".page-column"))).width).toBeCloseTo(
      54 * rem,
      0,
    );
    await expectShown(["Backlog", "Taken"], ["Recently done 0 entries"]);
    await expectStoryCardsKeepTheirShare(page, 2);
  });

  await test.step("the right control shows Taken and Recently done, with a slide, and the left control names Backlog", async () => {
    await columnPagingControl(page, "Recently done").click();
    await expectShown(["Taken", "Recently done"], ["Backlog 2 entries"]);
    expect(await slidesOf(page)).toBe(1);
  });

  await test.step("the side panel closes: all three show and both controls go", async () => {
    await closeSidePanel(terminal, { using: "mouse" });
    await expect(terminal).toHaveCount(0);
    await expectShown(columns, []);
  });

  await test.step("the side panel reopens: Taken and Recently done show again", async () => {
    await openTerminal();
    await expectShown(["Taken", "Recently done"], ["Backlog 2 entries"]);
  });
});
