import { expect, test } from "../tests/support/frontendApp.ts";
import { largeBacklog, queuedTitles } from "../tests/accessibleBoard.ts";
import { expectSettledPage } from "../tests/dashboardPage.ts";
import { boardView } from "../tests/boardView.ts";
import { scrollByTouch } from "../tests/touchGestures.ts";

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

test("native vertical reading scrolls without paging", async ({
  page,
  frontendServices,
}) => {
  Object.assign(frontendServices, { backlog: largeBacklog });
  await page.goto("/");
  await expectSettledPage(page, {
    backlog: queuedTitles,
    taken: ["Repair the installer's update report"],
  });
  const board = boardView(page);
  const before = await board.scrollY();
  await scrollByTouch(
    page,
    board.scrollRegion(),
    -240,
    "vertical",
    undefined,
    board.scrollRegion(),
  );
  expect(await board.scrollY()).toBeGreaterThan(before);
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
});
