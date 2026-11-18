// Where the Board has no room for all three Board Columns, it is only as
// long as the columns it shows: read to its end, a developer reaches the end
// of the longest shown column and the Board's ordinary framing, never a blank
// stretch left by a taller hidden column. Showing a longer column makes all
// of it reachable again. An opened inspection lengthens the Board and closing
// it shortens it again, while content arriving in a hidden column adds
// nothing. Recently done shows its latest ten entries until its older ones are
// revealed. Where a Board read far down stops when shorter columns show is
// ./board-clamp.spec.ts; that focus and a Sessions sidebar choice
// reveal a hidden column whole is ./board-paging.spec.ts and
// ./board-paging-sessions-sidebar.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { renderStorySection } from "../../../Distribution/tests/support/published-seed.mjs";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  hideDetail,
  inspectedDetail,
} from "../../test-support/storyCardControls.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  openDoughSource,
  putFrontendDoneRecords,
  putFrontendPublished,
  type FrontendServiceState,
} from "../../test-support/support/frontendServiceState.ts";
import { holdAnswer } from "../../test-support/support/frontendSubstituteAnswers.ts";
import { expectSettledPage, parts } from "../../test-support/dashboardPage.ts";
import {
  expectEndsWithShown,
  expectLongerThanTheBoard,
  expectView,
  extentOf,
  rem,
  showColumn,
  wheelTo,
} from "../../test-support/boardPage.ts";
import {
  expectAtBoardBottom,
  expectPagingControlInSight,
} from "../../test-support/boardReading.ts";
import { takenBacklogStories } from "../../test-support/launchStoryCardPage.ts";
import { revealAction } from "../../test-support/recentlyDoneColumn.ts";
import {
  at,
  publishedFiles,
  queuedTitle as inspectedTitle,
  revision,
  workspaceEntry,
} from "../../test-support/recentlyDoneRecords.ts";

const doneTitle = (place: number) => `Done work number ${place} is closed`;

// Publishes `doneCount` done records an hour apart, the first the latest.
function publishDone(services: FrontendServiceState, doneCount: number): void {
  const now = Date.now();
  putFrontendDoneRecords(
    services,
    openDoughSource.id,
    [...Array(doneCount).keys()].map((index) =>
      makeMe.aDoneRecord
        .with({
          identity: `SEED-2${index + 1}#closed`,
          title: doneTitle(index + 1),
          completedAt: at(now, (index + 1) * 60 * 60 * 1000),
          developer: "Terry Yin",
        })
        .please(),
    ),
  );
}

test.describe("in a two-column Board", () => {
  test("a hidden long Recently done adds no blank tail below Backlog and Taken; an inspection lengthens and shortens the Board, and Recently done shown is read whole", async ({
    page,
    frontendServices,
  }) => {
    await page.setViewportSize({ width: 54 * rem, height: 480 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const doneCount = 40;
    const purpose = `Keep the inspected story's purpose readable to its end. ${"Its detail holds a long purpose, so opening it lengthens the page well past one window. ".repeat(30)}The purpose ends here.`;
    const published = publishedFiles({
      files: {
        ".planning/seeds/SEED-008-worktree-branch-trunk-sync.md":
          renderStorySection(workspaceEntry, { goal: purpose }),
      },
    });
    putFrontendPublished(frontendServices, {
      revision,
      backlog: published[".planning/PRODUCT-BACKLOG.md"] ?? "",
      files: published,
    });
    publishDone(frontendServices, doneCount);
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

    await test.step("read to its end, the Board ends with Backlog and Taken", async () => {
      await expectLongerThanTheBoard(lastDone);
      await expectEndsWithShown(page, ["Backlog", "Taken"]);
    });

    const card = backlog.getByRole("article", { name: inspectedTitle });
    const before = await extentOf(page);
    await test.step("an opened inspection lengthens the Board and is read to its end", async () => {
      const detail = await inspectedDetail(card);
      await expect(detail).toContainText("The purpose ends here.");
      expect(await extentOf(page)).toBeGreaterThan(before + 480);
      await expectEndsWithShown(page, ["Backlog", "Taken"]);
      await expect(
        detail.getByText(/The purpose ends here\.$/),
      ).toBeInViewport();
      await expectLongerThanTheBoard(lastDone);
    });

    await test.step("closing it shortens the Board again", async () => {
      await wheelTo(page, 0);
      await hideDetail(card);
      await expect.poll(() => extentOf(page)).toBe(before);
      await expectEndsWithShown(page, ["Backlog", "Taken"]);
    });

    await test.step("Recently done shown is reachable to its last entry, and the short pair again clamps the Board", async () => {
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
      await expectAtBoardBottom(page);
      await expectEndsWithShown(page, ["Backlog", "Taken"]);
      await expectPagingControlInSight(page, "Recently done");
    });
  });

  test("done stories arriving in a hidden Recently done add no blank tail below Backlog and Taken", async ({
    page,
    frontendServices,
  }) => {
    // Read at the Board's top, the column paging control starts below the Board header
    // and is as tall as its "Entry count incomplete" label, whose length
    // differs by font: about 320 px on macOS and 340 px on Linux, ending near
    // 495 and 515 px. The window leaves room for a label far longer, and
    // stays shorter than Backlog and Taken, so the Board still ends with them.
    await page.setViewportSize({ width: 54 * rem, height: 600 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    // The default Backlog and Taken, longer than the window, beside 41 done
    // records.
    publishDone(frontendServices, 41);
    // The done catalog's answer is held until released.
    const { held, hold } = holdAnswer(page);
    await page.route(
      (url) =>
        url.pathname === authenticatedReadEndpoint &&
        url.searchParams.get("done") === "catalog",
      async (route) => {
        hold.received();
        await hold.released;
        await route.fallback();
        hold.delivered();
      },
    );
    await page.goto("/");
    await held.received;
    // Every card has its length before the Board's is read.
    await expect(parts(page).taken.getByRole("article")).toHaveCount(
      takenBacklogStories.taken.length,
    );
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    const doneCard = parts(page).recentlyDone.getByRole("article", {
      name: doneTitle(1),
    });
    const { recentlyDone } = parts(page);
    await expect(doneCard).toHaveCount(0);
    await expectView(page, ["Backlog", "Taken"], [/^Recently done /]);
    const before = await extentOf(page);
    await expectEndsWithShown(page, ["Backlog", "Taken"]);

    held.release();
    // The latest ten show.
    const lastDone = recentlyDone.getByRole("article", {
      name: doneTitle(10),
    });
    await expect(lastDone).toHaveCount(1);
    await expect(doneCard).toHaveCount(1);
    await expect(revealAction(recentlyDone)).toHaveText(
      "Show 10 of 31 older entries",
    );
    await expectLongerThanTheBoard(revealAction(recentlyDone));
    expect(await extentOf(page)).toBe(before);
    await expectEndsWithShown(page, ["Backlog", "Taken"]);
  });
});
