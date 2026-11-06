// A selected story's changes placed over Intent's published tree
// (../../src/intentStoryOverlay.ts), with the locations of the moves journey
// (../support/intentStoryWorktree.ts) behind an unchanged first location: a
// rename into a location sits at its new path, inserted; one out of a
// location stays at its old path; one between locations sits at its new path,
// its old entry gone; one neither location admits is not listed. A deletion
// the published tree no longer lists stays, unpublished. Each change no
// location admits counts once outside. "Selected story only" keeps just the
// changed entries, and the story opens the first changed location in
// configured order with the folders holding changes, whether or not it is
// restricted. The integrated journeys: ../tests/intent/intent-story-changes-moves.spec.ts
// and ../tests/intent/intent-story-completed.spec.ts.

import { expect, test } from "../tests/support/pageTest.ts";
import type { IntentLocation } from "../src/authenticatedIntentRead.ts";
import {
  intentStoryOverlay,
  storyChangesOnly,
  storyOverlayExpansion,
  type StoryOverlay,
} from "../src/intentStoryOverlay.ts";
import type { ReviewedFile } from "../src/storyReviewFiles.ts";

const locations: readonly IntentLocation[] = [
  {
    path: "features",
    kind: "gherkin",
    files: ["features/board/select.feature"],
  },
  {
    path: "dashboard/tests",
    kind: "typescript",
    include: ["**/*.spec.ts"],
    files: [
      "dashboard/tests/a.spec.ts",
      "dashboard/tests/between/moved.spec.ts",
      "dashboard/tests/deep/b.spec.ts",
      "dashboard/tests/leaving.spec.ts",
    ],
  },
  {
    path: "tests",
    kind: "shell",
    include: ["*.sh"],
    files: ["tests/check.sh"],
  },
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
const placed = ({ locations: shown }: StoryOverlay) =>
  Object.fromEntries(
    shown.map(({ files, containsChanges }, index) => [
      `${locations[index]?.path ?? ""}${containsChanges ? " (changes)" : ""}`,
      files.map(
        (file) =>
          `${file.path}${file.kind === undefined ? "" : ` [${file.kind}]`}${
            file.published ? "" : " (unpublished)"
          }`,
      ),
    ]),
  );

test("each change sits where a location admits its path, else a rename's old path; the rest count once outside", () => {
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
  expect(overlay.outside).toBe(2);
  // Each change keeps the comparison's file for its diff.
  const between = overlay.locations[2]?.files[1];
  expect(between?.change).toBe(changes[4]);
});

test("without a story the trees are the published files alone", () => {
  const overlay = intentStoryOverlay(locations, undefined);
  expect(overlay.outside).toBe(0);
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
  expect(only.outside).toBe(2);
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
  ).toEqual({ location: undefined, folders: [[], [], []] });
});
