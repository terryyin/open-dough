// The freshness command on a Story Branch that shares several best common
// bases with fetched trunk, as after a sibling import or a contributor merge.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  executionBranch,
  git,
  porcelainStatus,
} from "../dough-story-wrap-up/closure-git-fixtures.mjs";
import {
  amendTrunk,
  planOf,
  planPath,
  read,
  recordOf,
  run,
  seedOf,
  seedPath,
  slice,
  sliceOneDone,
  storySection,
  takenStoryBranch,
  takenStoryGraph,
} from "./source-freshness-test-fixtures.mjs";

async function sharedBases({ execution }) {
  const { stdout } = await git(
    execution,
    "merge-base",
    "--all",
    "origin/main",
    "HEAD",
  );
  return stdout.trim().split("\n").sort();
}

// HEAD and every ref on the remote: what a run may not move.
const published = async ({ execution }) =>
  (await git(execution, "rev-parse", "HEAD")).stdout +
  (await git(execution, "ls-remote", "origin")).stdout;

// Runs `command` as `run` does, and checks it committed and pushed nothing.
async function runWithoutPublishing(fixture, command, code) {
  const before = await published(fixture);
  const report = await run(fixture, command, code);
  assert.equal(await published(fixture), before);
  return report;
}

// Trunk merged a foreign history that forked before the Take; the branch,
// forked at the Take, merged it too. Best bases: the Take and `foreign`.
const foreignMergeBesideTheTake = (t) =>
  takenStoryGraph(t, (history) =>
    history
      .withRevision("foreign", { parents: ["before the Take"] })
      .withRevision("trunk merge", { parents: ["take", "foreign"] })
      .withWorkspace(executionBranch, { from: "take" })
      .withUnpublishedRevision("slice 1", sliceOneDone)
      .withUnpublishedRevision("branch merge", {
        parents: ["slice 1", "foreign"],
      }),
  );

test("a Take on one of two shared bases is the base, and an unchanged source proceeds", async (t) => {
  const fixture = await foreignMergeBesideTheTake(t);
  const { revisions } = fixture;
  assert.deepEqual(
    await sharedBases(fixture),
    [revisions.take, revisions.foreign].sort(),
  );

  const report = await run(fixture, "check", 0);
  assert.equal(report.result, "unchanged");
  assert.equal(report.base, revisions.take);
  assert.equal(report.trunkRevision, revisions["trunk merge"]);
  assert.equal(recordOf(report, "story").state, "unchanged");
  assert.equal(recordOf(report, "plan").state, "unchanged");
});

test("a story promise added on trunk beside two shared bases is amended from the Taken base, and absorb writes it", async (t) => {
  const fixture = await foreignMergeBesideTheTake(t);
  const promised = storySection("\n\nPromise two from the owner.");
  const amendedSeed = seedOf({ story: promised });
  const trunk = await amendTrunk(fixture, { [seedPath]: amendedSeed });

  const report = await run(fixture, "check", 1);
  assert.equal(report.result, "amended");
  assert.equal(report.trunkRevision, trunk);
  assert.equal(report.base, fixture.take);
  const story = recordOf(report, "story");
  assert.equal(story.state, "amended");
  assert.equal(story.application, promised);
  assert.match(story.change, /^\+Promise two from the owner\.$/m);
  assert.equal(recordOf(report, "plan").state, "unchanged");
  assert.equal(await porcelainStatus(fixture.execution), "");

  const absorbed = await runWithoutPublishing(fixture, "absorb", 0);
  assert.deepEqual(absorbed.written, [seedPath]);
  assert.equal(await porcelainStatus(fixture.execution), ` M ${seedPath}\n`);
  assert.equal(read(fixture, seedPath), amendedSeed);
  assert.equal((await run(fixture, "check", 0)).result, "unchanged");
});

