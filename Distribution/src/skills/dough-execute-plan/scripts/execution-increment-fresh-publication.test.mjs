// The deployed fresh command owns preparation, commit, publication and observer
// ordering; a successful outer output consumer cannot grant those dependencies.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import { localFixture } from "./execution-increment-fresh-test-fixtures.mjs";

const storyTarget = "refs/heads/exec/story";
const trunkTarget = "refs/heads/main";
const publishArgs = (f, target = storyTarget) => [
  "--previously-published-base",
  f.trunkSha,
  "--target-ref",
  target,
  "--repo",
  "owner/project",
  "--host",
  "cursor",
  "--session-json",
  JSON.stringify(f.session),
];

for (const failure of ["preparation", "commit"]) {
  test(`filtered ${failure} failure cannot deliver the older HEAD or establish observation`, async (t) => {
    const f = await localFixture(t);
    if (failure === "preparation")
      f.preparation.formatting = f.logged("formatting", "process.exit(7);");
    else
      writeFileSync(
        f.hook,
        `#!/bin/sh\nprintf 'commit\\n' >> '${f.hookLog}'\nexit 1\n`,
        { mode: 0o755 },
      );
    const trace = join(f.fixture, "git-trace.log");
    const failed = await f.fresh(f.preparation, {
      authority: "publish",
      args: publishArgs(f),
      filtered: true,
      env: { ...f.env, GIT_TRACE: trace },
    });
    assert.equal(failed.code, 0, "cat masks the inner failure");
    assert.equal(failed.result.ok, false);
    assert.equal(
      failed.result.operation,
      failure === "preparation" ? "formatting" : "commit",
    );
    assert.equal(failed.result.commit, null);
    await f.withheld({ hookCalled: failure === "commit" });
    assert.doesNotMatch(
      readFileSync(trace, "utf8"),
      /built-in: git (fetch|push)/,
    );
    assert.notEqual(
      f.before,
      f.trunkSha,
      "an older deliverable HEAD already exists",
    );
    assert.equal(existsSync(join(f.fixture, "calls.jsonl")), false);
  });
}

test("missing publication inputs and a forbidden Story Branch target refuse before preparation or commit", async (t) => {
  const f = await localFixture(t);
  f.preparation.formatting = f.logged("forbidden formatter");
  for (const field of [
    "--previously-published-base",
    "--target-ref",
    "--repo",
  ]) {
    const args = publishArgs(f);
    args.splice(args.indexOf(field), 2);
    const failed = await f.fresh(f.preparation, { authority: "publish", args });
    assert.equal(failed.result.operation, "publication context");
    assert.match(failed.result.error, /missing/);
    await f.withheld();
  }
  const forbidden = await f.fresh(f.preparation, {
    authority: "publish",
    args: publishArgs(f, trunkTarget),
  });
  assert.match(forbidden.result.error, /Story Branch Mode delivers only/);
  assert.equal(existsSync(f.operations), false);
  await f.withheld();
});

for (const [mode, target, extra] of [
  ["story-branch", storyTarget, []],
  ["trunk", trunkTarget, []],
  ["current-branch", trunkTarget, []],
  ["story-branch", trunkTarget, ["--tracking", "one-shot"]],
]) {
  test(`${mode} fresh publication carries its exact successful commit to the authorized ${target}`, async (t) => {
    const f = await localFixture(t);
    writeFileSync(join(f.workspace, "human.txt"), "unrelated human bytes\n");
    const result = await f.fresh(f.preparation, {
      mode,
      authority: "publish",
      args: [...publishArgs(f, target), ...extra],
    });
    const d = result.result;
    assert.equal(result.code, 0, JSON.stringify(d));
    assert.equal(d.publication, "accepted");
    assert.equal(d.commit.sha, await revParse(f.workspace, "HEAD"));
    assert.equal(d.receipt.sha, d.commit.sha);
    assert.equal(await lsRemoteSha(f.origin, target), d.commit.sha);
    assert.equal(
      await lsRemoteSha(
        f.origin,
        target === trunkTarget ? storyTarget : trunkTarget,
      ),
      target === trunkTarget ? "" : f.trunkSha,
    );
    assert.equal(d.observation.state, "attached");
    assert.deepEqual(
      readRevisionCoverage(d.observation.directory).map(({ sha }) => sha),
      [d.commit.sha],
    );
    assert.equal(d.recovery.candidateSha, d.commit.sha);
    assert.equal(d.recovery.suffixBase, f.trunkSha);
    assert.equal(d.recovery.workspace, f.workspace);
    assert.equal(
      readFileSync(join(f.workspace, "human.txt"), "utf8"),
      "unrelated human bytes\n",
    );
    assert.equal(
      (await git(f.workspace, "symbolic-ref", "--short", "HEAD")).stdout.trim(),
      "exec/story",
    );
    assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
  });
}

test("repairing the failed prerequisite publishes the same owned work through one successful commit", async (t) => {
  const f = await localFixture(t);
  const options = { authority: "publish", args: publishArgs(f) };
  f.preparation.formatting = f.logged(
    "failed formatter",
    "fs.writeFileSync('work.txt', 'retained\\n'); process.exit(7);",
  );
  assert.equal((await f.fresh(f.preparation, options)).result.ok, false);
  await f.withheld();
  f.preparation.formatting = f.logged("repaired formatter");
  const d = (await f.fresh(f.preparation, options)).result;
  assert.equal(d.receipt.sha, d.commit.sha);
  assert.equal(
    (await git(f.workspace, "show", `${d.receipt.sha}:work.txt`)).stdout,
    "retained\n",
  );
  assert.equal(
    (
      await git(f.workspace, "rev-list", "--count", `${f.before}..HEAD`)
    ).stdout.trim(),
    "1",
  );
  assert.equal(
    readFileSync(f.operations, "utf8"),
    "failed formatter\nrepaired formatter\n",
  );
});
