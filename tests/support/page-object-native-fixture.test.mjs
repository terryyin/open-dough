import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createPageObjectProject } from "./page-object-native-fixture.mjs";

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
      readFileSync("src/skills/dough-page-objects/SKILL.md", "utf8"),
    );
    assert.equal(
      readFileSync(join(installed, "references/convention.md"), "utf8"),
      readFileSync(
        "src/skills/dough-page-objects/references/convention.md",
        "utf8",
      ),
    );
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
