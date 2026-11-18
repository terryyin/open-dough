import {
  expect,
  test,
  openFrontendTakenBacklog,
} from "../test-support/support/frontendApp.ts";
import {
  activateColumnIndicator,
  expectColumnIndicatorFocused,
  focusColumnIndicator,
} from "../test-support/boardPage.ts";
import { boardView } from "../test-support/boardView.ts";

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

test("thin phone indicators give stories more room and native taps share the swipe destinations", async ({
  page,
}, testInfo) => {
  await openFrontendTakenBacklog(page);
  const board = boardView(page);
  await board.swipe("left");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  const room = await board.columnReadingRoom("Taken");
  await testInfo.attach("indicator-room", {
    body: JSON.stringify(room),
    contentType: "application/json",
  });
  expect(room.controlWidths).toHaveLength(2);
  for (const width of room.controlWidths) expect(width).toBeLessThanOrEqual(16);
  // The observed baseline reserved 44px on each side. The gain must reach
  // the actual view and story, not merely change a CSS declaration.
  const previousView = room.board - 2 * 44;
  expect(room.view - previousView).toBeGreaterThan(44);
  expect(room.card - previousView).toBeGreaterThan(44);
  await board.tapIndicator("Recently done");
  await board.showsPhoneColumn("Recently done", ["Taken 1 entry"]);
  await board.swipe("right");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await board.tapIndicator("Backlog");
  await board.showsPhoneColumn("Backlog", ["Taken 1 entry"]);
});

test("thin indicators retain complete destination names, keyboard activation and focus handoff", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  const board = boardView(page);
  await focusColumnIndicator(page, "Taken");
  await expectColumnIndicatorFocused(page, "Taken");
  await activateColumnIndicator(page, "Taken");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
  await expectColumnIndicatorFocused(page, "Recently done");
  await activateColumnIndicator(page, "Recently done");
  await board.showsPhoneColumn("Recently done", ["Taken 1 entry"]);
  await expectColumnIndicatorFocused(page, "Taken");
  await activateColumnIndicator(page, "Taken");
  await board.showsPhoneColumn("Taken", [
    "Backlog 2 entries",
    "Recently done 0 entries",
  ]);
});
