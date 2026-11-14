import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { makeMe } from "./support/makeMe.mjs";
import { git } from "../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import {
  materializeSelectionProject,
  runChangedMakeMeSelection,
  intentSettingsForLocations,
} from "./support/makeme-selection-project.mjs";

test("both move paths are context while only the current destination can select MakeMe", async (t) => {
  for (const [source, destination, selected] of [
    ["enabled/moved.spec.ts", "disabled/moved.spec.ts", false],
    ["disabled/moved.spec.ts", "enabled/moved.spec.ts", true],
  ]) {
    const root = await materializeSelectionProject(
      t,
      intentSettingsForLocations(
        makeMe.anIntentLocation
          .at("enabled")
          .ofKind("typescript")
          .usingMakeMe()
          .please(),
        makeMe.anIntentLocation
          .at("disabled")
          .ofKind("typescript")
          .usingMakeMe(false)
          .please(),
      ),
      {
        [source]: "a moved source\n",
        "enabled/keep.spec.ts": "keeps folder\n",
        "disabled/keep.spec.ts": "keeps folder\n",
      },
    );
    await git(root, "mv", source, destination);
    const { code, answer } = runChangedMakeMeSelection(root);
    assert.equal(code, 0);
    assert.deepEqual(answer.changedPaths, [source, destination].sort());
    assert.deepEqual(answer.currentPaths, [destination]);
    assert.deepEqual(answer.files, selected ? [destination] : []);
    assert.equal(answer.status, selected ? "selected" : "not-selected");
  }
});

test("deleting an enabled source retains context without inventing conversion", async (t) => {
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations(
      makeMe.anIntentLocation
        .at("enabled")
        .ofKind("typescript")
        .usingMakeMe()
        .please(),
    ),
    { "enabled/deleted.spec.ts": "deleted source\n" },
  );
  rmSync(join(root, "enabled/deleted.spec.ts"));
  const { code, answer } = runChangedMakeMeSelection(root);
  assert.equal(code, 0);
  assert.deepEqual(answer.changedPaths, ["enabled/deleted.spec.ts"]);
  assert.deepEqual(answer.currentPaths, []);
  assert.deepEqual(answer.files, []);
  assert.equal(answer.status, "not-selected");
  assert.equal("convention" in answer, false);
});
