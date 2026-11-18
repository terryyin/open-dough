import { prepareFrontendDoneIntent } from "../../test-support/support/frontendIntentDoneStory.ts";
// Reports with incomplete evidence or no result reach the same Intent
// coverage view as a Caught result (../../../e2e/intent/intent-story-completed.spec.ts),
// from controlled published Done records. Real CLI completion is retained in
// e2e/intent/intent-story-completed.spec.ts. An older record saved with no
// assessment, and a done record still being read or whose read failed, each
// say so apart, the failed read with the done record read's Retry
// (../../src/doneDetails.ts). An active story's view:
// ./intent-story-summary-title.spec.ts.
import { selectDoneStoryInIntent } from "../../test-support/support/selectDoneStoryInIntent.ts";
import type { Locator } from "@playwright/test";
import { holdAuthenticatedReadsWhere } from "../../test-support/holdAuthenticatedReads.ts";
import { chooseStoryTab } from "../../test-support/support/intentStoryPage.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";

async function openCoverage(intent: Locator) {
  await chooseStoryTab(intent, "Intent coverage");
  return intent.getByRole("region", { name: "Intent coverage" });
}

test("Intent shows an Insufficient evidence report with its reason and unavailable cost", async ({
  page,
  frontendServices,
}) => {
  const report =
    "Outcome: Insufficient evidence\n" +
    "Evidence: No maintained assertion checks the new wrap-up guidance.\n\n" +
    "Test runtime: unavailable (no test ran)\n" +
    "Human effort: unavailable (no human intervention observed)\n" +
    "Agent effort: 1 min (estimated from the work log)\n" +
    "Invocation-to-report elapsed: 67 s (measured by the host clock)\n";
  await prepareFrontendDoneIntent(page, frontendServices, { report });
  const { intent } = await selectDoneStoryInIntent(page);
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
  frontendServices,
}) => {
  const unavailable = "The check was interrupted before producing a report.";
  await prepareFrontendDoneIntent(page, frontendServices, { unavailable });
  const { intent } = await selectDoneStoryInIntent(page);
  const detail = await openCoverage(intent);
  await expect(
    detail.getByRole("heading", { name: "Intent coverage" }),
  ).toBeVisible();
  await expect(detail.getByText("Unavailable", { exact: true })).toBeVisible();
  await expect(detail.getByText(unavailable, { exact: true })).toBeVisible();
});

const noAssessment = "No Intent Coverage assessment was saved for this story.";
const unknown =
  "This done story could not be read, so whether it saved an Intent Coverage assessment is not known.";

test("Intent says an older completion read without an assessment saved none", async ({
  page,
  frontendServices,
}) => {
  await prepareFrontendDoneIntent(page, frontendServices);
  const { intent } = await selectDoneStoryInIntent(page);
  const detail = await openCoverage(intent);
  await expect(detail.locator("p")).toHaveText([noAssessment]);
});

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("Intent coverage waits for the done record, and a failed read offers Retry without saying no assessment was saved", async ({
  page,
  frontendServices,
}) => {
  const report = "Outcome: Caught\nEvidence: The retried read shows it.\n";
  let reads: Awaited<ReturnType<typeof holdAuthenticatedReadsWhere>>;
  await prepareFrontendDoneIntent(page, frontendServices, { report });
  const { intent } = await selectDoneStoryInIntent(
    page,
    "Story A",
    async () => {
      reads = await holdAuthenticatedReadsWhere(
        page,
        (query) => query.get("done") === "bodies",
        releases,
      );
    },
  );
  const detail = await openCoverage(intent);

  await test.step("while its record is read, the view says so", async () => {
    await expect(detail.getByRole("status")).toHaveText("Reading done story…");
    await expect.poll(() => reads.held()).toBe(1);
  });

  await test.step("a failed read says its assessment is unknown, with its problem and Retry", async () => {
    reads.fail();
    await expect(detail.getByText(unknown, { exact: true })).toBeVisible();
    await expect(
      detail.getByText("Done stories could not be read."),
    ).toBeVisible();
    await expect(detail.getByText(noAssessment)).toHaveCount(0);
    await expect(detail.getByText("Unavailable")).toHaveCount(0);
  });

  await test.step("Retry reads the record again and shows the saved report", async () => {
    await detail.getByRole("button", { name: "Retry done story" }).click();
    const result = detail.locator(".intent-story-coverage-text");
    await expect(result).toBeVisible();
    expect(await result.textContent()).toBe(report);
    await expect(detail.getByText(unknown)).toHaveCount(0);
  });
});
