import { passTimeUntilChecked, pausePageClock } from "./autoRefreshJourney.ts";
import { expect, test } from "./dashboardTest.ts";
import {
  longAddress,
  longBacklog,
  longIdentity,
  longPlan,
  longTitle,
  revision,
  unusableTarget,
} from "./accessibleBoard.ts";
import { shortRevision, openDirection, parts } from "./dashboardPage.ts";
import { showColumn } from "./boardPage.ts";
import { inspectedDetail } from "./storyCardControls.ts";
import {
  commitAnswer,
  emptyBacklog,
  notFoundAnswer,
  publishMovingOrigin,
  publishOrigin,
  rawFileAnswer,
} from "./publishedOrigin.ts";
import { zoomedWindow } from "./accessibleReading.ts";
import {
  box,
  expectInside,
  expectNoSidewaysScrollAndWholeText,
  expectSideBySideInOrder,
  expectStackedInOrder,
} from "./pageLayout.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

const narrowWindow = { width: 360, height: 740 };

test("accessible Board reflows long published work for a narrow window and page zoom", async ({
  page,
}, testInfo) => {
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(longBacklog) },
  });
  await openUntilRead(page);
  const { backlog, taken, recentlyDone, direction, directionToggle, source } =
    parts(page);
  const longCard = taken.getByRole("article", { name: longTitle });
  await expect(longCard).toBeVisible();

  await test.step("a wide window reads the long work whole, three columns side by side", async () => {
    await expectNoSidewaysScrollAndWholeText(page);
    const columns = [backlog, taken, recentlyDone];
    await expectSideBySideInOrder(columns);
    // Nothing stands between the columns: only the frame's gap separates them.
    const boxes = await Promise.all(columns.map(box));
    boxes.slice(1).forEach((to, index) => {
      const from = boxes[index];
      expect(to.x - ((from?.x ?? 0) + (from?.width ?? 0))).toBeLessThanOrEqual(
        24,
      );
    });
    await page.screenshot({
      path: testInfo.outputPath("long-work-wide.png"),
      fullPage: true,
    });
  });

  await page.setViewportSize(zoomedWindow);

  await test.step("nothing widens the page or is cut short", async () => {
    await expectNoSidewaysScrollAndWholeText(page);
  });

  await test.step("the page reads direction, then Backlog alone, and its column paging control brings Taken", async () => {
    await expectStackedInOrder([directionToggle, backlog]);
    await showColumn(page, "Taken");
    await expectStackedInOrder([directionToggle, taken]);
    await expectNoSidewaysScrollAndWholeText(page);
  });

  await test.step("long titles, identities, and recorded targets stay inside their card", async () => {
    await expectInside(longCard.getByText(longTitle), longCard);
    const external = backlog.getByRole("article", {
      name: "Read the hosting provider's note",
    });
    const unusable = backlog.getByRole("article", {
      name: "Keep a target that is not offered as a link readable",
    });
    // Identities and recorded targets are read in each story's detail.
    for (const [column, card, texts] of [
      ["Taken", longCard, [longIdentity, longPlan]],
      ["Backlog", external, [longAddress]],
      ["Backlog", unusable, [unusableTarget]],
    ] as const) {
      await showColumn(page, column);
      const detail = await inspectedDetail(card);
      for (const text of texts) {
        await expectInside(detail.getByText(text), card);
      }
      await expectNoSidewaysScrollAndWholeText(page);
    }
    // Shown again, Taken holds the long card whole.
    await showColumn(page, "Taken");
    await expectInside(longCard, taken);
  });

  await test.step("source evidence and direction stay reachable", async () => {
    await expect(parts(page).readRevision).toContainText(
      shortRevision(revision),
    );
    await parts(page).sourceEvidence.click();
    await expectInside(source.getByText("terryyin/open-dough"), source);
    await parts(page).sourceEvidence.click();
    await openDirection(page);
    await expect(direction).toContainText("Derive it solely from Git state");
  });

  await test.step("browser zoom is left to the reader", async () => {
    const viewport =
      (await page.locator("meta[name='viewport']").getAttribute("content")) ??
      "";
    expect(viewport).toContain("width=device-width");
    expect(viewport).not.toMatch(/user-scalable|maximum-scale|minimum-scale/);
  });

  await page.setViewportSize(narrowWindow);
  await page.screenshot({
    path: testInfo.outputPath("long-work-narrow.png"),
    fullPage: true,
  });
});

test("accessible Board keeps empty groups readable in a narrow window", async ({
  page,
}) => {
  await page.setViewportSize(narrowWindow);
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(emptyBacklog) },
  });
  await openUntilRead(page);
  const { backlog, taken, direction, directionText, source } = parts(page);

  await expect(
    backlog.getByText("No Backlog entries are recorded."),
  ).toBeVisible();
  await openDirection(page);
  await expectStackedInOrder([directionText, backlog]);
  await showColumn(page, "Taken");
  await expectStackedInOrder([directionText, taken]);
  await expect(taken.getByText("No Taken entries are recorded.")).toBeVisible();
  await expect(
    direction.getByText("No near-future direction is recorded."),
  ).toBeVisible();
  await expect(parts(page).readRevision).toContainText(shortRevision(revision));
  await parts(page).sourceEvidence.click();
  await expectInside(source.getByText("terryyin/open-dough"), source);
  await parts(page).sourceEvidence.click();
  await expectNoSidewaysScrollAndWholeText(page);
});

test("accessible Board keeps a read problem and the retained work reachable in a narrow window", async ({
  page,
}) => {
  await page.setViewportSize(zoomedWindow);
  const origin = await publishMovingOrigin(page);
  origin.push(revision, longBacklog);
  await pausePageClock(page);
  await openUntilRead(page);
  const { board, source, problem } = parts(page);
  await expect(board.getByRole("article")).toHaveCount(5);

  const missing = "f".repeat(40);
  origin.push(missing, longBacklog);
  origin.answerWith(missing, notFoundAnswer());
  await passTimeUntilChecked(page);

  // The concise problem still names the backlog path at narrow widths.
  await expect(problem).toContainText(
    "The published backlog (.planning/PRODUCT-BACKLOG.md) is missing or inaccessible in Open Dough (HTTP 404).",
  );
  await expectNoSidewaysScrollAndWholeText(page);
  await expectStackedInOrder([source, problem, board]);
  await expect(problem.locator("time")).toHaveCount(2);
  await expect(problem).toContainText(
    "What is shown is the earlier snapshot, retrieved at",
  );
  await expect(board.getByRole("article")).toHaveCount(5);
  await problem.scrollIntoViewIfNeeded();
  await expect(problem).toBeInViewport();
});
