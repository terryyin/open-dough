import assert from "node:assert/strict";
import test from "node:test";
import {
  delivered,
  objectAt,
  observed,
  onlyResult,
  outcomeChange,
  outcomePath,
  publish,
  startWait,
  watchedOutcome,
  watchedRemote,
} from "../../support/wait-for-publication-fixture.mjs";

const beyondJudgment = ["--duration-minutes", "1"];
// An interval no wait in these tests reaches: only an observation made at
// start can end such a wait before its deadline.
const noLaterObservation = ["--interval-seconds", "3600"];

// A wait on the outcome that ends with a publication result for an outcome
// the coordinator does not accept.
async function nonqualifyingResult(t, waitFor) {
  const { supplier, watcher } = await watchedRemote(t);
  const first = startWait(t, watcher, ...watchedOutcome, ...waitFor);
  await observed(watcher, await objectAt(supplier, "HEAD"));
  await publish(supplier, "main", { [outcomePath]: "not yet\n" });
  return { supplier, watcher, ...(await onlyResult(first)) };
}

test("a supplier that publishes a slice and then its completion while the previous result is judged ends the rerun given the returned deadline at once, naming the change from the object that result reported", async (t) => {
  const { supplier, watcher, changes, deadline } = await nonqualifyingResult(
    t,
    beyondJudgment,
  );
  await publish(supplier, "main", { "src/slice.md": "x\n" });
  const completed = await publish(supplier, "main", delivered);

  const rerun = startWait(
    t,
    watcher,
    ...watchedOutcome,
    "--deadline",
    deadline,
    ...noLaterObservation,
  );

  assert.deepEqual(await onlyResult(rerun), {
    result: "publication",
    remote: "origin",
    changes: [await outcomeChange(supplier, changes[0].after, completed)],
    deadline,
  });
});

test("a rerun given the returned deadline with nothing published since prints nothing for the change already reported, and ends on the next one from the object that result reported", async (t) => {
  const { supplier, watcher, changes, deadline } = await nonqualifyingResult(
    t,
    beyondJudgment,
  );

  const rerun = startWait(
    t,
    watcher,
    ...watchedOutcome,
    "--deadline",
    deadline,
  );
  const unrelated = await publish(supplier, "main", { "src/other.md": "x\n" });
  await observed(watcher, unrelated);
  assert.equal(rerun.stdout + rerun.stderr, "");
  const completed = await publish(supplier, "main", delivered);

  assert.deepEqual(await onlyResult(rerun), {
    result: "publication",
    remote: "origin",
    changes: [await outcomeChange(supplier, changes[0].after, completed)],
    deadline,
  });
});

test("a wait with a new duration after a publication result takes its own first observation and stays silent across the push before it", async (t) => {
  const { supplier, watcher, deadline } = await nonqualifyingResult(t, []);
  const further = await publish(supplier, "main", delivered);

  const fresh = startWait(t, watcher, ...watchedOutcome, ...beyondJudgment);
  await observed(watcher, further);
  assert.equal(fresh.stdout + fresh.stderr, "");
  const next = await publish(supplier, "main", { [outcomePath]: "again\n" });

  const result = await onlyResult(fresh);
  assert.deepEqual(result.changes, [
    await outcomeChange(
      supplier,
      await objectAt(supplier, `${further}:${outcomePath}`),
      next,
    ),
  ]);
  assert.notEqual(result.deadline, deadline);
});
