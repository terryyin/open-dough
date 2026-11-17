import assert from "node:assert/strict";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import test from "node:test";
import { git } from "../../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { until } from "../../support/local-test-suite-fixtures.mjs";
import {
  executionWorktree,
  proofFiles,
  shellThroughClock,
} from "../../support/slice-clock-fixture.mjs";

const readRun = (log) => JSON.parse(readFileSync(`${log}.run.json`, "utf8"));
const epoch = Date.parse("2026-11-16T09:00:00Z");

// Regressions: losing command identity before completion, recording the terminal
// state at launch, or suppressing evidence when no slice is running.
test("a run outside an active slice leaves its command and checkout record before launching and completes it before the exit file", async (t) => {
  const { worktree, scratch, time, clock } = await executionWorktree(t);
  const files = proofFiles(scratch, "running");
  const started = join(scratch, "started");
  const release = join(scratch, "release");
  const command = `test -f '${files.log}.run.json' || exit 88; touch '${started}'; until [ -e '${release}' ]; do sleep 0.02; done`;
  const revision = (await git(worktree, "rev-parse", "HEAD")).stdout.trim();
  const log = resolve(realpathSync(worktree), relative(worktree, files.log));
  const exitFile = resolve(
    realpathSync(worktree),
    relative(worktree, files.exitFile),
  );
  const running = clock(
    worktree,
    "run",
    "--log",
    relative(worktree, files.log),
    "--exit-file",
    relative(worktree, files.exitFile),
    "--",
    "sh",
    "-c",
    command,
  );
  await until("the child has seen its run record", () => existsSync(started));

  assert.deepEqual(readRun(files.log), {
    command: ["sh", "-c", command],
    revision,
    uncommittedChanges: false,
    startedAt: epoch,
    log,
    exitFile,
  });
  assert.equal(existsSync(files.exitFile), false);
  time.at(2);
  writeFileSync(release, "");
  const ended = await running;

  assert.equal(ended.exitStatus, 0);
  assert.equal(ended.result.slice, null);
  assert.equal(ended.result.runRecord, `${log}.run.json`);
  assert.equal(readFileSync(files.exitFile, "utf8"), "0\n");
  assert.equal(readRun(files.log).endedAt, epoch + 2 * 60_000);
  assert.equal(readRun(files.log).exitStatus, 0);
});

// Regression: a large failing log leaves no concise recoverable verdict.
test("a failed command's record retains literal arguments, revision and terminal status after large output", async (t) => {
  const { worktree, scratch, clock } = await executionWorktree(t);
  const files = proofFiles(scratch, "failed");
  const script =
    'process.stdout.write("progress\\n".repeat(40000) + "assertion failed\\n"); process.exit(3)';
  const args = ["-e", script, "literal $value; spaces"];
  await clock(worktree, "start", "--identity", "proof", "--slice", "1");

  const ended = await clock(
    worktree,
    "run",
    ...files.flags,
    "--",
    process.execPath,
    ...args,
  );
  const record = readRun(files.log);

  assert.equal(ended.exitStatus, 3);
  assert.equal(record.exitStatus, 3);
  assert.deepEqual(record.command, [process.execPath, ...args]);
  assert.equal(
    record.revision,
    (await git(worktree, "rev-parse", "HEAD")).stdout.trim(),
  );
  assert.equal(readFileSync(files.exitFile, "utf8"), "3\n");
  assert.equal(
    readFileSync(files.log, "utf8").slice(-17),
    "assertion failed\n",
  );
});

// Regression: checkout edits at launch disappear from the evidence identity.
test("the run retains its launch revision and dirty state when the command commits those changes", async (t) => {
  const { worktree, scratch, clock } = await executionWorktree(t);
  const files = proofFiles(scratch, "dirty");
  const revision = (await git(worktree, "rev-parse", "HEAD")).stdout.trim();
  writeFileSync(join(worktree, "README.md"), "changed before proof\n");
  await git(worktree, "add", "README.md");

  const ended = await shellThroughClock(
    clock,
    worktree,
    files,
    "git -c user.name=Clock -c user.email=clock@example.test commit --quiet -m proof-cleans-checkout",
  );

  assert.equal(ended.exitStatus, 0);
  assert.equal(readRun(files.log).uncommittedChanges, true);
  assert.equal(readRun(files.log).revision, revision);
  assert.notEqual(
    (await git(worktree, "rev-parse", "HEAD")).stdout.trim(),
    revision,
  );
  assert.equal((await git(worktree, "status", "--porcelain")).stdout, "");
});

// Regression: a signal or failed executable leaves an unfinished record.
for (const [name, command, status] of [
  ["signal", ["sh", "-c", "kill -TERM $$"], 143],
  ["missing executable", ["no-such-proof-command-open-dough"], 127],
]) {
  test(`a run ended by ${name} records its terminal status`, async (t) => {
    const { worktree, scratch, clock } = await executionWorktree(t);
    const files = proofFiles(scratch, "ended");

    const ended = await clock(
      worktree,
      "run",
      ...files.flags,
      "--",
      ...command,
    );

    assert.equal(ended.exitStatus, status);
    assert.equal(readRun(files.log).exitStatus, status);
    assert.equal(typeof readRun(files.log).endedAt, "number");
    assert.equal(readFileSync(files.exitFile, "utf8"), `${status}\n`);
  });
}
