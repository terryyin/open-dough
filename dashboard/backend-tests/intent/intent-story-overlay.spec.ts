// How a story's comparison paths (../support/storyComparisonPaths.ts) are
// placed over the published Intent locations: renames, the scope each
// location keeps, and the files listed once outside every location.

import { expect, test } from "vitest";
import type { IntentLocation } from "../../src/authenticatedIntentRead.ts";
import {
  intentStoryOverlay,
  intentLocationFiles,
  storyFilePath,
  type StoryOverlay,
} from "../../src/intentStoryOverlay.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { changes, locations } from "../support/storyComparisonPaths.ts";

// Scope projection keys are repository paths even when a rename moved out.
const placed = (
  overlay: StoryOverlay,
  of: readonly IntentLocation[] = locations,
) =>
  Object.fromEntries(
    of.map((location) => [
      location.path,
      [...intentLocationFiles(overlay.files, location).keys()]
        .map((path) => path.slice(location.path.length + 1))
        .sort(),
    ]),
  );

const outside = ({ files }: StoryOverlay) =>
  [...files.values()].flatMap(({ path, outside }) =>
    outside === true ? [path] : [],
  );

test("renames have one destination row and keep their original change for the diff", () => {
  const overlay = intentStoryOverlay(locations, changes);
  for (const change of changes) {
    expect(overlay.files.get(change.path)?.change).toBe(change);
    if (change.kind !== "renamed") continue;
    expect(overlay.files.has(change.oldPath)).toBe(false);
    expect(storyFilePath(overlay, change.oldPath)).toBe(change.path);
  }
  expect(outside(overlay)).toEqual([
    "docs/renamed-notes.md",
    "dashboard/src/app.ts",
  ]);
});

test("a rename leaving Intent keeps its former proof scope independently of its tree row", () => {
  const overlay = intentStoryOverlay(locations, changes);
  expect(placed(overlay)).toEqual({
    features: ["board/select.feature"],
    "dashboard/tests": [
      "a.spec.ts",
      "arriving/arriving.spec.ts",
      "deep/b.spec.ts",
      "gone.spec.ts",
      "leaving.spec.ts",
    ],
    tests: ["check.sh", "moved.sh"],
  });
  expect(overlay.changedLocations).toEqual(
    new Set(["dashboard/tests", "tests"]),
  );
  expect(overlay.files.get("scripts/left.spec.ts")?.proofPath).toBe(
    "dashboard/tests/leaving.spec.ts",
  );
});

test("without a story the tree contains the published files alone", () => {
  const overlay = intentStoryOverlay(locations, undefined);
  expect([...overlay.files.keys()]).toEqual(
    locations.flatMap(({ files }) => files),
  );
  expect(overlay.changedLocations.size).toBe(0);
});

test("a sources location places a story's added matching file as added, and a non-matching neighbor is listed once outside", () => {
  const checks = makeMe.anIntentLocation
    .at("checks")
    .withSources({ include: ["**/*.check"] })
    .selecting("checks/a.check")
    .please();
  const overlay = intentStoryOverlay(
    [checks],
    [
      { kind: "added", path: "checks/b.check" },
      { kind: "added", path: "checks/notes.md" },
    ],
  );
  expect(placed(overlay, [checks])).toEqual({
    checks: ["a.check", "b.check"],
  });
  expect(outside(overlay)).toEqual(["checks/notes.md"]);
  expect(overlay.files.get("checks/b.check")).toMatchObject({
    kind: "added",
    published: false,
  });
});

test("Java changes use configured membership for placement, including unpublished additions and deletions", () => {
  const java = makeMe.anIntentLocation
    .at("backend/src/test/java")
    .ofKind("java", ["**/*Test.java"])
    .selecting("backend/src/test/java/com/example/CalculatorTest.java")
    .please();
  const overlay = intentStoryOverlay(
    [java],
    [
      makeMe.aReviewedFile
        .with({
          kind: "modified",
          path: "backend/src/test/java/com/example/CalculatorTest.java",
        })
        .please(),
      makeMe.aReviewedFile
        .with({
          kind: "added",
          path: "backend/src/test/java/com/example/NewTest.java",
        })
        .please(),
      makeMe.aReviewedFile
        .with({
          kind: "deleted",
          path: "backend/src/test/java/com/example/OldTest.java",
        })
        .please(),
      makeMe.aReviewedFile
        .with({
          kind: "added",
          path: "backend/src/test/java/com/example/Fixture.java",
        })
        .please(),
    ],
  );
  expect(placed(overlay, [java])).toEqual({
    "backend/src/test/java": [
      "com/example/CalculatorTest.java",
      "com/example/NewTest.java",
      "com/example/OldTest.java",
    ],
  });
  expect(outside(overlay)).toEqual([
    "backend/src/test/java/com/example/Fixture.java",
  ]);
  for (const [path, kind, published] of [
    ["CalculatorTest.java", "modified", true],
    ["NewTest.java", "added", false],
    ["OldTest.java", "deleted", false],
  ] as const)
    expect(
      overlay.files.get(`backend/src/test/java/com/example/${path}`),
    ).toMatchObject({ kind, published });
});
