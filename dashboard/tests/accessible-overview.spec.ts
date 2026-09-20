import { expect, test } from "@playwright/test";
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
} from "./accessibleOverview";
import { expectMembership, parts } from "./dashboardPage";
import {
  commitAnswer,
  emptyBacklog,
  notFoundAnswer,
  publishMovingOrigin,
  publishOrigin,
  rawFileAnswer,
} from "./githubOrigin";
import {
  box,
  expectInside,
  expectNoSidewaysScrollAndWholeText,
  expectSideBySideInOrder,
  expectStackedInOrder,
} from "./pageLayout";

// A 1280 by 1024 window under 400% browser zoom lays the page out in this many
// CSS pixels, so the narrow journey is also the zoomed one.
const zoomedWindow = { width: 320, height: 256 };
const narrowWindow = { width: 360, height: 740 };

test("accessible overview reflows long published work for a narrow window and page zoom", async ({
  page,
}, testInfo) => {
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(longBacklog) },
  });
  await page.goto("/");
  const {
    stages,
    backlog,
    taken,
    connector,
    direction,
    source,
    refresh,
    status,
  } = parts(page);
  const connectorMeaning = stages.getByText("not a dependency between entries");
  const arrow = stages.locator("svg").first();
  const longCard = taken.getByRole("article", { name: longTitle });
  await expect(longCard).toBeVisible();

  await test.step("a wide window reads the long work whole, side by side", async () => {
    await expectNoSidewaysScrollAndWholeText(page);
    await expectSideBySideInOrder([backlog, connector, taken]);
    // The arrow joins the stages: it lies between them, and the line it draws
    // crosses most of what separates them.
    await expectSideBySideInOrder([backlog, arrow, taken]);
    const [from, drawn, to] = await Promise.all([
      box(backlog),
      box(arrow.locator("line")),
      box(taken),
    ]);
    const between = to.x - (from.x + from.width);
    expect(between).toBeGreaterThan(100);
    expect(drawn.width).toBeGreaterThanOrEqual(0.7 * between);
    expect(drawn.width).toBeLessThanOrEqual(between);
    await page.screenshot({
      path: testInfo.outputPath("long-work-wide.png"),
      fullPage: true,
    });
  });

  await page.setViewportSize(zoomedWindow);

  await test.step("nothing widens the page or is cut short", async () => {
    await expectNoSidewaysScrollAndWholeText(page);
  });

  await test.step("the page reads top to bottom: evidence, direction, Backlog, taking work, Taken", async () => {
    await expectStackedInOrder([
      page.getByRole("heading", { level: 1 }),
      source,
      status,
      direction,
      backlog,
      arrow,
      connector,
      connectorMeaning,
      taken,
    ]);
    await expectStackedInOrder([
      source.getByText("Current agent activity is unknown"),
      refresh,
    ]);
  });

  await test.step("long titles, identities, and recorded targets stay inside their card", async () => {
    for (const text of [longTitle, longIdentity, longPlan]) {
      await expectInside(longCard.getByText(text), longCard);
    }
    const external = backlog.getByRole("article", {
      name: "Read the hosting provider's note",
    });
    await expectInside(external.getByText(longAddress), external);
    const unusable = backlog.getByRole("article", {
      name: "Keep a target that is not offered as a link readable",
    });
    await expectInside(unusable.getByText(unusableTarget), unusable);
    await expectInside(longCard, taken);
  });

  await test.step("source evidence, direction, and the read control stay reachable", async () => {
    await expectInside(source.getByText(revision), source);
    await expect(source.locator("time")).toBeVisible();
    await expect(direction).toContainText("Derive it solely from Git state");
    await refresh.scrollIntoViewIfNeeded();
    await expect(refresh).toBeInViewport({ ratio: 1 });
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

test("accessible overview keeps empty groups and their connection readable in a narrow window", async ({
  page,
}) => {
  await page.setViewportSize(narrowWindow);
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(emptyBacklog) },
  });
  await page.goto("/");
  const { backlog, taken, connector, direction, source } = parts(page);

  await expect(
    backlog.getByText("No Backlog entries are recorded."),
  ).toBeVisible();
  await expect(taken.getByText("No Taken entries are recorded.")).toBeVisible();
  await expect(
    direction.getByText("No near-future direction is recorded."),
  ).toBeVisible();
  await expectInside(source.getByText(revision), source);
  await expectNoSidewaysScrollAndWholeText(page);
  await expectStackedInOrder([direction, backlog, connector, taken]);
});

test("accessible overview keeps a read problem, the retained work, and the read control reachable in a narrow window", async ({
  page,
}) => {
  await page.setViewportSize(zoomedWindow);
  const origin = await publishMovingOrigin(page);
  origin.push(revision, longBacklog);
  await page.goto("/");
  const { stages, source, refresh, retry, problem } = parts(page);
  await expect(stages.getByRole("article")).toHaveCount(5);

  const missing = "f".repeat(40);
  origin.push(missing, longBacklog);
  origin.answerWith(missing, notFoundAnswer());
  await refresh.click();

  // The problem names a path and a 40-character revision no line can hold.
  await expect(problem).toContainText(
    `GitHub answered HTTP 404 while reading .planning/PRODUCT-BACKLOG.md at ${missing}.`,
  );
  await expectNoSidewaysScrollAndWholeText(page);
  await expectStackedInOrder([source, problem, stages]);
  await expect(problem.locator("time")).toHaveCount(2);
  await expect(source).toContainText(revision);
  await retry.scrollIntoViewIfNeeded();
  await expect(retry).toBeInViewport({ ratio: 1 });
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
  const heading = backlog.getByRole("heading", { level: 2 });
  const lastCard = backlog.getByRole("article", {
    name: queuedTitle(queuedCount),
  });
  const lastLink = lastCard.getByRole("link", { name: /^Canonical record/ });
  await expect(lastLink).not.toBeInViewport();

  await test.step("the page itself scrolls to the last queued work", async () => {
    await page.keyboard.press("End");
    await expect(lastLink).toBeInViewport({ ratio: 1 });
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
    await lastLink.focus();
    for (let place = queuedCount - 1; place >= 1; place -= 1) {
      await page.keyboard.press("Shift+Tab");
      const link = backlog
        .getByRole("article", { name: queuedTitle(place), exact: true })
        .getByRole("link", { name: /^Canonical record/ });
      await expect(link).toBeFocused();
      await expect(link).toBeInViewport({ ratio: 1 });
      const [stuck, focused] = await Promise.all([box(heading), box(link)]);
      expect(stuck.y + stuck.height).toBeLessThanOrEqual(focused.y);
    }
  });
});
