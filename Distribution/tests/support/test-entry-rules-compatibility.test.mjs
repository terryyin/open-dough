import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { makeMeSkillFiles } from "./makeme-skill-files.mjs";
import {
  materializeSelectionProject,
  runChangedSelection,
  runSourceSelection,
  intentSettingsForLocations,
} from "./makeme-selection-project.mjs";

test("the installed source command retains independent entry choices", async (t) => {
  const locations = [
    makeMe.anIntentLocation
      .at("both")
      .ofKind("javascript")
      .usingMakeMe()
      .withRules({ pageObjects: true })
      .please(),
    makeMe.anIntentLocation
      .at("pages")
      .ofKind("javascript")
      .usingMakeMe(false)
      .withRules({ pageObjects: true })
      .please(),
    makeMe.anIntentLocation
      .at("data")
      .ofKind("javascript")
      .usingMakeMe()
      .please(),
    makeMe.anIntentLocation.at("neither").ofKind("javascript").please(),
  ];
  const root = await materializeSelectionProject(
    t,
    intentSettingsForLocations(...locations),
  );
  const paths = [
    "both/new.test.mjs",
    "pages/new.test.mjs",
    "data/new.test.mjs",
    "neither/new.test.mjs",
  ];
  const { code, answer } = runSourceSelection(root, ...paths);
  assert.equal(code, 0);
  assert.deepEqual(answer.sources, [
    { path: paths[0], makeMe: true, pageObjects: true },
    { path: paths[1], makeMe: false, pageObjects: true },
    { path: paths[2], makeMe: true, pageObjects: false },
    { path: paths[3], makeMe: false, pageObjects: false },
  ]);
});

test("the common changed command keeps exact commits, explicit ranges and caller paths distinct", async (t) => {
  const settings = intentSettingsForLocations(
    makeMe.anIntentLocation
      .at("browser")
      .ofKind("javascript")
      .withRules({ makeMe: true, pageObjects: true })
      .please(),
  );
  const { integration: root, revisions } = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: {
          ...makeMeSkillFiles(
            fileURLToPath(new URL("../../..", import.meta.url)),
            ".agents/skills",
          ),
          ".planning/open-dough.json": JSON.stringify(settings),
          "browser/first.mjs": "original\n",
          "browser/later.mjs": "original\n",
          "browser/explicit.mjs": "unchanged\n",
        },
      })
      .withRevision("first", {
        files: { "browser/first.mjs": "first change\n" },
      })
      .withRevision("later", {
        files: { "browser/later.mjs": "later change\n" },
      })
      .please(),
  );
  const selected = (...args) => {
    const { code, answer } = runChangedSelection(root, ...args);
    assert.equal(code, 0);
    return answer.sources.map((source) => source.path);
  };
  assert.deepEqual(selected("--committed", revisions.first), [
    "browser/first.mjs",
  ]);
  assert.deepEqual(
    selected("--committed", `${revisions.base}..${revisions.later}`),
    ["browser/first.mjs", "browser/later.mjs"],
  );
  assert.deepEqual(
    selected("--committed", revisions.first, "--path", "browser/explicit.mjs"),
    ["browser/explicit.mjs", "browser/first.mjs"],
  );
});
