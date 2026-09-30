import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  copyRepositoryFiles,
  env,
  excludeLinkedDependencies,
  git,
  gitOk,
  violation,
  write,
} from "./lint-runner-fixture.mjs";

const unformatted = "export const  drift = {a:1};\n";

// A committed repository with this repository's lint runner, configs, and
// tracked hook; the fixture sets core.hooksPath directly.
function hookFixture(t) {
  const fixture = mkdtempSync(join(tmpdir(), "pre-commit-lint-hook-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  copyRepositoryFiles(fixture, [
    "scripts/lint.mjs",
    "eslint.config.mjs",
    ".gitignore",
    ".prettierignore",
    ".prettierrc.json",
    ".editorconfig",
    ".shellcheckrc",
    ".githooks/pre-commit",
  ]);
  write(
    join(fixture, "package.json"),
    '{"private":true,"type":"module","scripts":{"lint":"node scripts/lint.mjs"}}\n',
  );
  write(
    join(fixture, "tsconfig.json"),
    '{"compilerOptions":{"strict":true,"module":"esnext","target":"esnext"},"include":["src"]}\n',
  );
  write(join(fixture, "src/ok.mjs"), "export const ok = 1;\n");
  gitOk(fixture, "init", "--quiet");
  excludeLinkedDependencies(fixture);
  gitOk(fixture, "add", ".");
  gitOk(fixture, "-c", "core.hooksPath=/dev/null", "commit", "-qm", "fixture");
  gitOk(fixture, "config", "core.hooksPath", ".githooks");
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
