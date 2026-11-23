import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { syncBuiltinESMExports } from "node:module";
import { promisify } from "node:util";

// Every Git child the publisher starts, as the executable it named. The
// recorders are in place before any module that binds `node:child_process`
// loads, so the fixtures load afterwards too.
const started = [];
const { execFile, spawn } = childProcess;
const recording =
  (start) =>
  (file, args, ...rest) => {
    started.push({ file, subcommand: args?.[0] });
    return start(file, args, ...rest);
  };
childProcess.execFile = Object.assign(recording(execFile), {
  [promisify.custom]: recording(execFile[promisify.custom]),
});
childProcess.spawn = recording(spawn);
syncBuiltinESMExports();
const { git } =
  await import("../../../src/skills/dough-execute-plan/scripts/publication-git.mjs");
const { materializeRepository } =
  await import("../../support/repository-fixture.mjs");
const { trunkWithOneUnpublishedIncrement } =
  await import("./publication-clean-trunk-fixtures.mjs");

async function publisherChildren(t, searchPath) {
  const base = await materializeRepository(trunkWithOneUnpublishedIncrement);
  const previous = process.env.PATH;
  process.env.PATH = searchPath;
  t.after(() => {
    process.env.PATH = previous;
    base.cleanup();
  });
  started.length = 0;
  await git(base.execution, "rev-parse", "HEAD");
  await git(base.execution, "push", "origin", "HEAD:refs/heads/probe");
  const child = (subcommand) =>
    started.find((call) => call.subcommand === subcommand)?.file;
  return { local: child("rev-parse"), push: child("push") };
}

test(
  "Apple's Git launcher on PATH starts the developer-tool Git directly",
  { skip: process.platform !== "darwin" && "Apple's launcher is macOS only" },
  async (t) => {
    const selected = await promisify(execFile)("/usr/bin/xcrun", ["-f", "git"]);
    const children = await publisherChildren(t, "/usr/bin:/bin");
    assert.deepEqual(children, {
      local: selected.stdout.trim(),
      push: selected.stdout.trim(),
    });
  },
);

test("a Git the caller puts first on PATH keeps the ordinary invocation", async (t) => {
  const shimDir = mkdtempSync(join(tmpdir(), "caller-git-"));
  t.after(() => rmSync(shimDir, { recursive: true, force: true }));
  const log = join(shimDir, "calls.log");
  const realGit = (
    await promisify(execFile)("/bin/sh", ["-c", "command -v git"])
  ).stdout.trim();
  writeFileSync(
    join(shimDir, "git"),
    `#!/bin/sh\necho "$1" >> '${log}'\nexec '${realGit}' "$@"\n`,
    { mode: 0o755 },
  );
  const children = await publisherChildren(t, `${shimDir}:/usr/bin:/bin`);
  assert.deepEqual(children, { local: "git", push: "git" });
  assert.deepEqual(readFileSync(log, "utf8").trim().split("\n").slice(0, 2), [
    "rev-parse",
    "push",
  ]);
});
