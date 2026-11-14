import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const command = fileURLToPath(
  new URL("./native-import-closure.mjs", import.meta.url),
);

// Module bytes are the input under test, rather than arranged product state.
function closure(t, files) {
  const root = mkdtempSync(join(tmpdir(), "native-import-closure-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, source] of Object.entries(files))
    writeFileSync(join(root, name), source);
  return spawnSync(process.execPath, [command, root, "entry.mjs"], {
    encoding: "utf8",
  });
}

for (const operator of ["++", "--"]) {
  test(`reads division after postfix ${operator}`, (t) => {
    const result = closure(t, {
      "entry.mjs": `let i = 0; const x = i${operator} / 2;\nimport "./actual.mjs";`,
      "actual.mjs": "export const actual = true;",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "actual.mjs\nentry.mjs\n");
  });
}

test("reads a keyword regular expression with backtick and slash in its class", (t) => {
  const result = closure(t, {
    "entry.mjs":
      'function matches(value) { return /[`/]/.test(value); }\nimport "./actual.mjs";',
    "actual.mjs": "export const actual = true;",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "actual.mjs\nentry.mjs\n");
});

test("keeps nested and escaped template text as data while following expressions", (t) => {
  const result = closure(t, {
    "entry.mjs": [
      'const generated = `import "./text.mjs"; ${`export { text } from "./nested.mjs"; ${import("./actual.mjs")}`}`;',
      'const escaped = `\\` import "./escaped.mjs"; \\${import("./escaped-expression.mjs")}`;',
      'new URL("./spawned.mjs", import.meta.url);',
    ].join("\n"),
    "actual.mjs": "export const actual = true;",
    "spawned.mjs": "export const spawned = true;",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "actual.mjs\nentry.mjs\nspawned.mjs\n");
});

test("ignores import and spawned-module examples inside comments", (t) => {
  const result = closure(t, {
    "entry.mjs": [
      '// new URL("./commented.mjs", import.meta.url);',
      '/* import "./also-commented.mjs"; */',
      'import "./actual.mjs";',
    ].join("\n"),
    "actual.mjs": "export const actual = true;",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "actual.mjs\nentry.mjs\n");
});

test("fails loudly without a partial closure when a reached module is unreadable", (t) => {
  const result = closure(t, { "entry.mjs": 'import "./missing.mjs";' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ENOENT.*missing\.mjs/u);
  assert.equal(result.stdout, "");
});

for (const [kind, source] of [
  ["template", 'const generated = `import "./text.mjs";'],
  ["regular expression", "function match() { return /[`/]; }"],
  ["string", 'const text = "unfinished;'],
  ["comment", "/* unfinished"],
]) {
  test(`fails loudly on an unterminated ${kind} literal`, (t) => {
    const result = closure(t, { "entry.mjs": source });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unterminated/u);
    assert.equal(result.stdout, "");
  });
}
