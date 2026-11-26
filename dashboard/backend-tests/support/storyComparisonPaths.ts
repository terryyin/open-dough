// Story comparison paths over the published Intent locations, modeled on
// ../../../e2e/intent/intent-story-changes-moves.spec.ts with an unchanged
// location first to distinguish configured order from expansion. The
// overlay's placement (../intent/intent-story-overlay.spec.ts) and the tree it
// lists (../intent/intent-story-repository-tree.spec.ts) read them.

import type { IntentLocation } from "../../src/authenticatedIntentRead.ts";
import type { ReviewedFile } from "../../src/storyReviewFiles.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

export const locations: readonly IntentLocation[] = [
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

export const changes: readonly ReviewedFile[] = [
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
