import { writePlanning } from "./storyReadinessCli.ts";
import { passTimeUntilChecked, pausePageClock } from "./autoRefreshJourney.ts";
import { expect } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { expectDependencyAccessibly } from "./storyDependencyAccessible.ts";
import { notFoundAnswer } from "./originAnswers.ts";
import {
  consumer,
  test,
  twoDependencies,
  recordDependency,
  publishDependencies,
  publishMalformedDependencies,
} from "./storyDependencyFixture.ts";
import { openUntilRead, reloadUntilRead } from "./pageRequestNotes.ts";
import {
  expectNoSidewaysScrollAndWholeText,
  tapWhereShown,
} from "./pageLayout.ts";
import { reason, condition, decision } from "./storyDependencyFixture.ts";

test.use({ hasTouch: true });

test("touch inspection reads dependency, readiness and Start limitations without hovering", async ({
  page,
  origin,
  dashboard,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const revision = await twoDependencies(origin, true);
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", {
    name: consumer.title,
    exact: true,
  });
  const execution = card.getByRole("button", { name: "Start execution" });
  await expect(execution).toBeDisabled();
  await expect(
    card.getByText("Not marked Ready for execution", { exact: true }),
  ).toBeVisible();
  await expect(card.locator(".dependency-start-reason")).toContainText(
    "2 blocking dependencies",
  );
  const summary = card.locator(".story-dependencies summary");
  await summary.scrollIntoViewIfNeeded();
  await tapWhereShown(summary);
  const dependencies = card.getByRole("list", { name: "Story dependencies" });
  for (const explanation of [reason, condition, decision]) {
    const text = dependencies.getByText(explanation, { exact: false }).first();
    await text.scrollIntoViewIfNeeded();
    await expect(text).toBeInViewport({ ratio: 1 });
  }
  const inspect = card.getByRole("button", { name: "Inspect story" });
  await inspect.scrollIntoViewIfNeeded();
  await tapWhereShown(inspect);
  const detail = card.getByRole("region", { name: "Detail for Story A" });
  const readiness = detail.getByText(
    "Unrelated consumer design decision remains.",
    { exact: false },
  );
  await readiness.scrollIntoViewIfNeeded();
  await expect(readiness).toBeInViewport({ ratio: 1 });
  await expect(
    detail.getByRole("link", { name: /^Canonical record/ }),
  ).toHaveAttribute(
    "href",
    `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/A.md#a`,
  );
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(dependencies).toBeVisible();
  await expect(detail).toBeVisible();
  await expectNoSidewaysScrollAndWholeText(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const hide = card.getByRole("button", { name: "Hide detail" });
  await hide.scrollIntoViewIfNeeded();
  await tapWhereShown(hide);
  await expect(card).toBeFocused();
  await expect(dependencies).toBeVisible();
  const refine = card.getByRole("button", { name: "Start refinement" });
  await refine.scrollIntoViewIfNeeded();
  await tapWhereShown(refine);
  const dialog = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await expect(dialog).toBeVisible();
  await tapWhereShown(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
  );
  await expect(dialog).toHaveCount(0);
  await expect(refine).toBeFocused();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
});

