import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { makeMe } from "./makeMe.mjs";
import {
  selectTestEntryRules,
  testEntryRules,
} from "../../src/skills/dough-execute-plan/scripts/test-entry-rules.mjs";

function settingsWith(...locations) {
  return JSON.stringify(
    makeMe.intentSettings.withLocations(...locations).please(),
  );
}

test("four entries select independent rules using the declared test membership", () => {
  const both = makeMe.anIntentLocation
    .at("both")
    .ofKind("typescript", ["**/*.spec.ts"])
    .withRules({ makeMe: true, pageObjects: true })
    .please();
  const pages = makeMe.anIntentLocation
    .at("pages")
    .ofKind("typescript", ["**/*.spec.ts"])
    .withRules({ makeMe: false, pageObjects: true })
    .please();
  const data = makeMe.anIntentLocation
    .at("data")
    .ofKind("typescript", ["**/*.spec.ts"])
    .withRules({ makeMe: true, pageObjects: false })
    .please();
  const neither = makeMe.anIntentLocation
    .at("neither")
    .ofKind("typescript", ["**/*.spec.ts"])
    .please();
  assert.deepEqual(
    selectTestEntryRules(settingsWith(both, pages, data, neither), [
      "both/nested/a.spec.ts",
      "pages/a.spec.ts",
      "data/a.spec.ts",
      "neither/a.spec.ts",
      "both/a.ts",
      "both/a.spec.TS",
      "outside/a.spec.ts",
    ]),
    {
      status: "resolved",
      sources: [
        { path: "both/nested/a.spec.ts", makeMe: true, pageObjects: true },
        { path: "pages/a.spec.ts", makeMe: false, pageObjects: true },
        { path: "data/a.spec.ts", makeMe: true, pageObjects: false },
        { path: "neither/a.spec.ts", makeMe: false, pageObjects: false },
        { path: "both/a.ts", makeMe: false, pageObjects: false },
        { path: "both/a.spec.TS", makeMe: false, pageObjects: false },
        { path: "outside/a.spec.ts", makeMe: false, pageObjects: false },
      ],
    },
  );
});

test("sources take precedence and custom extensions stay case-sensitive; overlapping opt-outs do not veto either rule", () => {
  const custom = makeMe.anIntentLocation
    .at("checks")
    .withSources({ include: ["**/*.check"], syntax: "python" })
    .withRules({ pageObjects: true })
    .please();
  // Conflicting legacy fields are exact input under proof.
  const declared = { ...custom, kind: "typescript", include: ["**/*.spec.ts"] };
  const overlap = makeMe.anIntentLocation
    .at("checks/nested")
    .withSources({ include: ["**/*.check"] })
    .withRules({ makeMe: true, pageObjects: false })
    .please();
  const optOut = makeMe.anIntentLocation
    .at("checks")
    .withSources({ include: ["**/*"] })
    .withRules({ makeMe: false, pageObjects: false })
    .please();
  assert.deepEqual(
    selectTestEntryRules(settingsWith(optOut, overlap, declared), [
      "checks/nested/a.check",
      "checks/a.check",
      "checks/a.CHECK",
      "checks/a.spec.ts",
    ]).sources,
    [
      { path: "checks/nested/a.check", makeMe: true, pageObjects: true },
      { path: "checks/a.check", makeMe: false, pageObjects: true },
      { path: "checks/a.CHECK", makeMe: false, pageObjects: false },
      { path: "checks/a.spec.ts", makeMe: false, pageObjects: false },
    ],
  );
});

test("omitted, false and non-boolean flags never enable a convention", () => {
  const entry = makeMe.anIntentLocation
    .at("browser")
    .ofKind("javascript", ["**/*.spec.mjs"])
    .please();
  for (const value of [undefined, false, "true", 1, null, {}, []]) {
    // These exact invalid flag values stay outside the valid domain builder.
    const declared = { ...entry, makeMe: value, pageObjects: value };
    assert.deepEqual(
      selectTestEntryRules(settingsWith(declared), ["browser/a.spec.mjs"])
        .sources,
      [{ path: "browser/a.spec.mjs", makeMe: false, pageObjects: false }],
      `flag ${JSON.stringify(value)}`,
    );
  }
});

test("missing configuration is off; malformed and unreadable settings remain unresolved", async (t) => {
  const project = mkdtempSync(join(tmpdir(), "test-entry-rules-"));
  t.after(() => rmSync(project, { recursive: true, force: true }));
  assert.deepEqual(await testEntryRules(project, ["browser/new.spec.ts"]), {
    status: "resolved",
    configuration: "absent",
    sources: [
      { path: "browser/new.spec.ts", makeMe: false, pageObjects: false },
    ],
  });
  mkdirSync(join(project, ".planning"));
  const settings = join(project, ".planning/open-dough.json");
  writeFileSync(settings, "{ malformed settings");
  assert.deepEqual(await testEntryRules(project, ["browser/new.spec.ts"]), {
    status: "unresolved",
    problem: "malformed",
    sources: [],
  });
  rmSync(settings);
  mkdirSync(settings);
  assert.deepEqual(await testEntryRules(project, ["browser/new.spec.ts"]), {
    status: "unresolved",
    problem: "unreadable",
    sources: [],
  });
});

test("unusable include declarations and unsafe source paths do not widen membership", () => {
  const entry = makeMe.anIntentLocation
    .at("browser")
    .ofKind("typescript")
    .withRules({ pageObjects: true })
    .please();
  assert.deepEqual(
    selectTestEntryRules(settingsWith({ ...entry, include: ["../*.ts"] }), [
      "browser/a.ts",
    ]).sources,
    [{ path: "browser/a.ts", makeMe: false, pageObjects: false }],
  );
  assert.throws(
    () => selectTestEntryRules(settingsWith(entry), ["browser/../a.ts"]),
    /project-relative test source/,
  );
});
