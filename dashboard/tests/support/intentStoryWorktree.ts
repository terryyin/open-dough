// A story's worktree whose changes Intent overlays on its published tests
// (../intent-story-changes.spec.ts): trunk publishes Intent locations for
// `dashboard/tests` (TypeScript specs) and `tests` (shell scripts) with test
// files in nested folders, and the story modifies one spec, adds another as
// an untracked file, deletes one, renames one between the two locations, one
// into a location from outside, and one out of a location, and changes a
// product file and renames a document, neither in any location. Each test
// rename adds one line, little enough that Git detects it as a rename.
// Another story changes only the product file.

import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";

export const intentLocations = [
  { path: "dashboard/tests", kind: "typescript", include: ["**/*.spec.ts"] },
  { path: "tests", kind: "shell", include: ["*.sh"] },
];

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

// Trunk's files: Intent settings beside the project's own, and the sources.
export function publishIntentTrunk(project: string) {
  const settingsPath = path.join(project, ".planning/open-dough.json");
  const settings: Record<string, unknown> = existsSync(settingsPath)
    ? (JSON.parse(readFileSync(settingsPath, "utf8")) as Record<
        string,
        unknown
      >)
    : {};
  writeAt(
    project,
    ".planning/open-dough.json",
    `${JSON.stringify({ ...settings, intent: { locations: intentLocations } }, null, 2)}\n`,
  );
  const files = {
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
  };
  for (const [file, text] of Object.entries(files))
    writeAt(project, file, text);
  commitAll(project, "intent locations and tests");
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

// A story's worktree changing only a product file, outside every location.
export function changeProductOnly(workspace: string) {
  writeAt(workspace, "dashboard/src/App.tsx", `${lines("app")}more\n`);
  commitAll(workspace, "change the product");
}
