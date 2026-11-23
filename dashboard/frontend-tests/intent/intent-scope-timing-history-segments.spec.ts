// Supplemental presentation of owning-entry segments in a Done story's scope
// history. The collection-to-Summary journey owns actual retained evidence;
// this substitute supplies one retained history.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { openDoneScopeHistory } from "./intent-done-scope-history.ts";

const caseReading = (ms: number, segment: string) =>
  ({ kind: "point", unit: "case", ms, segment }) as const;

test("earlier supported owning-entry segments stay readable beside a selected proof gap and the line does not join incompatible segments", async () => {
  const expired = {
    status: "unavailable",
    reason: "CI proof summary expired",
  } as const;
  const { history } = await openDoneScopeHistory(
    (path, selectedRevision) =>
      makeMe.aScopeHistoryGlance
        .with({
          path,
          selectedRevision,
          availability: "retained",
          entries: [
            {
              key: "run/40/1",
              kind: "point",
              date: "2026-11-03T10:00:00Z",
              selected: false,
              landings: [{ selected: false, provenance: "exact" }],
              readings: [caseReading(600, "case/1")],
            },
            {
              key: "run/41/1",
              kind: "point",
              date: "2026-11-04T10:00:00Z",
              selected: false,
              landings: [{ selected: false, provenance: "exact" }],
              readings: [caseReading(1200, "case/1")],
            },
            {
              key: "run/42/1",
              kind: "point",
              date: "2026-11-05T10:00:00Z",
              selected: false,
              landings: [{ selected: false, provenance: "exact" }],
              readings: [caseReading(2400, "case/owner-2")],
            },
            {
              key: "run/43/1",
              kind: "gap",
              date: "2026-11-06T10:00:00Z",
              selected: true,
              landings: [{ selected: true, provenance: "exact" }],
              readings: [{ kind: "gap", unit: "case", ...expired }],
              gap: expired,
            },
          ],
        })
        .please(),
    { phone: true },
  );
  const chart = await history.chart("test cases", "selected landing");
  expect(chart.markNames()).toEqual(
    expect.arrayContaining(["Nov 4 · 1.2 s", "Nov 5 · 2.4 s"]),
  );
  expect(chart.readout()).toBe(
    "Nov 6 · Selected landing · No timing · CI proof summary expired",
  );
  expect(chart.builds()).toEqual({ measured: 3, selected: 0, unavailable: 1 });
  // case/1 strokes its two builds; case/owner-2 starts apart, never joined.
  expect(chart.line()).toMatch(/^M[^ML]+L[^ML]+M[^ML]+$/);
  expect(history.scrollingSideways()).toEqual([]);
});
