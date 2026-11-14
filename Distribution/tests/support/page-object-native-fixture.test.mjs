import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createPageObjectProject } from "./page-object-native-fixture.mjs";
import { createPageObjectRefactorProject } from "./page-object-native-refactor-fixture.mjs";

test("the native fixture installs one candidate in each existing host layout with distinct entries", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "page-object-layout-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const host of ["codex", "cursor", "claude"]) {
    const { project, installed, settings } = await createPageObjectProject(
      join(root, host),
      host,
    );
    assert.equal(
      installed,
      join(
        project,
        host === "claude" ? ".claude" : ".agents",
        "skills",
        "dough-page-objects",
      ),
    );
    assert.equal(settings.intent.locations[0].pageObjects, true);
    assert.equal(settings.intent.locations[1].pageObjects, false);
    assert.equal(
      readFileSync(join(installed, "SKILL.md"), "utf8"),
      readFileSync(
        "Distribution/src/skills/dough-page-objects/SKILL.md",
        "utf8",
      ),
    );
    assert.equal(
      readFileSync(join(installed, "references/convention.md"), "utf8"),
      readFileSync(
        "Distribution/src/skills/dough-page-objects/references/convention.md",
        "utf8",
      ),
    );
    const execution = join(installed, "..", "dough-execute-plan");
    const selection = execFileSync(
      process.execPath,
      [
        join(execution, "scripts/test-entry-rules.mjs"),
        "--project",
        project,
        "--source",
        "browser/new.spec.mjs",
        "--source",
        "legacy/new.spec.mjs",
      ],
      { encoding: "utf8" },
    );
    assert.deepEqual(JSON.parse(selection), {
      status: "resolved",
      sources: [
        { path: "browser/new.spec.mjs", makeMe: false, pageObjects: true },
        { path: "legacy/new.spec.mjs", makeMe: false, pageObjects: false },
      ],
    });
  }
});

test("the fresh opted-out fixture has no enabled entry", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "page-object-off-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { settings } = await createPageObjectProject(
    join(root, "project"),
    "codex",
    { enabled: false },
  );
  assert.deepEqual(
    settings.intent.locations.map((entry) => entry.pageObjects),
    [false, false],
  );
});

test("the refactor fixture carries current guidance and mixed staged/untracked scenarios", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "page-object-refactor-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { project, installed } = await createPageObjectRefactorProject(
    join(root, "project"),
    "codex",
  );
  const status = execFileSync("git", ["-C", project, "status", "--short"], {
    encoding: "utf8",
  });
  assert.equal(
    status,
    "A  browser/library.spec.mjs\n?? legacy/library.spec.mjs\n",
  );
  assert.equal(
    readFileSync(
      join(installed, "..", "dough-post-change-refactor", "SKILL.md"),
      "utf8",
    ),
    readFileSync(
      "Distribution/src/skills/dough-post-change-refactor/SKILL.md",
      "utf8",
    ),
  );
  const result = execFileSync(
    process.execPath,
    [
      join(
        installed,
        "..",
        "dough-execute-plan",
        "scripts/test-entry-rules.mjs",
      ),
      "--project",
      project,
      "--changed",
    ],
    { encoding: "utf8" },
  );
  assert.deepEqual(JSON.parse(result).sources, [
    { path: "browser/library.spec.mjs", makeMe: false, pageObjects: true },
    { path: "legacy/library.spec.mjs", makeMe: false, pageObjects: false },
  ]);
});
