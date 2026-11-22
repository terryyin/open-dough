// A selected story's changes placed over Intent's published tree
// (../../src/intentStoryOverlay.ts), with the locations of the moves journey
// (../../test-support/support/intentStoryWorktree.ts) behind an unchanged
// first location: a rename into a location sits at its new path, inserted;
// one out of a location stays at its old path; one between locations sits at
// its new path, its old entry gone. A deletion the published tree no longer
// lists stays, unpublished. Each change no location admits, a rename by
// either path, is listed once outside at its repository path. "Selected story
// only" keeps just the changed entries, and the story opens the first changed
// location in configured order with the folders holding changes, whether or
// not it is restricted. A location declared by source entries places a story's added
// file by the same rule. The integrated journeys: ../../../e2e/intent/intent-story-changes-moves.spec.ts
// and ../../../e2e/intent/intent-story-completed.spec.ts.

import { expect, test } from "../../test-support/support/pageTest.ts";
import type { IntentLocation } from "../../src/authenticatedIntentRead.ts";
import {
  intentStoryOverlay,
  overlayFilesByPath,
  storyChangesOnly,
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

// Each location's tree files as `path [kind] (unpublished)`, by location.
const placed = (
  { locations: shown }: StoryOverlay,
  of: readonly IntentLocation[] = locations,
) =>
  Object.fromEntries(
    shown.map(({ files, containsChanges }, index) => [
      `${of[index]?.path ?? ""}${containsChanges ? " (changes)" : ""}`,
      files.map(
        (file) =>
          `${file.path}${file.kind === undefined ? "" : ` [${file.kind}]`}${
            file.published ? "" : " (unpublished)"
          }`,
      ),
    ]),
  );

// The changed files outside every location as `path [kind]`.
const outside = ({ outside: files }: StoryOverlay) =>
  files.map((file) => `${file.path} [${file.kind ?? ""}]`);

test("each change sits where a location admits its path, else a rename's old path; the rest are listed once outside", () => {
  const overlay = intentStoryOverlay(locations, changes);
  expect(placed(overlay)).toEqual({
    features: ["board/select.feature"],
    "dashboard/tests (changes)": [
      "a.spec.ts",
      "deep/b.spec.ts [modified]",
      // Out of the location: at its old path, which the published tree lists.
      "leaving.spec.ts [renamed]",
      "gone.spec.ts [deleted] (unpublished)",
      // Into the location: inserted at its new path.
      "arriving/arriving.spec.ts [renamed] (unpublished)",
    ],
    // Between locations: at its new path, its old entry gone from the first.
    "tests (changes)": ["check.sh", "moved.sh [renamed] (unpublished)"],
  });
  // The rename neither path admits and the product change, once each.
  expect(outside(overlay)).toEqual([
    "docs/renamed-notes.md [renamed]",
    "dashboard/src/app.ts [modified]",
  ]);
  // Each change keeps the comparison's file for its diff.
  expect(overlay.outside[1]?.change).toBe(changes[6]);
  const between = overlay.locations[2]?.files[1];
  expect(between?.change).toBe(changes[4]);
});

test("the tree's files by repository path hold the outside files beside the located ones", () => {
  const overlay = intentStoryOverlay(locations, changes);
  const byPath = overlayFilesByPath(locations, overlay);
  expect(byPath.get("dashboard/src/app.ts")?.change).toBe(changes[6]);
  expect(byPath.get("dashboard/tests/deep/b.spec.ts")?.kind).toBe("modified");
});

test("without a story the trees are the published files alone", () => {
  const overlay = intentStoryOverlay(locations, undefined);
  expect(outside(overlay)).toEqual([]);
  expect(placed(overlay)).toEqual({
    features: ["board/select.feature"],
    "dashboard/tests": [
      "a.spec.ts",
      "between/moved.spec.ts",
      "deep/b.spec.ts",
      "leaving.spec.ts",
    ],
    tests: ["check.sh"],
  });
});

test("Selected story only keeps the changed entries, deletions and renames included", () => {
  const only = storyChangesOnly(intentStoryOverlay(locations, changes));
  expect(outside(only)).toEqual([
    "docs/renamed-notes.md [renamed]",
    "dashboard/src/app.ts [modified]",
  ]);
  expect(placed(only)).toEqual({
    features: [],
    "dashboard/tests (changes)": [
      "deep/b.spec.ts [modified]",
      "leaving.spec.ts [renamed]",
      "gone.spec.ts [deleted] (unpublished)",
      "arriving/arriving.spec.ts [renamed] (unpublished)",
    ],
    "tests (changes)": ["moved.sh [renamed] (unpublished)"],
  });
});

test("the story opens the first changed location and the folders holding changes, restricted or not", () => {
  const overlay = intentStoryOverlay(locations, changes);
  const expansion = {
    location: "dashboard/tests",
    folders: [[], ["arriving", "deep"], []],
    outsideFolders: ["dashboard/src", "docs"],
  };
  expect(storyOverlayExpansion(locations, overlay)).toEqual(expansion);
  expect(storyOverlayExpansion(locations, storyChangesOnly(overlay))).toEqual(
    expansion,
  );
  // A story changing nothing a location admits opens none.
  expect(
    storyOverlayExpansion(
      locations,
      intentStoryOverlay(locations, [changes[6] as ReviewedFile]),
    ),
  ).toEqual({
    location: undefined,
    folders: [[], [], []],
    outsideFolders: ["dashboard/src"],
  });
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
    "checks (changes)": ["a.check", "b.check [added] (unpublished)"],
  });
  expect(outside(overlay)).toEqual(["checks/notes.md [added]"]);
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
    "backend/src/test/java (changes)": [
      "com/example/CalculatorTest.java [modified]",
      "com/example/NewTest.java [added] (unpublished)",
      "com/example/OldTest.java [deleted] (unpublished)",
    ],
  });
  expect(outside(overlay)).toEqual([
    "backend/src/test/java/com/example/Fixture.java [added]",
  ]);
});
