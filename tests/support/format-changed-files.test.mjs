import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  changedPaths,
  committedLintFixture,
  env,
  gitOk,
  shellToolsMissing,
  snapshot,
  toollessEnv,
  write,
} from "./lint-runner-fixture.mjs";

const unformatted = "export const  untouched = {old:1};\n";
function formatFixture(t, { dependencies = true, files = {} } = {}) {
  return committedLintFixture(t, {
    prefix: "format-changed-files-",
    dependencies,
    repositoryFiles: ["package.json"],
    files: {
      "src/edited.mjs": "export const edited = { a: 1 };\n",
      "src/untouched.mjs": unformatted,
      ".planning/seed.md": "# Seed\n",
      ".planning/record.json": '{"before":1}\n',
      ...files,
    },
  });
}

function npm(cwd, script, args = [], environment = env) {
  const result = spawnSync("npm", ["run", "--silent", script, "--", ...args], {
    cwd,
    env: environment,
    encoding: "utf8",
  });
  return { status: result.status, output: result.stdout + result.stderr };
}

test("Markdown and ignored planning changes need no lint tools or dependencies", (t) => {
  const fixture = formatFixture(t, { dependencies: false });
  write(join(fixture, ".planning/seed.md"), "# Edited seed\n");
  write(join(fixture, ".planning/record.json"), '{"after":  2}\n');
  write(join(fixture, ".planning/new.json"), '{"new":  3}\n');
  write(join(fixture, ".planning/new.mjs"), "var ignored = 1;\n");
  write(join(fixture, "docs/new.md"), "# New document\n");
  const before = snapshot(fixture);

  const result = npm(fixture, "format", [], toollessEnv(t));

  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /not found|src\/|\.planning\/|docs\//);
  assert.equal(existsSync(join(fixture, "node_modules")), false);
  assert.deepEqual(snapshot(fixture), before);
});

test("format changes exactly the edited and new eligible files and is idempotent", (t) => {
  const fixture = formatFixture(t);
  write(join(fixture, "src/edited.mjs"), "export const  edited = {a:2};\n");
  write(join(fixture, "src/new.mjs"), "export const  fresh = {b:3};\n");
  const before = snapshot(fixture);

  const first = npm(fixture, "format");

  assert.equal(first.status, 0, first.output);
  assert.match(first.output, /src\/edited\.mjs/);
  assert.match(first.output, /src\/new\.mjs/);
  assert.doesNotMatch(first.output, /untouched\.mjs/);
  assert.equal(
    readFileSync(join(fixture, "src/edited.mjs"), "utf8"),
    "export const edited = { a: 2 };\n",
  );
  assert.equal(
    readFileSync(join(fixture, "src/new.mjs"), "utf8"),
    "export const fresh = { b: 3 };\n",
  );
  const formatted = snapshot(fixture);
  assert.deepEqual(changedPaths(before, formatted), [
    "src/edited.mjs",
    "src/new.mjs",
  ]);
  const second = npm(fixture, "format");
  assert.equal(second.status, 0, second.output);
  assert.doesNotMatch(second.output, /untouched\.mjs/);
  assert.deepEqual(snapshot(fixture), formatted);
});

test("format skips a deleted shell file and preserves a filename containing a space", (t) => {
  const fixture = formatFixture(t, {
    files: { "scripts/deleted.sh": '#!/bin/sh\nprintf "%s\\n" old\n' },
  });
  rmSync(join(fixture, "scripts/deleted.sh"));
  write(
    join(fixture, "fixtures/with space.mjs"),
    "export const  spaced = 1;\n",
  );

  const result = npm(fixture, "format");

  assert.equal(result.status, 0, result.output);
  assert.doesNotMatch(result.output, /deleted\.sh|untouched\.mjs/);
  assert.match(result.output, /fixtures\/with space\.mjs/);
  assert.equal(existsSync(join(fixture, "scripts/deleted.sh")), false);
  assert.equal(
    readFileSync(join(fixture, "fixtures/with space.mjs"), "utf8"),
    "export const spaced = 1;\n",
  );
});

test("format fails with remaining findings after automatic fixes are rechecked", (t) => {
  const fixture = formatFixture(t);
  write(join(fixture, "src/edited.mjs"), "export const  edited = missing;\n");

  const result = npm(fixture, "format");

  assert.equal(result.status, 1, result.output);
  assert.equal(
    readFileSync(join(fixture, "src/edited.mjs"), "utf8"),
    "export const edited = missing;\n",
  );
  assert.match(
    result.output,
    /Checking lint and formatting[\s\S]*src\/edited\.mjs[\s\S]*no-undef/,
  );
  assert.match(result.output, /Format failed/);
  assert.doesNotMatch(result.output, /untouched\.mjs/);
});

