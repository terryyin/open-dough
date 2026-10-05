// The page's one side panel replaces one story's review with another's, and a
// review with a retained final report, of Story A's and Story B's real
// worktrees (./support/storyPanels.ts) and kept launch records, Story B's
// session having ended with a final report. A review still being read when
// another story's review opens never answers the new one; reading the report
// neither continues nor marks its session done, and reopening a review reads
// a fresh snapshot. Asking again for the review shown takes the keyboard to
// it and keeps its snapshot; the real `claude` is never reached.

import type { Locator } from "@playwright/test";
import { storyReviewEndpoint } from "../src/storyReview.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { otherQueuedIdentity, queuedIdentity } from "./support/startOrigin.ts";
import {
  keptSession,
  panelItems,
  storyBLaunchRecord,
  storyBReport,
  storyBWorktree,
} from "./support/storyPanels.ts";
import { storyWorktree } from "./support/storyReviewWorktree.ts";
import {
  keepLaunchRecords,
  storyALaunchRecord,
} from "./support/storyLaunchRecord.ts";

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
      review
        .getByRole("list", { name: "1 changed file" })
        .getByRole("button", { name: "Added story-b.txt" }),
    ).toBeVisible();
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

  await test.step("Review changes for the review shown takes the keyboard to it and keeps its snapshot", async () => {
    await reviewOf(cardA).click();
    const files = review.getByRole("list", { name: "7 changed files" });
    const selected = files.getByRole("button", {
      name: "Modified unstaged.txt",
    });
    await selected.press("Enter");
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    const reads = reviewReads.length;
    await reviewOf(cardA).focus();
    await reviewOf(cardA).press("Enter");
    await expect(review.locator(".story-review-body")).toBeFocused();
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await expect(
      review.getByRole("region", { name: "Modified unstaged.txt" }),
    ).toBeVisible();
    expect(reviewReads.length).toBe(reads);
    await expect(items).toHaveCount(1);
  });
});
