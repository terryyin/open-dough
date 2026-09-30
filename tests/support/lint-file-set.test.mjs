import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = fileURLToPath(new URL("../..", import.meta.url));
const violation = "var unused = 1;\nexport default unused;\n";
const env = {
  ...process.env,
  PATH: `${join(root, "node_modules", ".bin")}${delimiter}${process.env.PATH}`,
  GIT_AUTHOR_NAME: "Lint Fixture",
  GIT_AUTHOR_EMAIL: "lint-fixture@example.com",
  GIT_COMMITTER_NAME: "Lint Fixture",
  GIT_COMMITTER_EMAIL: "lint-fixture@example.com",
};

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
}

function write(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

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
  const fixture = mkdtempSync(join(tmpdir(), "lint-file-set-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  for (const file of [
    "scripts/lint.mjs",
    "eslint.config.mjs",
    ".gitignore",
    ".prettierignore",
  ]) {
    cpSync(join(root, file), join(fixture, file));
  }
  symlinkSync(join(root, "node_modules"), join(fixture, "node_modules"));
  write(join(fixture, "src/ok.mjs"), "export const ok = 1;\n");
  write(join(fixture, "dashboard/dashboard/dist/assets/b.js"), violation);
  git(fixture, "init", "--quiet");
  // .gitignore's node_modules/ matches directories, not this symlink.
  write(join(fixture, ".git/info/exclude"), "/node_modules\n");
  git(fixture, "add", ".");
  git(fixture, "commit", "--quiet", "-m", "fixture");
  return fixture;
}

test("lint reports no finding for ignored nested build output, consistently", (t) => {
  const fixture = lintFixture(t);

  const clean = lint(fixture);
  assert.equal(clean.status, 0, clean.output);
  assert.doesNotMatch(clean.output, /b\.js|problem/);
  assert.deepEqual(lint(fixture), clean);
});

test("lint fails on a worktree's violation only inside that worktree", (t) => {
  const fixture = lintFixture(t);
  const worktree = join(fixture, ".worktrees/w");
  git(fixture, "worktree", "add", "--quiet", worktree);
  symlinkSync(join(root, "node_modules"), join(worktree, "node_modules"));
  write(join(worktree, "src/bad.mjs"), violation);

  const enclosing = lint(fixture);
  assert.equal(enclosing.status, 0, enclosing.output);
  assert.doesNotMatch(enclosing.output, /bad\.mjs/);
  const inside = lint(worktree);
  assert.equal(inside.status, 1, inside.output);
  assert.match(inside.output, /src\/bad\.mjs[\s\S]*no-var/);
});

test("lint still checks new untracked source", (t) => {
  const fixture = lintFixture(t);
  write(join(fixture, "src/new.mjs"), violation);

  const untracked = lint(fixture);
  assert.equal(untracked.status, 1, untracked.output);
  assert.match(untracked.output, /src\/new\.mjs[\s\S]*no-var/);
});
