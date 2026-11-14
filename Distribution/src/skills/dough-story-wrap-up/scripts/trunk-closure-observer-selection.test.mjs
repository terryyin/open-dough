// Which of its coordinator's observers closure selects while that coordinator
// holds a live one, with real workers. Beside one ended observer that
// registered the final closure, whatever its record holds, and beside several
// such: the one live observer the coordinator holds, before that observer
// registers it; none when it holds several live ones. An observer claimed
// after the coordinator's observers were listed is never selected. Selection
// among ended observers alone is proven in
// `trunk-closure-observer-ended-selection.test.mjs`; the other gaps' reasons
// and directories through the installed `finish` in
// `trunk-closure-owner-gaps.test.mjs`.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  coverage,
  siblingCheckouts,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  attempt,
  claimed,
  endedCovering,
  observe,
  observersOf,
  states,
} from "./trunk-closure-observer-selection-test-fixtures.mjs";

test("closure selects none of several ended observers that each registered the final closure, and selects its coordinator's one live observer that has yet to register it beside them", async (t) => {
  const checkouts = await siblingCheckouts(t, "cursor");
  const sha = "a".repeat(40);
  await endedCovering(checkouts, sha, 2);
  const select = async () => (await observersOf(checkouts.fixture)).select(sha);

  assert.equal((await select()).gap.ownership, "ended");

  const live = await claimed(checkouts);
  assert.equal((await select()).directory, live);
});

for (const [record, conclusion, state] of [
  ["a verdict", "success", "success"],
  ["only a cancelled attempt", "cancelled", "incomplete"],
]) {
  test(`closure selects its coordinator's one live observer that has yet to register the final closure beside one ended observer whose record of it holds ${record}`, async (t) => {
    const checkouts = await siblingCheckouts(t, "cursor");
    const sha = "f".repeat(40);
    const ended = await endedCovering(checkouts, sha, 1);
    await observe(ended[0], attempt(sha, conclusion));
    assert.deepEqual(states(ended, sha), [state]);
    const live = await claimed(checkouts);

    const selected = (await observersOf(checkouts.fixture)).select(sha);

    assert.equal(selected.directory, live);
    assert.deepEqual(coverage(live), []);
  });
}

test("closure selects none of its coordinator's several live observers that have yet to register the final closure, nor the one ended observer that registered it beside them", async (t) => {
  const checkouts = await siblingCheckouts(t, "cursor");
  const sha = "9".repeat(40);
  const ended = await endedCovering(checkouts, sha, 1);
  await observe(ended[0], attempt(sha, "success"));
  assert.deepEqual(states(ended, sha), ["success"]);
  const live = [await claimed(checkouts), await claimed(checkouts)];

  const { gap, directory } = (await observersOf(checkouts.fixture)).select(sha);

  assert.equal(directory, undefined);
  assert.equal(gap.state, "unobserved");
  assert.equal(gap.ownership, "ambiguous");
  assert.match(gap.reason, /owns 2 live observers of owner\/project main/);
  assert.deepEqual(gap.directories.toSorted(), live.toSorted());
  for (const observer of live) assert.deepEqual(coverage(observer), []);
});

test("closure names an observer its coordinator claimed after its observers were listed as one that went live, with the rerun that registers on it", async (t) => {
  const checkouts = await siblingCheckouts(t, "cursor");
  const observers = await observersOf(checkouts.fixture, "late-coordinator");
  assert.deepEqual(observers.directories, []);
  const late = await claimed(checkouts, "late-coordinator");

  const { gap } = observers.select("a".repeat(40));

  assert.equal(gap.state, "unobserved");
  assert.equal(gap.ownership, "live");
  assert.deepEqual(gap.directories, [late]);
  assert.match(
    gap.reason,
    new RegExp(
      `observer at ${late} went live while this finish ran; rerunning this finish registers on it$`,
    ),
  );
  assert.deepEqual(coverage(late), []);
});
