// A page read far down the long Backlog stops at the bottom of shorter
// columns shown in its place, keeps a position the columns shown can hold, and
// stays as long as the columns it shows when it widens or narrows. That the
// page is only as long as its shown columns is
// ./dashboard-columns-height.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import {
  largeBacklog,
  queuedCount,
  queuedTitle,
  revision,
} from "./accessibleOverview.ts";
import {
  commitAnswer,
  publishOrigin,
  rawFileAnswer,
} from "./publishedOrigin.ts";
import {
  bottomOf,
  edgeControl,
  expectEndsWithShown,
  expectLongerThanThePage,
  expectView,
  rem,
  scrollYOf,
  showColumn,
  wheelTo,
} from "./dashboardColumnsPage.ts";

test("a long Backlog read far down: shorter columns clamp the page to their bottom, a position they hold stays, and widening or narrowing keeps the page as long as the columns it shows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 54 * rem, height: 480 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(largeBacklog) },
  });
  await page.goto("/");
  const { backlog } = parts(page);
  const lastCard = backlog.getByRole("article", {
    name: queuedTitle(queuedCount),
  });
  // Where the Backlog's last card ends, which a developer reading to the
  // Backlog's end reaches whatever the card's height against the window.
  const lastCardEnd = lastCard.getByRole("button", { name: "Inspect story" });
  // Read only once every card has its length, so the bottom a move stops
  // at is the page's own and not one a later read lengthens.
  await expectSettledPage(page);
  await expect(lastCard).toBeVisible();
  const backlogControl = `Backlog ${queuedCount} entries`;

  await test.step("far down the Backlog, showing Taken and Recently done stops the page at their bottom, below its top", async () => {
    await wheelTo(page, 1500);
    await showColumn(page, "Recently done");
    await expectView(page, ["Taken", "Recently done"], [backlogControl]);
    await expectLongerThanThePage(lastCard);
    const clamped = await scrollYOf(page);
    expect(clamped).toBe(await bottomOf(page));
    expect(clamped).toBeGreaterThan(0);
    expect(clamped).toBeLessThan(1500);
    await expect(edgeControl(page, "Backlog")).toBeInViewport({ ratio: 1 });
    await expectEndsWithShown(page, ["Taken", "Recently done"]);
  });

  await test.step("showing Backlog again keeps the position and reaches its last card", async () => {
    const kept = await scrollYOf(page);
    await showColumn(page, "Backlog");
    await expectView(page, ["Backlog", "Taken"], ["Recently done 0 entries"]);
    expect(await scrollYOf(page)).toBe(kept);
    await expectEndsWithShown(page, ["Backlog", "Taken"]);
    await expect(lastCardEnd).toBeInViewport({ ratio: 1 });
  });

  await test.step("a page wide enough for all three is as long as Backlog, which is read whole", async () => {
    await page.setViewportSize({ width: 80 * rem, height: 480 });
    await expectView(page, ["Backlog", "Taken", "Recently done"], []);
    await expectEndsWithShown(page, ["Backlog", "Taken", "Recently done"]);
    await expect(lastCardEnd).toBeInViewport({ ratio: 1 });
  });

  await test.step("a one-column page shows Backlog, the kept column, then only a short Recently done, with no blank page past it", async () => {
    await page.setViewportSize({ width: 40 * rem, height: 480 });
    await expectView(page, ["Backlog"], ["Taken 1 entry"]);
    await expectEndsWithShown(page, ["Backlog"]);
    await showColumn(page, "Recently done");
    await expectView(page, ["Recently done"], ["Taken 1 entry"]);
    await expectLongerThanThePage(lastCard);
    await expectEndsWithShown(page, ["Recently done"]);
  });
});
