// How the split chosen with the divider between the Sessions sidebar's two lists
// (./cursor-sessions-sidebar-resize.spec.ts) lasts for the page: across collapsing,
// project and view changes and closing the sidebar. Where the window is too
// short for both floors, the divider offers no range and the sidebar scrolls;
// more room recovers the chosen split. The crowded lists' saved sessions and
// runner answers are preconditions only; the held client is real, and
// resizing asks it nothing.
import {
  expandCrowded,
  expectDividerSays,
  expectSplit,
  heightOf,
  keyStep,
  press,
  roomOf,
  valueOf,
  wide,
} from "./cursorSessionsSidebarResizePage.ts";
import { parts } from "./dashboardPage.ts";
import {
  compactProjectSelectCut,
  expectEveryControlReachable,
  expectNoSidewaysScrollAndWholeText,
} from "./pageLayout.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import {
  changesAsked,
  expectLastInReach,
  listFloor as floor,
  runningCursorParts,
  showPage,
} from "./runningCursorSessionsPage.ts";
import { expect, test } from "./support/cursorStart.ts";

test.use({ cursorScreen: "working" });

test("where the window is too short for both floors, the divider offers no range and the sidebar scrolls; more room recovers the chosen split", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const { shown, heldRows, expectNothingChanged } = await expandCrowded(
    page,
    dashboard,
    origin,
    cursor,
  );
  const { sidebar, divider, header, list, body } = shown;
  const room = await roomOf(shown);
  // What the sidebar's heading, header and padding take from its height.
  const taken = wide.height - room;
  const maximum = await valueOf(divider, "aria-valuemax");
  await divider.focus();
  await press(page, "ArrowUp", 40);
  await press(page, "ArrowDown", 2);
  const chosen = maximum - 2 * keyStep;
  await expectSplit(shown, room, chosen);

  await test.step("less room fits the chosen split within the floors", async () => {
    const height = Math.ceil(taken + 2 * floor + 40);
    await page.setViewportSize({ width: wide.width, height });
    await expect(divider).toHaveAttribute("aria-valuemax", String(floor + 40));
    await expectDividerSays(divider, floor + 40);
    await expectSplit(shown, height - taken, floor + 40);
  });

  await test.step("too little room for both floors: the divider offers no range, and both lists and the header stay in reach by scrolling", async () => {
    await page.setViewportSize({
      width: wide.width,
      height: Math.floor(taken + 2 * floor - 40),
    });
    await expect(divider).toBeDisabled();
    // Nothing to say or to take the keyboard for.
    expect(await divider.getAttribute("aria-valuenow")).toBeNull();
    expect(await divider.getAttribute("tabindex")).toBeNull();
    for (const area of [list, body])
      expect(await heightOf(area)).toBeCloseTo(floor, 0);
    expect(
      await sidebar.evaluate(
        (element) => element.scrollHeight > element.clientHeight,
      ),
    ).toBe(true);
    await expectEveryControlReachable(sidebar);
    await expectLastInReach([
      [list, shown.entries.last()],
      [body, heldRows.last()],
    ]);
  });

  await test.step("more room offers the range again and recovers the chosen split", async () => {
    await page.setViewportSize(wide);
    await expect(divider).toBeEnabled();
    await expect(divider).toHaveAttribute("aria-valuemax", String(maximum));
    await expectDividerSays(divider, chosen);
    await expectSplit(shown, room, chosen);
  });

  for (const [bound, key, height] of [
    ["the top", "ArrowUp", maximum],
    ["the bottom", "ArrowDown", floor],
  ] as const) {
    await test.step(`resized to ${bound}, a short, zoomed window keeps both lists and the header in reach without sideways scrolling, and more room recovers it`, async () => {
      await divider.focus();
      await press(page, key, 40);
      await expectSplit(shown, room, height);
      await page.setViewportSize({ width: 320, height: 256 });
      await expect(sidebar).toBeVisible();
      await expect(divider).toBeDisabled();
      // An entry's title is cut by design (./sessions-sidebar-row.spec.ts).
      await expectNoSidewaysScrollAndWholeText(page, [
        ".sessions-sidebar-session-entry-title",
        ...compactProjectSelectCut,
      ]);
      for (const area of [list, body])
        expect(await heightOf(area)).toBeGreaterThanOrEqual(floor - 1);
      await expectEveryControlReachable(sidebar);
      await expectLastInReach([
        [list, shown.entries.last()],
        [body, heldRows.last()],
      ]);
      await header.scrollIntoViewIfNeeded();
      await expect(header).toBeInViewport();
      await page.setViewportSize(wide);
      await expect(divider).toBeEnabled();
      await expectSplit(shown, room, height);
    });
  }

  expectNothingChanged();
});

test.describe("with two projects", () => {
  test.use({ projectFolders: ["open-dough", "pygardon"] });

  test("the chosen split survives collapsing, project and view changes, and closing the sidebar", async ({
    page,
    origin,
    cursor,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(wide);
    const pygardon = await publishMovingOrigin(page, "terryyin/pygardon");
    pygardon.push(
      "e6".repeat(20),
      "# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [A Pygardon story](seeds/SEED-301.md#s) — SEED-301#s\n",
    );
    const asked = changesAsked(page);
    await showPage(page, origin);
    const shown = runningCursorParts(page);
    const { sidebar, button, header, divider, body } = shown;
    const { project, backlog } = parts(page);
    await button.click();
    await header.click();
    await expect(body).toBeVisible();
    const room = await roomOf(shown);
    await divider.focus();
    await press(page, "ArrowUp", 3);
    const chosen = Math.round(room / 2) + 3 * keyStep;
    await expectSplit(shown, room, chosen);
    const expectChosen = async () => {
      await expect(header).toHaveAttribute("aria-expanded", "true");
      await expectDividerSays(divider, chosen);
      await expectSplit(shown, room, chosen);
    };

    await test.step("collapsing and expanding again restores it", async () => {
      await header.click();
      await expect(body).toHaveCount(0);
      await expect(divider).toHaveCount(0);
      await header.click();
      await expectChosen();
    });

    await test.step("choosing another project keeps it", async () => {
      await project.getByRole("radio", { name: "Pygardon" }).check();
      await expect(backlog).toContainText("A Pygardon story");
      await expectChosen();
    });

    await test.step("System settings and back keeps it", async () => {
      await page
        .getByRole("button", { name: "System settings", exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "System settings", exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Back to dashboard", exact: true })
        .click();
      await expect(backlog).toContainText("A Pygardon story");
      await expectChosen();
    });

    await test.step("closing and reopening the sidebar keeps it", async () => {
      await button.click();
      await expect(sidebar).toBeHidden();
      await button.click();
      await expectChosen();
    });

    expect(asked).toEqual([]);
    expect(cursor.calls()).toEqual([]);
    expect(cursor.attaches()).toEqual([]);
  });
});
