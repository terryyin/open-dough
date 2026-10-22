import assert from "node:assert/strict";
import { rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  declaredIdentifiers,
  importPathForms,
  stringLiterals,
} from "./consumer-trace-terms.mjs";
import { repository, section, trace } from "./consumer-trace-test-fixtures.mjs";

const contract = "src/contract/runnerProtocol.ts";

test("a base revision derives terms from the change, so an untouched stand-in and a test of a removed message are found", (t) => {
  const root = repository(t, {
    [contract]:
      'export interface RunnerHello {\n  pid: number;\n}\nexport const READY_MESSAGE = "runner is ready";\n',
    "src/contract/legacyHello.ts": "export function legacyHello() {}\n",
    "src/app.ts": 'import { legacyHello } from "./contract/legacyHello";\n',
    "tests/support/fakeRunner.ts":
      'import { connect } from "../../src/contract/runnerProtocol";\nexport const fake = connect;\n',
    "tests/runner.test.ts": 'expect(output).toContain("runner is ready");\n',
    "src/unrelated.ts": "export const other = 2;\n",
  });
  writeFileSync(
    join(root, contract),
    'export interface RunnerHello {\n  pid: number;\n  sessionToken: string;\n}\nexport const READY_MESSAGE = "runner ready";\n',
  );
  rmSync(join(root, "src/contract/legacyHello.ts"));
  writeFileSync(
    join(root, "src/contract/issueToken.ts"),
    "export function issueSessionToken() {}\n",
  );
  const result = trace("--checkout", root, "--base", "HEAD");
  assert.equal(result.status, 0, result.stderr);
  const output = result.stdout;

  for (const row of [
    /\| `src\/contract\/runnerProtocol` \| import path of `src\/contract\/runnerProtocol\.ts` \|/,
    /\| `runnerProtocol` \| import path of `src\/contract\/runnerProtocol\.ts` \|/,
    /\| `sessionToken` \| declared in `src\/contract\/runnerProtocol\.ts` \|/,
    /\| `runner is ready` \| removed from `src\/contract\/runnerProtocol\.ts`:4 \|/,
    /\| `legacyHello` \| import path of `src\/contract\/legacyHello\.ts` \|/,
    /\| `issueSessionToken` \| declared in `src\/contract\/issueToken\.ts` \|/,
  ])
    assert.match(output, row);
  assert.doesNotMatch(output, /\| `pid` \|/, "unchanged lines derive nothing");
  assert.match(
    output,
    /Changed files not searched: `src\/contract\/issueToken\.ts`, `src\/contract\/legacyHello\.ts`, `src\/contract\/runnerProtocol\.ts`\./,
  );

  assert.match(
    section(output, "Test support or stand-in"),
    /\| `tests\/support\/fakeRunner\.ts` \| `src\/contract\/runnerProtocol`, `runnerProtocol` \| 1: /,
  );
  assert.match(
    section(output, "Test"),
    /\| `tests\/runner\.test\.ts` \| `runner is ready` \| 1: /,
  );
  const production = section(output, "Production");
  assert.match(production, /\| `src\/app\.ts` \| `legacyHello` \|/);
  assert.doesNotMatch(production, /unrelated/);
});

test("a derived term found in most files is recorded as too broad and lists no file by itself", (t) => {
  const files = { "src/shape.ts": "export const shape = {};\n" };
  for (let index = 0; index < 24; index += 1)
    files[`src/user${index}.ts`] = `export const label = user.title;\n`;
  files["src/reader.ts"] = 'import { shape } from "./shape";\n';
  const root = repository(t, files);
  writeFileSync(
    join(root, "src/shape.ts"),
    "export const shape = {\n  title: 1,\n};\n",
  );
  const result = trace("--checkout", root, "--base", "HEAD");
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /\| `title` \| declared in `src\/shape\.ts`; in 24 files, too broad to list consumers by itself; supply it as a `--term` to list them \|/,
  );
  const production = section(result.stdout, "Production");
  assert.match(production, /\| `src\/reader\.ts` \| `shape` \|/);
  assert.doesNotMatch(production, /user\d+\.ts/);
});

test("changed lines declare identifiers, keys and exports; an index module is imported through its directory", () => {
  assert.deepEqual(
    declaredIdentifiers("export async function startRunner(options) {"),
    ["startRunner"],
  );
  assert.deepEqual(declaredIdentifiers("  readonly addressFile?: string;"), [
    "addressFile",
  ]);
  assert.deepEqual(declaredIdentifiers('  "held-reads": true,'), [
    "held-reads",
  ]);
  assert.deepEqual(
    declaredIdentifiers("export { runnerPaths, held as heldReads };"),
    ["runnerPaths", "held", "heldReads"],
  );
  assert.deepEqual(declaredIdentifiers("const ok = a ? b : c;"), []);
  assert.deepEqual(declaredIdentifiers("  const recursive = true;"), []);
  assert.deepEqual(declaredIdentifiers("type RunnerAddress = string;"), [
    "RunnerAddress",
  ]);
  assert.deepEqual(
    importPathForms("dashboard/server/hosts/cursor/runnerPaths.ts"),
    ["dashboard/server/hosts/cursor/runnerPaths", "runnerPaths"],
  );
  assert.deepEqual(importPathForms("src/runner/index.ts"), [
    "src/runner",
    "runner",
  ]);
  assert.deepEqual(importPathForms("install"), []);
  assert.deepEqual(
    stringLiterals('run("git", ["-C", root], { encoding: "utf8" });'),
    ["git", "-C", "utf8"],
  );
});

test("a file replaced by a symlink still leaves every other changed file its derived terms", (t) => {
  const root = repository(t, {
    "src/link.ts": "export const linked = 1;\n",
    "src/target.ts": "export const target = 1;\n",
    "src/later.ts": "export const before = 1;\n",
  });
  rmSync(join(root, "src/link.ts"));
  symlinkSync("target.ts", join(root, "src/link.ts"));
  writeFileSync(join(root, "src/later.ts"), "export const gammaRay = 2;\n");
  const result = trace("--checkout", root, "--base", "HEAD");
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /\| `gammaRay` \| declared in `src\/later\.ts` \|/,
  );
});
