import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  copyFiles,
  copyRepositoryFiles,
  env,
  excludeLinkedDependencies,
  git,
  gitWith,
  gitOk,
  root,
  violation,
  write,
} from "./lint-runner-fixture.mjs";

const unformatted = "export const  drift = {a:1};\n";

const fixtureFiles = [
  "scripts/lint.mjs",
  "eslint.config.mjs",
  "eslint.ignores.mjs",
  ".gitignore",
  ".prettierignore",
  ".prettierrc.json",
  ".editorconfig",
  ".shellcheckrc",
  ".githooks/pre-commit",
  "scripts/install-hooks.mjs",
];

// A committed repository with this repository's lint runner, configs, and
// tracked hook; the fixture sets core.hooksPath directly. Without linked
// dependencies it has no node_modules, like a fresh worktree.
function hookFixture(t, { dependencies = true, install = false } = {}) {
  const fixture = mkdtempSync(join(tmpdir(), "pre-commit-lint-hook-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  (dependencies ? copyRepositoryFiles : copyFiles)(fixture, fixtureFiles);
  write(
    join(fixture, "package.json"),
    '{"private":true,"type":"module","scripts":{"lint":"node scripts/lint.mjs","prepare":"node scripts/install-hooks.mjs"}}\n',
  );
  write(
    join(fixture, "tsconfig.json"),
    '{"compilerOptions":{"strict":true,"module":"esnext","target":"esnext"},"include":["src"]}\n',
  );
  write(join(fixture, "src/ok.mjs"), "export const ok = 1;\n");
  gitOk(fixture, "init", "--quiet");
  if (dependencies) {
    excludeLinkedDependencies(fixture);
  }
  gitOk(fixture, "add", ".");
  gitOk(fixture, "-c", "core.hooksPath=/dev/null", "commit", "-qm", "fixture");
  if (!install) {
    gitOk(fixture, "config", "core.hooksPath", ".githooks");
  }
  return fixture;
}

function head(cwd) {
  return gitOk(cwd, "rev-parse", "HEAD").trim();
}

test("a staged lint violation refuses the commit with the finding and format pointer", (t) => {
  const fixture = hookFixture(t);
  const before = head(fixture);
  write(join(fixture, "src/bad.mjs"), violation);
  gitOk(fixture, "add", "src/bad.mjs");

  const commit = git(fixture, "commit", "-m", "bad");

  assert.notEqual(commit.status, 0, commit.output);
  assert.match(commit.output, /src\/bad\.mjs[\s\S]*no-var/);
  assert.match(commit.output, /npm run format/);
  assert.equal(head(fixture), before);
});

test("staged formatting drift is refused and nothing is changed", (t) => {
  const fixture = hookFixture(t);
  const file = join(fixture, "src/drift.mjs");
  write(file, unformatted);
  gitOk(fixture, "add", "src/drift.mjs");
  const stagedDiff = gitOk(fixture, "diff", "--cached");

  const commit = git(fixture, "commit", "-m", "drift");

  assert.notEqual(commit.status, 0, commit.output);
  assert.match(commit.output, /src\/drift\.mjs/);
  assert.match(commit.output, /npm run format/);
  assert.equal(readFileSync(file, "utf8"), unformatted);
  assert.equal(gitOk(fixture, "diff", "--cached"), stagedDiff);
  assert.equal(gitOk(fixture, "diff"), "");
});

function onPath(tool) {
  return spawnSync(tool, ["--version"], { env, stdio: "ignore" }).status === 0;
}

const shellToolsMissing =
  onPath("shellcheck") && onPath("shfmt")
    ? false
    : "shellcheck and shfmt are not both on PATH";

function commitsCleanFilesUnchanged(t, contents) {
  const fixture = hookFixture(t);
  for (const [file, content] of Object.entries(contents)) {
    write(join(fixture, file), content);
    gitOk(fixture, "add", file);
  }

  const commit = git(fixture, "commit", "-m", "clean");

  assert.equal(commit.status, 0, commit.output);
  for (const [file, content] of Object.entries(contents)) {
    assert.equal(gitOk(fixture, "show", `HEAD:${file}`), content);
    assert.equal(readFileSync(join(fixture, file), "utf8"), content);
  }
}

test("clean staged TypeScript and JSON files commit unchanged", (t) => {
  commitsCleanFilesUnchanged(t, {
    "src/a.ts": "export const a: number = 1;\n",
    "src/b.json": '{ "b": 1 }\n',
  });
});

test(
  "clean staged shell files commit unchanged",
  { skip: shellToolsMissing },
  (t) => {
    commitsCleanFilesUnchanged(t, {
      "scripts/c.sh": '#!/bin/sh\nset -eu\nprintf "%s\\n" hello\n',
    });
  },
);

test("an unstaged violating file does not block a clean staged commit", (t) => {
  const fixture = hookFixture(t);
  write(join(fixture, "src/untracked-bad.mjs"), violation);
  write(join(fixture, "src/ok.mjs"), "export const ok = 2;\n");
  gitOk(fixture, "add", "src/ok.mjs");

  const commit = git(fixture, "commit", "-m", "clean change");

  assert.equal(commit.status, 0, commit.output);
  assert.equal(
    gitOk(fixture, "show", "HEAD:src/ok.mjs"),
    "export const ok = 2;\n",
  );
});

// A PATH holding only node, npm, git, env, and sh, so eslint, prettier, shellcheck,
// and shfmt are absent wherever the host installs them.
function toolless(t) {
  const bin = mkdtempSync(join(tmpdir(), "toolless-bin-"));
  t.after(() => rmSync(bin, { recursive: true, force: true }));
  for (const tool of ["node", "npm", "git", "env", "sh"]) {
    const found = execFileSync("which", [tool], { encoding: "utf8" }).trim();
    symlinkSync(realpathSync(found), join(bin, tool));
  }
  return gitWith({ ...env, PATH: bin });
}

test("a records-only commit succeeds without lint tools", (t) => {
  const gitToolless = toolless(t);
  const fixture = hookFixture(t, { dependencies: false });
  write(join(fixture, ".planning/agents/x.json"), '{"a":  1}\n');
  write(join(fixture, ".planning/seeds/SEED-1.md"), "# Seed\n");
  gitOk(fixture, "add", ".planning");

  const commit = gitToolless(fixture, "commit", "-m", "records");

  assert.equal(commit.status, 0, commit.output);
  assert.doesNotMatch(commit.output, /not found/);
  assert.equal(
    gitOk(fixture, "show", "HEAD:.planning/agents/x.json"),
    '{"a":  1}\n',
  );
});

test("a staged file whose tool is missing is refused naming the tool and npm ci", (t) => {
  const gitToolless = toolless(t);
  for (const [file, content, tool] of [
    ["scripts/c.sh", '#!/bin/sh\nset -eu\nprintf "%s\\n" hello\n', "shfmt"],
    ["src/new.mjs", "export const n = 1;\n", "eslint"],
  ]) {
    const fixture = hookFixture(t, { dependencies: false });
    const before = head(fixture);
    write(join(fixture, file), content);
    gitOk(fixture, "add", file);

    const commit = gitToolless(fixture, "commit", "-m", "needs tool");

    assert.notEqual(commit.status, 0, commit.output);
    assert.match(commit.output, new RegExp(`${tool}: not found on PATH`));
    assert.match(commit.output, /npm ci/);
    assert.equal(head(fixture), before);
  }
});

function prepare(cwd) {
  const result = spawnSync("npm", ["run", "--silent", "prepare"], {
    cwd,
    env,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
}

function stageViolation(cwd) {
  write(join(cwd, "src/bad.mjs"), violation);
  gitOk(cwd, "add", "src/bad.mjs");
}

function linkedWorktree(t, fixture, name) {
  const path = `${fixture}-${name}`;
  t.after(() => rmSync(path, { recursive: true, force: true }));
  gitOk(fixture, "worktree", "add", "--quiet", "--detach", path, "HEAD");
  symlinkSync(join(root, "node_modules"), join(path, "node_modules"));
  return path;
}

test("prepare enables the hook in the checkout and a linked worktree, and a repeat leaves the config untouched", (t) => {
  const fixture = hookFixture(t, { install: true });
  assert.equal(git(fixture, "config", "--get", "core.hooksPath").status, 1);

  prepare(fixture);

  assert.equal(
    gitOk(fixture, "config", "--get", "core.hooksPath").trim(),
    ".githooks",
  );
  const configFile = join(fixture, ".git/config");
  const configBefore = readFileSync(configFile);
  const mtimeBefore = statSync(configFile).mtimeMs;
  prepare(fixture);
  assert.deepEqual(readFileSync(configFile), configBefore);
  assert.equal(statSync(configFile).mtimeMs, mtimeBefore);

  const worktree = linkedWorktree(t, fixture, "with-hook");
  for (const cwd of [fixture, worktree]) {
    const before = head(cwd);
    stageViolation(cwd);
    const commit = git(cwd, "commit", "-m", "bad");
    assert.notEqual(commit.status, 0, commit.output);
    assert.match(commit.output, /src\/bad\.mjs[\s\S]*no-var/);
    assert.equal(head(cwd), before);
  }
});

test("a linked worktree on a revision without the hook commits as before", (t) => {
  const fixture = hookFixture(t, { install: true });
  gitOk(fixture, "rm", "-q", ".githooks/pre-commit");
  gitOk(fixture, "commit", "-qm", "drop the hook");
  prepare(fixture);
  const worktree = linkedWorktree(t, fixture, "no-hook");
  stageViolation(worktree);

  const commit = git(worktree, "commit", "-m", "bad");

  assert.equal(commit.status, 0, commit.output);
});

test("prepare exits quietly outside a Git checkout", (t) => {
  const fixture = mkdtempSync(join(tmpdir(), "prepare-no-git-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  copyFiles(fixture, ["scripts/install-hooks.mjs"]);
  write(join(fixture, "package.json"), '{"type":"module"}\n');
  const result = spawnSync("node", ["scripts/install-hooks.mjs"], {
    cwd: fixture,
    env: { ...env, GIT_CEILING_DIRECTORIES: tmpdir() },
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout + result.stderr, "");
});
