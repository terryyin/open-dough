import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  copyFiles,
  copyRepositoryFiles,
  excludeLinkedDependencies,
  gitOk,
  write,
} from "./lint-runner-fixture.mjs";

// The fixture's typechecked program: a JavaScript module whose inferred
// signature a TypeScript consumer depends on, as the dashboard's journeys
// depend on shared fixtures.
export const fixtureModule = "src/fixture.mjs";
const land = (parameters) =>
  `export function land(${parameters}) {\n  return [worktree, identity];\n}\n`;
export const defaulted = land('{ worktree, identity = "story" }');
export const required = land("{ worktree, identity }");
const consumer =
  'import { land } from "./fixture.mjs";\n\nexport const landed = land({ worktree: "w" });\n';

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
// tracked hook, and its own small program behind `typecheck:dashboard`; the
// fixture sets core.hooksPath directly. Without linked dependencies it has no
// node_modules, like a fresh worktree.
export function hookFixture(t, { dependencies = true, install = false } = {}) {
  const fixture = mkdtempSync(join(tmpdir(), "pre-commit-hook-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  (dependencies ? copyRepositoryFiles : copyFiles)(fixture, fixtureFiles);
  write(
    join(fixture, "package.json"),
    '{"private":true,"type":"module","scripts":{"lint":"node scripts/lint.mjs","typecheck:dashboard":"tsc -p tsconfig.json","prepare":"node scripts/install-hooks.mjs"}}\n',
  );
  write(
    join(fixture, "tsconfig.json"),
    '{"compilerOptions":{"strict":true,"module":"esnext","target":"esnext","moduleResolution":"bundler","allowJs":true,"checkJs":false,"noEmit":true},"include":["src"]}\n',
  );
  write(join(fixture, "src/ok.mjs"), "export const ok = 1;\n");
  write(join(fixture, fixtureModule), defaulted);
  write(join(fixture, "src/consumer.ts"), consumer);
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

export function head(cwd) {
  return gitOk(cwd, "rev-parse", "HEAD").trim();
}

export function stage(cwd, file, content) {
  write(join(cwd, file), content);
  gitOk(cwd, "add", file);
}