test("plain lint checks the whole tree and format --all fixes unchanged files", (t) => {
  const fixture = formatFixture(t);
  const before = snapshot(fixture);
  const selective = npm(fixture, "format");
  assert.equal(selective.status, 0, selective.output);
  assert.doesNotMatch(selective.output, /untouched\.mjs/);
  assert.deepEqual(snapshot(fixture), before);

  const lint = npm(fixture, "lint");
  assert.equal(lint.status, 1, lint.output);
  assert.match(lint.output, /src\/untouched\.mjs/);
  assert.deepEqual(snapshot(fixture), before);

  const all = npm(fixture, "format", ["--all"]);
  assert.equal(all.status, 0, all.output);
  assert.match(all.output, /src\/untouched\.mjs/);
  assert.equal(
    readFileSync(join(fixture, "src/untouched.mjs"), "utf8"),
    "export const untouched = { old: 1 };\n",
  );
  const recheck = npm(fixture, "lint");
  assert.equal(recheck.status, 0, recheck.output);
});

test("format includes index-only differences without changing staged content", (t) => {
  const original = '{"indexOnly":1}\n';
  const staged = '{"indexOnly":2}\n';
  const fixture = formatFixture(t, {
    files: { "src/index-only.json": original },
  });
  write(join(fixture, "src/index-only.json"), staged);
  gitOk(fixture, "add", "src/index-only.json");
  write(join(fixture, "src/index-only.json"), original);
  assert.equal(gitOk(fixture, "diff", "HEAD", "--name-only"), "");
  assert.equal(gitOk(fixture, "show", ":src/index-only.json"), staged);

  const result = npm(fixture, "format");

  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /src\/index-only\.json/);
  assert.equal(
    readFileSync(join(fixture, "src/index-only.json"), "utf8"),
    '{ "indexOnly": 1 }\n',
  );
  assert.equal(gitOk(fixture, "show", ":src/index-only.json"), staged);
});

test("selective ignore filtering honors root-anchored patterns for untracked files", (t) => {
  const fixture = formatFixture(t);
  write(
    join(fixture, ".prettierignore"),
    `${readFileSync(join(fixture, ".prettierignore"), "utf8")}/root-only.json\n`,
  );
  gitOk(fixture, "add", ".prettierignore");
  gitOk(fixture, "commit", "--quiet", "-m", "root-only ignore");
  write(join(fixture, "root-only.json"), '{"root":1}\n');
  write(join(fixture, "src/root-only.json"), '{"nested":1}\n');

  const result = npm(fixture, "format");

  assert.equal(result.status, 0, result.output);
  assert.equal(
    readFileSync(join(fixture, "root-only.json"), "utf8"),
    '{"root":1}\n',
  );
  assert.equal(
    readFileSync(join(fixture, "src/root-only.json"), "utf8"),
    '{ "nested": 1 }\n',
  );
  assert.match(result.output, /src\/root-only\.json/);
});

test(
  "format fixes and rechecks only the changed shell script",
  { skip: shellToolsMissing },
  (t) => {
    const fixture = formatFixture(t, {
      files: {
        "scripts/changed.sh": '#!/bin/sh\nset -eu\nprintf "%s\\n" old\n',
        "scripts/untouched.sh": '#!/bin/sh\nprintf "%s\\n"  untouched\n',
      },
    });
    write(
      join(fixture, "scripts/changed.sh"),
      '#!/bin/sh\nset -eu\nif true;then\nprintf "%s\\n" changed\nfi\n',
    );
    const before = snapshot(fixture);

    const result = npm(fixture, "format");

    assert.equal(result.status, 0, result.output);
    assert.equal(
      readFileSync(join(fixture, "scripts/changed.sh"), "utf8"),
      '#!/bin/sh\nset -eu\nif true; then\n  printf "%s\\n" changed\nfi\n',
    );
    assert.deepEqual(changedPaths(before, snapshot(fixture)), [
      "scripts/changed.sh",
    ]);
    assert.doesNotMatch(result.output, /untouched\.(?:mjs|sh)/);
  },
);

test("format continues to refuse --staged without changing any file", (t) => {
  const fixture = formatFixture(t, { dependencies: false });
  const before = snapshot(fixture);

  const result = npm(fixture, "format", ["--staged"], toollessEnv(t));

  assert.equal(result.status, 2, result.output);
  assert.match(
    result.output,
    /--staged only checks and cannot be combined with --fix/,
  );
  assert.deepEqual(snapshot(fixture), before);
});