test("published consumer dependencies disclose blockers accessibly and preserve independent readiness", async ({
  page,
  origin,
  dashboard,
}) => {
  const revision = await twoDependencies(origin, true);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", {
    name: consumer.title,
    exact: true,
  });
  const execution = card.getByRole("button", { name: "Start execution" });
  const summary = card.locator(".story-dependencies summary");
  await expect(summary).toHaveText("Dependencies · 2 blocking");
  await expect(execution).toBeDisabled();
  await expect(execution).toHaveAccessibleDescription(
    /2 blocking dependencies/,
  );
  await expect(
    card.getByRole("button", { name: "Start refinement" }),
  ).toBeEnabled();
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    card.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
  await card.getByRole("button", { name: "Hide detail" }).click();
  await expect(card).toBeFocused();
  await expect(card.getByText("Slice planned", { exact: true })).toBeVisible();
  await expect(card.getByText("Not ready", { exact: true })).toBeVisible();
  await expect(card.getByText("Priority 1")).toBeVisible();
  await card.getByRole("button", { name: "Start refinement" }).click();
  await expect(
    page.getByRole("dialog", { name: "Start refinement in Claude Code" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel" })
    .click();
  await expect(
    page.getByRole("dialog", {
      name: "Start refinement in Claude Code",
      includeHidden: true,
    }),
  ).toHaveCount(0);
  await expect(
    card.getByRole("button", { name: "Start refinement" }),
  ).toBeFocused();
  const supplierCard = parts(page).backlog.getByRole("article", {
    name: "Story B",
    exact: true,
  });
  await expect(supplierCard.locator(".story-dependencies")).toHaveCount(0);
  await expect(
    supplierCard.getByRole("button", { name: "Start execution" }),
  ).toBeEnabled();

  const list = card.getByRole("list", { name: "Story dependencies" });
  await expectDependencyAccessibly(page, card, revision);

  recordDependency(origin, 0, "satisfied", revision);
  const one = await publishDependencies(origin);
  await card.focus();
  await passTimeUntilChecked(page);
  await expect(parts(page).source).toContainText(one);
  await expect(card).toBeFocused();
  await expect(summary).toHaveText("Dependencies · 1 blocking");
  await expect(execution).toBeDisabled();
  // The dependencies the developer opened stay open across the refresh.
  await expect(list).toBeVisible();
  await expect(list).toContainText("Satisfied");
  await expect(list).toContainText("Decision needed");
  await expect(
    list.getByRole("link", { name: `Revision ${revision}` }),
  ).toHaveAttribute(
    "href",
    `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/B.md`,
  );

  recordDependency(origin, 1, "satisfied", revision);
  const both = await publishDependencies(origin);
  await passTimeUntilChecked(page);
  await expect(parts(page).source).toContainText(both);
  await expect(summary).toHaveText("Dependencies · 0 blocking");
  await expect(execution).toBeEnabled();
  await expect(execution).toHaveAccessibleDescription(
    /Not marked Ready for execution/,
  );
  await expect(card.getByText("Not ready", { exact: true })).toBeVisible();
  await expect(
    card.getByText("Changed since readiness review", { exact: true }),
  ).toBeVisible();
  // The readiness reason is secondary detail, read without another source
  // read; the Not ready badge stays in the scan view.
  await expect(card).not.toContainText(
    "Unrelated consumer design decision remains.",
  );
  const readsBeforeDetail = published.requests.length;
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    card.getByRole("region", { name: "Detail for Story A" }),
  ).toContainText("Unrelated consumer design decision remains.");
  expect(published.requests.length).toBe(readsBeforeDetail);
  // Removing the dependency gate restores the existing noted action. The
  // independent readiness judgment still refuses at the real startup command.
  await execution.click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  await expect(card).toContainText("published preparation is not-ready");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(published.requests.length).toBeGreaterThan(0);
});

test("malformed and unreadable dependency facts block execution without blocking refinement", async ({
  page,
  origin,
}) => {
  await twoDependencies(origin);
  const revision = await publishMalformedDependencies(origin);
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  const releaseCanonical = published.hold(".planning/seeds/A.md");
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", {
    name: consumer.title,
    exact: true,
  });
  const execution = card.getByRole("button", { name: "Start execution" });
  await expect(execution).toBeDisabled();
  await expect(execution).toHaveAccessibleDescription(
    /dependency facts are being read/,
  );
  await expect(
    card.getByRole("button", { name: "Start refinement" }),
  ).toBeEnabled();
  releaseCanonical();
  await expect(card).toContainText(
    "Dependency facts unavailable: Story dependencies: present dependency block is not valid JSON.",
  );
  await expect(execution).toBeDisabled();
  await expect(execution).toHaveAccessibleDescription(
    /dependency facts could not be read/,
  );
  await expect(
    card.getByRole("button", { name: "Start refinement" }),
  ).toBeEnabled();
  writePlanning(
    origin.project,
    "observed-change.md",
    "Force a newly pinned observation.\n",
  );
  const unreadRevision = await publishDependencies(origin);
  published.answerWith(".planning/seeds/A.md", notFoundAnswer());
  await reloadUntilRead(page);
  await expect(parts(page).source).toContainText(unreadRevision);
  await expect(card.locator(".dependency-problem")).not.toContainText(
    "not valid JSON",
  );
  await expect(card.locator(".dependency-problem")).toContainText(
    "Dependency facts unavailable",
  );
  await expect(execution).toBeDisabled();
  await expect(
    card.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
});
