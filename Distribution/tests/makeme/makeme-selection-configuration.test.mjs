import assert from "node:assert/strict";
import test from "node:test";
import { makeMe } from "../support/makeMe.mjs";
import {
  materializeSelectionProject,
  runSourceSelection,
  intentSettingsForLocations,
} from "../support/makeme-selection-project.mjs";
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
    const { code, answer } = runSourceSelection(root, "checks/a.test.mjs");
    assert.equal(code, 0);
    assert.equal(answer.status, "resolved");
    assert.equal(answer.sources[0].makeMe, false);
  }
});

test("missing configuration is a successful no-opt-in answer", async (t) => {
  const root = await materializeSelectionProject(t);
  const { code, answer } = runSourceSelection(root, "checks/a.test.mjs");
  assert.equal(code, 0);
  assert.equal(answer.status, "resolved");
  assert.equal(answer.configuration, "absent");
  assert.equal(answer.sources[0].makeMe, false);
});

test("malformed and unreadable configuration remain unresolved checks", async (t) => {
  const malformed = await materializeSelectionProject(t, "{broken");
  const unreadable = await materializeSelectionProject(t);
  mkdirSync(join(unreadable, ".planning/open-dough.json"), { recursive: true });
  for (const [root, problem] of [
    [malformed, "malformed"],
    [unreadable, "unreadable"],
  ]) {
    const { code, answer } = runSourceSelection(root, "checks/a.test.mjs");
    assert.equal(code, 1);
    assert.equal(answer.status, "unresolved");
    assert.equal(answer.problem, problem);
    assert.deepEqual(answer.sources, []);
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
    const { code, stderr, answer } = runSourceSelection(root, path);
    assert.equal(code, 2);
    assert.match(stderr, /Expected a project-relative test source path/);
    assert.equal(answer, undefined);
  }
});
