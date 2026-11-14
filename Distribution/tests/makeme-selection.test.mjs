import assert from "node:assert/strict";
import test from "node:test";
import { makeMe } from "./support/makeMe.mjs";
import {
  materializeSelectionProject,
  runMakeMeSelection,
  intentSettingsForLocations,
} from "./support/makeme-selection-project.mjs";
import { join } from "node:path";

// New source paths are intentionally absent; selection precedes test authoring.
test("standalone command selects only opted-in source membership, with no npm installation", async (t) => {
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations(
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
    ),
  );
  const { code, answer } = runMakeMeSelection(
    root,
    "backend/tests/nested/new.spec.ts",
    "backend/tests/helper.ts",
    "backend/tests/new.SPEC.TS",
    "backend/tests-neighbor/new.spec.ts",
    "frontend/tests/new.spec.ts",
  );
  assert.equal(code, 0);
  assert.deepEqual(answer, {
    status: "selected",
    configuration: join(root, ".planning/open-dough.json"),
    files: ["backend/tests/nested/new.spec.ts"],
    entries: [
      { path: "backend/tests", files: ["backend/tests/nested/new.spec.ts"] },
    ],
    convention: join(
      root,
      ".agents/skills/dough-makeme",
      "references/convention.md",
    ),
  });
});

test("an overlapping opt-out does not veto an enabled entry", async (t) => {
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations(
      makeMe.anIntentLocation
        .at("checks")
        .ofKind("javascript")
        .usingMakeMe(false)
        .please(),
      makeMe.anIntentLocation
        .at("checks/nested")
        .ofKind("javascript", ["*.test.mjs"])
        .usingMakeMe()
        .please(),
    ),
  );
  assert.deepEqual(
    runMakeMeSelection(root, "checks/nested/a.test.mjs").answer.entries,
    [{ path: "checks/nested", files: ["checks/nested/a.test.mjs"] }],
  );
});

test("sources override legacy fields and match custom extensions case-sensitively", async (t) => {
  const source = makeMe.anIntentLocation
    .at("checks")
    .withSources({ include: ["nested/*.check"], syntax: "future-grammar" })
    .usingMakeMe()
    .please();
  // Conflicting legacy fields are the exact configuration form under proof.
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations({
      ...source,
      kind: "typescript",
      include: ["**/*.ts"],
    }),
  );
  const { answer } = runMakeMeSelection(
    root,
    "checks/nested/a.check",
    "checks/nested/a.CHECK",
    "checks/nested/a.ts",
    "checks/nested/deeper/a.check",
  );
  assert.deepEqual(answer.files, ["checks/nested/a.check"]);
});

test("kind extension filters remain required even when include matches", async (t) => {
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations(
      makeMe.anIntentLocation
        .at("checks")
        .ofKind("shell", ["**/*"])
        .usingMakeMe()
        .please(),
    ),
  );
  assert.deepEqual(
    runMakeMeSelection(
      root,
      "checks/a.sh",
      "checks/nested/a.bash",
      "checks/a.SH",
      "checks/a.md",
    ).answer.files,
    ["checks/a.sh", "checks/nested/a.bash"],
  );
});

test("sources retain extglob and brace selection grammar", async (t) => {
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations(
      makeMe.anIntentLocation
        .at("checks")
        .withSources({ include: ["cases/@(alpha|beta).{test,check}"] })
        .usingMakeMe()
        .please(),
    ),
  );
  assert.deepEqual(
    runMakeMeSelection(
      root,
      "checks/cases/alpha.test",
      "checks/cases/beta.check",
      "checks/cases/gamma.test",
      "checks/cases/ALPHA.test",
    ).answer.files,
    ["checks/cases/alpha.test", "checks/cases/beta.check"],
  );
});
