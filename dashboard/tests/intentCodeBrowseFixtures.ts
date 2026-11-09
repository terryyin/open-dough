// Published projects, settings, and source texts for Intent code-kind browse
// journeys (`./intent/intent-code-browse.spec.ts`); its projects and publisher also
// serve other Intent journeys.

import { catalogPublications } from "./catalogProjectRecords.ts";
import { publishIntentProject } from "./publishIntentProject.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

export { publishIntentProject };

export const openDough = {
  ...catalogPublications.openDough,
  revision: "b2".repeat(20),
};

export const doughnut = {
  ...catalogPublications.doughnut,
  revision: "c3".repeat(20),
};

export const pygardon = {
  ...catalogPublications.pygardon,
  revision: "d4".repeat(20),
};

export const openDoughSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript", ["**/*.spec.ts"])
      .please(),
    makeMe.anIntentLocation.at("tests").ofKind("shell", ["*.sh"]).please(),
  )
  .please();

export const doughnutSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation
      .at("scripts")
      .ofKind("javascript", ["**/*.test.mjs"])
      .please(),
  )
  .please();

export const pygardonSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation
      .at("frontend/src")
      .ofKind("typescript", [
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
      ])
      .please(),
    makeMe.anIntentLocation
      .at("tests")
      .ofKind("python", ["**/test_*.py"])
      .please(),
  )
  .please();

export const browseSpec = `import { test } from "@playwright/test";
test("browses", async () => {});
`;

export const devicesSpec = `export function devices() {
  return "devices";
}
`;

export const aspyPage = `export function AspyPage() {
  return null;
}
`;

export const pythonTest = `def test_example():
    assert "ok"
`;

export const shellCheck = `#!/usr/bin/env bash
echo ok
`;

export const nodeTest = `import assert from "node:assert/strict";
assert.equal(1, 1);
`;

// How many times the page read `path`'s content from a project published by
// `publishIntentProject`.
export function contentReadsOf(
  requests: Awaited<ReturnType<typeof publishIntentProject>>,
  path: string,
) {
  return requests.filter(
    ({ request }) => request.kind === "content" && request.path === path,
  ).length;
}