test("two shared bases that both predate the Take are refused, naming both", async (t) => {
  const fixture = await takenStoryGraph(t, (history) =>
    history
      .withRevision("left", { parents: ["before the Take"] })
      .withRevision("right", { parents: ["before the Take"] })
      .withRevision("sides merge", { parents: ["take", "left"] })
      .withRevision("trunk merge", { parents: ["sides merge", "right"] })
      .withWorkspace(executionBranch, { from: "left" })
      .withUnpublishedRevision("early merge", { parents: ["left", "right"] }),
  );
  const bases = [fixture.revisions.left, fixture.revisions.right].sort();
  assert.deepEqual(await sharedBases(fixture), bases);

  for (const command of ["check", "absorb"]) {
    const refused = await run(fixture, command, 3);
    assert.equal(refused.result, "refused");
    assert.equal(refused.reason, "not-taken-at-base");
    assert.deepEqual([...refused.bases].sort(), bases);
    for (const base of bases) assert.ok(refused.message.includes(base));
  }
  assert.equal(await porcelainStatus(fixture.execution), "");
});

// Trunk changed `amended` after the Take, then merged sibling `s1` (forked at
// the Take) and sibling `s2` (forked at the change); the branch, forked at
// the Take, imported both. Best bases: `s1` and `s2`, each holding the Take.
const twoTakenBases = (t, amended) =>
  takenStoryGraph(t, (history) =>
    history
      .withRevision("amend", { files: amended })
      .withRevision("s1", { parents: ["take"] })
      .withRevision("merge s1", { parents: ["amend", "s1"] })
      .withRevision("s2", { parents: ["amend"] })
      .withRevision("merge s2", { parents: ["merge s1", "s2"] })
      .withWorkspace(executionBranch, { from: "take" })
      .withUnpublishedRevision("slice 1", sliceOneDone)
      .withUnpublishedRevision("import s1", { parents: ["slice 1", "s1"] })
      .withUnpublishedRevision("import s2", { parents: ["import s1", "s2"] }),
  );
const takenBasesOf = ({ revisions }) => [revisions.s1, revisions.s2].sort();

// A compared record amended on trunk between the two Taken bases.
const disagreements = [
  {
    record: "plan",
    path: planPath,
    text: planOf(slice(1, "A"), slice(2, "B"), slice(3, "C")),
  },
  {
    record: "story",
    path: seedPath,
    text: seedOf({ story: storySection("\n\nPromise two from the owner.") }),
  },
];
for (const { record, path, text } of disagreements)
  test(`two Taken bases with the ${record} amended between them are refused, naming both and the ${record}`, async (t) => {
    const fixture = await twoTakenBases(t, { [path]: text });
    const bases = takenBasesOf(fixture);
    assert.deepEqual(await sharedBases(fixture), bases);

    for (const command of ["check", "absorb"]) {
      const refused = await runWithoutPublishing(fixture, command, 3);
      assert.equal(refused.result, "refused");
      assert.equal(refused.reason, "ambiguous-base");
      assert.deepEqual([...refused.bases].sort(), bases);
      assert.equal(refused.record, record);
      assert.equal(refused.path, path);
      for (const named of [...bases, path])
        assert.ok(refused.message.includes(named));
      assert.equal(await porcelainStatus(fixture.execution), "");
    }
  });

test("two Taken bases whose story and plan read the same proceed from one of them", async (t) => {
  const fixture = await twoTakenBases(t, {
    [seedPath]: seedOf({ sibling: "Sibling text amended on trunk." }),
  });
  const bases = takenBasesOf(fixture);
  assert.deepEqual(await sharedBases(fixture), bases);

  for (const command of ["check", "absorb"]) {
    const report = await runWithoutPublishing(fixture, command, 0);
    assert.equal(report.result, "unchanged");
    assert.ok(bases.includes(report.base), report.base);
    assert.equal(recordOf(report, "story").state, "unchanged");
    assert.equal(recordOf(report, "plan").state, "unchanged");
    assert.equal(await porcelainStatus(fixture.execution), "");
  }
});

test("a branch sharing no history with fetched trunk is refused", async (t) => {
  const fixture = await takenStoryBranch(t);
  await git(fixture.execution, "checkout", "-q", "--orphan", "unrelated");
  await git(fixture.execution, "commit", "-q", "-m", "unrelated root");

  const refused = await run(fixture, "check", 3);
  assert.equal(refused.reason, "no-common-base");
  assert.equal(await porcelainStatus(fixture.execution), "");
});
