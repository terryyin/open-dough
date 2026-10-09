// Where the page has no room for all three dashboard columns, it is only as
// long as the columns it shows: read to its end, a developer reaches the end
// of the longest shown column and the page's ordinary framing, never a blank
// stretch left by a taller hidden column. Showing a longer column makes all
// of it reachable again. An opened inspection lengthens the page and closing
// it shortens it again, while content arriving in a hidden column adds
// nothing. Recently done shows its latest ten entries until its older ones are
// revealed. Where a page read far down stops when shorter columns show is
// ./dashboard-columns-clamp.spec.ts; that focus and a Sessions sidebar choice
// reveal a hidden column whole is ./dashboard-columns-paging.spec.ts and
// ./dashboard-columns-paging-sessions-sidebar.spec.ts.

import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { inspectedDetail } from "./cardControls.ts";
import { expect, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
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
import { withDoneCatalog } from "./doneCatalogAnswers.ts";
import { revealAction } from "./recentlyDoneProgressivePage.ts";
import {
  at,
  doneDirectory,
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
        ...publishedFiles(withDoneCatalog(doneRecords, doneDirectory)),
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
    await test.step("Recently done revealed to its oldest entry is long, then hidden again", async () => {
      await showColumn(page, "Recently done");
      const reveal = revealAction(recentlyDone);
      for (const offered of [
        "Show 10 of 30 older entries",
        "Show 10 of 20 older entries",
        "Show the 10 older entries",
      ]) {
        await expect(reveal).toHaveText(offered);
        await reveal.click();
      }
      await expect(reveal).toHaveCount(0);
      await expect(lastDone).toHaveCount(1);
      await showColumn(page, "Backlog");
    });
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
    await page.setViewportSize({ width: 54 * rem, height: 500 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const moreDone = 40;
    const { release, doneCard } = await heldFactGroups(page, { moreDone });
    const { recentlyDone } = parts(page);
    await expect(doneCard).toHaveCount(0);
    await expectView(page, ["Backlog", "Taken"], [/^Recently done /]);
    const before = await extentOf(page);
    await expectEndsWithShown(page, ["Backlog", "Taken"]);

    release("done");
    // The latest ten show: the journeys' own done story, then nine more.
    const lastDone = recentlyDone.getByRole("article", {
      name: moreDoneTitle(9),
    });
    await expect(lastDone).toHaveCount(1);
    await expect(doneCard).toHaveCount(1);
    await expect(revealAction(recentlyDone)).toHaveText(
      "Show 10 of 31 older entries",
    );
    await expectLongerThanThePage(revealAction(recentlyDone));
    expect(await extentOf(page)).toBe(before);
    await expectEndsWithShown(page, ["Backlog", "Taken"]);
  });
});
