import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { symlinkSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  committedLintFixture,
  env,
  gitOk,
  root,
  violation,
  write,
} from "./lint-runner-fixture.mjs";
import { makeMe } from "./makeMe.mjs";

function lint(cwd) {
  const result = spawnSync("node", ["scripts/lint.mjs"], {
    cwd,
    env,
    encoding: "utf8",
  });
  return { status: result.status, output: result.stdout + result.stderr };
}

// A committed repository running this repository's lint runner and config,
// holding clean source and an ignored nested build bundle with a violation.
function lintFixture(t) {
  return committedLintFixture(
    t,
    makeMe.aRepository
      .withRevision("fixture", {
        backlog: undefined,
        files: {
          "src/ok.mjs": "export const ok = 1;\n",
          "dashboard/dashboard/dist/assets/b.js": violation,
        },
      })
      .please(),
  );
}

test("lint reports no finding for ignored nested build output, consistently", async (t) => {
  const fixture = await lintFixture(t);

  const clean = lint(fixture);
  assert.equal(clean.status, 0, clean.output);
  assert.doesNotMatch(clean.output, /b\.js|problem/);
  assert.deepEqual(lint(fixture), clean);
});

test("lint fails on a worktree's violation only inside that worktree", async (t) => {
  const fixture = await lintFixture(t);
  const worktree = join(fixture, ".worktrees/w");
  gitOk(fixture, "worktree", "add", "--quiet", worktree);
  symlinkSync(join(root, "node_modules"), join(worktree, "node_modules"));
  write(join(worktree, "src/bad.mjs"), violation);

  const enclosing = lint(fixture);
  assert.equal(enclosing.status, 0, enclosing.output);
  assert.doesNotMatch(enclosing.output, /bad\.mjs/);
  const inside = lint(worktree);
  assert.equal(inside.status, 1, inside.output);
  assert.match(inside.output, /src\/bad\.mjs[\s\S]*no-var/);
});

test("lint still checks new untracked source", async (t) => {
  const fixture = await lintFixture(t);
  write(join(fixture, "src/new.mjs"), violation);

  const untracked = lint(fixture);
  assert.equal(untracked.status, 1, untracked.output);
  assert.match(untracked.output, /src\/new\.mjs[\s\S]*no-var/);
});
