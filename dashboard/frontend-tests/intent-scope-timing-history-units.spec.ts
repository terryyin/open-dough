import { attemptLink } from "../tests/ciEvidenceLabelsPage.ts";
import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryUnit,
} from "../tests/intentScopeHistoryPage.ts";
// Supplemental receiving/presentation proof. Actual collection and retained
// unit projection belong to the integrated collector-to-Summary journey.
import { makeMe } from "../../tests/support/makeMe.mjs";
import { expectComparisonScopeRows } from "../tests/intentScopeProofPage.ts";
import { expectNoSidewaysScrollIn } from "../tests/pageLayout.ts";
import {
  expect,
  test,
  mountComparison,
} from "../tests/support/comparisonMountPage.ts";
import {
  summaryScopeFacts,
  serveComparison,
} from "../tests/support/comparisonScopeFacts.ts";
import { entryComparisonRows } from "../tests/support/summaryComparisonExpectedRows.ts";

test("one collected attempt has separate case and file histories with one common evidence row and independent selected gaps", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  const setup = { completion: facts.work.revision };
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
  await mountComparison(page, comparisonServer, {
    ...facts,
    doneEndpoint: { revision: setup.completion, at: "2026-11-09T00:00:00Z" },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const history = scopeHistory(summary);

  // Count attempts once across facets; neither unit is selected or summed.
  await expect(scopeHistoryReading(history).extent).toHaveText(
    "2 measured builds · Nov 4–Nov 5",
  );
  await expect(history.getByRole("combobox")).toHaveCount(0);
  await expect(history.getByRole("radio")).toHaveCount(0);
  const cases = scopeHistoryUnit(history, "Test cases");
  const files = scopeHistoryUnit(history, "Test files");
  await expect(
    cases.getByRole("heading", { name: "Test cases", exact: true }),
  ).toBeVisible();
  await expect(
    files.getByRole("heading", { name: "Test files", exact: true }),
  ).toBeVisible();
  await expect(scopeHistoryReading(history).charts).toHaveCount(2);
  await expect(
    cases.getByRole("img", { name: /test cases.*build date/i }),
  ).toBeVisible();
  await expect(
    files.getByRole("img", { name: /test files.*build date/i }),
  ).toBeVisible();
  await expect(scopeHistoryReading(cases).points).toHaveCount(2);
  await expect(scopeHistoryReading(files).points).toHaveCount(1);
  await expect(scopeHistoryReading(cases).selected).toHaveText("Selected");
  await expect(scopeHistoryReading(files).selectedGap).toBeVisible();
  await expect(scopeHistoryReading(files).selected).toHaveCount(0);

  const rows = scopeHistoryReading(history).rows;
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
  const firstRun = attemptLink(rows.nth(0), "Run 41 · attempt 1");
  const selectedRun = attemptLink(rows.nth(1), "Run 42 · attempt 1");
  await expect(firstRun).toHaveAttribute("href", "https://ci.invalid/runs/41");
  await expect(selectedRun).toHaveAttribute(
    "href",
    "https://ci.invalid/runs/42",
  );
  await scopeHistoryReading(history).disclosure.focus();
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
