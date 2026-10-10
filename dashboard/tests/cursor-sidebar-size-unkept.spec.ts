// Where this browser keeps no usable height for the Sessions sidebar's
// Running Cursor sessions (./cursor-sidebar-size-kept.spec.ts), because the
// kept value is unusable or storage is refused, the two lists start at an
// equal share and still resize, for the page's lifetime where nothing can be
// kept, without error. The held session and the crowded lists are
// preconditions; resizing asks the server and the cursor-agent nothing.
import {
  expandCrowded,
  expectCollapsed,
  expectEdgeSays,
  expectSplit,
  heightKey,
  keepInBrowser,
  keptHeight,
  keyStep,
  press,
  roomOf,
} from "./cursorSidebarResizePage.ts";
import { watchPageErrors } from "./pageErrors.ts";
import { crowd } from "./runningCursorSessionsPage.ts";
import { expect, test } from "./support/cursorStart.ts";

test.use({ cursorScreen: "working" });

test("an unusable kept height starts at an equal share, is not replaced by expanding, and the next choice is kept", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const errors = watchPageErrors(page);
  const { shown, heldRows, expectNothingChanged } = await expandCrowded(
    page,
    dashboard,
    origin,
    cursor,
  );
  const { sidebar, header, edge, entries } = shown;
  const room = await roomOf(shown);
  const half = Math.round(room / 2);
  for (const unusable of ["tall", "", "0", "-240", "Infinity", "NaN"]) {
    await test.step(`kept as ${JSON.stringify(unusable)}`, async () => {
      await keepInBrowser(page, heightKey, unusable);
      await page.reload();
      await expect(sidebar).toBeVisible();
      await expectCollapsed(shown);
      await header.click();
      await expectEdgeSays(edge, half);
      await expectSplit(shown, room, half);
      expect(await keptHeight(page)).toBe(unusable);
    });
  }

  await edge.focus();
  await press(page, "ArrowDown", 2);
  const chosen = half - 2 * keyStep;
  await expectSplit(shown, room, chosen);
  expect(await keptHeight(page)).toBe(String(chosen));
  await page.reload();
  await header.click();
  await expectEdgeSays(edge, chosen);
  await expectSplit(shown, room, chosen);
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
  test.setTimeout(120_000);
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
  await expect(keptHeight(page)).rejects.toThrow("Storage is refused.");
  const { sidebar, button, header, edge, entries } = shown;
  const room = await roomOf(shown);
  const half = Math.round(room / 2);
  await expectEdgeSays(edge, half);
  await expectSplit(shown, room, half);

  await edge.focus();
  await press(page, "ArrowUp", 3);
  const chosen = half + 3 * keyStep;
  const expectChosen = async () => {
    await expectEdgeSays(edge, chosen);
    await expectSplit(shown, room, chosen);
    await expect(entries).toHaveCount(crowd + 1);
    await expect(heldRows).toHaveCount(crowd);
  };
  await expectChosen();

  await test.step("collapsing and closing the sidebar keep the choice for the page", async () => {
    await header.click();
    await expectCollapsed(shown);
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
    await expectCollapsed(shown);
    await header.click();
    await expectEdgeSays(edge, half);
    await expectSplit(shown, room, half);
    await expect(entries).toHaveCount(crowd + 1);
    await expect(heldRows).toHaveCount(crowd);
  });

  expectNothingChanged();
  expect(errors).toEqual([]);
});
