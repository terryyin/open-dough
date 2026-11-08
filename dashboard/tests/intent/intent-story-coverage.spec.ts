// Reports with incomplete evidence or no result reach the same Intent
// coverage view as a Caught result (./intent-story-completed.spec.ts),
// through real completion.
import { selectCompletedStoryInIntent } from "../support/intentCompletedStory.ts";
import type { Locator } from "@playwright/test";
import { chooseStoryTab } from "../support/intentStoryPage.ts";
import { expect, test } from "../support/preparationPage.ts";

async function openCoverage(intent: Locator) {
  await chooseStoryTab(intent, "Intent coverage");
  return intent.getByRole("region", { name: "Intent coverage" });
}

test("Intent shows an Insufficient evidence report with its reason and unavailable cost", async ({
  page,
  origin,
}) => {
  const report =
    "Outcome: Insufficient evidence\n" +
    "Evidence: No maintained assertion checks the new wrap-up guidance.\n\n" +
    "Test runtime: unavailable (no test ran)\n" +
    "Human effort: unavailable (no human intervention observed)\n" +
    "Agent effort: 1 min (estimated from the work log)\n" +
    "Invocation-to-report elapsed: 67 s (measured by the host clock)\n";
  const { intent } = await selectCompletedStoryInIntent(page, origin, {
    intentCoverage: { report },
  });
  const detail = await openCoverage(intent);
  await expect(
    detail.getByRole("heading", { name: "Intent coverage" }),
  ).toBeVisible();
  const result = detail.locator(".intent-story-coverage-text");
  await expect(result).toBeVisible();
  expect(await result.textContent()).toBe(report);
});

test("Intent shows Unavailable and the reason when completion has no assessment report", async ({
  page,
  origin,
}) => {
  const unavailable = "The check was interrupted before producing a report.";
  const { intent } = await selectCompletedStoryInIntent(page, origin, {
    intentCoverage: { unavailable },
  });
  const detail = await openCoverage(intent);
  await expect(
    detail.getByRole("heading", { name: "Intent coverage" }),
  ).toBeVisible();
  await expect(detail.getByText("Unavailable", { exact: true })).toBeVisible();
  await expect(detail.getByText(unavailable, { exact: true })).toBeVisible();
});
