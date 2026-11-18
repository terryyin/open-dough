// A Board too narrow for Backlog, Taken, and Recently done side by side
// shows the whole columns that fit, two from 48rem and one below, filling
// the Board from Backlog; a column paging control on a side with a hidden
// column names it and how many entries it holds, stays in sight down a long
// Board, and moves the view one column, briefly sliding unless the developer
// asked for reduced motion, and the chosen position comes back where the width
// allows it; focus landing in a hidden column shows it. That three columns
// show side by side in a wide Board is ./accessible-board.spec.ts.

import type { Page } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import type { FrontendServiceState } from "../../test-support/support/frontendServiceState.ts";
import {
  expectMembership,
  expectSettledPage,
  parts,
} from "../../test-support/dashboardPage.ts";
import {
  publishLargeBacklog,
  queuedCount,
  queuedTitle,
  queuedTitles,
} from "../../test-support/accessibleBoard.ts";
import { expectBelowBanner } from "../../test-support/bannerReading.ts";
import { box } from "../../test-support/pageLayout.ts";
import { pagingRoom, rem } from "../../test-support/boardPage.ts";
import { boardView } from "../../test-support/boardView.ts";
import {
  expectAtBoardBottom,
  expectPagingControlInSight,
} from "../../test-support/boardReading.ts";

// The dashboard, reading a Backlog longer than one screen and one Taken entry.
async function openLargeBacklog(page: Page, services: FrontendServiceState) {
  publishLargeBacklog(services);
  await page.goto("/");
  await expectSettledPage(page);
}

