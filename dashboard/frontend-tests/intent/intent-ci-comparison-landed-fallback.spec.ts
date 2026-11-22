// When Landed cannot be compared, the comparison falls back to Branch, keeps
// Branch's measured figures and explains the nearest running, cancelled or
// proofless Landed result without borrowing its timing.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountComparison } from "./intent-ci-comparison-page.ts";

test("running Landed retains Branch fallback and its added-entry words", async () => {
  const comparison = await mountComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withLanded({ kind: "running" })
      .withMixedEntries()
      .please(),
  );
  await expect
    .poll(() => comparison.activeComparison())
    .toEqual(["Baseline compared with Branch"]);
  expect(comparison.wallTimes()).toEqual(["3 min", "3 min 20 s", "—"]);
  expect(comparison.timesWithoutWaits()).toEqual([
    "2 min",
    "2 min",
    "Unavailable while the build is running.",
  ]);
  expect(comparison.identities()[2]?.text).toContain("running");
  expect(
    comparison.entryRows().find(([entry]) => entry === "src/skills"),
  ).toEqual([
    "src/skills",
    "added → 3 test files",
    "added",
    "30 s",
    "Build is still running.",
  ]);
});

test("unavailable Landed proof retains the Branch counts, time and exact adapter reason", async () => {
  const reason =
    "This attempt's CI adapter gave no CI proof summary: no summary retained for this attempt.";
  const comparison = await mountComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withAdapterAttemptAt("landed", { attemptId: "landing" })
      .withMixedEntries()
      .withProofAt(
        "landed",
        makeMe.aCiProof
          .unavailable("none", "no summary retained for this attempt")
          .please(),
      )
      .please(),
  );
  await expect
    .poll(() => comparison.activeComparison())
    .toEqual(["Baseline compared with Branch"]);
  expect(comparison.entryRows()).toEqual([
    [
      "dashboard/tests",
      "2,090 → 2,092 test cases (+2)",
      "4 min",
      "+30 s",
      reason,
    ],
    ["tests", "5 test files (no change)", "2 min", "−30 s", reason],
    ["src/skills", "added → 3 test files", "added", "30 s", reason],
  ]);
});

// Each cancelled landing names a different nearest later result; the timing
// of that later build (shown in `borrowed`) never stands in for Landed.
const cancelledLandings = [
  {
    nearest: "nearest proofless later build",
    reason:
      "The CI build at the landing merge was cancelled. The nearest later trunk build at eeeeeee (run 399 #1) published no CI proof summary.",
    borrowed: "5 min",
  },
  {
    nearest: "running later build",
    reason:
      "The CI build at the landing merge was cancelled. A later trunk build at fffffff (run 403 #1) is still running, so no later trunk build has finished yet.",
    borrowed: "7 min",
  },
  {
    nearest: "proofless then running",
    reason:
      "The CI build at the landing merge was cancelled. The nearest later trunk build at eeeeeee (run 304 #1) published no CI proof summary. A later trunk build at fffffff (run 305 #1) is still running.",
    borrowed: "no later trunk build has finished yet",
  },
  {
    nearest: "no later result at the read head",
    reason:
      "The CI build at the landed story revision was cancelled. No later trunk build has finished yet.",
    borrowed: "7 min",
  },
] as const;

const cancelledLanding = (reason: string) =>
  makeMe.aComparedStory
    .wallTimed()
    .withAnswer({
      landed: {
        kind: "none",
        explanation: reason,
        awaitingLaterBuild: true,
        requestedStatus: {
          kind: "cancelled",
          explanation: "Cancelled at ddddddd.",
        },
      },
    })
    .withMixedEntries()
    .please();

test("cancelled Landed fallback preserves each nearest later result's explanation without borrowed timing", async () => {
  const [first] = cancelledLandings;
  const comparison = await mountComparison(cancelledLanding(first.reason));
  for (const { nearest, reason, borrowed } of cancelledLandings) {
    comparison.showsStory(cancelledLanding(reason));
    await expect
      .poll(() => comparison.fallbackReason())
      .toEqual([`Landed is not used: ${reason}`]);
    const landed = comparison.identities()[2]?.text;
    expect(landed, nearest).toContain("Cancelled at ddddddd.");
    expect(landed, nearest).toContain(reason);
    expect(comparison.activeComparison(), nearest).toEqual([
      "Baseline compared with Branch",
    ]);
    expect(comparison.wallTimes()[2], nearest).toBe("—");
    expect(comparison.timesWithoutWaits()[2], nearest).toBe("—");
    expect(comparison.text(), nearest).not.toContain(borrowed);
  }
});
