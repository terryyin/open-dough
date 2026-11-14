import assert from "node:assert/strict";
import test from "node:test";
import { makeMe } from "./support/makeMe.mjs";
import {
  materializeSelectionProject,
  runMakeMeSelection,
  intentSettingsForLocations,
} from "./support/makeme-selection-project.mjs";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

test("omitted, false and non-boolean flags remain off", async (t) => {
  const valid = makeMe.anIntentLocation
    .at("checks")
    .ofKind("javascript")
    .please();
  for (const flag of [undefined, false, "true", 1, {}, null]) {
    // The flag's exact invalid representation is the input under proof.
    const entry = flag === undefined ? valid : { ...valid, makeMe: flag };
    const root = await materializeSelectionProject(
      t,
      intentSettingsForLocations(entry),
    );
    const { code, answer } = runMakeMeSelection(root, "checks/a.test.mjs");
    assert.equal(code, 0);
    assert.equal(answer.status, "not-selected");
    assert.equal(answer.reason, "no-enabled-source");
    assert.deepEqual(answer.files, []);
  }
});

test("missing configuration is a successful no-opt-in answer", async (t) => {
  const root = await materializeSelectionProject(t);
  const { code, answer } = runMakeMeSelection(root, "checks/a.test.mjs");
  assert.equal(code, 0);
  assert.equal(answer.status, "not-selected");
  assert.equal(answer.reason, "configuration-absent");
});

test("malformed and unreadable configuration remain unresolved checks", async (t) => {
  const malformed = await materializeSelectionProject(t, "{broken");
  const unreadable = await materializeSelectionProject(t);
  mkdirSync(join(unreadable, ".planning/open-dough.json"), { recursive: true });
  for (const [root, reason] of [
    [malformed, "configuration-malformed"],
    [unreadable, "configuration-unreadable"],
  ]) {
    const { code, answer } = runMakeMeSelection(root, "checks/a.test.mjs");
    assert.equal(code, 1);
    assert.equal(answer.status, "unresolved");
    assert.equal(answer.reason, reason);
    assert.equal("files" in answer, false);
  }
});

test("unsafe source paths do not claim successful applicability", async (t) => {
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations(
      makeMe.anIntentLocation
        .at("checks")
        .ofKind("javascript")
        .usingMakeMe()
        .please(),
    ),
  );
  for (const path of [
    "../checks/a.mjs",
    "/checks/a.mjs",
    "checks/../a.mjs",
    "checks\\a.mjs",
    "checks//a.mjs",
  ]) {
    const { code, answer } = runMakeMeSelection(root, path);
    assert.equal(code, 1);
    assert.equal(answer.reason, "invalid-test-path");
  }
});