test.describe("in a narrow window", () => {
  test("a 40rem Board shows one column; each move shows the next, and wider and narrower Boards keep the leftmost shown column", async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize({ width: 40 * rem, height: 800 });
    await openLargeBacklog(page, frontendServices);
    const board = boardView(page);
    await expectMembership(page, {
      taken: ["Repair the installer's update report"],
      backlog: queuedTitles,
    });

    await test.step("Backlog fills the Board; the right control names Taken", async () => {
      await board.shows(["Backlog"], ["Taken 1 entry"]);
      await board.keepsStoryCardShare(1);
    });

    await test.step("one move shows Taken, with Backlog on the left and Recently done on the right", async () => {
      await board.pageTo("Taken");
      await board.shows(
        ["Taken"],
        [`Backlog ${queuedCount} entries`, "Recently done 0 entries"],
      );
    });

    await test.step("Recently done, the last column, leaves only the left control", async () => {
      await board.pageTo("Recently done");
      await board.shows(["Recently done"], ["Taken 1 entry"]);
    });

    await test.step("a 54rem Board shows Taken and Recently done, never a blank place past them", async () => {
      await page.setViewportSize({ width: 54 * rem, height: 800 });
      await board.shows(
        ["Taken", "Recently done"],
        [`Backlog ${queuedCount} entries`],
      );
    });

    await test.step("a 40rem Board again shows Recently done, the leftmost column chosen", async () => {
      await page.setViewportSize({ width: 40 * rem, height: 800 });
      await board.shows(["Recently done"], ["Taken 1 entry"]);
    });
  });

  test("from the keyboard, a control gone after its move hands the keyboard to the other side's control", async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize({ width: 40 * rem, height: 800 });
    await openLargeBacklog(page, frontendServices);
    const board = boardView(page);
    await board.shows(["Backlog"], ["Taken 1 entry"]);

    await board.pagingControl("Taken").focus();
    await page.keyboard.press("Enter");
    await board.shows(
      ["Taken"],
      [`Backlog ${queuedCount} entries`, "Recently done 0 entries"],
    );
    // The control pressed is still there and keeps the keyboard.
    await expect(board.pagingControl("Recently done")).toBeFocused();

    await page.keyboard.press("Enter");
    await board.shows(["Recently done"], ["Taken 1 entry"]);
    await expect(board.pagingControl("Taken")).toBeFocused();
  });

  test("far down a long Backlog the column paging control stays in sight and moves the view, and the shown column heading stays stuck below the banner", async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize({ width: 54 * rem, height: 700 });
    await openLargeBacklog(page, frontendServices);
    const board = boardView(page);
    const { backlog, banner } = parts(page);
    await expect(
      backlog.getByRole("article", { name: queuedTitle(queuedCount) }),
    ).toBeVisible();
    await expect(backlog.locator(".dependency-problem")).toHaveCount(
      queuedCount,
    );
    const heading = backlog.getByRole("heading", { level: 2 });

    await test.step("down the Backlog, its heading stays stuck below the banner and the right control stays in sight", async () => {
      await board.wheelTo(1000);
      const stuck = (await box(heading)).y;
      const bannerBox = await box(banner);
      expect(stuck).toBeGreaterThanOrEqual(bannerBox.y + bannerBox.height);
      expect(stuck).toBeLessThan(bannerBox.y + bannerBox.height + rem);
      await board.wheelTo(1500);
      expect((await box(heading)).y).toBe(stuck);
      await expectPagingControlInSight(page, "Recently done");
    });

    await test.step("the control moves the view where the developer reads, stopping at the shorter columns' bottom, and the left one moves it back", async () => {
      const stuck = (await box(heading)).y;
      await board.showColumn("Recently done");
      await board.shows(
        ["Taken", "Recently done"],
        [`Backlog ${queuedCount} entries`],
      );
      // Taken and Recently done are shorter than the place read in Backlog:
      // the Board ends with them, and the position stops at their bottom.
      const clamped = await expectAtBoardBottom(page);
      expect(clamped).toBeLessThan(1500);
      await expectPagingControlInSight(page, "Backlog");
      const takenHeading = parts(page).taken.getByRole("heading", {
        level: 2,
      });
      await expectBelowBanner(takenHeading);
      await expect(takenHeading).toBeInViewport({ ratio: 1 });

      // Backlog shown again keeps that position, and its length is back:
      // far down it, its heading sticks where it did.
      await board.showColumn("Backlog");
      expect(await board.scrollY()).toBe(clamped);
      await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
      await board.wheelTo(1500);
      expect((await box(heading)).y).toBe(stuck);
      await expectPagingControlInSight(page, "Recently done");
    });
  });

  test("with reduced motion asked for, a move shows the next column at once", async ({
    page,
    frontendServices,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 40 * rem, height: 800 });
    await openLargeBacklog(page, frontendServices);
    const board = boardView(page);
    const { taken } = parts(page);
    await expect(taken.getByRole("article")).toHaveCount(1);
    await board.countSlides();
    const pageColumn = await box(board.pageColumn());

    await board.pageTo("Taken");
    // Taken is in place at once, the Board column's paging-control room from its side.
    const at = await box(taken);
    expect(at.x).toBeGreaterThanOrEqual(pageColumn.x);
    expect(at.x).toBeLessThanOrEqual(pageColumn.x + pagingRoom + 0.5);
    expect(await board.slides()).toBe(0);
    await board.shows(
      ["Taken"],
      [`Backlog ${queuedCount} entries`, "Recently done 0 entries"],
    );
  });

  test("tabbing backwards out of Taken into the last Backlog card shows Backlog with that card in sight", async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize({ width: 54 * rem, height: 700 });
    await openLargeBacklog(page, frontendServices);
    const board = boardView(page);
    const { backlog, taken } = parts(page);
    const lastCard = backlog.getByRole("article", {
      name: queuedTitle(queuedCount),
    });
    await expect(lastCard).toBeVisible();
    await board.showColumn("Recently done");
    await board.shows(
      ["Taken", "Recently done"],
      [`Backlog ${queuedCount} entries`],
    );

    // Hidden, Backlog keeps its place in the reading order.
    await board.keepsColumnReadingOrder();

    // The keyboard on Taken's first stop, then one stop backwards.
    await taken.getByRole("button").first().focus();
    await page.keyboard.press("Shift+Tab");
    const focused = page.locator(":focus");
    await expect(lastCard.locator(":focus")).toHaveCount(1);
    await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
    // The view moved without taking the keyboard from the card, which shows
    // whole below the banner.
    await expect(focused).toBeInViewport({ ratio: 1 });
    await expectBelowBanner(focused);
    // Backlog has its whole length again: read to the Board's end, its last
    // card ends the Board.
    await board.endsWith(["Backlog", "Taken"]);
    await expect(lastCard).toBeInViewport({ ratio: 1 });
    await expect(lastCard.locator(":focus")).toHaveCount(1);
  });
});
