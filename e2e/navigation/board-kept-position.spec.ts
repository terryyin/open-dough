import type { Page } from "@playwright/test";
import { materializeRepository } from "../../Distribution/tests/support/repository-fixture.mjs";
import {
  largeBacklogRepository,
  queuedTitles,
} from "../../dashboard/test-support/accessibleBoard.ts";
import {
  boardView,
  classicBoardScrollbarLaunchOptions,
} from "../../dashboard/test-support/boardView.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { watchPageErrors } from "../../dashboard/test-support/pageErrors.ts";

const twoColumnViewport = { width: 864, height: 800 };
const backlogPagingLabel = `Backlog ${queuedTitles.length} entries`;
const classicScrollbarWidth = 15;

test.use({
  viewport: twoColumnViewport,
  reducedMotion: "reduce",
  launchOptions: classicBoardScrollbarLaunchOptions,
});

async function openPublishedBoard(
  page: Page,
  afterGitHubStops: (cleanup: () => void | Promise<void>) => void,
) {
  const { origin, trunkSha, cleanup } = await materializeRepository(
    largeBacklogRepository(),
  );
  afterGitHubStops(cleanup);
  await publishCommittedOrigin(page, {
    repoDir: origin,
    revision: trunkSha,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  return boardView(page);
}

test("reload restores the chosen Board position even when all three columns fit at the time", async ({
  page,
  afterGitHubStops,
}) => {
  await test.step("Given this browser reserves room for the classic Board scrollbar", async () => {
    await boardView(page).useClassicScrollbar(classicScrollbarWidth);
  });
  const board =
    await test.step("And a published Board showing Backlog and Taken", async () => {
      const opened = await openPublishedBoard(page, afterGitHubStops);
      await opened.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
      return opened;
    });
  await test.step("When I page to Recently done", async () => {
    await board.pageTo("Recently done");
  });
  await test.step("Then Taken and Recently done share the Board", async () => {
    await board.shows(["Taken", "Recently done"], [backlogPagingLabel]);
  });
  await test.step("When I reload at the same width", async () => {
    await board.reload();
  });
  await test.step("Then Taken and Recently done are still shown", async () => {
    await board.shows(["Taken", "Recently done"], [backlogPagingLabel]);
  });
  await test.step("When I widen the window to fit three columns", async () => {
    await page.setViewportSize({ width: 1728, height: 800 });
  });
  await test.step("Then all three columns fit together", async () => {
    await board.shows(["Backlog", "Taken", "Recently done"], []);
  });
  await test.step("When I reload in the wider window", async () => {
    await board.reload();
  });
  await test.step("Then all three columns still fit", async () => {
    await board.shows(["Backlog", "Taken", "Recently done"], []);
  });
  await test.step("When I narrow the window to the three-column boundary with a classic scrollbar", async () => {
    await page.setViewportSize({
      width: 1152,
      height: twoColumnViewport.height,
    });
  });
  await test.step("Then the scrollbar leaves room for the chosen pair", async () => {
    await expect
      .poll(() => board.scrollbarWidth())
      .toBeGreaterThanOrEqual(classicScrollbarWidth);
    await board.shows(["Taken", "Recently done"], [backlogPagingLabel]);
  });
  await test.step("When I reload with the classic scrollbar", async () => {
    await board.reload();
  });
  await test.step("Then the chosen pair is still shown", async () => {
    await board.shows(["Taken", "Recently done"], [backlogPagingLabel]);
  });
  await test.step("When I return to the original width", async () => {
    await page.setViewportSize(twoColumnViewport);
  });
  await test.step("Then the chosen pair is still shown at the original width", async () => {
    await board.shows(["Taken", "Recently done"], [backlogPagingLabel]);
  });
  await test.step("When I page back to Backlog", async () => {
    await board.pageTo("Backlog");
  });
  await test.step("Then Backlog and Taken share the Board again", async () => {
    await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  });
  await test.step("When I reload after choosing Backlog", async () => {
    await board.reload();
  });
  await test.step("Then Backlog and Taken are still shown", async () => {
    await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  });
});

test("reload starts again at Backlog if the browser refuses storage", async ({
  page,
  afterGitHubStops,
}) => {
  const errors =
    await test.step("Given the browser refuses storage", async () => {
      const pageErrors = watchPageErrors(page);
      await page.addInitScript(() => {
        Object.defineProperty(window, "localStorage", {
          get() {
            throw new DOMException("Storage is refused.", "SecurityError");
          },
        });
      });
      return pageErrors;
    });
  const board =
    await test.step("And a published Board opens at Backlog", async () => {
      const opened = await openPublishedBoard(page, afterGitHubStops);
      await opened.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
      return opened;
    });
  await test.step("When I page to Recently done", async () => {
    await board.pageTo("Recently done");
  });
  await test.step("Then I see Taken and Recently done", async () => {
    await board.shows(["Taken", "Recently done"], [backlogPagingLabel]);
  });
  await test.step("When I reload", async () => {
    await board.reload();
  });
  await test.step("Then the Board starts at Backlog again", async () => {
    await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
  });
  await test.step("And neither visit reported a browser error", () => {
    expect(errors).toEqual([]);
  });
});
