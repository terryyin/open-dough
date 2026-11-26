// The repository tree a story's comparison lists over the published Intent
// locations (../support/storyComparisonPaths.ts): what Changes only and
// Intent only list, their empty match, and the folders the story opens.

import { expect, test } from "vitest";
import {
  intentStoryOverlay,
  storyRepositoryTree,
  storyOverlayExpansion,
  type StoryOverlay,
} from "../../src/intentStoryOverlay.ts";
import type { ReviewedFile } from "../../src/storyReviewFiles.ts";
import { changes, locations } from "../support/storyComparisonPaths.ts";

// The comparison's paths in repository order, renames at their destination.
const order = [
  "dashboard/src/app.ts",
  "dashboard/tests/arriving/arriving.spec.ts",
  "dashboard/tests/deep/b.spec.ts",
  "dashboard/tests/gone.spec.ts",
  "docs/renamed-notes.md",
  "scripts/left.spec.ts",
  "tests/moved.sh",
];

test("Changes only lists just the comparison's paths, deletions and renames included, in repository order", () => {
  const overlay = intentStoryOverlay(locations, changes);
  const changesOnly = storyRepositoryTree(locations, overlay, true);
  expect(changesOnly.changedFiles.map(({ path }) => path)).toEqual(order);
  expect([...changesOnly.files.keys()].sort()).toEqual([...order].sort());
  expect(changesOnly.roots.has("features")).toBe(false);
  expect(changesOnly.noMatch).toBe(false);
});

test("with Changes only off the revision is listed too, the changes in the same order", () => {
  const overlay = intentStoryOverlay(locations, changes);
  const revision = storyRepositoryTree(locations, overlay, false);
  expect(revision.changedFiles.map(({ path }) => path)).toEqual(order);
  expect([...revision.files.keys()]).toEqual([...overlay.files.keys()]);
  expect(revision.roots.has("features")).toBe(true);
});

test("Changes only over a comparison with no changed path matches nothing", () => {
  const overlay = intentStoryOverlay(locations, []);
  expect(storyRepositoryTree(locations, overlay, true)).toMatchObject({
    noMatch: true,
    changedFiles: [],
  });
  expect(storyRepositoryTree(locations, overlay, false).noMatch).toBe(false);
});

// Paths no configured location selects, on either side of a change.
const outsideIntent = ["dashboard/src/app.ts", "docs/renamed-notes.md"];

test("Intent only keeps the changes a location selects, a rename by either path and a deletion by its path", () => {
  const overlay = intentStoryOverlay(locations, changes);
  const both = storyRepositoryTree(locations, overlay, true, true);
  expect(both.changedFiles.map(({ path }) => path)).toEqual(
    order.filter((path) => !outsideIntent.includes(path)),
  );
  expect(both.noMatch).toBe(false);
});

test("Intent only with Changes only off lists the selected revision paths and admitted changes", () => {
  const overlay = intentStoryOverlay(locations, changes);
  const intent = storyRepositoryTree(locations, overlay, false, true);
  expect([...intent.files.keys()]).toEqual(
    [...overlay.files.keys()].filter((path) => !outsideIntent.includes(path)),
  );
});

test("both filters over a production-only change match nothing", () => {
  const productOnly = intentStoryOverlay(locations, [
    changes[6] as ReviewedFile,
  ]);
  expect(storyRepositoryTree(locations, productOnly, true, true)).toMatchObject(
    { noMatch: true, changedFiles: [] },
  );
});

test("without locations Intent only lists nothing and leaves the reason to the configuration notice", () => {
  const unconfigured = intentStoryOverlay([], changes);
  const none = storyRepositoryTree([], unconfigured, false, true);
  expect(none.files.size).toBe(0);
  expect(none.noMatch).toBe(false);
  expect(storyRepositoryTree([], unconfigured, false).files.size).toBe(
    changes.length,
  );
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
