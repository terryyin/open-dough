// A story's worktree whose changes Intent overlays on its published tests
// (../../../e2e/intent/intent-story-changes.spec.ts): trunk publishes Intent locations for
// `dashboard/tests` (TypeScript specs) and `tests` (shell scripts) with test
// files in nested folders, and the story modifies one spec, adds another as
// an untracked file, deletes one, renames one between the two locations, one
// into a location from outside, and one out of a location, and changes a
// product file and renames a document, neither in any location. Each test
// rename adds one line, little enough that Git detects it as a rename.
// Another story changes only the product file.

import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import { intentSettingsText } from "./intentSettingsFile.ts";

// The story's changes as Review changes names each file's control.
export const changed = {
  modified: "Modified dashboard/tests/a.spec.ts",
  added: "Added dashboard/tests/boundary/b.spec.ts",
  deleted: "Deleted dashboard/tests/gone.spec.ts",
  between: "Renamed dashboard/tests/between/moved.spec.ts → tests/moved.sh",
  into: "Renamed scripts/arriving.spec.ts → dashboard/tests/arriving/arriving.spec.ts",
  outOf:
    "Renamed dashboard/tests/out/leaving.spec.ts → scripts/leaving.spec.ts",
} as const;

// Intent settings naming the locations, as trunk publishes them.
export const intentSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript", ["**/*.spec.ts"])
      .please(),
    makeMe.anIntentLocation.at("tests").ofKind("shell", ["*.sh"]).please(),
  )
  .please();

// Trunk's revision: Intent settings and the sources.
export const intentTrunkRevision = {
  message: "intent locations and tests",
  files: {
    ".planning/open-dough.json": intentSettingsText(intentSettings),
    "dashboard/tests/a.spec.ts": lines("a"),
    "dashboard/tests/gone.spec.ts": lines("gone"),
    "dashboard/tests/boundary/kept.spec.ts": lines("kept"),
    "dashboard/tests/other/c.spec.ts": lines("c"),
    "dashboard/tests/between/moved.spec.ts": lines("between"),
    "dashboard/tests/out/leaving.spec.ts": lines("leaving"),
    "scripts/arriving.spec.ts": lines("arriving"),
    "tests/check.sh": lines("check"),
    "dashboard/src/App.tsx": lines("app"),
    "docs/notes.md": lines("notes"),
  },
} satisfies RevisionFacts;

// Publishes that revision onto trunk from the project checkout.
export function publishIntentTrunk(project: string) {
  writeRevisionFiles(project, intentTrunkRevision);
  commitAll(project, intentTrunkRevision.message);
  git(project, "push", "--quiet", "origin", "main");
}

// The story's changes in its worktree: committed, plus one untracked spec.
export function changeIntentTests(workspace: string) {
  // A rename with a small edit, so its diff shows a line and Git still
  // detects the rename.
  const move = (from: string, to: string, word?: string) => {
    mkdirSync(path.dirname(path.join(workspace, to)), { recursive: true });
    git(workspace, "mv", from, to);
    if (word !== undefined) writeAt(workspace, to, `${lines(word)}renamed\n`);
  };
  writeAt(workspace, "dashboard/tests/a.spec.ts", `${lines("a")}more\n`);
  rmSync(path.join(workspace, "dashboard/tests/gone.spec.ts"));
  move("dashboard/tests/between/moved.spec.ts", "tests/moved.sh", "between");
  move(
    "scripts/arriving.spec.ts",
    "dashboard/tests/arriving/arriving.spec.ts",
    "arriving",
  );
  move(
    "dashboard/tests/out/leaving.spec.ts",
    "scripts/leaving.spec.ts",
    "leaving",
  );
  move("docs/notes.md", "docs/renamed-notes.md");
  writeAt(workspace, "dashboard/src/App.tsx", `${lines("app")}more\n`);
  commitAll(workspace, "change the tests");
  writeAt(workspace, "dashboard/tests/boundary/b.spec.ts", "added\n");
}

// A long spec the story adds two folders deep (`boundary/deep`), as Review
// changes names its control.
export const deepSpec = "Added dashboard/tests/boundary/deep/long.spec.ts";

// The story's changes, and that long added spec.
export function changeWithDeepSpec(workspace: string) {
  changeIntentTests(workspace);
  writeAt(
    workspace,
    "dashboard/tests/boundary/deep/long.spec.ts",
    lines("long", 120),
  );
}

// A story's worktree changing only a product file, outside every location.
export function changeProductOnly(workspace: string) {
  writeAt(workspace, "dashboard/src/App.tsx", `${lines("app")}more\n`);
  commitAll(workspace, "change the product");
}
