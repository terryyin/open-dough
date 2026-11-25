// Story comparison paths over the published Intent locations, modeled on
// ../../../e2e/intent/intent-story-changes-moves.spec.ts with an unchanged
// location first to distinguish configured order from expansion.

import { expect, test } from "vitest";
import type { IntentLocation } from "../../src/authenticatedIntentRead.ts";
import {
  intentStoryOverlay,
  overlayFilesByPath,
  storyChangesOnly,
  storyOverlayExpansion,
  type StoryOverlay,
} from "../../src/intentStoryOverlay.ts";
import type { ReviewedFile } from "../../src/storyReviewFiles.ts";
import { reviewFileTree } from "../../src/reviewFileTree.ts";
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
  const opened = (overlay: StoryOverlay) => {
    const files = [...overlayFilesByPath(locations, overlay)].map(
      ([path, file]) => ({ ...file, path }),
    );
    const tree = reviewFileTree(files, { compact: false });
    return new Set(storyOverlayExpansion(locations, overlay, tree));
  };
  const expansion = new Set([
    "dashboard",
    "dashboard/tests",
    "dashboard/tests/arriving",
    "dashboard/tests/deep",
    "dashboard/src",
    "docs",
  ]);
  expect(opened(overlay)).toEqual(expansion);
  expect(opened(storyChangesOnly(overlay))).toEqual(expansion);
  // A story changing nothing a location admits opens none.
  expect(
    opened(intentStoryOverlay(locations, [changes[6] as ReviewedFile])),
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
