import { expect } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { shortRevision, parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  test,
  twoDependencies,
  suppliers,
  publishDependencies,
} from "./storyDependencyFixture.ts";
import { notFoundAnswer } from "./originAnswers.ts";
import { pausePageClock, passTimeUntilChecked } from "./autoRefreshJourney.ts";
import { writePlanning } from "./storyReadinessCli.ts";
import { expectReadingTop } from "./readingPlace.ts";

test.setTimeout(120_000);
test.use({ hasTouch: true });

test("a dependency opens its active story, keeping the dashboard and inspection on repeated activation", async ({
  page,
  origin,
  dashboard,
}) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  await twoDependencies(origin);
  writePlanning(
    origin.project,
    "seeds/B.md",
    `---\nid: SEED-B\n---\n\n# Seed B\n\n<a id="b"></a>\n\n### Story B\n\n**Identity:** SEED-B#b\n\n${"A detailed example of the published endpoint contract.\n\n".repeat(24)}`,
  );
  const revision = await publishDependencies(origin);
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
    .getByRole("link", { name: suppliers[0].identity, exact: true })
    .click();
  await expect(
    supplier.getByRole("region", { name: "Detail for Story B" }),
  ).toBeVisible();
  await expect(supplier).toBeFocused();
  expect(
    await supplier.evaluate((card) => card.getBoundingClientRect().height),
  ).toBeGreaterThan(await page.evaluate(() => innerHeight));
  await expectReadingTop(supplier);
  expect(new URL(page.url()).hostname).toBe("127.0.0.1");
  await consumer
    .getByRole("link", { name: suppliers[0].identity, exact: true })
    .click();
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
  writePlanning(
    origin.project,
    "observation-change.md",
    "A new revision for focus retention.\n",
  );
  const refreshed = await publishDependencies(origin);
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
  const revision = await twoDependencies(origin);
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
  const revision = await twoDependencies(origin);
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
