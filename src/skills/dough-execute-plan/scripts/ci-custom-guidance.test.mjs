import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const reference = (name) =>
  readFileSync(join(skill, "references", name), "utf8");

// ADR 0005: assess the safeguards independently of wrapping and phrasing.
function assertCustomRepairRouting(guidance) {
  const prose = guidance.replace(/\s+/g, " ");
  assert.match(
    prose,
    /do not (?:run|invoke) `gh` or (?:invent|fabricate) GitHub jobs/i,
  );
  assert.match(prose, /(?:same|shared) analysis\s*\/\s*repair path/i);
  assert.match(
    prose,
    /(?:do not start a second|never (?:start )?a second) provider-specific (?:repair )?workflow/i,
  );
}

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
  assertCustomRepairRouting(monitor);
});

const customRouting = `For a project command, do not run \`gh\` or invent GitHub jobs.
If custom evidence is insufficient, enter the same analysis/repair path with
uncertainty; do not start a second provider-specific repair workflow.`;

test("custom repair routing assessment accepts equivalent prose and wrapping", () => {
  for (const guidance of [
    customRouting,
    `For a project command, do not run \`gh\`
or invent GitHub jobs. Insufficient custom evidence enters the same analysis/
repair path with uncertainty, never a second provider-specific workflow.`,
    `Do not invoke \`gh\` or fabricate GitHub jobs. Uncertain custom evidence uses
the shared analysis / repair path; never start a second provider-specific workflow.`,
  ]) {
    assertCustomRepairRouting(guidance);
  }
});

test("custom repair routing assessment rejects missing safeguards", () => {
  for (const [safeguard, replacement] of [
    ["do not run `gh`", "run `gh`"],
    ["or invent GitHub jobs", "but invent GitHub jobs"],
    ["same analysis/repair path", "separate analysis/repair path"],
    [
      "do not start a second provider-specific repair workflow",
      "start a second provider-specific repair workflow",
    ],
  ]) {
    assert.throws(
      () =>
        assertCustomRepairRouting(
          customRouting.replace(safeguard, replacement),
        ),
      assert.AssertionError,
    );
  }
});
