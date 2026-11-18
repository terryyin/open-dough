import { comparisonReading } from "../../test-support/intentCiComparisonPage.ts";
// Adapter proof absence stays distinct from GitHub run wording.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../test-support/support/pageTest.ts";
import { expectExactSourceCue } from "../../test-support/support/expectCiComparisonSourceCue.ts";

test("adapter proof size limit is named separately for every endpoint", async ({
  renderComparison,
}) => {
  const tooLarge = makeMe.aCiProof.tooLarge(1024 * 1024).please();
  const panel = await renderComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withAdapterAttemptAt("baseline", { attemptId: "1" })
      .withAdapterAttemptAt("branch", { attemptId: "2" })
      .withAdapterAttemptAt("landed", { attemptId: "3" })
      .withProofs(tooLarge, tooLarge, tooLarge)
      .please(),
  );
  const gaps = comparisonReading(panel).entryEvidence;
  for (const label of ["Baseline", "Branch", "Landed"])
    await expect(gaps).toContainText(
      `${label} — This attempt's CI proof is larger than the 1 MiB proof limit.`,
    );
});

test("invalid adapter Baseline and ambiguous Branch and Landed retain their own proof reasons", async ({
  renderComparison,
}) => {
  const panel = await renderComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withAdapterAttemptAt("baseline", { attemptId: "1" })
      .withAdapterAttemptAt("branch", { attemptId: "2", ambiguous: true })
      .withAdapterAttemptAt(
        "landed",
        { attemptId: "2", ambiguous: true },
        { revision: "b".repeat(40) },
      )
      .withProofs(
        makeMe.aCiProof
          .unavailable("invalid", "schemaVersion is not 1 or 2")
          .please(),
        undefined,
        undefined,
      )
      .please(),
  );
  const gaps = comparisonReading(panel).entryEvidence;
  await expect(gaps).toContainText(
    "Baseline — This attempt's CI proof summary is not a valid summary: schemaVersion is not 1 or 2.",
  );
  for (const label of ["Branch", "Landed"])
    await expect(gaps).toContainText(
      `${label} — This attempt is ambiguous at its revision: another discovered attempt is also attempt 2 at bbbbbbb.`,
    );
});

test("adapter builds with no recorded wall time keep exact source words and hide attempt ids", async ({
  renderComparison,
}) => {
  const gap = {
    kind: "none" as const,
    explanation:
      "No build at aaaaaaa: no ancestor build was found to compare against.",
  };
  // Branch and Landed are the same retried adapter build at Branch's revision.
  const attempt = { runId: "landing", attemptId: "passed-retry" };
  const unrecorded = { startedAt: undefined, completedAt: undefined };
  const noProof = makeMe.aCiProof.unavailable("none", "no proof kept").please();
  const panel = await renderComparison(
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
  const builds = comparisonReading(panel).identities;
  await expect(builds.first()).toHaveText(gap.explanation);
  for (const index of [1, 2]) {
    await expect(builds.nth(index)).toContainText("bbbbbbb");
    await expectExactSourceCue(builds.nth(index));
    await expect(builds.nth(index)).not.toContainText("attempt passed-retry");
    await expect(comparisonReading(panel).wallTimes.nth(index)).toHaveText(
      "Not recorded",
    );
  }
});
