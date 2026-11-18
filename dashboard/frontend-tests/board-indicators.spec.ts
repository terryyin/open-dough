import {
  expect,
  test,
  openFrontendTakenBacklog,
} from "../test-support/support/frontendApp.ts";
import {
  activateColumnIndicator,
  columnReadingRoom,
  expectColumnIndicatorFocused,
  expectColumnReading,
  focusColumnIndicator,
  swipeBoard,
  tapColumnIndicator,
} from "../test-support/boardPage.ts";
import { compactProjectSelectCut } from "../test-support/pageLayout.ts";

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

test("thin phone indicators give stories more room and native taps share the swipe destinations", async ({
  page,
}, testInfo) => {
  await openFrontendTakenBacklog(page);
  await swipeBoard(page, "left");
  await expectColumnReading(
    page,
    "Taken",
    ["Backlog 2 entries", "Recently done 0 entries"],
    compactProjectSelectCut,
  );
  const room = await columnReadingRoom(page, "Taken");
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
  await tapColumnIndicator(page, "Recently done");
  await expectColumnReading(
    page,
    "Recently done",
    ["Taken 1 entry"],
    compactProjectSelectCut,
  );
  await swipeBoard(page, "right");
  await expectColumnReading(
    page,
    "Taken",
    ["Backlog 2 entries", "Recently done 0 entries"],
    compactProjectSelectCut,
  );
  await tapColumnIndicator(page, "Backlog");
  await expectColumnReading(
    page,
    "Backlog",
    ["Taken 1 entry"],
    compactProjectSelectCut,
  );
});

test("thin indicators retain complete destination names, keyboard activation and focus handoff", async ({
  page,
}) => {
  await openFrontendTakenBacklog(page);
  await focusColumnIndicator(page, "Taken");
  await expectColumnIndicatorFocused(page, "Taken");
  await activateColumnIndicator(page, "Taken");
  await expectColumnReading(
    page,
    "Taken",
    ["Backlog 2 entries", "Recently done 0 entries"],
    compactProjectSelectCut,
  );
  await expectColumnIndicatorFocused(page, "Recently done");
  await activateColumnIndicator(page, "Recently done");
  await expectColumnReading(
    page,
    "Recently done",
    ["Taken 1 entry"],
    compactProjectSelectCut,
  );
  await expectColumnIndicatorFocused(page, "Taken");
  await activateColumnIndicator(page, "Taken");
  await expectColumnReading(
    page,
    "Taken",
    ["Backlog 2 entries", "Recently done 0 entries"],
    compactProjectSelectCut,
  );
});
