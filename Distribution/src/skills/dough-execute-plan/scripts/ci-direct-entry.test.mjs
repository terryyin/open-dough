import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-direct-entry-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test("a canonical argv path that spells the module path identically is direct entry", (t) => {
  const root = fixture(t);
  const script = join(root, "script.mjs");
  writeFileSync(script, "");
  const moduleUrl = pathToFileURL(script).href;
  assert.equal(isDirectCliEntry(moduleUrl, script), true);
});

test("a symlink-equivalent argv path that resolves to the same file is direct entry", (t) => {
  const root = fixture(t);
  // The module Node actually loads lives at root/real/script.mjs. argv
  // reaches the same file through a differently spelled path,
  // root/link/script.mjs, a real symlink to the former -- the same file
  // identity mismatch macOS produces by mounting `/tmp` as `/private/tmp`.
  const realDir = join(root, "real");
  const linkDir = join(root, "link");
  mkdirSync(realDir);
  mkdirSync(linkDir);
  const realScript = join(realDir, "script.mjs");
  const linkScript = join(linkDir, "script.mjs");
  writeFileSync(realScript, "");
  symlinkSync(realScript, linkScript);

  const moduleUrl = pathToFileURL(realScript).href;
  assert.equal(isDirectCliEntry(moduleUrl, linkScript), true);
});

test("an unrelated script path naming a different file is not direct entry", (t) => {
  const root = fixture(t);
  const script = join(root, "script.mjs");
  const other = join(root, "other.mjs");
  writeFileSync(script, "");
  writeFileSync(other, "");
  const moduleUrl = pathToFileURL(script).href;
  assert.equal(isDirectCliEntry(moduleUrl, other), false);
});

test("importing without a matching invocation (no argv path) is not direct entry", (t) => {
  const root = fixture(t);
  const script = join(root, "script.mjs");
  writeFileSync(script, "");
  const moduleUrl = pathToFileURL(script).href;
  assert.equal(isDirectCliEntry(moduleUrl, undefined), false);
  assert.equal(isDirectCliEntry(moduleUrl, ""), false);
});

test("a symlink target that no longer resolves fails closed instead of throwing", () => {
  const moduleUrl = pathToFileURL("/nonexistent/module.mjs").href;
  assert.equal(
    isDirectCliEntry(moduleUrl, "/nonexistent/argv-path.mjs"),
    false,
  );
});
