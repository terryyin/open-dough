// Canonical local-history and judgment answers for frontend lifecycle scenarios.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";

export function scopeHistoryPoint(revision: string, path: string, ms: number) {
  return makeMe.aCiScopeHistory
    .with({
      path,
      selectedRevision: revision,
      availability: "retained",
      entries: [
        {
          key: "run/310/1",
          kind: "point",
          date: "2026-11-07T10:00:00Z",
          selected: true,
          landings: [
            {
              revision,
              receivedAt: "2026-11-07T10:10:00Z",
              selected: true,
              provenance: "exact",
            },
          ],
          build: {
            revision,
            runId: 310,
            runAttempt: 1,
            runUrl: "https://ci.invalid/runs/310",
            provenance: "exact",
          },
          readings: [
            {
              kind: "point",
              unit: "case",
              ms,
              entry: "dashboard/tests",
              segment: "case/0",
            },
          ],
        },
      ],
    })
    .please();
}

export async function serveUnreadProjectCi(page: Page, revision: string) {
  const judgment = makeMe.anIntentCiStatus
    .with({
      branch: "main",
      revision,
      subject: "Older CI observation",
      state: "unread",
      reason: "Live proof unavailable",
      laterWithoutResult: 1,
      runBranch: "main",
      checkedAt: "2026-11-11T07:00:00Z",
      freshness: "fresh",
    })
    .please();
  await page.route(/intent=ci-status/, (route) =>
    route.fulfill({
      json: new URL(route.request().url()).searchParams.has("kept")
        ? { none: true }
        : judgment,
    }),
  );
}
