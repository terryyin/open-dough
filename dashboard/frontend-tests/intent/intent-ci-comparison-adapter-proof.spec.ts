// Each adapter build keeps its own proof reason and exact source words:
// size limit, invalid summary, attempt ambiguity and unrecorded wall time,
// through the production comparison.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountComparison } from "./intent-ci-comparison-page.ts";

test("adapter proof size limit, invalid summary and attempt ambiguity each keep their own endpoint's reason", async () => {
  const comparison = await mountComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withAdapterAttemptAt("baseline", { attemptId: "1" })
      .withAdapterAttemptAt("branch", { attemptId: "2" })
      .withAdapterAttemptAt(
        "landed",
        { attemptId: "2", ambiguous: true },
        { revision: "b".repeat(40) },
      )
      .withProofs(
        makeMe.aCiProof
          .unavailable("invalid", "schemaVersion is not 1 or 2")
          .please(),
        makeMe.aCiProof.tooLarge(1024 * 1024).please(),
        undefined,
      )
      .please(),
  );
  await expect
    .poll(() => comparison.entryEvidence())
    .toContain(
      "Baseline — This attempt's CI proof summary is not a valid summary: schemaVersion is not 1 or 2.",
    );
  expect(comparison.entryEvidence()).toContain(
    "Branch — This attempt's CI proof is larger than the 1 MiB proof limit.",
  );
  expect(comparison.entryEvidence()).toContain(
    "Landed — This attempt is ambiguous at its revision: another discovered attempt is also attempt 2 at bbbbbbb.",
  );
});

test("adapter builds with no recorded wall time keep exact source words and hide attempt ids", async () => {
  const gap = {
    kind: "none" as const,
    explanation:
      "No build at aaaaaaa: no ancestor build was found to compare against.",
  };
  // Branch and Landed are the same retried adapter build at Branch's revision.
  const attempt = { runId: "landing", attemptId: "passed-retry" };
  const unrecorded = { startedAt: undefined, completedAt: undefined };
  const noProof = makeMe.aCiProof.unavailable("none", "no proof kept").please();
  const comparison = await mountComparison(
    makeMe.aComparedStory
      .withAnswer({ baseline: gap })
      .withAdapterAttemptAt("branch", attempt, unrecorded)
      .withAdapterAttemptAt("landed", attempt, {
        ...unrecorded,
        revision: "b".repeat(40),
        subject: "branch",
      })
      .withProofs(undefined, noProof, noProof)
      .please(),
  );
  await expect
    .poll(() => comparison.wallTimes().slice(1))
    .toEqual(["Not recorded", "Not recorded"]);
  const [baseline, ...builds] = comparison.identities();
  expect(baseline?.text).toBe(gap.explanation);
  for (const build of builds) {
    expect(build.text).toContain("bbbbbbb");
    expect(build.text).toContain("exact revision");
    expect(build.sources).toEqual([
      { selection: "exact", title: "exact revision", visible: true },
    ]);
    expect(build.text).not.toContain("attempt passed-retry");
  }
});
