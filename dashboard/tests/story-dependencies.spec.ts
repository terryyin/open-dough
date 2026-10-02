import { writePlanning } from "./storyReadinessCli.ts";
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

test.use({ hasTouch: true });

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
  await page.goto("/");
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
  const release = published.hold("main");
  await parts(page).refresh.click();
  await card.focus();
  release();
  await expect(parts(page).source).toContainText(one);
  await expect(card).toBeFocused();
  await expect(summary).toHaveText("Dependencies · 1 blocking");
  await expect(execution).toBeDisabled();
  await summary.click();
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
  await parts(page).refresh.click();
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
  await card.getByText("Preparation facts", { exact: true }).click();
  await expect(card).toContainText(
    "Unrelated consumer design decision remains.",
  );
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
  await page.goto("/");
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
  await parts(page).refresh.click();
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
