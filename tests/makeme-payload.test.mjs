import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "./support/makeMe.mjs";
import { materializeLocalCheckout } from "./support/repository-fixture.mjs";
import { openDoughSource } from "./support/releaseTestData.mjs";

const ruleFiles = [
  "SKILL.md",
  "references/convention.md",
  "scripts/changed-makeme.mjs",
  "scripts/intent-location-selection.mjs",
  "scripts/intent-location-settings.mjs",
  "scripts/minimatch.bundle.mjs",
  "scripts/minimatch.LICENSE.md",
  "scripts/repository-path.mjs",
  "scripts/select-makeme.mjs",
];

test("installation and update deliver the complete standalone MakeMe rule to both native roots without changing project opt-ins", async (t) => {
  const source = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("release before MakeMe", {
        backlog: null,
        release: makeMe.aRelease
          .with({
            version: "0.1.1",
            taggedAt: "2026-09-01T00:00:00",
            marker: "before-MakeMe",
            withheld: ["dough-makeme/"],
            removed: ["dough-makeme"],
          })
          .please(),
      })
      .withRevision("release with MakeMe", {
        backlog: null,
        release: makeMe.aRelease
          .with({
            version: "0.1.2",
            taggedAt: "2026-09-02T00:00:00",
            marker: "with-MakeMe",
          })
          .please(),
      })
      .please(),
  );
  const settings = `${JSON.stringify(
    makeMe.intentSettings
      .withLocations(
        makeMe.anIntentLocation
          .at("backend/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .usingMakeMe()
          .please(),
        makeMe.anIntentLocation
          .at("frontend/tests")
          .ofKind("typescript")
          .usingMakeMe(false)
          .please(),
      )
      .please(),
    null,
    2,
  )}\n`;
  const sentinels = {
    ".planning/open-dough.json": settings,
    ".agents/skills/local/SKILL.md": "Project-owned shared guidance.\n",
    ".claude/skills/local/SKILL.md": "Project-owned Claude guidance.\n",
    ".cursor/skills/local/SKILL.md": "Project-owned Cursor guidance.\n",
    "backend/tests/current.spec.ts": "export {};\n",
    "frontend/tests/current.spec.ts": "export {};\n",
  };
  const project = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("project", { backlog: null, files: sentinels })
      .please(),
  );
  const root = project.integration;
  const run = (command, args) =>
    execFileSync(command, args, {
      cwd: root,
      encoding: "utf8",
    });
  const install = (installer, sourcePath) =>
    run("bash", [
      installer,
      "--target",
      root,
      "--source",
      sourcePath,
      "--platform",
      "cursor",
    ]);
  const assertInstalled = (target) => {
    const execute = (command, args) =>
      execFileSync(command, args, {
        cwd: target,
        encoding: "utf8",
      });
    assert.equal(existsSync(join(target, "node_modules")), false);
    for (const [path, bytes] of Object.entries(sentinels))
      assert.equal(readFileSync(join(target, path), "utf8"), bytes, path);
    for (const alias of [".agents", ".claude"]) {
      const skill = join(target, alias, "skills/dough-makeme");
      for (const path of ruleFiles)
        assert.deepEqual(
          readFileSync(join(skill, path)),
          readFileSync(join(openDoughSource, "src/skills/dough-makeme", path)),
        );
      const select = JSON.parse(
        execute(process.execPath, [
          join(skill, "scripts/select-makeme.mjs"),
          "--project",
          target,
          "--",
          "backend/tests/new.spec.ts",
          "backend/tests/helper.ts",
          "frontend/tests/new.spec.ts",
        ]),
      );
      assert.equal(select.status, "selected");
      assert.deepEqual(select.files, ["backend/tests/new.spec.ts"]);
      assert.equal(select.convention, join(skill, "references/convention.md"));
      const changed = JSON.parse(
        execute(process.execPath, [
          join(skill, "scripts/changed-makeme.mjs"),
          "--project",
          target,
          "--path",
          "backend/tests/current.spec.ts",
          "--path",
          "frontend/tests/current.spec.ts",
        ]),
      );
      assert.equal(changed.status, "selected");
      assert.deepEqual(changed.files, ["backend/tests/current.spec.ts"]);
    }
  };

  // Current-source installation exercises its real composed declaration.
  install(join(openDoughSource, "install.sh"), openDoughSource);
  assertInstalled(root);

  const old = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("older checkout", { backlog: null })
      .please(),
  );
  execFileSync("git", [
    "-C",
    old.integration,
    "fetch",
    "--quiet",
    source.integration,
    "refs/tags/v0.1.1",
  ]);
  execFileSync("git", [
    "-C",
    old.integration,
    "checkout",
    "--quiet",
    "--detach",
    "FETCH_HEAD",
  ]);
  // Use a fresh project so update begins with an actual older installation.
  const updating = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("updating project", { backlog: null, files: sentinels })
      .please(),
  );
  const updateRoot = updating.integration;
  execFileSync(
    "bash",
    [
      join(old.integration, "install.sh"),
      "--target",
      updateRoot,
      "--source",
      source.integration,
      "--platform",
      "codex",
    ],
    { cwd: updateRoot },
  );
  for (const alias of [".agents", ".claude"])
    assert.equal(
      existsSync(join(updateRoot, alias, "skills/dough-makeme")),
      false,
    );
  const output = execFileSync(
    "bash",
    [
      join(openDoughSource, "src/install/open-dough-release.sh"),
      "apply",
      "--target",
      updateRoot,
      "--platform",
      "codex",
    ],
    { cwd: updateRoot, encoding: "utf8" },
  );
  assert.match(
    output,
    /installed or updated the shared Codex\/Cursor root and Claude Code to 0\.1\.2/,
  );
  // The same observations apply to each isolated target.
  assertInstalled(updateRoot);
});
