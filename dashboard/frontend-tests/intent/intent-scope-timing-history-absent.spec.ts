// A Done story's scope history without measurements explains why without
// drawing an empty chart: no collected history at all, or only builds
// without timing, whose selected status and insufficient average the compact
// readout still shows. The Summary keeps its comparison rows. The
// collection-to-Summary journey owns actual retained evidence.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import {
  expectDoneEntryComparisonKept,
  openDoneScopeHistory,
} from "./intent-done-scope-history.ts";
import { doneCompletion } from "./intent-story-compare-stories.ts";

const gap = {
  status: "unavailable",
  reason: "Partial: part 2 of 2 missing",
} as const;

for (const variant of ["empty", "all gaps"] as const) {
  test(`${variant} scope history explains the absence of measurements without drawing an empty chart`, async () => {
    const { summary, history } = await openDoneScopeHistory(
      (path, selectedRevision) =>
        makeMe.aScopeHistoryGlance
          .with({
            path,
            selectedRevision,
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
                      landings: [{ selected: true, provenance: "exact" }],
                      readings: [{ kind: "gap", unit: "case", ...gap }],
                      gap,
                    },
                  ],
            references:
              variant === "empty"
                ? []
                : [
                    {
                      unit: "case",
                      reference: {
                        endpoint: selectedRevision,
                        selected: {
                          key: "run/43/1",
                          date: "2026-11-06T10:00:00Z",
                          reason: gap.reason,
                        },
                        sampleCount: 0,
                      },
                    },
                  ],
          })
          .please(),
    );
    if (variant === "empty") {
      await expect.poll(history.status).toBe("No collected history");
      expect(history.text()).toContain(
        "No complete test execution times are available for this scope.",
      );
      expect(history.readout().selected).toBeUndefined();
    } else {
      // The selected build's status and an insufficient average, no change.
      await expect.poll(history.readout).toEqual({
        selected: `Selected landing ${shortSha(doneCompletion)} · No timing · Partial: part 2 of 2 missing`,
        average:
          "Prior-build average · Insufficient history · 0 prior builds used",
        change: undefined,
      });
      expect(history.status()).toBeUndefined();
      expect(history.text()).toContain(
        "No complete test execution times are available for test cases.",
      );
    }
    expect(history.charts()).toBe(0);
    expect(history.lists()).toBe(0);
    expectDoneEntryComparisonKept(summary);
  });
}
