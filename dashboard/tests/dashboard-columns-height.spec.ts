// Where the page has no room for all three dashboard columns, it is only as
// long as the columns it shows: read to its end, a developer reaches the end
// of the longest shown column and the page's ordinary framing, never a blank
// stretch left by a taller hidden column. Showing a longer column makes all
// of it reachable again; a vertical position the new columns cannot hold
// stops at their bottom, and one they can hold stays. An opened inspection
// lengthens the page and closing it shortens it again, while content arriving
// in a hidden column adds nothing. That focus and a Sessions sidebar choice
// reveal a hidden column whole is ./dashboard-columns-paging.spec.ts and
// ./dashboard-columns-paging-sessions-sidebar.spec.ts.

import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { inspectedDetail } from "./cardControls.ts";
import { expect, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import {
  largeBacklog,
  queuedCount,
  queuedTitle,
  revision as largeRevision,
} from "./accessibleOverview.ts";
import {
  commitAnswer,
  publishFiles,
  publishOrigin,
  rawFileAnswer,
} from "./publishedOrigin.ts";
import { pressWhereShown } from "./pageLayout.ts";
import {
  bottomOf,
  edgeControl,
  expectEndsWithShown,
  expectLongerThanThePage,
  expectView,
  extentOf,
  rem,
  scrollYOf,
  showColumn,
  wheelTo,
} from "./dashboardColumnsPage.ts";
import { heldFactGroups, moreDoneTitle } from "./publishedFactsArrival.ts";
import {
  at,
  doneRecordAt,
  publishedFiles,
  queuedTitle as inspectedTitle,
  repository,
  revision,
} from "./recentlyDoneRecords.ts";

test.describe("in a two-column page", () => {
  test("a hidden long Recently done adds no blank tail below Backlog and Taken; an inspection lengthens and shortens the page, and Recently done shown is read whole", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 54 * rem, height: 480 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const now = Date.now();
    const doneCount = 40;
    const doneTitle = (place: number) => `Done work number ${place} is closed`;
    const doneRecords = Object.fromEntries(
      [...Array(doneCount).keys()].map((index) => {
        const identity = `SEED-2${index + 1}#closed`;
        return [
          doneRecordAt(identity),
          renderDoneRecord({
            identity,
            title: doneTitle(index + 1),
            completedAt: at(now, (index + 1) * 60 * 60 * 1000),
            developer: "Terry Yin",
          }),
        ];
      }),
    );
    const purpose = `Keep the inspected story's purpose readable to its end. ${"Its detail holds a long purpose, so opening it lengthens the page well past one window. ".repeat(30)}The purpose ends here.`;
    await publishFiles(page, {
      repository,
      revision,
      files: {
        ...publishedFiles(doneRecords),
        ".planning/seeds/SEED-008-worktree-branch-trunk-sync.md": `<a id="planning-workspace-procedure"></a>

### ${inspectedTitle}

**Identity:** SEED-008#planning-workspace-procedure

**Goal:** ${purpose}
`,
      },
    });
    await page.goto("/");
    // Read only once every card has its length, as in the long-Backlog read.
    await expectSettledPage(page, { taken: [], backlog: [inspectedTitle] });
    const { backlog, recentlyDone } = parts(page);
    const lastDone = recentlyDone.getByRole("article", {
      name: doneTitle(doneCount),
    });
    await expect(lastDone).toHaveCount(1);
    await expectView(page, ["Backlog", "Taken"], ["Recently done 40 entries"]);

    await test.step("read to its end, the page ends with Backlog and Taken", async () => {
      await expectLongerThanThePage(lastDone);
      await expectEndsWithShown(page, ["Backlog", "Taken"]);
    });

    const card = backlog.getByRole("article", { name: inspectedTitle });
    const before = await extentOf(page);
    await test.step("an opened inspection lengthens the page and is read to its end", async () => {
      const detail = await inspectedDetail(card);
      await expect(detail).toContainText("The purpose ends here.");
      expect(await extentOf(page)).toBeGreaterThan(before + 480);
      await expectEndsWithShown(page, ["Backlog", "Taken"]);
      await expect(
        detail.getByText(/The purpose ends here\.$/),
      ).toBeInViewport();
      await expectLongerThanThePage(lastDone);
    });

    await test.step("closing it shortens the page again", async () => {
      const hide = card.getByRole("button", { name: "Hide detail" });
      await wheelTo(page, 0);
      await hide.scrollIntoViewIfNeeded();
      await pressWhereShown(hide);
      await expect(
        card.getByRole("button", { name: "Inspect story" }),
      ).toBeVisible();
      await expect.poll(() => extentOf(page)).toBe(before);
      await expectEndsWithShown(page, ["Backlog", "Taken"]);
    });

    await test.step("Recently done shown is reachable to its last entry, and the short pair again clamps the page", async () => {
      await showColumn(page, "Recently done");
      await expectView(page, ["Taken", "Recently done"], ["Backlog 1 entry"]);
      await expectEndsWithShown(page, ["Taken", "Recently done"]);
      await expect(lastDone).toBeInViewport();
      await showColumn(page, "Backlog");
      await expectView(
        page,
        ["Backlog", "Taken"],
        ["Recently done 40 entries"],
      );
      expect(await scrollYOf(page)).toBe(await bottomOf(page));
      await expectEndsWithShown(page, ["Backlog", "Taken"]);
      await expect(edgeControl(page, "Recently done")).toBeInViewport({
        ratio: 1,
      });
    });
  });

  test("done stories arriving in a hidden Recently done add no blank tail below Backlog and Taken", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 54 * rem, height: 480 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const moreDone = 40;
    const { release, doneCard } = await heldFactGroups(page, { moreDone });
    const { recentlyDone } = parts(page);
    await expect(doneCard).toHaveCount(0);
    await expectView(page, ["Backlog", "Taken"], [/^Recently done /]);
    const before = await extentOf(page);
    await expectEndsWithShown(page, ["Backlog", "Taken"]);

    release("done");
    const lastDone = recentlyDone.getByRole("article", {
      name: moreDoneTitle(moreDone),
    });
    await expect(lastDone).toHaveCount(1);
    await expect(doneCard).toHaveCount(1);
    await expectLongerThanThePage(lastDone);
    expect(await extentOf(page)).toBe(before);
    await expectEndsWithShown(page, ["Backlog", "Taken"]);
  });
});

test("a long Backlog read far down: shorter columns clamp the page to their bottom, a position they hold stays, and widening or narrowing keeps the page as long as the columns it shows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 54 * rem, height: 480 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await publishOrigin(page, {
    ref: commitAnswer(largeRevision),
    backlog: { revision: largeRevision, answer: rawFileAnswer(largeBacklog) },
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
