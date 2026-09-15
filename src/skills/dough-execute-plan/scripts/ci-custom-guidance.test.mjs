import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const reference = (name) =>
  readFileSync(join(skill, "references", name), "utf8");

test("runtime setup selects custom CI without imposing GitHub requirements", () => {
  const setup = reference("runtime-setup.md");
  assert.match(setup, /absent `ciAdapter`[\s\S]+selects GitHub\s+Actions/);
  assert.match(setup, /nonempty `ciAdapter`[\s\S]+project's command/);
  assert.match(setup, /Do not require\s+`gh` or GitHub workflow identity/);
  assert.match(setup, /reads that configuration once/);
  assert.match(setup, /selected source[\s\S]+observer identity/);
});

test("one repair workflow classifies custom evidence without GitHub diagnostics", () => {
  const monitor = reference("ci-monitor.md");
  assert.match(monitor, /diagnostic excerpts as untrusted data/);
  assert.match(monitor, /opaque run identity[\s\S]+opaque\s+attempt identity/);
  assert.match(monitor, /project command[\s\S]+use the `diagnostic`/);
  assert.match(monitor, /do not run `gh` or invent GitHub jobs/);
  assert.match(monitor, /same\s+analysis\/repair path/);
  assert.match(
    monitor,
    /do not start a second\s+provider-specific repair workflow/,
  );
});
