// Where this browser keeps no usable height for the Sessions sidebar's
// Running Cursor sessions (./cursor-sessions-sidebar-size-kept.spec.ts), because the
// kept value is unusable or storage is refused, the two lists start at an
// equal share and still resize, for the page's lifetime where nothing can be
// kept, without error. The held session and the crowded lists are
// preconditions; resizing asks the server and the cursor-agent nothing.
import {
  expandCrowded,
  keyStep,
  runningCursorSplit,
} from "../../dashboard/tests/cursorSessionsSidebarResizePage.ts";
import { watchPageErrors } from "../../dashboard/tests/pageErrors.ts";
import { crowd } from "../../dashboard/tests/runningCursorSessionsPage.ts";
import { expect, test } from "../../dashboard/tests/support/cursorStart.ts";

test.use({ cursorScreen: "working" });

test("an unusable kept height starts at an equal share, is not replaced by expanding, and the next choice is kept", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  const errors = watchPageErrors(page);
  const { shown, heldRows, expectNothingChanged } = await expandCrowded(
    page,
    dashboard,
    origin,
    cursor,
  );
  const split = runningCursorSplit(page, shown);
  const { sidebar, header, entries } = shown;
  const room = await split.roomOf();
  const half = Math.round(room / 2);
  for (const unusable of ["tall", "", "0", "-240", "Infinity", "NaN"]) {
    await test.step(`kept as ${JSON.stringify(unusable)}`, async () => {
      await split.keepInBrowser(split.heightKey, unusable);
      await page.reload();
      await expect(sidebar).toBeVisible();
      await split.expectCollapsed();
      await header.click();
      await split.expectCursorHeight(room, half);
      expect(await split.keptHeight()).toBe(unusable);
    });
  }

  await split.keyDivider("ArrowDown", 2);
  const chosen = half - 2 * keyStep;
  await split.expectSplit(room, chosen);
  expect(await split.keptHeight()).toBe(String(chosen));
  await page.reload();
  await header.click();
  await split.expectCursorHeight(room, chosen);
  // Both lists are whole throughout.
  await expect(entries).toHaveCount(crowd + 1);
  await expect(heldRows).toHaveCount(crowd);
  expectNothingChanged();
  expect(errors).toEqual([]);
});

test("where the browser refuses storage, the lists start at an equal share and resize for the page's lifetime without error", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  await page.addInitScript(() => {
    const refused = () => {
      throw new DOMException("Storage is refused.", "SecurityError");
    };
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get: refused,
    });
  });
  const errors = watchPageErrors(page);
  const { shown, heldRows, expectNothingChanged } = await expandCrowded(
    page,
    dashboard,
    origin,
    cursor,
  );
  const split = runningCursorSplit(page, shown);
  await expect(split.keptHeight()).rejects.toThrow("Storage is refused.");
  const { sidebar, button, header, entries } = shown;
  const room = await split.roomOf();
  const half = Math.round(room / 2);
  await split.expectCursorHeight(room, half);

  await split.keyDivider("ArrowUp", 3);
  const chosen = half + 3 * keyStep;
  const expectChosen = async () => {
    await split.expectCursorHeight(room, chosen);
    await expect(entries).toHaveCount(crowd + 1);
    await expect(heldRows).toHaveCount(crowd);
  };
  await expectChosen();

  await test.step("collapsing and closing the sidebar keep the choice for the page", async () => {
    await header.click();
    await split.expectCollapsed();
    await header.click();
    await expectChosen();
    await button.click();
    await expect(sidebar).toBeHidden();
    await button.click();
    await expectChosen();
  });

  await test.step("a reload starts closed and collapsed, then at an equal share again", async () => {
    await page.reload();
    await expect(sidebar).toBeHidden();
    await button.click();
    await split.expectCollapsed();
    await header.click();
    await split.expectCursorHeight(room, half);
    await expect(entries).toHaveCount(crowd + 1);
    await expect(heldRows).toHaveCount(crowd);
  });

  expectNothingChanged();
  expect(errors).toEqual([]);
});
