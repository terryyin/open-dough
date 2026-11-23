// One retained scope history whose chart shows every kind of history mark,
// for the Done and Project Intent chart-mark specs
// (./intent-*ci-history-chart-marks.spec.ts), and the readouts of its builds
// before the selected one.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ScopeGlanceEntry } from "../../src/ciScopeHistory.ts";

const build = (day: number) => ({
  key: `run/${String(day)}/1`,
  date: `2026-11-0${String(day)}T10:00:00Z`,
  selected: false,
  landings: [{ selected: false, provenance: "exact" as const }],
});
const measured = (day: number, ms: number, segment = "case/1") =>
  ({
    ...build(day),
    kind: "point",
    readings: [{ kind: "point", unit: "case", ms, segment }],
  }) satisfies ScopeGlanceEntry;
const untimed = (
  day: number,
  status: "failed" | "unavailable",
  reason: string,
) =>
  ({
    ...build(day),
    kind: "gap",
    gap: { status, reason },
    readings: [{ kind: "gap", unit: "case", status, reason }],
  }) satisfies ScopeGlanceEntry;

// Retained test-case times: two joined builds, a failed build, a measured
// zero, a build without timing, one more measured build and the selected
// build, whose measurement is incompatible with the builds before it.
export const markedHistory = (path: string, selectedRevision: string) =>
  makeMe.aScopeHistoryGlance
    .with({
      path,
      selectedRevision,
      availability: "retained",
      entries: [
        measured(2, 1000),
        measured(3, 1200),
        untimed(4, "failed", "Failed CI build"),
        measured(5, 0),
        untimed(6, "unavailable", "Expired CI proof summary"),
        measured(7, 1600),
        {
          ...measured(8, 1500, "case/2"),
          selected: true,
          landings: [{ selected: true, provenance: "exact" }],
        },
      ],
      references: [
        {
          unit: "case",
          reference: {
            endpoint: selectedRevision,
            sampleCount: 4,
            averageMs: 950,
          },
        },
      ],
    })
    .please();

export const failed = "Nov 4 · Failed build";
export const zero = "Nov 5 · 0 ms";
export const unavailable = "Nov 6 · No timing · Expired CI proof summary";
export const readoutsBefore = [
  "Nov 2 · 1.0 s",
  "Nov 3 · 1.2 s",
  failed,
  zero,
  unavailable,
  "Nov 7 · 1.6 s",
];
