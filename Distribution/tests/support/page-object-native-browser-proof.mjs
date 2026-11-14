import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createPageObjectProject } from "./page-object-native-fixture.mjs";
import { controlScenario } from "./page-object-native-project-files.mjs";

test("the native browser fixture preserves held reads and expected/actual diagnostics", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "page-object-control-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { project } = await createPageObjectProject(
    join(root, "project"),
    "codex",
  );
  const scenario = join(project, "browser", "control.spec.mjs");
  writeFileSync(scenario, controlScenario);
  const run = () =>
    execFileSync(
      process.execPath,
      ["run-tests.mjs", "browser/control.spec.mjs"],
      { cwd: project, encoding: "utf8", stdio: "pipe", timeout: 20000 },
    );
  assert.match(run(), /SCENARIO PASSED/);
  writeFileSync(
    scenario,
    controlScenario.replace(
      "showsItem('Boreal')",
      "showsItem('Wrong expected item')",
    ),
  );
  assert.throws(run, (error) => {
    assert.match(error.stderr, /Wrong expected item/);
    assert.match(error.stderr, /Boreal/);
    assert.match(error.stderr, /Expected|expected/);
    return true;
  });
});
