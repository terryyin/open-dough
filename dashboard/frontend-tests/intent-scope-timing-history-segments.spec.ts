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

test("earlier supported owning-entry segments stay readable beside a selected proof gap and the line does not join incompatible segments", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(comparisonServices, facts, facts.entries);
  const setup = { completion: facts.work.revision };
  const older = "1".repeat(40);
  const changed = "2".repeat(40);
  const collected = makeMe.aCiScopeHistory
    .with({
      path: "dashboard/tests",
      selectedRevision: setup.completion,
      availability: "retained",
      entries: [
        {
          key: "run/41/1",
          kind: "point",
          date: "2026-11-04T10:00:00Z",
          selected: false,
          landings: [
            {
              revision: older,
              receivedAt: "2026-11-04T10:00:00Z",
              selected: false,
            },
          ],
          build: {
            revision: older,
            runId: 41,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/41",
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
          date: "2026-11-05T10:00:00Z",
          selected: false,
          landings: [
            {
              revision: changed,
              receivedAt: "2026-11-05T10:00:00Z",
              selected: false,
            },
          ],
          build: {
            revision: changed,
            runId: 42,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/42",
            provenance: "exact",
          },
          readings: [
            {
              kind: "point",
              unit: "case",
              ms: 2400,
              entry: "dashboard",
              segment: "case/owner-2",
            },
          ],
        },
        {
          key: "run/43/1",
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
          build: {
            revision: setup.completion,
            runId: 43,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/43",
            provenance: "exact",
          },
          readings: [
            { kind: "gap", unit: "case", reason: "CI proof summary expired" },
          ],
          reason: "CI proof summary expired",
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
  const history = summary.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });
  await expect(history).toContainText("2 measured builds · Nov 4–Nov 5");
  const rows = history
    .getByRole("list", { name: "Test execution history evidence" })
    .getByRole("listitem");
  await expect(rows.nth(0)).toContainText("1.2 s · test cases");
  await expect(rows.nth(1)).toContainText(
    "2.4 s · test cases · entry dashboard",
  );
  await expect(rows.nth(2)).toContainText(
    "CI proof summary expired · Selected landing",
  );
  await expect(rows.nth(2)).not.toContainText("ms");
  await expect(
    history.locator("svg").getByText("Selected gap", { exact: true }),
  ).toBeVisible();
  await expect(history.locator(".intent-ci-history-line")).toHaveAttribute(
    "d",
    /^M[^M]+ M/,
  );
  await expect(history.locator("circle.intent-ci-history-point")).toHaveCount(
    2,
  );
  await expectNoSidewaysScrollIn(page, history);
});

for (const variant of ["empty", "all gaps"] as const) {
  test(`${variant} scope history explains the absence of measurements without drawing an empty chart`, async ({
    page,
    comparisonServer,
    comparisonServices,
  }) => {
    const facts = summaryScopeFacts();
    serveComparison(comparisonServices, facts, facts.entries);
    const setup = { completion: facts.work.revision };
    const collected = makeMe.aCiScopeHistory
      .with({
        path: "dashboard/tests",
        selectedRevision: setup.completion,
        availability: variant === "empty" ? "empty" : "retained",
        entries:
          variant === "empty"
            ? []
            : [
                {
                  key: "run/43/1",
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
                  build: {
                    revision: setup.completion,
                    runId: 43,
                    runAttempt: 1,
                    runUrl: "https://ci.invalid/runs/43",
                    provenance: "exact",
                  },
                  readings: [
                    {
                      kind: "gap",
                      unit: "case",
                      reason: "Partial: part 2 of 2 missing",
                    },
                  ],
                  reason: "Partial: part 2 of 2 missing",
                },
              ],
      })
      .please();
    await page.route(
      /\/__authenticated-read\?.*intent=ci-history.*scope=/,
      (route) => route.fulfill({ json: collected }),
    );
    await mountComparison(page, comparisonServer, {
      ...facts,
      doneEndpoint: { revision: setup.completion, at: "2026-11-09T00:00:00Z" },
    });
    const summary = page.getByRole("region", { name: "Summary", exact: true });
    const history = summary.getByRole("region", {
      name: "Test execution time history",
      exact: true,
    });
    await expect(history).toContainText("0 measured builds");
    await expect(history).toContainText(
      "No complete test execution times are available for this scope.",
    );
    await expect(history.getByRole("img")).toHaveCount(0);
    if (variant === "empty") {
      await expect(history).toContainText(
        "No dashboard-recorded landing history has been collected.",
      );
      await expect(history.getByRole("list")).toHaveCount(0);
    } else {
      const evidence = history.getByRole("list", {
        name: "Test execution history evidence",
      });
      await expect(evidence.getByRole("listitem")).toContainText(
        "Partial: part 2 of 2 missing · Selected landing",
      );
      await expect(evidence).not.toContainText("ms");
      await expect(
        evidence.getByRole("link", { name: "Run 43 · attempt 1" }),
      ).toHaveAttribute("href", "https://ci.invalid/runs/43");
    }
    await expectComparisonScopeRows(
      summary,
      "dashboard/tests",
      entryComparisonRows,
    );
  });
}
