// Canonical local-history and judgment answers for frontend lifecycle scenarios.
import type { Page } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";

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

// Five prior trunk builds and the endpoint's, each measured in test cases
// and in test files at a tenth, with each unit's reference as the glance read
// answers it: test cases 120 ms against 103 ms, test files 12 ms against
// 10.3 ms, both 17% slower.
export function scopeUnitsHistory(revision: string, path: string) {
  const caseMs = [100, 100, 100, 100, 115, 120];
  const entries = caseMs.map((ms, index) => {
    const day = String(index + 1);
    const selected = index === caseMs.length - 1;
    return {
      key: `run/${day}/1`,
      kind: "point" as const,
      date: `2026-11-0${day}T10:00:00Z`,
      selected,
      landings: [{ selected, provenance: "exact" as const }],
      readings: (["case", "file"] as const).map((unit) => ({
        kind: "point" as const,
        unit,
        ms: unit === "case" ? ms : ms / 10,
        segment: `${unit}/1`,
      })),
    };
  });
  const reference = (averageMs: number, ms: number, text: string) => ({
    endpoint: revision,
    selected: { key: "run/6/1", date: "2026-11-06T10:00:00Z", ms },
    sampleCount: 5,
    averageMs,
    difference: {
      text,
      changeMs: ms - averageMs,
      relative: (ms - averageMs) / averageMs,
    },
  });
  return makeMe.aScopeHistoryGlance
    .with({
      path,
      selectedRevision: revision,
      availability: "retained",
      entries,
      references: [
        { unit: "case", reference: reference(103, 120, "+17 ms") },
        { unit: "file", reference: reference(10.3, 12, "+2 ms") },
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
