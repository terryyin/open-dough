// How a reused equivalent or later trunk build stands for the landings its
// timing represents in a Done story's scope history. The collection-to-Summary
// journey owns actual retained evidence.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { openDoneScopeHistory } from "./intent-done-scope-history.ts";
import { doneCompletion } from "./intent-story-compare-stories.ts";

test("a later trunk build that supplies the selected timing stays named in the readout and each mark names its build's role", async () => {
  const later = "d".repeat(40);
  // The later build's attempt key carries its revision, never shown.
  const standIn = `adapter/${JSON.stringify(["42", "1", later])}`;
  const { history } = await openDoneScopeHistory(
    (path, selectedRevision) =>
      makeMe.aScopeHistoryGlance
        .with({
          path,
          selectedRevision,
          availability: "retained",
          entries: [
            {
              key: "run/41/1",
              kind: "point",
              date: "2026-11-04T10:00:00Z",
              selected: false,
              // A preparation and a skipped landing share one equivalent build.
              landings: [
                { selected: false, provenance: "equivalent" },
                { selected: false, provenance: "equivalent" },
              ],
              readings: [
                {
                  kind: "point",
                  unit: "case",
                  ms: 1200,
                  segment: "case/1",
                },
              ],
            },
            {
              key: standIn,
              kind: "point",
              date: "2026-11-08T10:00:00Z",
              selected: true,
              landings: [{ selected: true, provenance: "later" }],
              readings: [
                {
                  kind: "point",
                  unit: "case",
                  ms: 2400,
                  segment: "case/1",
                },
              ],
            },
          ],
          references: [
            {
              unit: "case",
              reference: {
                endpoint: selectedRevision,
                selected: {
                  key: standIn,
                  date: "2026-11-08T10:00:00Z",
                  ms: 2400,
                },
                sampleCount: 1,
              },
            },
          ],
        })
        .please(),
    { phone: true },
  );
  // Each measured build by its date, timing and role.
  const chart = await history.chart("test cases", "selected landing");
  expect(history.readout().selected).toBe(
    `Selected landing ${shortSha(doneCompletion)} · 2.4 s · Later trunk build, includes later changes`,
  );
  expect(chart.titles()).toEqual([
    "Nov 4 · 1.2 s · test cases · Reused equivalent first-parent build",
    "Nov 8 · 2.4 s · test cases · Later trunk build, includes later changes · Selected landing",
  ]);
  expect(chart.readout()).toBe("Nov 8 · Selected landing · 2.4 s");
  expect(history.text()).not.toContain(shortSha(later));
  expect(history.scrollingSideways()).toEqual([]);
});
