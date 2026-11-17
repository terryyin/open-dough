// The agent roster scrolls below its stationary banner, and a classic Board
// scrollbar keeps the Column boundary and a saved Board position. That the
// Board alone scrolls beside an open Side panel is
// ./board-scroll-side-panel.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  putFrontendBacklog,
  putFrontendPublished,
} from "../../tests/support/frontendServiceState.ts";
import {
  largeBacklog,
  queuedCount,
  revision,
} from "../../tests/accessibleBoard.ts";
import {
  boardPositionKey,
  boardScroll,
  expectView,
  keptBoardPosition,
} from "../../tests/boardPage.ts";
import { expectDocumentStill } from "../../tests/boardReading.ts";
import {
  expectSettledPage,
  parts,
  rosterParts,
} from "../../tests/dashboardPage.ts";
import { box } from "../../tests/pageLayout.ts";
import { openDough, openDoughFiles } from "../../tests/agentRosterRecords.ts";
import { openUntilRead } from "../../tests/pageRequestNotes.ts";
import { dashboardBrowserArgs } from "../../tests/support/browserArgs.ts";

// Exercise the browser's actual scrollbar; Playwright normally hides it.
test.use({
  launchOptions: {
    args: dashboardBrowserArgs,
    ignoreDefaultArgs: ["--hide-scrollbars"],
  },
});

test("the agent roster scrolls below its stationary banner without scrolling the document", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 700, height: 800 });
  putFrontendPublished(frontendServices, {
    revision: openDough.revision,
    backlog: openDoughFiles[".planning/PRODUCT-BACKLOG.md"] ?? "",
    files: openDoughFiles,
  });
  await openUntilRead(page, "/?project=open-dough&view=roster");
  const { banner } = parts(page);
  const { members } = rosterParts(page);
  const region = page.locator(".roster-scroll");
  const before = await box(banner);
  const at = await box(region);
  await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => region.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await box(banner)).toEqual(before);
  await expectDocumentStill(page);
  await members.last().scrollIntoViewIfNeeded();
  await expect(members.last()).toBeInViewport({ ratio: 1 });
  await expectDocumentStill(page);
});

test("a classic Board scrollbar's width owns the Column boundary and keeps a saved position", async ({
  page,
  frontendServices,
}, testInfo) => {
  await page.setViewportSize({ width: 1152, height: 800 });
  await page.addInitScript((key) => {
    // A classic track, as on hosts without overlay scrollbars, whatever
    // this host's own scrollbar style.
    document.addEventListener("DOMContentLoaded", () => {
      const track = document.createElement("style");
      track.textContent = ".board-scroll::-webkit-scrollbar { width: 15px; }";
      document.head.append(track);
    });
    if (localStorage.getItem(key) === null) localStorage.setItem(key, "1");
  }, boardPositionKey);
  putFrontendBacklog(frontendServices, { revision, backlog: largeBacklog });
  await page.goto("/");
  await expectSettledPage(page);
  const room = await boardScroll(page).evaluate((element) => {
    const board = element.querySelector(".board");
    if (!board) throw new Error("No Board in its scroll region");
    return {
      board: element.clientWidth,
      page: element.closest(".page-column")?.clientWidth,
      shown: getComputedStyle(board).getPropertyValue("--columns-shown"),
    };
  });
  await testInfo.attach("native Board room", {
    body: JSON.stringify(room),
    contentType: "application/json",
  });
  expect(room.board).toBeLessThan(1152);
  const backlogControl = `Backlog ${queuedCount} entries`;
  await expectView(page, ["Taken", "Recently done"], [backlogControl]);
  expect(await keptBoardPosition(page)).toBe("1");
  await page.reload();
  await expectView(page, ["Taken", "Recently done"], [backlogControl]);
});
