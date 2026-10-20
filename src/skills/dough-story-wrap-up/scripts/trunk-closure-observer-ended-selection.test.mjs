// Which of its coordinator's ended observers closure selects when none is
// live and one or several each registered the final closure, with real
// workers. The ended observers whose records hold a CI verdict for the closure
// decide, one as several: one of them when those verdicts agree, none when
// they differ, and a record that holds no verdict (nothing yet, or a cancelled
// attempt) neither identifies one nor counts against one. Selection beside a
// live observer is proven in `trunk-closure-observer-selection.test.mjs`.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { publishJson } from "../../dough-execute-plan/scripts/ci-mailbox-json-file.mjs";
import { siblingCheckouts } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  attempt,
  claimed,
  endedCovering,
  observe,
  observersOf,
  states,
} from "./trunk-closure-observer-selection-test-fixtures.mjs";

// `count` ended observers of the coordinator that each registered `sha`, in
// the order closure lists them, with what selecting among them returns.
async function endedListed(t, sha, count) {
  const checkouts = await siblingCheckouts(t, "cursor");
  const ended = await endedCovering(checkouts, sha, count);
  const listed = (await observersOf(checkouts.fixture)).directories;
  assert.deepEqual(listed.toSorted(), ended.toSorted());
  return {
    listed,
    select: async () => (await observersOf(checkouts.fixture)).select(sha),
  };
}

function assertEndedGap({ gap, directory }, listed) {
  assert.equal(directory, undefined);
  assert.equal(gap.ownership, "ended");
  assert.match(
    gap.reason,
    listed.length > 1
      ? new RegExp(
          `${listed.length} of its observers each registered this revision`,
        )
      : new RegExp(
          `its observer at ${listed[0]} registered this revision and its record holds no CI verdict for it`,
        ),
  );
  assert.deepEqual(gap.directories.toSorted(), listed.toSorted());
}

test("closure selects, among several ended observers that each registered the final closure, the first whose record holds a verdict when those verdicts agree, and none when they differ", async (t) => {
  const sha = "b".repeat(40);
  const { listed, select } = await endedListed(t, sha, 3);

  // One holds the verdict; the others ended before they saw it.
  await observe(listed[1], attempt(sha, "success"));
  assert.deepEqual(states(listed, sha), [
    "undiscovered",
    "success",
    "undiscovered",
  ]);
  assert.equal((await select()).directory, listed[1]);

  // Every record that holds a verdict holds the same one.
  await observe(listed[2], attempt(sha, "success"));
  assert.equal((await select()).directory, listed[1]);
  await observe(listed[0], attempt(sha, "success"));
  assert.equal((await select()).directory, listed[0]);

  // Verdicts that differ identify none to trust.
  await observe(listed[2], attempt(sha, "failure"));
  assert.deepEqual(states(listed, sha), ["success", "success", "failure"]);
  assertEndedGap(await select(), listed);
});

test("closure selects its coordinator's one ended observer that registered the final closure when its record holds a verdict, and none while it holds nothing or only a cancelled attempt", async (t) => {
  const sha = "a".repeat(40);
  const { listed, select } = await endedListed(t, sha, 1);

  assert.deepEqual(states(listed, sha), ["undiscovered"]);
  assertEndedGap(await select(), listed);

  await observe(listed[0], attempt(sha, "cancelled"));
  assert.deepEqual(states(listed, sha), ["incomplete"]);
  assertEndedGap(await select(), listed);

  await observe(listed[0], attempt(sha, "success"));
  assert.deepEqual(states(listed, sha), ["success"]);
  assert.equal((await select()).directory, listed[0]);
});

test("closure selects, of its coordinator's two ended observers only one of which registered the final closure, none while that one's record holds no verdict, and that one once it holds one", async (t) => {
  const sha = "f".repeat(40);
  const checkouts = await siblingCheckouts(t, "cursor");
  const other = await claimed(checkouts);
  await checkouts.fixture.stopObserver(other);
  const [registered] = await endedCovering(checkouts, sha, 1);
  const observers = async () => observersOf(checkouts.fixture);
  assert.deepEqual(
    (await observers()).directories.toSorted(),
    [other, registered].toSorted(),
  );

  assertEndedGap((await observers()).select(sha), [registered]);
  await observe(registered, attempt(sha, "cancelled"));
  assert.deepEqual(states([registered], sha), ["incomplete"]);
  assertEndedGap((await observers()).select(sha), [registered]);

  await observe(registered, attempt(sha, "success"));
  assert.equal((await observers()).select(sha).directory, registered);
});

test("closure selects none of several ended observers whose records each hold only a cancelled attempt of the final closure", async (t) => {
  const sha = "c".repeat(40);
  const { listed, select } = await endedListed(t, sha, 2);

  for (const directory of listed)
    await observe(directory, attempt(sha, "cancelled"));
  assert.deepEqual(states(listed, sha), ["incomplete", "incomplete"]);

  assertEndedGap(await select(), listed);
});

test("closure selects the ended observer whose record holds a verdict beside ended observers whose records hold a cancelled attempt, whether the verdict is the closure's own or its basis's", async (t) => {
  const sha = "d".repeat(40);
  const basis = "e".repeat(40);
  const { listed, select } = await endedListed(t, sha, 3);

  await observe(listed[0], attempt(sha, "cancelled"));
  await observe(listed[1], attempt(sha, "success"));
  assert.deepEqual(states(listed, sha), [
    "incomplete",
    "success",
    "undiscovered",
  ]);
  assert.equal((await select()).directory, listed[1]);

  await observe(listed[1], attempt(sha, "failure"));
  assert.equal((await select()).directory, listed[1]);

  // Selection reads the ended observer's stored verdict; it does not poll
  // again or reclassify applicability. Supply the inherited coverage record
  // as its starting condition, without asking observation to accept fake Git
  // ancestry. Real-Git basis refresh is covered by ci-inherited-evidence-refresh.
  await observe(listed[1], attempt(sha, "cancelled"));
  const recordedBasis = (state) =>
    publishJson(join(listed[2], "coverage"), `${sha}.json`, {
      sha,
      state: "not_required",
      basis: { sha: basis, ...(state && { state }) },
    });
  recordedBasis();
  assertEndedGap(await select(), listed);
  recordedBasis("success");
  assert.deepEqual(states(listed, sha), [
    "incomplete",
    "incomplete",
    "not_required:success",
  ]);
  assert.equal((await select()).directory, listed[2]);

  // A cancelled attempt of the basis holds no verdict either.
  recordedBasis("incomplete");
  assertEndedGap(await select(), listed);
});
