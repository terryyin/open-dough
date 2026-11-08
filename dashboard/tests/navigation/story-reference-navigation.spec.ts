import {
  queuedReadyRepository,
  storyB,
  storySeed,
} from "../../../tests/support/queued-repository.mjs";
import { expect } from "../dashboardTest.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { shortRevision, parts } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { test, twoDependencies, supplierB } from "../storyDependencyFixture.ts";
import { notFoundAnswer } from "../originAnswers.ts";
import { pausePageClock, passTimeUntilChecked } from "../autoRefreshJourney.ts";
import { expectReadingTop } from "../readingPlace.ts";
import { launchWaitMs } from "../support/launchWait.ts";
import { expectSelected, selectStory } from "../storyCardSelection.ts";
import {
  expectCueEnds,
  expectDestinationCue,
  passPartOfCue,
} from "../destinationCue.ts";

// Story A waits on Story B and needs a decision about Story C.
test.use({
  hasTouch: true,
  originRepository: queuedReadyRepository()
    .withRevision("dependencies", twoDependencies())
    .please(),
});

test("a dependency opens its active story, keeping the dashboard and inspection on repeated activation", async ({
  page,
  origin,
  dashboard,
}) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  // Story B's seed long enough to scroll to its section.
  const revision = await origin.publishRevision({
    files: {
      ".planning/seeds/B.md": storySeed(
        storyB,
        "A detailed example of the published endpoint contract.\n\n"
          .repeat(24)
          .trimEnd(),
      ),
    },
  });
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.context().route("https://github.com/**", (route) =>
    route.fulfill({
      body: "<h1>Source evidence</h1>",
      contentType: "text/html",
    }),
  );
  await pausePageClock(page);
  await openUntilRead(page);
  const consumer = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const supplier = parts(page).backlog.getByRole("article", {
    name: "Story B",
    exact: true,
  });
  await consumer.locator(".story-dependencies summary").click();
  await consumer
    .getByRole("link", { name: supplierB.identity, exact: true })
    .click();
  await expect(
    supplier.getByRole("region", { name: "Detail for Story B" }),
  ).toBeVisible();
  await expect(supplier).toBeFocused();
  expect(
    await supplier.evaluate((card) => card.getBoundingClientRect().height),
  ).toBeGreaterThan(await page.evaluate(() => innerHeight));
  await expectReadingTop(supplier);
  await expectDestinationCue(page, supplier, { motion: true });
  await expect(page.locator(".story-card-selected")).toHaveCount(0);
  await expectCueEnds(page, supplier);
  await expectSelected(supplier, false);
  expect(new URL(page.url()).hostname).toBe("127.0.0.1");
  await selectStory(supplier).click();
  await expectSelected(supplier, true);
  const reference = consumer.getByRole("link", {
    name: supplierB.identity,
    exact: true,
  });
  await reference.click();
  await expectDestinationCue(page, supplier, { motion: true });
  await expectSelected(supplier, true);
  await passPartOfCue(page, 1000);
  await reference.click();
  await expectDestinationCue(page, supplier, { motion: true });
  await passPartOfCue(page, 1000);
  await expectDestinationCue(page, supplier, { motion: true });
  await expectCueEnds(page, supplier);
  await expectSelected(supplier, true);
  await expect(
    supplier.getByRole("button", { name: "Hide detail" }),
  ).toBeVisible();
  await expect(supplier).toBeFocused();
  const popup = page.waitForEvent("popup");
  await supplier.getByRole("link", { name: /^Canonical record/ }).click();
  const evidence = await popup;
  await expect(
    evidence.getByRole("heading", { name: "Source evidence" }),
  ).toBeVisible();
  expect(evidence.url()).toBe(
    `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/B.md#b`,
  );
  await evidence.close();
  await supplier.getByRole("button", { name: "Hide detail" }).click();
  await consumer.getByRole("button", { name: "Inspect story" }).focus();
  const refreshed = await origin.publishRevision({
    files: {
      ".planning/observation-change.md":
        "A new revision for focus retention.\n",
    },
  });
  await passTimeUntilChecked(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(refreshed),
  );
  await expect(
    supplier.getByRole("button", { name: "Inspect story" }),
  ).toBeVisible();
  await expect(
    consumer.getByRole("button", { name: "Inspect story" }),
  ).toBeFocused();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(dashboard.claudeAttaches()).toEqual([]);
});

test("a reference reveals a starting story without opening its protected inspection or starting another host action", async ({
  page,
  origin,
  dashboard,
}) => {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  dashboard.claudeScenario("held");
  await openUntilRead(page);
  const supplier = page.getByRole("article", { name: "Story B", exact: true });
  await supplier.getByRole("button", { name: "Start execution" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await expect(
    supplier.getByRole("button", { name: "Inspect story" }),
  ).toBeDisabled();
  // Inspect protects before mechanical prep invokes the held host; that real
  // Take publication may take as long as the start's own launch wait.
  await expect
    .poll(() => dashboard.claudeLaunchCalls(), { timeout: launchWaitMs })
    .toHaveLength(1);
  const before = dashboard.claudeLaunchCalls().length;
  const consumer = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await consumer.locator(".story-dependencies summary").click();
  await consumer.getByRole("link", { name: "SEED-B#b", exact: true }).click();
  await expect(supplier).toBeFocused();
  await expect(
    supplier.getByRole("region", { name: "Detail for Story B" }),
  ).toHaveCount(0);
  await expect(
    supplier.getByRole("link", { name: /^Canonical record/ }),
  ).toBeVisible();
  expect(dashboard.claudeLaunchCalls().length).toBe(before);
  expect(dashboard.claudeAttaches()).toEqual([]);
  dashboard.releaseHeldClaude();
  await expect(
    supplier.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled({ timeout: 30_000 });
});

test("an identified active block with unreadable detail still opens with its existing read gap", async ({
  page,
  origin,
}) => {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  published.answerWith(".planning/seeds/B.md", notFoundAnswer());
  await openUntilRead(page);
  const consumer = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await expect(consumer.locator(".story-dependencies summary")).toBeVisible();
  await consumer.locator(".story-dependencies summary").click();
  await consumer.getByRole("link", { name: "SEED-B#b", exact: true }).click();
  const supplier = parts(page).backlog.getByRole("article", {
    name: "Story B",
    exact: true,
  });
  const detail = supplier.getByRole("region", { name: "Detail for Story B" });
  await expect(detail.locator(".preparation-problem").first()).toBeVisible();
  await expect(supplier).toBeFocused();
  await expect(supplier).toBeInViewport({ ratio: 0.5 });
  await expect(page.locator(".story-reference-notice")).toBeEmpty();
});
