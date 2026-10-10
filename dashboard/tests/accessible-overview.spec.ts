import { passTimeUntilChecked, pausePageClock } from "./autoRefreshJourney.ts";
import { expect, test } from "./dashboardTest.ts";
import {
  largeBacklog,
  longAddress,
  longBacklog,
  longIdentity,
  longPlan,
  longTitle,
  queuedCount,
  queuedTitle,
  queuedTitles,
  revision,
  unusableTarget,
} from "./accessibleOverview.ts";
import { expectMembership, openDirection, parts } from "./dashboardPage.ts";
import { showColumn } from "./dashboardColumnsPage.ts";
import { enabledCardLaunchActions, inspectedDetail } from "./cardControls.ts";
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

test("accessible overview reflows long published work for a narrow window and page zoom", async ({
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

  await test.step("the page reads direction, then Backlog alone, and its edge control brings Taken", async () => {
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
    await parts(page).sourceEvidence.click();
    await expectInside(source.getByText(revision), source);
    await expect(source.locator("time")).toBeVisible();
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

test("accessible overview keeps empty groups readable in a narrow window", async ({
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
  await parts(page).sourceEvidence.click();
  await expectInside(source.getByText(revision), source);
  await parts(page).sourceEvidence.click();
  await expectNoSidewaysScrollAndWholeText(page);
});

test("accessible overview keeps a read problem and the retained work reachable in a narrow window", async ({
  page,
}) => {
  await page.setViewportSize(zoomedWindow);
  const origin = await publishMovingOrigin(page);
  origin.push(revision, longBacklog);
  await pausePageClock(page);
  await openUntilRead(page);
  const { stages, source, problem } = parts(page);
  await expect(stages.getByRole("article")).toHaveCount(5);

  const missing = "f".repeat(40);
  origin.push(missing, longBacklog);
  origin.answerWith(missing, notFoundAnswer());
  await passTimeUntilChecked(page);

  // The problem names a path and a 40-character revision no line can hold.
  await expect(problem).toContainText(
    `GitHub answered HTTP 404 to the local GitHub CLI while reading .planning/PRODUCT-BACKLOG.md at ${missing}.`,
  );
  await expectNoSidewaysScrollAndWholeText(page);
  await expectStackedInOrder([source, problem, stages]);
  await expect(problem.locator("time")).toHaveCount(2);
  await expect(source).toContainText(revision);
  await problem.scrollIntoViewIfNeeded();
  await expect(problem).toBeInViewport();
});

test("accessible overview reads a backlog longer than one screen by scrolling the page", async ({
  page,
}) => {
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(largeBacklog) },
  });
  await page.goto("/");
  const { backlog } = parts(page);
  await expectMembership(page, {
    taken: ["Repair the installer's update report"],
    backlog: queuedTitles,
  });
  // Canonical reads can grow the cards after membership first appears.
  await expect(backlog.locator(".dependency-problem")).toHaveCount(queuedCount);
  const heading = backlog.getByRole("heading", { level: 2 });
  const lastCard = backlog.getByRole("article", {
    name: queuedTitle(queuedCount),
  });
  const lastInspect = lastCard.getByRole("button", { name: "Inspect story" });
  await expect(lastInspect).not.toBeInViewport();

  await test.step("the page itself scrolls to the last queued work", async () => {
    await page.keyboard.press("End");
    await expect(lastInspect).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate("window.scrollY")).toBeGreaterThan(0);
    await expectNoSidewaysScrollAndWholeText(page);
    await expect(lastCard).toContainText(`Priority ${queuedCount}`);
  });

  await test.step("the stage still says which stage this is and how much it holds", async () => {
    await expect(heading).toBeInViewport({ ratio: 1 });
    await expect(backlog.getByText(`${queuedCount} entries`)).toBeInViewport({
      ratio: 1,
    });
  });

  await test.step("keyboard focus moving back up is never hidden under that heading", async () => {
    await lastInspect.focus();
    for (let place = queuedCount - 1; place >= 1; place -= 1) {
      // Each queued card offers its enabled launch actions before its Inspect
      // story, its last control, so Shift+Tab past them reaches the previous
      // card's Inspect story.
      const card = backlog.getByRole("article", {
        name: queuedTitle(place + 1),
        exact: true,
      });
      const launches = await enabledCardLaunchActions(card);
      for (let step = 0; step < launches.length + 1; step += 1) {
        await page.keyboard.press("Shift+Tab");
      }
      const inspect = backlog
        .getByRole("article", { name: queuedTitle(place), exact: true })
        .getByRole("button", { name: "Inspect story" });
      await expect(inspect).toBeFocused();
      await expect(inspect).toBeInViewport({ ratio: 1 });
      const [stuck, focused] = await Promise.all([box(heading), box(inspect)]);
      expect(stuck.y + stuck.height).toBeLessThanOrEqual(focused.y);
    }
  });
});
