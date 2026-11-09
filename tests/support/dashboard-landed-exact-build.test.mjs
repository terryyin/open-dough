// Story Branch Landed at a landing whose own build answers it
// (`lookupResultBuild`): a rerun attempt's own build and a timed-out
// landing stay exact without walking forward to a later trunk build, the
// timed-out landing naming its own build as the one it could not use. A
// cancelled landing's forward walk is in
// ./dashboard-later-trunk-landed.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { lookupResultBuild } from "../../dashboard/server/baseCiRevisionLookup.ts";
import {
  exactFor,
  lookupOf,
  ownBuild,
  sourceFor,
  run,
  trunk,
} from "./dashboard-later-trunk-fixture.mjs";

test("Story Branch Landed keeps a rerun attempt's own build and a timed-out landing exact without walking forward, naming the timed-out build", async (t) => {
  const repo = await trunk(t);
  const [later1] = repo.later;
  const exact = exactFor();
  const rerun = lookupOf({
    [repo.landing]: [run(repo.landing, 41, "success", { attempt: 2 })],
    [later1]: [run(later1, 42, "success")],
  });
  const own = await lookupResultBuild(
    repo.landing,
    repo.landing,
    sourceFor(repo, rerun.lookup),
    "missing",
    exact,
  );
  assert.equal(own.kind, "build");
  assert.equal(own.runId, 41);
  assert.equal(own.selection, "exact");
  assert.equal(own.requestedStatus, undefined);
  assert.ok(!rerun.listed.includes(later1));

  const timedOut = lookupOf({
    [repo.landing]: [run(repo.landing, 51, "timed_out")],
    [later1]: [run(later1, 52, "success")],
  });
  const slot = await lookupResultBuild(
    repo.landing,
    repo.landing,
    sourceFor(repo, timedOut.lookup),
    "missing",
    exact,
  );
  assert.deepEqual(slot, {
    kind: "none",
    explanation: "The CI build at the landing merge timed out.",
    cancelled: true,
    unusableBuild: ownBuild(repo.landing, 51),
  });
  assert.ok(!timedOut.listed.includes(later1));
});
