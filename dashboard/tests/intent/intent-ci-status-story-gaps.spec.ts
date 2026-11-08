// Intent's CI status for a selected story without a branch to judge
// (../../src/intentCiTarget.ts): a queued or Preparing story is named with no
// published story branch; a Taken Trunk Mode story shows its provisional CI
// timing comparison (./intent-ci-comparison-taken.spec.ts); a Recently done
// story shows its CI timing comparison instead (./intent-ci-comparison.spec.ts);
// conflicting or unreadable agent profiles leave its branch unknown, saying
// why; a recorded name the dashboard cannot use is that story's gap; and a
// recorded branch GitHub no longer publishes is said so by name. None shows a
// live branch judgment in another's place (SEED-219 example 5). Judged story
// branches: ./intent-ci-status-story.spec.ts.

import type { Locator } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { chooseCiStatus } from "../intentCiStatusPage.ts";
import { publishMovingFiles } from "../publishedFiles.ts";
import { doughnut } from "../intentCodeBrowseFixtures.ts";
import {
  done,
  onTrunk,
  preparing,
  queued,
  removed,
  twoOwners,
  unusable,
} from "../intentCiStoryBoard.ts";
import {
  branchJudgmentCalls,
  card,
  expectNamed,
  publishStoryCi,
  toggleOnDevelopment,
} from "../intentCiStoryRecords.ts";
import { openUntilRead } from "../pageRequestNotes.ts";

// No state, no run, nothing to check again.
async function expectNoStatus(panel: Locator) {
  await expect(panel.locator(".intent-ci-state")).toHaveCount(0);
  await expect(panel.getByRole("link")).toHaveCount(0);
  await expect(panel).not.toContainText(/passed|failed|running/i);
}

test("a selected story without a published story branch is named and explained, with no status and no other branch judged", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const ci = publishStoryCi(page);
  const calls = ci.published.requests;
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  await expectNamed(await chooseCiStatus(intent), "main");
  await expect(intent.locator(".intent-ci-state")).toHaveText(
    "Passed at 4774f60 (Add login)",
  );
  const before = calls.length;

  await test.step("a selected done story shows its CI timing comparison, not a no-branch gap", async () => {
    const { development, intentChoice } = parts(page);
    await development.click();
    await card(page, done.title).locator("h3").first().click();
    await intentChoice.click();
    const panel = intent.getByRole("region", {
      name: "CI timing comparison",
      exact: true,
    });
    await expect(panel.getByRole("heading")).toHaveText("CI timing changes");
    // This synthetic board has no recoverable published completion in the
    // local checkout, so the comparison explains that gap rather than
    // inventing figures or judging another branch.
    await expect(panel.locator(".intent-ci-gap")).toBeVisible();
    await expectNoStatus(panel);
    await expect(panel).not.toContainText("Passed at");
    await expect(panel).not.toContainText("no published story branch");
  });

  await test.step("a Taken Trunk Mode story shows its provisional CI timing comparison, not a no-branch gap", async () => {
    const { development, intentChoice } = parts(page);
    await development.click();
    await card(page, onTrunk.title).locator("h3").first().click();
    await intentChoice.click();
    const panel = intent.getByRole("region", {
      name: "CI timing comparison",
      exact: true,
    });
    await expect(panel.getByRole("heading")).toHaveText("CI timing changes");
    // Synthetic board has no recoverable published claim in the local
    // checkout, so the comparison explains that gap rather than inventing
    // figures or judging main as the story's branch.
    await expect(panel.locator(".intent-ci-gap")).toBeVisible();
    await expectNoStatus(panel);
    await expect(panel).not.toContainText("no published story branch");
  });

  for (const [title, why] of [
    [
      queued.title,
      `${queued.title} is queued, not taken, so it has no published story branch and no CI status is shown.`,
    ],
    [
      preparing.title,
      `${preparing.title} is being prepared, not taken, so it has no published story branch and no CI status is shown.`,
    ],
    [
      twoOwners.title,
      `The story branch of ${twoOwners.title} is unknown: more than one agent profile names it, so it has no single branch. No CI status is shown.`,
    ],
    [
      unusable.title,
      `The recorded branch ${unusable.branch} of ${unusable.title} has a name this dashboard cannot use, so its CI status cannot be read.`,
    ],
  ] as const) {
    await test.step(title, async () => {
      const panel = await toggleOnDevelopment(page, title);
      await expect(panel.getByRole("heading")).toHaveText(
        `CI status of ${title}`,
      );
      await expect(panel.locator(".intent-ci-gap")).toHaveText(why);
      await expectNoStatus(panel);
      await expect(panel).not.toContainText("main");
    });
  }
  // None of them judged any branch, the trunk included.
  expect(branchJudgmentCalls(calls.slice(before))).toEqual([]);

  await test.step("a recorded branch no longer published is said so by name", async () => {
    const panel = await toggleOnDevelopment(page, removed.title);
    await expectNamed(panel, removed.branch);
    await expect(panel.locator(".intent-ci-gap")).toHaveText(
      `The recorded branch ${removed.branch} of ${removed.title} is no longer published, so it has no CI status.`,
    );
    await expectNoStatus(panel);
    // Its history alone was asked: GitHub has no such branch.
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([
      "commit-list codex/removed-branch",
    ]);
  });

  await test.step("clearing the selection shows main again", async () => {
    const panel = await toggleOnDevelopment(page, removed.title);
    await expectNamed(panel, "main");
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at 4774f60 (Add login)",
    );
  });
});

test("a selected story whose agent profiles cannot be read has an unknown branch, saying why, and no status", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  // A published profile whose read fails as a lost connection would.
  const profile = ".planning/agents/akiho-chan.json";
  publishMovingFiles(page, {
    repository: doughnut.repository,
    ref: doughnut.ref,
    revision: doughnut.revision,
    files: { ...doughnut.files, [profile]: "{}\n" },
    unanswered: [profile],
  });
  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await chooseCiStatus(intent);
  const taken = "Doughnut's own taken story";
  const panel = await toggleOnDevelopment(page, taken);
  await expect(panel.getByRole("heading")).toHaveText(`CI status of ${taken}`);
  await expect(panel.locator(".intent-ci-gap")).toContainText(
    `The story branch of ${taken} is unknown: the agent profiles could not be read`,
  );
  await expectNoStatus(panel);
});
