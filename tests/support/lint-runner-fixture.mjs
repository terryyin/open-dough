import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
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

export function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, env, encoding: "utf8" });
  return {
    status: result.status,
    stdout: result.stdout,
    output: result.stdout + result.stderr,
  };
}

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
export function copyRepositoryFiles(fixture, files) {
  for (const file of files) {
    cpSync(join(root, file), join(fixture, file));
  }
  symlinkSync(join(root, "node_modules"), join(fixture, "node_modules"));
}

export function excludeLinkedDependencies(fixture) {
  write(join(fixture, ".git/info/exclude"), "/node_modules\n");
}
