import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Shared building blocks for tests that run this repository's lint runner
// inside a throwaway Git repository.
export const root = fileURLToPath(new URL("../..", import.meta.url));
export const violation = "var unused = 1;\nexport default unused;\n";
export const env = {
  ...process.env,
  PATH: `${join(root, "node_modules", ".bin")}${delimiter}${process.env.PATH}`,
  GIT_AUTHOR_NAME: "Lint Fixture",
  GIT_AUTHOR_EMAIL: "lint-fixture@example.com",
  GIT_COMMITTER_NAME: "Lint Fixture",
  GIT_COMMITTER_EMAIL: "lint-fixture@example.com",
};

function onPath(tool) {
  return spawnSync(tool, ["--version"], { env, stdio: "ignore" }).status === 0;
}

export const shellToolsMissing =
  onPath("shellcheck") && onPath("shfmt")
    ? false
    : "shellcheck and shfmt are not both on PATH";

const runnerFiles = [
  "scripts/lint.mjs",
  "eslint.config.mjs",
  "eslint.ignores.mjs",
  ".gitignore",
  ".prettierignore",
  ".prettierrc.json",
  ".editorconfig",
  ".shellcheckrc",
];

// A `git` runner using the given environment, for fixtures that change PATH.
export function gitWith(environment) {
  return (cwd, ...args) => {
    const result = spawnSync("git", args, {
      cwd,
      env: environment,
      encoding: "utf8",
    });
    return {
      status: result.status,
      stdout: result.stdout,
      output: result.stdout + result.stderr,
    };
  };
}

export const git = gitWith(env);

export function gitOk(cwd, ...args) {
  const result = git(cwd, ...args);
  assert.equal(result.status, 0, result.output);
  return result.stdout;
}

export function write(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

// Copies the named repository files into the fixture and links this
// repository's dependencies. Git's `.gitignore` rule for node_modules/ matches
// directories, not the symlink, so the fixture excludes it explicitly once its
// repository is initialized.
export function copyFiles(fixture, files) {
  for (const file of files) {
    mkdirSync(dirname(join(fixture, file)), { recursive: true });
    cpSync(join(root, file), join(fixture, file));
  }
}

export function copyRepositoryFiles(fixture, files) {
  copyFiles(fixture, files);
  symlinkSync(join(root, "node_modules"), join(fixture, "node_modules"));
}

export function excludeLinkedDependencies(fixture) {
  write(join(fixture, ".git/info/exclude"), "/node_modules\n");
}

// Each suite supplies its sample program; runner configuration and the
// committed repository lifecycle stay the same, including without node_modules.
export function committedLintFixture(
  t,
  {
    prefix = "lint-runner-",
    dependencies = true,
    repositoryFiles = [],
    files = {},
  } = {},
) {
  const fixture = mkdtempSync(join(tmpdir(), prefix));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  (dependencies ? copyRepositoryFiles : copyFiles)(fixture, [
    ...runnerFiles,
    ...repositoryFiles,
  ]);
  for (const [file, content] of Object.entries(files)) {
    write(join(fixture, file), content);
  }
  gitOk(fixture, "init", "--quiet");
  if (dependencies) {
    excludeLinkedDependencies(fixture);
  }
  gitOk(fixture, "add", ".");
  gitOk(fixture, "-c", "core.hooksPath=/dev/null", "commit", "-qm", "fixture");
  return fixture;
}

// Keep only the tools needed to enter npm scripts and Git hooks on PATH.
// ESLint, Prettier, ShellCheck and shfmt are absent regardless of host installs.
export function toollessEnv(t) {
  const bin = mkdtempSync(join(tmpdir(), "lint-toolless-bin-"));
  t.after(() => rmSync(bin, { recursive: true, force: true }));
  for (const tool of ["node", "npm", "git", "env", "sh"]) {
    const found = execFileSync("which", [tool], { encoding: "utf8" }).trim();
    symlinkSync(realpathSync(found), join(bin, tool));
  }
  return { ...env, PATH: bin };
}

// Observe every current tracked or non-ignored new file, so a formatting test
// can prove exactly which bytes changed without relying on tool output alone.
export function snapshot(fixture) {
  const paths = gitOk(
    fixture,
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "-z",
  )
    .split("\0")
    .filter((file) => file && existsSync(join(fixture, file)));
  return new Map(
    paths.map((file) => [file, readFileSync(join(fixture, file))]),
  );
}

export function changedPaths(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])]
    .filter((file) => !before.get(file)?.equals(after.get(file)))
    .sort();
}
