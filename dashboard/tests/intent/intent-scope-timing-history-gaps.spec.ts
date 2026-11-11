import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryChart,
} from "../intentScopeHistoryPage.ts";
// Supplemental UI recovery proof for the locally collected scope history.
// The collection-to-Summary journey owns actual retained evidence; this
// substitute fails only the local history read beside an existing comparison.

import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { expectComparisonScopeRows } from "../intentScopeProofPage.ts";
import { entryComparisonRows } from "../support/summaryComparisonExpectedRows.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { shortSha } from "../../src/baseCiWording.ts";

test("unverified local landing order explains the partial cohort while the selected known measurement remains readable", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const unknownRevision = "e".repeat(40);
  const collected = makeMe.aCiScopeHistory
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "order-unavailable",
      entries: [
        {
          key: "run/42/1",
          kind: "point",
          date: "2026-11-08T10:00:00Z",
          selected: true,
          landings: [
            {
              revision: setup.completion,
              receivedAt: "2026-11-08T10:00:00Z",
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
          ],
        },
      ],
    })
    .please();
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    (route) => route.fulfill({ json: collected }),
  );
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  await expect(history).toContainText(
    "Some retained landing positions could not be verified from local Git evidence. Only the selected observation and independently verified preceding history are shown.",
  );
  await expect(history).toContainText("1 measured build");
  const rows = scopeHistoryReading(history).rows;
  await expect(rows).toHaveCount(1);
  await expect(rows).toHaveText(
    `Nov 8 · 0 ms · test cases · entry dashboard/tests · Selected landing · Exact build ${shortSha(setup.completion)} · Run 42 · attempt 1 · Represents ${shortSha(setup.completion)} (selected landing) (exact build)`,
  );
  await expect(history).not.toContainText(shortSha(unknownRevision));
  await expect(scopeHistoryChart(history, "test cases")).toBeVisible();
  await expect(
    rows.getByRole("link", { name: "Run 42 · attempt 1" }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/42");
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
});

test("a pending scope gap links its known run without presenting a measured build or execution time", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const collected = makeMe.aCiScopeHistory
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "retained",
      entries: [
        {
          key: "pending/51/2",
          kind: "gap",
          date: "2026-11-06T10:00:00Z",
          selected: true,
          landings: [
            {
              revision: setup.completion,
              receivedAt: "2026-11-06T10:00:00Z",
              selected: true,
            },
          ],
          readings: [],
          reason: "Pending · CI queued or running",
          run: {
            runId: 51,
            runAttempt: 2,
            runUrl: "https://ci.invalid/runs/51",
          },
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
  const history = scopeHistory(summary);
  const row = scopeHistoryReading(history).rows;
  await expect(row).toContainText(
    "Pending · CI queued or running · Selected landing",
  );
  await expect(row).not.toContainText(
    /(?:\d[\d.]*\s*(?:ms|s|min)\b|(?:Exact|Measured|Reused|Later trunk) build)/,
  );
  const link = row.getByRole("link", { name: "Run 51 · attempt 2" });
  await expect(link).toHaveAttribute("href", "https://ci.invalid/runs/51");
  await scopeHistoryReading(history).disclosure.focus();
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  await expect(history).toContainText("0 measured builds");
  await expect(scopeHistoryReading(history).charts).toHaveCount(0);
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await expectNoSidewaysScrollIn(page, history);
});
