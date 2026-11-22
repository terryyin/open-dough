// Canonical local-history and judgment answers for frontend lifecycle scenarios.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

// One measured selected build of `ms` test-case time, with its unit's
// reference, as the glance read answers it: the compact readout names the
// endpoint and that time.
export function scopeHistoryPoint(revision: string, path: string, ms: number) {
  return makeMe.aScopeHistoryGlance
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
          landings: [{ selected: true, provenance: "exact" }],
          readings: [{ kind: "point", unit: "case", ms, segment: "case/0" }],
        },
      ],
      references: [
        {
          unit: "case",
          reference: {
            endpoint: revision,
            selected: { key: "run/310/1", date: "2026-11-07T10:00:00Z", ms },
            sampleCount: 0,
          },
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
