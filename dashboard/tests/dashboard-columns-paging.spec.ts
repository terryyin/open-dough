// A page too narrow for Backlog, Taken, and Recent sessions side by side
// shows the whole columns that fit, two from 48rem and one below, filling
// the page from Backlog; an edge control on a side with a hidden column names
// it and how many entries it holds, stays in sight down a long page, and
// moves the view one column, briefly sliding unless the developer asked for
// reduced motion, and the chosen position comes back where the width allows
// it. That the side panel pages the columns as a window would is
// ./dashboard-columns-paging-side-panel.spec.ts; that three columns show side
// by side in a wide page is ./accessible-overview.spec.ts.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  largeBacklog,
  queuedCount,
  queuedTitle,
  queuedTitles,
  revision,
} from "./accessibleOverview.ts";
import {
  commitAnswer,
  publishOrigin,
  rawFileAnswer,
} from "./publishedOrigin.ts";
import { box } from "./pageLayout.ts";
import {
  edgeControl,
  edgeRoom,
  expectCardsKeepTheirShare,
  expectView,
  recordSlides,
  rem,
  showColumn,
  slidesOf,
} from "./dashboardColumnsPage.ts";

// The dashboard, reading a Backlog longer than one screen and one Taken entry.
async function openLargeBacklog(page: Page) {
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(largeBacklog) },
  });
  await page.goto("/");
}

test.describe("in a narrow window", () => {
  test("a 40rem page shows one column; each move shows the next, and wider and narrower pages keep the leftmost shown column", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 40 * rem, height: 800 });
    await openLargeBacklog(page);
    await expectMembership(page, {
      taken: ["Repair the installer's update report"],
      backlog: queuedTitles,
    });

    await test.step("Backlog fills the page; the right control names Taken", async () => {
      await expectView(page, ["Backlog"], ["Taken 1 entry"]);
      await expectCardsKeepTheirShare(page, 1);
    });

    await test.step("one move shows Taken, with Backlog on the left and Recent sessions on the right", async () => {
      await edgeControl(page, "Taken").click();
      await expectView(
        page,
        ["Taken"],
        [`Backlog ${queuedCount} entries`, "Recent sessions 0 entries"],
      );
    });

    await test.step("Recent sessions, the last column, leaves only the left control", async () => {
      await edgeControl(page, "Recent sessions").click();
      await expectView(page, ["Recent sessions"], ["Taken 1 entry"]);
    });

    await test.step("a 54rem page shows Taken and Recent sessions, never a blank place past them", async () => {
      await page.setViewportSize({ width: 54 * rem, height: 800 });
      await expectView(
        page,
        ["Taken", "Recent sessions"],
        [`Backlog ${queuedCount} entries`],
      );
    });

    await test.step("a 40rem page again shows Recent sessions, the leftmost column chosen", async () => {
      await page.setViewportSize({ width: 40 * rem, height: 800 });
      await expectView(page, ["Recent sessions"], ["Taken 1 entry"]);
    });
  });

  test("far down a long Backlog the edge control stays in sight and moves the view, and the shown stage heading stays stuck below the banner", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 54 * rem, height: 700 });
    await openLargeBacklog(page);
    const { backlog, banner } = parts(page);
    await expect(
      backlog.getByRole("article", { name: queuedTitle(queuedCount) }),
    ).toBeVisible();
    await expect(backlog.locator(".dependency-problem")).toHaveCount(
      queuedCount,
    );
    const heading = backlog.getByRole("heading", { level: 2 });
    const scrollTo = async (y: number) => {
      await page.mouse.wheel(0, y - (await page.evaluate(() => scrollY)));
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(y);
    };

    await test.step("down the Backlog, its heading stays stuck below the banner and the right control stays in sight", async () => {
      await scrollTo(1000);
      const stuck = (await box(heading)).y;
      const bannerBox = await box(banner);
      expect(stuck).toBeGreaterThanOrEqual(bannerBox.y + bannerBox.height);
      expect(stuck).toBeLessThan(bannerBox.y + bannerBox.height + rem);
      await scrollTo(1500);
      expect((await box(heading)).y).toBe(stuck);
      await expect(edgeControl(page, "Recent sessions")).toBeInViewport({
        ratio: 1,
      });
    });

    await test.step("the control moves the view where the developer reads, and the left one moves it back", async () => {
      const stuck = (await box(heading)).y;
      await showColumn(page, "Recent sessions");
      expect(await page.evaluate(() => scrollY)).toBe(1500);
      await expectView(
        page,
        ["Taken", "Recent sessions"],
        [`Backlog ${queuedCount} entries`],
      );
      await showColumn(page, "Backlog");
      expect(await page.evaluate(() => scrollY)).toBe(1500);
      await expectView(
        page,
        ["Backlog", "Taken"],
        ["Recent sessions 0 entries"],
      );
      expect((await box(heading)).y).toBe(stuck);
    });
  });

  test("with reduced motion asked for, a move shows the next column at once", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 40 * rem, height: 800 });
    await openLargeBacklog(page);
    const { taken } = parts(page);
    await expect(taken.getByRole("article")).toHaveCount(1);
    await recordSlides(page);
    const pageColumn = await box(page.locator(".page-column"));

    await edgeControl(page, "Taken").click();
    // Taken is in place at once, the page column's edge room from its side.
    const at = await box(taken);
    expect(at.x).toBeGreaterThanOrEqual(pageColumn.x);
    expect(at.x).toBeLessThanOrEqual(pageColumn.x + edgeRoom + 0.5);
    expect(await slidesOf(page)).toBe(0);
    await expectView(
      page,
      ["Taken"],
      [`Backlog ${queuedCount} entries`, "Recent sessions 0 entries"],
    );
  });
});
