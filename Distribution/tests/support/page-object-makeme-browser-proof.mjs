import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { createPageObjectMakeMeProject } from "./page-object-makeme-fixture.mjs";
import { makeMeControlScenario } from "./page-object-makeme-project-files.mjs";

test("the installed domain fixture needs independent fresh item setup and preserves causal observations", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "page-makeme-control-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const { project } = await createPageObjectMakeMeProject(
    join(directory, "project"),
    "codex",
    "both",
  );
  const { makeMe } = await import(
    pathToFileURL(join(project, "support/makeMe.mjs"))
  );
  const boreal = makeMe.anItem.identifiedAs("boreal").titled("Boreal").please();
  const atlas = makeMe.anItem
    .identifiedAs("atlas")
    .titled("Atlas")
    .relatedTo(boreal)
    .please();
  assert.equal(atlas.related, "boreal");
  const fresh = makeMe.anItem.please();
  atlas.title = "Changed by this scenario";
  assert.equal(fresh.title, "Untitled");
  assert.equal(boreal.title, "Boreal");
  assert.notEqual(makeMe.anItem, makeMe.anItem);
  const scenario = join(project, "browser/control.spec.mjs");
  const run = () =>
    execFileSync(
      process.execPath,
      ["run-tests.mjs", "browser/control.spec.mjs"],
      { cwd: project, encoding: "utf8", stdio: "pipe", timeout: 20000 },
    );
  writeFileSync(scenario, makeMeControlScenario);
  assert.match(run(), /SCENARIO PASSED/);
  // The catalog really starts empty; fixed Atlas/Boreal records cannot supply a pass.
  writeFileSync(
    scenario,
    makeMeControlScenario.replace("library.replaceItems(atlas, boreal);", ""),
  );
  assert.throws(run, (error) => {
    assert.match(error.stderr, /Expected: "Atlas"/);
    assert.match(error.stderr, /Received: ""/);
    return true;
  });
});
