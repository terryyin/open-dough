import { expect } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { consumer, test, twoDependencies } from "./storyDependencyFixture.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
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
    card.getByText("Not assessed as ready", { exact: true }),
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
