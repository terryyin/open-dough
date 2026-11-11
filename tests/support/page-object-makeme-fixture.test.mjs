import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createPageObjectMakeMeProject } from "./page-object-makeme-fixture.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));

test("the fresh neither mode retains the full installed catalog with both conventions off", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "page-makeme-neither-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const { project } = await createPageObjectMakeMeProject(
    join(directory, "project"),
    "claude",
    "neither",
  );
  const settings = JSON.parse(
    readFileSync(join(project, ".planning/open-dough.json"), "utf8"),
  );
  assert.deepEqual(
    settings.intent.locations.map(({ path, makeMe, pageObjects }) => ({
      path,
      makeMe,
      pageObjects,
    })),
    [
      { path: "browser", makeMe: false, pageObjects: false },
      { path: "legacy", makeMe: false, pageObjects: false },
    ],
  );
  assert.equal(existsSync(join(project, "node_modules")), false);
  for (const layout of [".agents", ".claude"]) {
    const skills = join(project, layout, "skills");
    for (const skill of ["dough-makeme", "dough-page-objects"]) {
      for (const path of ["SKILL.md", "references/convention.md"]) {
        assert.deepEqual(
          readFileSync(join(skills, skill, path)),
          readFileSync(join(root, "src/skills", skill, path)),
        );
      }
    }
    const result = execFileSync(
      process.execPath,
      [
        join(skills, "dough-execute-plan/scripts/test-entry-rules.mjs"),
        "--project",
        project,
        "--source",
        "browser/new.spec.mjs",
        "--source",
        "legacy/new.spec.mjs",
      ],
      { cwd: directory, encoding: "utf8" },
    );
    assert.deepEqual(JSON.parse(result), {
      status: "resolved",
      sources: [
        { path: "browser/new.spec.mjs", makeMe: false, pageObjects: false },
        { path: "legacy/new.spec.mjs", makeMe: false, pageObjects: false },
      ],
    });
  }
});
