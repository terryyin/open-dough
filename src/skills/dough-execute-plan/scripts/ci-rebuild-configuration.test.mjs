// Project-owned rebuild declaration is paired with the read-only adapter.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { readCiConfiguration } from "./ci-project-configuration.mjs";

function settings(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-rebuild-settings-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, ".planning"));
  return (facts) => {
    writeFileSync(
      join(root, ".planning/open-dough.json"),
      JSON.stringify(makeMe.projectCiSettings.with(facts).please()),
    );
    return readCiConfiguration(root);
  };
}
test("a paired rebuild may use the adapter command, while omitted, empty and unpaired declarations select no trigger", (t) => {
  const read = settings(t),
    command = ["node", "ci.mjs"];
  assert.deepEqual(
    read({ ciAdapter: command, ciRebuild: command }).rebuild,
    command,
  );
  for (const facts of [
    { ciAdapter: command },
    { ciAdapter: command, ciRebuild: [] },
    { ciRebuild: command },
    { ciAdapter: [], ciRebuild: command },
  ])
    assert.equal(read(facts).rebuild, undefined);
});
test("malformed rebuild commands identify the project setting", (t) => {
  const read = settings(t);
  for (const invalid of ["ci.mjs", [""], [1], null])
    assert.throws(
      () => read({ ciAdapter: ["node", "ci.mjs"], ciRebuild: invalid }),
      /ciRebuild.*must be an empty or nonempty string array/,
    );
});
