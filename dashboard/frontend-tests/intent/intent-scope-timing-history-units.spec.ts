// Supplemental receiving/presentation proof of a Done story's scope history
// by timing unit, including legacy evidence of unknown unit (its
// normalization is observed at the store boundary). Actual collection and
// retained unit projection belong to the collector-to-Summary journey.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  expectDoneEntryComparisonKept,
  openDoneScopeHistory,
} from "./intent-done-scope-history.ts";

test("one collected attempt charts case and file timing one unit at a time, each with its own values and selected gap", async () => {
  const { summary, history } = await openDoneScopeHistory(
    (path, selectedRevision) =>
      makeMe.aScopeHistoryGlance
        .with({
          path,
          selectedRevision,
          availability: "retained",
          entries: [
            {
              kind: "point",
              key: "run/41/1",
              date: "2026-11-04T10:00:00Z",
              selected: false,
              landings: [{ selected: false, provenance: "exact" }],
              readings: [
                { kind: "point", unit: "case", ms: 100, segment: "case/1" },
                { kind: "point", unit: "file", ms: 1000, segment: "file/1" },
              ],
            },
            {
              kind: "point",
              key: "run/42/1",
              date: "2026-11-05T10:00:00Z",
              selected: true,
              landings: [{ selected: true, provenance: "exact" }],
              readings: [
                { kind: "point", unit: "case", ms: 0, segment: "case/1" },
                {
                  kind: "gap",
                  unit: "file",
                  status: "unavailable",
                  reason: "Part 2 untimed",
                },
              ],
            },
          ],
        })
        .please(),
    { phone: true },
  );
  // One chart at a time; neither unit is summed into the other.
  const cases = await history.chart("test cases", "selected landing");
  expect(history.charts()).toBe(1);
  await expect
    .element(history.unit("Test cases"))
    .toHaveAttribute("aria-pressed", "true");
  await expect
    .element(history.unit("Test files"))
    .toHaveAttribute("aria-pressed", "false");
  expect(cases.builds()).toEqual({ measured: 1, selected: 1, unavailable: 0 });
  expect(cases.markNames()).toContain("Nov 4 · 100 ms");
  expect(cases.readout()).toBe("Nov 5 · Selected landing · 0 ms");
  // No prior-build reference was answered, so no compact readout is shown.
  expect(history.readout().selected).toBeFalsy();

  await history.choose("Test files", "touch");
  const files = await history.chart("test files", "selected landing");
  expect(history.charts()).toBe(1);
  expect(files.builds()).toEqual({ measured: 1, selected: 0, unavailable: 1 });
  expect(files.markNames()).toContain("Nov 4 · 1.0 s");
  expect(files.readout()).toBe(
    "Nov 5 · Selected landing · No timing · Part 2 untimed",
  );
  expectDoneEntryComparisonKept(summary);
  expect(history.scrollingSideways()).toEqual([]);
});

test("legacy-only collected evidence states its unknown unit without declaring a case or file history", async () => {
  const { summary, history } = await openDoneScopeHistory(
    (path, selectedRevision) =>
      makeMe.aScopeHistoryGlance
        .with({
          path,
          selectedRevision,
          availability: "retained",
          entries: [
            {
              kind: "gap",
              key: "run/42/1",
              date: "2026-11-05T10:00:00Z",
              selected: true,
              landings: [{ selected: true, provenance: "exact" }],
              readings: [],
              gap: { status: "unavailable", reason: "legacy unit unknown" },
            },
          ],
        })
        .please(),
  );
  // Its unknown unit as the brief status, with no declared unit history.
  await expect.poll(history.status).toBe("legacy unit unknown");
  expect(history.text()).not.toMatch(/test cases|test files/i);
  // No timing either; the joined text runs a unit into the next word.
  expect(history.text()).not.toMatch(/\d+(?:\.\d+)?\s*(?:ms|s)(?![a-z])/);
  expect(history.charts()).toBe(0);
  expectDoneEntryComparisonKept(summary);
});
