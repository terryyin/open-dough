import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { makeMe } from "./support/makeMe.mjs";
import { git } from "../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import {
  materializeSelectionProject,
  runChangedMakeMeSelection,
  intentSettingsForLocations,
} from "./support/makeme-selection-project.mjs";

test("changed scope includes index-only, working-tree and untracked sources without a folder-prefix shortcut", async (t) => {
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations(
      makeMe.anIntentLocation
        .at("enabled")
        .ofKind("typescript", ["**/*.spec.ts"])
        .usingMakeMe()
        .please(),
      makeMe.anIntentLocation
        .at("disabled")
        .ofKind("typescript")
        .usingMakeMe(false)
        .please(),
    ),
    {
      "enabled/staged.spec.ts": "before\n",
      "enabled/unstaged.spec.ts": "before\n",
      "enabled/helper.ts": "before\n",
      "disabled/off.spec.ts": "before\n",
    },
  );
  writeFileSync(join(root, "enabled/staged.spec.ts"), "staged\n");
  await git(root, "add", "--", "enabled/staged.spec.ts");
  writeFileSync(join(root, "enabled/staged.spec.ts"), "before\n");
  assert.equal(
    (
      await git(
        root,
        "diff",
        "HEAD",
        "--name-only",
        "--",
        "enabled/staged.spec.ts",
      )
    ).stdout,
    "",
  );
  writeFileSync(join(root, "enabled/unstaged.spec.ts"), "changed\n");
  writeFileSync(join(root, "enabled/new\ncase.spec.ts"), "new\n");
  writeFileSync(join(root, "enabled/helper.ts"), "support\n");
  writeFileSync(join(root, "disabled/off.spec.ts"), "local\n");
  const { code, answer } = runChangedMakeMeSelection(root);
  assert.equal(code, 0);
  assert.equal(answer.status, "selected");
  assert.deepEqual(answer.files, [
    "enabled/new\ncase.spec.ts",
    "enabled/staged.spec.ts",
    "enabled/unstaged.spec.ts",
  ]);
  assert.deepEqual(answer.changedPaths, [
    "disabled/off.spec.ts",
    "enabled/helper.ts",
    "enabled/new\ncase.spec.ts",
    "enabled/staged.spec.ts",
    "enabled/unstaged.spec.ts",
  ]);
});

test("supplied committed ranges and disposition paths use the same current entry check", async (t) => {
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
      "enabled/committed.spec.ts": "before\n",
      "enabled/disposition.spec.ts": "unchanged\n",
      "disabled/off.spec.ts": "local\n",
    },
  );
  writeFileSync(join(root, "enabled/committed.spec.ts"), "committed\n");
  await git(root, "add", "--", "enabled/committed.spec.ts");
  await git(root, "commit", "-m", "Change a test before refactoring");
  assert.equal(runChangedMakeMeSelection(root).answer.status, "not-selected");
  const { code, answer } = runChangedMakeMeSelection(
    root,
    "--committed",
    "HEAD~1..HEAD",
    "--path",
    "enabled/disposition.spec.ts",
    "--path",
    "disabled/off.spec.ts",
  );
  assert.equal(code, 0);
  assert.deepEqual(answer.files, [
    "enabled/committed.spec.ts",
    "enabled/disposition.spec.ts",
  ]);
  assert.deepEqual(answer.changedPaths, [
    "disabled/off.spec.ts",
    "enabled/committed.spec.ts",
    "enabled/disposition.spec.ts",
  ]);
  assert.equal(
    (await git(root, "status", "--porcelain")).stdout,
    "",
    "scope resolution converts no suite or source",
  );
});

test("production-only and empty changes provide no selected test source", async (t) => {
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations(
      makeMe.anIntentLocation
        .at("enabled")
        .ofKind("typescript", ["*.spec.ts"])
        .usingMakeMe()
        .please(),
    ),
    { "enabled/product.ts": "before\n" },
  );
  assert.deepEqual(runChangedMakeMeSelection(root).answer.files, []);
  writeFileSync(join(root, "enabled/product.ts"), "product\n");
  const { code, answer } = runChangedMakeMeSelection(root);
  assert.equal(code, 0);
  assert.equal(answer.status, "not-selected");
  assert.deepEqual(answer.changedPaths, ["enabled/product.ts"]);
  assert.deepEqual(answer.files, []);
  assert.equal("convention" in answer, false);
});

test("failed Git and configuration checks cannot claim successful empty scope", async (t) => {
  const malformed = await materializeSelectionProject(t, "{broken");
  const noGit = await materializeSelectionProject(t);
  rmSync(join(noGit, ".git"), { recursive: true });
  for (const [root, reason] of [
    [malformed, "configuration-malformed"],
    [noGit, "changed-scope-unreadable"],
  ]) {
    const { code, answer } = runChangedMakeMeSelection(root);
    assert.equal(code, 1);
    assert.equal(answer.status, "unresolved");
    assert.equal(answer.reason, reason);
    assert.equal("files" in answer, false);
  }
});

test("invalid caller dispositions stay unresolved", async (t) => {
  const root = await materializeSelectionProject(t);
  for (const [args, reason] of [
    [["--committed", "missing-revision..HEAD"], "changed-scope-unreadable"],
    [["--committed", "--output=unexpected.patch"], "changed-scope-unreadable"],
    [["--path", "../outside.spec.ts"], "invalid-test-path"],
  ]) {
    const { code, answer } = runChangedMakeMeSelection(root, ...args);
    assert.equal(code, 1);
    assert.equal(answer.reason, reason);
    assert.equal("files" in answer, false);
  }
});
