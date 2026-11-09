// Supplemental receiving/presentation proof. Actual collection and retained
// unit projection belong to the integrated collector-to-Summary journey.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expectComparisonScopeRows } from "../intentScopeProofPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { entryComparisonRows } from "../support/summaryComparisonExpectedRows.ts";

test("one collected attempt has separate case and file histories with one common evidence row and independent selected gaps", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const previous = "1".repeat(40);
  const collected = makeMe.aCiScopeHistory
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "retained",
      entries: [
        {
          kind: "point",
          key: "run/41/1",
          date: "2026-11-04T10:00:00Z",
          selected: false,
          landings: [
            {
              revision: previous,
              receivedAt: "2026-11-04T10:00:00Z",
              selected: false,
              provenance: "exact",
            },
          ],
          build: {
            revision: previous,
            runId: 41,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/41",
            provenance: "exact",
          },
          legacyReason: "legacy unit unknown",
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 100,
              entry: "dashboard/tests",
              segment: "case/1",
            },
            {
              kind: "point",
              unit: "file",
              ms: 1000,
              entry: "dashboard/tests",
              segment: "file/1",
            },
          ],
        },
        {
          kind: "point",
          key: "run/42/1",
          date: "2026-11-05T10:00:00Z",
          selected: true,
          landings: [
            {
              revision: setup.completion,
              receivedAt: "2026-11-05T10:00:00Z",
              selected: true,
              provenance: "exact",
            },
          ],
          build: {
            revision: setup.completion,
            runId: 42,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/42",
            provenance: "exact",
          },
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 0,
              entry: "dashboard/tests",
              segment: "case/1",
            },
            { kind: "gap", unit: "file", reason: "Part 2 untimed" },
          ],
        },
      ],
    })
    .please();
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    (route) => route.fulfill({ json: collected }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = summary.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });

  // Count attempts once across facets; neither unit is selected or summed.
  await expect(history.locator(".intent-ci-history-extent")).toHaveText(
    "2 measured builds · Nov 4–Nov 5",
  );
  await expect(history.getByRole("combobox")).toHaveCount(0);
  await expect(history.getByRole("radio")).toHaveCount(0);
  const cases = history.getByRole("region", {
    name: "Test cases",
    exact: true,
  });
  const files = history.getByRole("region", {
    name: "Test files",
    exact: true,
  });
  await expect(
    cases.getByRole("heading", { name: "Test cases", exact: true }),
  ).toBeVisible();
  await expect(
    files.getByRole("heading", { name: "Test files", exact: true }),
  ).toBeVisible();
  await expect(history.getByRole("img")).toHaveCount(2);
  await expect(
    cases.getByRole("img", { name: /test cases.*build date/i }),
  ).toBeVisible();
  await expect(
    files.getByRole("img", { name: /test files.*build date/i }),
  ).toBeVisible();
  await expect(cases.locator(".intent-ci-history-point")).toHaveCount(2);
  await expect(files.locator(".intent-ci-history-point")).toHaveCount(1);
  await expect(cases.locator(".intent-ci-history-selected")).toHaveText(
    "Selected",
  );
  await expect(
    files.locator("svg").getByText("Selected gap", { exact: true }),
  ).toBeVisible();
  await expect(files.locator(".intent-ci-history-selected")).toHaveCount(0);

  const rows = history
    .getByRole("list", { name: "Test execution history evidence" })
    .getByRole("listitem");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText("test cases");
  await expect(rows.nth(0)).toContainText("100 ms");
  await expect(rows.nth(0)).toContainText("test files");
  await expect(rows.nth(0)).toContainText("1.0 s");
  await expect(rows.nth(0)).not.toContainText("1.1 s");
  await expect(rows.nth(0)).toContainText("legacy unit unknown");
  expect(
    ((await rows.nth(0).textContent()) ?? "").match(/legacy unit unknown/g),
  ).toHaveLength(1);
  await expect(rows.nth(1)).toContainText("test cases");
  await expect(rows.nth(1)).toContainText("0 ms");
  await expect(rows.nth(1)).toContainText("test files");
  await expect(rows.nth(1)).toContainText("Part 2 untimed");
  await expect(rows.nth(0).locator("time")).toHaveCount(1);
  await expect(rows.nth(1).locator("time")).toHaveCount(1);
  await expect(rows.nth(1).locator("strong")).toHaveCount(1);
  await expect(rows.nth(0).getByRole("link")).toHaveCount(1);
  await expect(rows.nth(1).getByRole("link")).toHaveCount(1);
  const firstRun = rows
    .nth(0)
    .getByRole("link", { name: "Run 41 · attempt 1" });
  const selectedRun = rows
    .nth(1)
    .getByRole("link", { name: "Run 42 · attempt 1" });
  await expect(firstRun).toHaveAttribute("href", "https://ci.invalid/runs/41");
  await expect(selectedRun).toHaveAttribute(
    "href",
    "https://ci.invalid/runs/42",
  );
  await history.locator("summary").focus();
  await page.keyboard.press("Tab");
  await expect(firstRun).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(selectedRun).toBeFocused();
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await expectNoSidewaysScrollIn(page, history);
});
