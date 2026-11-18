// A fresh one-worker run of ordinary preparation-page cases before and after
// one that starts from the kept compared history
// (../../tests/support/keptComparedStoryBranch.ts): all share one worker,
// only the case that asks prepares the kept history, and each case's origin
// is its own.
import { startPreparationProofRun } from "../support/preparationProofRun.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import { removeProofDirectories } from "../../tests/support/proofRecordRun.ts";

type ReportedCase = {
  title: string;
  workerIndex: number;
  origin: string;
  commits: string[];
  completion?: string;
};

test.afterEach(removeProofDirectories);

test("kept and ordinary histories share one worker", async () => {
  const run = startPreparationProofRun({
    spec: "kept-history.proof.ts",
    setup: "backendGlobalSetup.ts",
  });
  try {
    await run.passed();

    const cases = run.cases<ReportedCase>();
    expect(cases.map(({ title }) => title)).toEqual([
      "an ordinary case runs first",
      "a kept-history case follows",
      "an ordinary case runs after the kept history",
    ]);
    expect(new Set(cases.map(({ workerIndex }) => workerIndex)).size).toBe(1);
    expect(
      run.fixtureSteps("keptComparedStoryBranch").map((step) => step.case),
    ).toEqual(["a kept-history case follows"]);
    const [first, kept, after] = cases;
    const completion = kept?.completion ?? "";
    expect(kept?.commits).toContain(completion);
    expect(first?.commits).not.toContain(completion);
    expect(after?.commits).not.toContain(completion);
    expect(new Set(cases.map(({ origin }) => origin)).size).toBe(3);
  } finally {
    await run.stop();
  }
});
