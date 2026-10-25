// The freshness command on a bare origin whose trunk holds a Take and an
// execution branch forked at it, with trunk amended (or not) by a human.
import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  executionBranch,
  git,
  integrateCommand,
  porcelainStatus,
  runScript,
} from "../../dough-story-wrap-up/scripts/closure-git-fixtures.mjs";
import {
  amendTrunk,
  branchPlan,
  cli,
  commitTree,
  planOf,
  planPath,
  read,
  recordOf,
  run,
  seedOf,
  seedPath,
  slice,
  storySection,
  takenEntries,
  takenStoryBranch,
  writeTree,
} from "./source-freshness-test-fixtures.mjs";

test("a story promise and a plan slice added on trunk are amended, and absorb writes exactly their application", async (t) => {
  const fixture = await takenStoryBranch(t);
  const amendedSeed = seedOf({
    story: storySection("\n\nPromise two from the owner."),
  });
  const amendedPlan = planOf(slice(1, "A"), slice(2, "B"), slice(3, "C"));
  const trunk = await amendTrunk(fixture, {
    [seedPath]: amendedSeed,
    [planPath]: amendedPlan,
  });

  const report = await run(fixture, "check", 1);
  assert.equal(report.result, "amended");
  assert.equal(report.trunkRevision, trunk);
  assert.equal(report.base, fixture.take);
  const story = recordOf(report, "story");
  assert.equal(story.state, "amended");
  assert.equal(story.path, seedPath);
  assert.equal(
    story.application,
    storySection("\n\nPromise two from the owner."),
  );
  assert.match(story.change, /^\+Promise two from the owner\.$/m);
  const plan = recordOf(report, "plan");
  assert.equal(plan.state, "amended");
  assert.equal(plan.path, planPath);
  assert.equal(
    plan.application,
    planOf(slice(1, "A", { status: "done" }), slice(2, "B"), slice(3, "C")),
  );
  assert.match(plan.change, /^\+### 3\. C$/m);
  assert.equal(await porcelainStatus(fixture.execution), "");

  const absorbed = await run(fixture, "absorb", 0);
  assert.deepEqual(absorbed.written, [seedPath, planPath]);
  assert.equal(
    await porcelainStatus(fixture.execution),
    ` M ${seedPath}\n M ${planPath}\n`,
  );
  assert.equal(read(fixture, seedPath), amendedSeed);
  assert.equal(read(fixture, planPath), plan.application);

  const settled = await run(fixture, "check", 0);
  assert.equal(settled.result, "unchanged");
  assert.deepEqual(
    settled.records.map((item) => item.state),
    ["unchanged", "unchanged"],
  );
});

test("with the system temporary directory unwritable, check and absorb compare inside the repository and leave only the records changed", async (t) => {
  const fixture = await takenStoryBranch(t);
  const unwritable = mkdtempSync(join(tmpdir(), "source-freshness-tmp-"));
  chmodSync(unwritable, 0o500);
  t.after(() => {
    chmodSync(unwritable, 0o700);
    rmSync(unwritable, { recursive: true, force: true });
  });
  const env = { ...process.env, TMPDIR: unwritable, TMP: unwritable };
  const amendedPlan = planOf(slice(1, "A"), slice(2, "B"), slice(3, "C"));
  await amendTrunk(fixture, { [planPath]: amendedPlan });

  const report = await run(fixture, "check", 1, undefined, env);
  assert.equal(report.result, "amended");
  assert.equal(
    recordOf(report, "plan").application,
    planOf(slice(1, "A", { status: "done" }), slice(2, "B"), slice(3, "C")),
  );
  assert.equal(await porcelainStatus(fixture.execution), "");

  const absorbed = await run(fixture, "absorb", 0, undefined, env);
  assert.deepEqual(absorbed.written, [planPath]);
  assert.equal(await porcelainStatus(fixture.execution), ` M ${planPath}\n`);
  const gitDir = (
    await git(fixture.execution, "rev-parse", "--absolute-git-dir")
  ).stdout.trim();
  assert.deepEqual(
    readdirSync(gitDir).filter((name) => name.startsWith("source-freshness")),
    [],
  );
});

test("a plan-only amendment over the branch's status edits keeps them done", async (t) => {
  const fixture = await takenStoryBranch(t);
  // An uncommitted plan edit of the slice being delivered stays in the merge.
  const delivering = planOf(
    slice(1, "A", { status: "done" }),
    slice(2, "B", { status: "done" }),
  );
  writeTree(fixture.execution, { [planPath]: delivering });
  await amendTrunk(fixture, {
    [planPath]: planOf(
      slice(1, "A"),
      slice(2, "B"),
      slice(3, "C", { behavior: "owner's added slice." }),
    ),
  });

  const report = await run(fixture, "check", 1);
  assert.equal(recordOf(report, "story").state, "unchanged");
  const plan = recordOf(report, "plan");
  assert.equal(plan.state, "amended");
  const merged = planOf(
    slice(1, "A", { status: "done" }),
    slice(2, "B", { status: "done" }),
    slice(3, "C", { behavior: "owner's added slice." }),
  );
  assert.equal(plan.application, merged);

  const absorbed = await run(fixture, "absorb", 0);
  assert.deepEqual(absorbed.written, [planPath]);
  assert.equal(read(fixture, planPath), merged);
  assert.equal(read(fixture, seedPath), seedOf());
});

test("a sibling-section edit, unrelated files and a release commit leave the source unchanged", async (t) => {
  const fixture = await takenStoryBranch(t);
  await amendTrunk(fixture, {
    [seedPath]: seedOf({ sibling: "Sibling text, amended." }),
  });
  await advanceOriginFromAnotherWriter(fixture.origin, {
    file: "trunk-only.txt",
  });
  await amendTrunk(
    fixture,
    { VERSION: "0.9.1\n", "CHANGELOG.md": "# Changelog\n\n## 0.9.1\n" },
    "Release 0.9.1",
  );

  const report = await run(fixture, "check", 0);
  assert.equal(report.result, "unchanged");
  assert.deepEqual(report.records, [
    { record: "story", path: seedPath, state: "unchanged" },
    { record: "plan", path: planPath, state: "unchanged" },
  ]);
  const absorbed = await run(fixture, "absorb", 0);
  assert.deepEqual(absorbed.written, []);
  assert.equal(await porcelainStatus(fixture.execution), "");
  assert.equal(existsSync(join(fixture.execution, "trunk-only.txt")), false);
});

for (const [name, amendedPlan, reason] of [
  [
    "a rewritten done slice",
    planOf(slice(1, "A", { behavior: "does A another way." }), slice(2, "B")),
    "done-slice",
  ],
  ["a removed done slice", planOf(slice(2, "B")), "overlapping-edit"],
]) {
  test(`${name} is a conflict, and absorb writes nothing`, async (t) => {
    const fixture = await takenStoryBranch(t);
    await amendTrunk(fixture, { [planPath]: amendedPlan });

    const report = await run(fixture, "check", 2);
    assert.equal(report.result, "conflict");
    const plan = recordOf(report, "plan");
    assert.equal(plan.state, "conflict");
    assert.equal(plan.reason, reason);
    assert.equal(plan.branchText, branchPlan);
    assert.equal(plan.trunkText, amendedPlan);
    if (reason === "done-slice")
      assert.deepEqual(plan.slices, [
        { index: 1, name: "A", change: "changed" },
      ]);

    const absorbed = await run(fixture, "absorb", 2);
    assert.equal(absorbed.result, "conflict");
    assert.deepEqual(absorbed.written, []);
    assert.equal(await porcelainStatus(fixture.execution), "");
  });
}

test("a quick story's Taken entry without a plan link compares its story section alone", async (t) => {
  const untouched = await takenStoryBranch(t, takenEntries.quick);
  const settled = await run(untouched, "check", 0);
  assert.equal(settled.result, "unchanged");
  assert.deepEqual(settled.records, [
    { record: "story", path: seedPath, state: "unchanged" },
  ]);

  const fixture = await takenStoryBranch(t, takenEntries.quick);
  const amendedSeed = seedOf({
    story: storySection("\n\nPromise two from the owner."),
  });
  await amendTrunk(fixture, { [seedPath]: amendedSeed });
  const report = await run(fixture, "check", 1);
  assert.equal(report.result, "amended");
  assert.deepEqual(
    report.records.map(({ record, path, state }) => ({ record, path, state })),
    [{ record: "story", path: seedPath, state: "amended" }],
  );

  const absorbed = await run(fixture, "absorb", 0);
  assert.deepEqual(absorbed.written, [seedPath]);
  assert.equal(await porcelainStatus(fixture.execution), ` M ${seedPath}\n`);
  assert.equal(read(fixture, seedPath), amendedSeed);
  assert.equal((await run(fixture, "check", 0)).result, "unchanged");
});

test("a plan-homed correction compares its home as the plan, absorbing an added slice", async (t) => {
  const fixture = await takenStoryBranch(t, takenEntries.planHomed);
  await amendTrunk(fixture, {
    [planPath]: planOf(slice(1, "A"), slice(2, "B"), slice(3, "C")),
  });

  const report = await run(fixture, "check", 1);
  assert.equal(report.result, "amended");
  assert.equal(report.records.length, 1);
  const plan = recordOf(report, "plan");
  assert.equal(plan.path, planPath);
  assert.equal(plan.state, "amended");
  const merged = planOf(
    slice(1, "A", { status: "done" }),
    slice(2, "B"),
    slice(3, "C"),
  );
  assert.equal(plan.application, merged);

  const absorbed = await run(fixture, "absorb", 0);
  assert.deepEqual(absorbed.written, [planPath]);
  assert.equal(await porcelainStatus(fixture.execution), ` M ${planPath}\n`);
  assert.equal(read(fixture, planPath), merged);
  assert.equal((await run(fixture, "check", 0)).result, "unchanged");
});

test("a plan-homed correction's done slice rewritten on trunk is a conflict", async (t) => {
  const fixture = await takenStoryBranch(t, takenEntries.planHomed);
  const amendedPlan = planOf(
    slice(1, "A", { behavior: "does A another way." }),
    slice(2, "B"),
  );
  await amendTrunk(fixture, { [planPath]: amendedPlan });

  const report = await run(fixture, "check", 2);
  assert.equal(report.result, "conflict");
  assert.equal(report.records.length, 1);
  const plan = recordOf(report, "plan");
  assert.equal(plan.path, planPath);
  assert.equal(plan.reason, "done-slice");
  assert.deepEqual(plan.slices, [{ index: 1, name: "A", change: "changed" }]);
  const absorbed = await run(fixture, "absorb", 2);
  assert.deepEqual(absorbed.written, []);
  assert.equal(await porcelainStatus(fixture.execution), "");
});

test("a linked plan present at the Take and removed on trunk is refused", async (t) => {
  const fixture = await takenStoryBranch(t);
  await amendTrunk(fixture, { [planPath]: null });

  const refused = await run(fixture, "check", 3);
  assert.equal(refused.reason, "record-absent");
  assert.equal(refused.record, "plan");
  assert.equal(refused.path, planPath);
  assert.deepEqual(refused.absentAt, ["trunk"]);
});

test("work not Taken on fetched trunk or at the branch's base is refused", async (t) => {
  const fixture = await takenStoryBranch(t);
  const missing = await run(fixture, "check", 3, "SEED-900#other");
  assert.equal(missing.result, "refused");
  assert.equal(missing.reason, "not-taken");

  // A branch forked before the Take has no Taken entry at its base.
  await git(fixture.execution, "checkout", "-q", "-b", "early", "HEAD~2");
  const early = await run(fixture, "absorb", 3);
  assert.equal(early.reason, "not-taken-at-base");
  assert.equal(await porcelainStatus(fixture.execution), "");

  const invalid = await runScript(
    cli,
    "check",
    "--workspace",
    fixture.execution,
  );
  assert.equal(invalid.code, 3);
  assert.equal(JSON.parse(invalid.stdout).reason, "invalid-input");
});

test("without the check, closure integration conflicts on a section and plan the owner amended on trunk", async (t) => {
  const fixture = await takenStoryBranch(t);
  const { execution } = fixture;
  await amendTrunk(fixture, {
    [seedPath]: seedOf({
      story: storySection("\n\nPromise two from the owner."),
    }),
    [planPath]: planOf(slice(1, "A"), slice(2, "B"), slice(3, "C")),
  });
  // Wrap-up deletes the branch's stale copy of both records.
  const closure = await commitTree(
    execution,
    {
      [seedPath]: seedOf({ story: "" }).replace("\n\n\n\n", "\n\n"),
      [planPath]: null,
    },
    "story closure",
  );
  await git(
    execution,
    "push",
    "-q",
    "origin",
    `HEAD:refs/heads/${executionBranch}`,
  );

  const stopped = await integrateCommand(execution, closure);
  assert.equal(stopped.code, 1, stopped.stderr);
  const result = JSON.parse(stopped.stdout);
  assert.equal(result.classification, "preserved");
  assert.equal(result.reason, "conflict");
  assert.deepEqual(
    [...result.conflictedPaths].sort(),
    [seedPath, planPath].sort(),
  );
  assert.equal(result.pushCount, 0);
});
