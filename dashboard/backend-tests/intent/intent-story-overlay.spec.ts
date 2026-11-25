// Story comparison paths over the published Intent locations, modeled on
// ../../../e2e/intent/intent-story-changes-moves.spec.ts with an unchanged
// location first to distinguish configured order from expansion.

import { expect, test } from "vitest";
import type { IntentLocation } from "../../src/authenticatedIntentRead.ts";
import {
  intentStoryOverlay,
  intentLocationFiles,
  storyFilePath,
  storyRepositoryTree,
  storyOverlayExpansion,
  type StoryOverlay,
} from "../../src/intentStoryOverlay.ts";
import type { ReviewedFile } from "../../src/storyReviewFiles.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const locations: readonly IntentLocation[] = [
  makeMe.anIntentLocation
    .at("features")
    .ofKind("gherkin")
    .selecting("features/board/select.feature")
    .please(),
  makeMe.anIntentLocation
    .at("dashboard/tests")
    .ofKind("typescript", ["**/*.spec.ts"])
    .selecting(
      "dashboard/tests/a.spec.ts",
      "dashboard/tests/between/moved.spec.ts",
      "dashboard/tests/deep/b.spec.ts",
      "dashboard/tests/leaving.spec.ts",
    )
    .please(),
  makeMe.anIntentLocation
    .at("tests")
    .ofKind("shell", ["*.sh"])
    .selecting("tests/check.sh")
    .please(),
];

const changes: readonly ReviewedFile[] = [
  { kind: "modified", path: "dashboard/tests/deep/b.spec.ts" },
  // Absent from the published tree, as a completed story's deletion is.
  { kind: "deleted", path: "dashboard/tests/gone.spec.ts" },
  {
    kind: "renamed",
    oldPath: "scripts/arriving.spec.ts",
    path: "dashboard/tests/arriving/arriving.spec.ts",
  },
  {
    kind: "renamed",
    oldPath: "dashboard/tests/leaving.spec.ts",
    path: "scripts/left.spec.ts",
  },
  {
    kind: "renamed",
    oldPath: "dashboard/tests/between/moved.spec.ts",
    path: "tests/moved.sh",
  },
  { kind: "renamed", oldPath: "docs/notes.md", path: "docs/renamed-notes.md" },
  { kind: "modified", path: "dashboard/src/app.ts" },
];

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

test("Selected story only keeps the changed entries in the same repository order", () => {
  const overlay = intentStoryOverlay(locations, changes);
  const order = [
    "dashboard/src/app.ts",
    "dashboard/tests/arriving/arriving.spec.ts",
    "dashboard/tests/deep/b.spec.ts",
    "dashboard/tests/gone.spec.ts",
    "docs/renamed-notes.md",
    "scripts/left.spec.ts",
    "tests/moved.sh",
  ];
  for (const only of [false, true]) {
    const shown = storyRepositoryTree(locations, overlay, only);
    expect(shown.changedFiles.map(({ path }) => path)).toEqual(order);
    expect(shown.roots.has("features")).toBe(!only);
  }
});

test("the story opens the first changed location and the folders holding changes, restricted or not", () => {
  const opened = (overlay: StoryOverlay, only: boolean) => {
    const { nodes, changedFiles } = storyRepositoryTree(
      locations,
      overlay,
      only,
    );
    return new Set(
      storyOverlayExpansion(locations, overlay, nodes, changedFiles),
    );
  };
  const overlay = intentStoryOverlay(locations, changes);
  const expansion = new Set([
    "dashboard",
    "dashboard/tests",
    "dashboard/tests/arriving",
    "dashboard/tests/deep",
    "dashboard/src",
    "docs",
    "scripts",
  ]);
  expect(opened(overlay, false)).toEqual(expansion);
  expect(opened(overlay, true)).toEqual(expansion);
  expect(
    opened(intentStoryOverlay(locations, [changes[6] as ReviewedFile]), false),
  ).toEqual(new Set(["dashboard", "dashboard/src"]));
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
