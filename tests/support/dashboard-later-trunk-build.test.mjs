import {
  comparisonBuildSource,
  comparisonHistory,
} from "../../dashboard/server/comparisonBuildSource.ts";
// Cancelled-landing forward walk (`../../dashboard/server/laterTrunkBuild.ts`):
// trunk's first-parent revisions after the landing, nearest first; the
// nearest later build with usable proof, past cancelled, unbuilt and
// proofless revisions; stops at a running build, the read trunk head or the
// bound, and says which. Landed's use of the walk lives in
// ./dashboard-later-trunk-landed.test.mjs.
import assert from "node:assert/strict";
import test from "node:test";
import { laterTrunkProofBuild } from "../../dashboard/server/laterTrunkBuild.ts";
import {
  absent,
  lookupOf,
  run,
  trunk,
  usable,
} from "./dashboard-later-trunk-fixture.mjs";

test("the Git history source lists first-parent trunk revisions after the landing, nearest first, within the bound", async (t) => {
  const repo = await trunk(t);
  assert.deepEqual(
    await comparisonHistory(repo.call).laterTrunk(repo.landing, "main", 30),
    repo.later,
  );
  assert.deepEqual(
    await comparisonHistory(repo.call).laterTrunk(repo.landing, "main", 2),
    repo.later.slice(0, 2),
  );
  assert.deepEqual(
    await comparisonHistory(repo.call).laterTrunk(repo.later[3], "main", 30),
    [],
  );
});

test("laterTrunkProofBuild passes cancelled, unbuilt and proofless builds and counts included revisions", async (t) => {
  const repo = await trunk(t);
  const [later1, later2, later3, later4] = repo.later;
  const { listed, lookup } = lookupOf({
    [later1]: [run(later1, 11, "cancelled")],
    [later3]: [run(later3, 13, "success")],
    [later4]: [run(later4, 14, "success")],
  });
  const checked = [];
  const walk = await laterTrunkProofBuild(
    repo.landing,
    "main",
    comparisonBuildSource(lookup, repo.call, "ci.yml", {
      repository: "terryyin/open-dough",
      signal: new AbortController().signal,
    }),
    async (candidate) => {
      checked.push(candidate.runId);
      return candidate.runId === 14 ? undefined : absent("none");
    },
  );
  assert.equal(walk.kind, "found");
  const { build } = walk;
  assert.equal(build?.revision, later4);
  assert.equal(build?.runId, 14);
  assert.equal(build?.state, "pass");
  assert.equal(build?.selection, "later");
  assert.equal(build?.laterWithoutResult, 4);
  assert.deepEqual(listed, [later1, later2, later3, later4]);
  assert.deepEqual(checked, [13, 14]);
  assert.ok(!listed.includes(repo.side));
});

test("laterTrunkProofBuild uses a failed later build with usable proof", async (t) => {
  const repo = await trunk(t);
  const [later1] = repo.later;
  const { listed, lookup } = lookupOf({
    [later1]: [run(later1, 21, "failure")],
  });
  const walk = await laterTrunkProofBuild(
    repo.landing,
    "main",
    comparisonBuildSource(lookup, repo.call, "ci.yml", {
      repository: "terryyin/open-dough",
      signal: new AbortController().signal,
    }),
    usable,
  );
  assert.equal(walk.kind, "found");
  const { build } = walk;
  assert.equal(build?.state, "failed");
  assert.equal(build?.selection, "later");
  assert.equal(build?.laterWithoutResult, 1);
  assert.deepEqual(listed, [later1]);
});

test("laterTrunkProofBuild says where it stopped: a running build, the read trunk head, or the bound", async (t) => {
  const repo = await trunk(t);
  const [later1, later2, later3] = repo.later;
  const running = lookupOf({
    [later1]: [run(later1, 31, "success")],
    [later2]: [run(later2, 32, null, { status: "in_progress" })],
    [later3]: [run(later3, 33, "success")],
  });
  const walk = await laterTrunkProofBuild(
    repo.landing,
    "main",
    comparisonBuildSource(running.lookup, repo.call, "ci.yml", {
      repository: "terryyin/open-dough",
      signal: new AbortController().signal,
    }),
    async (build) => (build.runId === 31 ? absent("expired") : undefined),
  );
  assert.equal(walk.kind, "running");
  assert.equal(walk.build.runId, 32);
  assert.equal(walk.unavailable?.build.revision, later1);
  assert.deepEqual(walk.unavailable?.absence, absent("expired"));
  assert.deepEqual(running.listed, [later1, later2]);

  const atHead = lookupOf({});
  assert.deepEqual(
    await laterTrunkProofBuild(
      repo.later[3],
      "main",
      comparisonBuildSource(atHead.lookup, repo.call, "ci.yml", {
        repository: "terryyin/open-dough",
        signal: new AbortController().signal,
      }),
      usable,
    ),
    { kind: "ended", at: "head" },
  );
  assert.deepEqual(atHead.listed, []);

  // Proofless and cancelled builds up to the head: names the nearest proofless.
  const proofless = lookupOf({
    [later1]: [run(later1, 41, "cancelled")],
    [later2]: [run(later2, 42, "success")],
    [repo.later[3]]: [run(repo.later[3], 44, "success")],
  });
  const ended = await laterTrunkProofBuild(
    repo.landing,
    "main",
    comparisonBuildSource(proofless.lookup, repo.call, "ci.yml", {
      repository: "terryyin/open-dough",
      signal: new AbortController().signal,
    }),
    async (build) =>
      build.runId === 42 ? absent("none") : absent("unreadable"),
  );
  assert.equal(ended.kind, "ended");
  assert.equal(ended.at, "head");
  assert.equal(ended.unavailable?.build.runId, 42);
  assert.deepEqual(ended.unavailable?.absence, absent("none"));

  // Bound reached before the head.
  const bounded = await laterTrunkProofBuild(
    repo.landing,
    "main",
    comparisonBuildSource(proofless.lookup, repo.call, "ci.yml", {
      repository: "terryyin/open-dough",
      signal: new AbortController().signal,
    }),
    async () => absent("none"),
    2,
  );
  assert.equal(bounded.kind, "ended");
  assert.equal(bounded.at, "bound");
  assert.equal(bounded.unavailable?.build.runId, 42);
  // Exactly the bound's revisions up to the head is still the head.
  const exactBound = await laterTrunkProofBuild(
    repo.landing,
    "main",
    comparisonBuildSource(lookupOf({}).lookup, repo.call, "ci.yml", {
      repository: "terryyin/open-dough",
      signal: new AbortController().signal,
    }),
    usable,
    4,
  );
  assert.deepEqual(exactBound, { kind: "ended", at: "head" });
});
