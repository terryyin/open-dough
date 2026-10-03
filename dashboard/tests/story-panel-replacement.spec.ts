// The page's one side panel replaces one story's review with another's, and a
// review with a retained final report, of Story A's and Story B's real
// worktrees (./support/storyPanels.ts) and kept launch records, Story B's
// session having ended with a final report. A review still being read when
// another story's review opens never answers the new one; reading the report
// neither continues nor marks its session done, and reopening a review reads
// a fresh snapshot. A review's header shares the terminal's look, the
// synthetic `claude` (./fixtures/fake-claude) listing Story A's session; the
// real `claude` is never reached.

import type { Locator, Page } from "@playwright/test";
import { storyReviewEndpoint } from "../src/storyReview.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { box } from "./pageLayout.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { otherQueuedIdentity, queuedIdentity } from "./support/startOrigin.ts";
import {
  keptSession,
  listed,
  panelItems,
  storyBLaunchRecord,
  storyBReport,
  storyBWorktree,
} from "./support/storyPanels.ts";
import {
  keepLaunchRecords,
  storyALaunchRecord,
  storyWorktree,
} from "./support/storyReviewWorktree.ts";

const windowRoom = (page: Page) =>
  page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  }));

test("a review, another story's review, and a final report replace each other in the one side panel", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace: workspaceA } = storyWorktree(origin);
  const workspaceB = storyBWorktree(origin.project);
  await keepLaunchRecords(dashboard, [
    storyALaunchRecord(workspaceA),
    storyBLaunchRecord(workspaceB),
  ]);
  // Every review read the page asks, by the story it names.
  const reviewReads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === storyReviewEndpoint)
      reviewReads.push(url.searchParams.get("identity") ?? "");
  });
  const cardA = await openBacklog(page, origin);
  const cardB = parts(page).backlog.getByRole("article", { name: "Story B" });
  const items = panelItems(page);
  const review = page.getByRole("region", { name: "Review changes" });
  const report = page.getByRole("region", { name: "Final report" });
  const reviewOf = (card: Locator) =>
    card.getByRole("button", { name: "Review changes" });
  const control = (panel: Locator, name: string) =>
    panel.getByRole("button", { name, exact: true });

  await test.step("a held review of Story A never answers Story B's review opened meanwhile", async () => {
    let fetched: (() => void) | undefined;
    const fetchedA = new Promise<void>((resolve) => {
      fetched = resolve;
    });
    let release: (() => void) | undefined;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(`**${storyReviewEndpoint}?**`, async (route) => {
      if (
        new URL(route.request().url()).searchParams.get("identity") !==
        queuedIdentity
      ) {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      fetched?.();
      await held;
      await route.fulfill({ response }).catch(() => undefined);
    });
    await reviewOf(cardA).click();
    await fetchedA;
    await expect(review.getByRole("heading", { level: 2 })).toHaveText(
      "Story A",
    );
    await expect(review.getByRole("status")).toHaveText(
      "Reading the story's changes…",
    );
    await reviewOf(cardB).click();
    await expect(review.getByRole("heading", { level: 2 })).toHaveText(
      "Story B",
    );
    await expect(
      review.getByRole("list", { name: "1 changed file" }),
    ).toContainText("Added story-b.txt");
    release?.();
    await page.unrouteAll({ behavior: "wait" });
    await expect(review.getByRole("heading", { level: 2 })).toHaveText(
      "Story B",
    );
    await expect(review).toContainText(`Review changes ${otherQueuedIdentity}`);
    await expect(
      review.getByRole("list", { name: "1 changed file" }),
    ).toBeVisible();
    await expect(
      review.getByRole("list", { name: /7 changed files/ }),
    ).toHaveCount(0);
    await expect(review).not.toContainText("unstaged.txt");
    await expect(items).toHaveCount(1);
  });

  await test.step("a final report and a review replace each other", async () => {
    const readReport = cardSessions(cardB).getByRole("button", {
      name: "Read final report",
    });
    await readReport.click();
    await expect(report).toContainText(storyBReport);
    await expect(items).toHaveCount(1);
    await expect(review).toHaveCount(0);
    const reads = reviewReads.length;
    await reviewOf(cardB).click();
    await expect(
      review.getByRole("list", { name: "1 changed file" }),
    ).toBeVisible();
    await expect(report).toHaveCount(0);
    await expect(items).toHaveCount(1);
    // Reopening reads a fresh snapshot.
    expect(reviewReads.length).toBe(reads + 1);
    await control(review, "Close").click();
    await expect(items).toHaveCount(0);
    await expect(reviewOf(cardB)).toBeFocused();
    expect((await keptSession(dashboard, "story-b-session")).doneAt).toBe(
      undefined,
    );
  });
});

test("the review's and the terminal's headers share one look", async ({
  page,
  dashboard,
  origin,
}, testInfo) => {
  const { workspace } = storyWorktree(origin);
  const sessionA = dashboard.claudeListsSession({
    name: "Story A",
    cwd: workspace,
    startedAt: Date.now(),
  });
  await keepLaunchRecords(dashboard, [
    storyALaunchRecord(workspace, listed(sessionA)),
  ]);
  const card = await openBacklog(page, origin);
  const header = (name: string) =>
    page.getByRole("region", { name }).locator("header");
  // The header's frame: its edge, room, and type.
  const look = (shown: Locator) =>
    shown.evaluate((element) => {
      const style = getComputedStyle(element);
      const heading = getComputedStyle(element.querySelector("h2") as Element);
      return {
        padding: style.padding,
        border: style.borderBottom,
        background: style.backgroundColor,
        heading: [heading.fontSize, heading.fontWeight, heading.lineHeight],
      };
    });
  await cardSessions(card)
    .getByRole("button", { name: "Open terminal" })
    .click();
  const terminalHeader = header("Terminal");
  await expect(terminalHeader).toContainText("Story A");
  const terminalLook = await look(terminalHeader);
  await terminalHeader.screenshot({
    path: testInfo.outputPath("terminal-header.png"),
  });
  await card.getByRole("button", { name: "Review changes" }).click();
  const reviewHeader = header("Review changes");
  await expect(reviewHeader).toContainText("Story A");
  expect(await look(reviewHeader)).toEqual(terminalLook);
  await reviewHeader.screenshot({
    path: testInfo.outputPath("review-header.png"),
  });
  await expect(
    page.getByRole("list", { name: "7 changed files" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("review-beside-dashboard.png"),
  });
  const { width } = await windowRoom(page);
  expect((await box(reviewHeader)).width).toBeLessThan(width);
});
