import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryChart,
} from "../tests/intentScopeHistoryPage.ts";
// Supplemental UI recovery proof for the locally collected scope history.
// The collection-to-Summary journey owns actual retained evidence; this
// substitute fails only the local history read beside an existing comparison.

import {
  expect,
  test,
  mountComparison,
} from "../tests/support/comparisonMountPage.ts";
import {
  summaryScopeFacts,
  serveComparison,
} from "../tests/support/comparisonScopeFacts.ts";
import { expectComparisonScopeRows } from "../tests/intentScopeProofPage.ts";
import { entryComparisonRows } from "../tests/support/summaryComparisonExpectedRows.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { expectNoSidewaysScrollIn } from "../tests/pageLayout.ts";
import { shortSha } from "../src/baseCiWording.ts";

test("a failed local entry history read keeps the selected Done story and comparison and offers its own retry", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  const setup = { completion: facts.work.revision };
  const previous = "1".repeat(40);
  const adapterAttemptId = "opaque-attempt+#";
  const adapterUrl = "https://ci.invalid/adapter-proof";
  const collected = makeMe.aCiScopeHistory
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "retained",
      entries: [
        {
          key: `adapter/${JSON.stringify(["run-a", adapterAttemptId, previous])}`,
          kind: "point",
          date: "2026-11-05T10:00:00Z",
          selected: false,
          landings: [
            {
              revision: previous,
              receivedAt: "2026-11-05T10:00:00Z",
              selected: false,
              provenance: "exact",
            },
          ],
          build: {
            revision: previous,
            adapterAttempt: { runId: "run-a", attemptId: adapterAttemptId },
            runUrl: adapterUrl,
            provenance: "exact",
          },
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 1200,
              entry: "dashboard/tests",
              segment: "case/1",
            },
          ],
        },
        {
          key: "run/42/1",
          kind: "point",
          date: "2026-11-06T10:00:00Z",
          selected: true,
          landings: [
            {
              revision: setup.completion,
              receivedAt: "2026-11-06T10:00:00Z",
              selected: true,
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
  let reads = 0;
  let available = false;
  let releaseHistory: () => void = () => undefined;
  const heldHistory = new Promise<void>((resolve) => {
    releaseHistory = resolve;
  });
  await page.route(
    /\/__authenticated-read\?.*intent=ci-history.*scope=/,
    async (route) => {
      reads += 1;
      if (available) await heldHistory;
      await route.fulfill(
        available
          ? { json: collected }
          : { status: 503, json: { error: "Local history unavailable" } },
      );
    },
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await mountComparison(page, comparisonServer, {
    ...facts,
    doneEndpoint: { revision: setup.completion, at: "2026-11-09T00:00:00Z" },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  const history = scopeHistory(summary);
  await expect(scopeHistoryReading(history).failure).toContainText(
    "Local history unavailable",
  );
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  expect(reads).toBe(1);
  available = true;
  try {
    await scopeHistoryReading(history).retry.click();
    await expect.poll(() => reads).toBe(2);
    await expect(scopeHistoryReading(history).failure).toContainText(
      "Local history unavailable",
    );
    await expectComparisonScopeRows(
      summary,
      "dashboard/tests",
      entryComparisonRows,
    );
  } finally {
    releaseHistory();
  }
  await expect(scopeHistoryReading(history).failure).toHaveCount(0);
  await expectComparisonScopeRows(
    summary,
    "dashboard/tests",
    entryComparisonRows,
  );
  await expect(history).toContainText(
    `Selected landing ${shortSha(setup.completion)}`,
  );
  await expect(history).toContainText("2 measured builds · Nov 5–Nov 6");
  const evidence = scopeHistoryReading(history).evidence;
  await expect(scopeHistoryReading(history).rows).toHaveText([
    `Nov 5 · 1.2 s · test cases · entry dashboard/tests · Exact build ${shortSha(previous)} · Attempt ${adapterAttemptId} · Represents ${shortSha(previous)} (exact build)`,
    `Nov 6 · 0 ms · test cases · entry dashboard/tests · Selected landing · Exact build ${shortSha(setup.completion)} · Run 42 · attempt 1 · Represents ${shortSha(setup.completion)} (selected landing)`,
  ]);
  await expect(scopeHistoryChart(history, "test cases")).toBeVisible();
  await expect(scopeHistoryReading(history).selectedLabels).toHaveText(
    "Selected",
  );
  const build = evidence.getByRole("link", { name: "Run 42 · attempt 1" });
  await expect(build).toHaveAttribute("href", "https://ci.invalid/runs/42");
  const adapter = evidence.getByRole("link", {
    name: `Attempt ${adapterAttemptId}`,
  });
  await expect(adapter).toHaveAttribute("href", adapterUrl);
  await scopeHistoryReading(history).disclosure.focus();
  await page.keyboard.press("Tab");
  await expect(adapter).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(build).toBeFocused();
  await expectNoSidewaysScrollIn(page, history);
});
