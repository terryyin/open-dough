// A fresh one-worker run of ordinary preparation-page cases before and after
// one that starts from the kept compared history
// (../../test-support/support/keptComparedStoryBranch.ts): all share one worker,
// only the case that asks prepares the kept history, and each case's origin
// is its own. Every worker preparation takes cold preparation's worker
// allowance, and the kept stories finish before the origins they serve.
import { startPreparationProofRun } from "../support/preparationProofRun.ts";
import {
  expect,
  keptStoryWorkerFixtures,
  test,
  workerPreparationFixtures,
} from "../../test-support/support/pageTest.ts";
import {
  coldInputPreparation,
  pinnedWatcherCodexPreparation,
} from "../../test-support/support/publishedMainWorkerFixtures.ts";
import { removeProofDirectories } from "../../test-support/support/proofRecordRun.ts";

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

// The pool's registrations, less the options that only select among them.
const preparations = Object.entries(workerPreparationFixtures).filter(
  ([, registration]) =>
    !(Array.isArray(registration) && registration[1].option),
);

test("every worker preparation takes the cold allowance", () => {
  for (const [name, registration] of preparations) {
    expect(Array.isArray(registration) && registration[1], name).toEqual(
      name === "pinnedWatcherCodex"
        ? pinnedWatcherCodexPreparation
        : coldInputPreparation,
    );
  }
});

test("kept setup finishes before the private origin starts", async () => {
  const run = startPreparationProofRun({
    spec: "kept-story.proof.ts",
    setup: "backendGlobalSetup.ts",
  });
  try {
    await run.passed();

    // Each case's private origin starts after its kept story is prepared.
    const kept = Object.keys(keptStoryWorkerFixtures);
    for (const name of kept) {
      const [prepared] = run.fixtureSteps(name);
      const origin = run
        .fixtureSteps("origin")
        .find((step) => step.case === name);
      expect(prepared?.case, name).toBe(name);
      expect(prepared?.end, name).toBeLessThanOrEqual(origin?.start ?? 0);
    }
    // The native Codex origin is prepared only for the case that takes it.
    expect(
      run.fixtureSteps("queuedCodexOriginReady").map((step) => step.case),
    ).toEqual(["keptStory"]);
  } finally {
    await run.stop();
  }
});
