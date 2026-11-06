// Shared trunk setup and story file edits for Intent Summary CI timing
// comparison publishers (./intentSummaryStoryComparisonFixture.ts,
// ./intentSummaryStoryComparisonVariantPublishers.ts).

import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { intentLocations } from "./intentStoryWorktree.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";

export const summaryComparisonChanges = {
  modified: "Modified dashboard/tests/folder/a.spec.ts",
  added: "Added dashboard/tests/added.spec.ts",
  deleted: "Deleted dashboard/tests/gone.spec.ts",
  renamed: "Renamed tests/old.sh → dashboard/tests/renamed.spec.ts",
} as const;

export function publishSummaryComparisonTrunk(project: string) {
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
    "dashboard/tests/folder/a.spec.ts": lines("a"),
    "dashboard/tests/folder/nested/c.spec.ts": lines("c"),
    "dashboard/tests/root.spec.ts": lines("root"),
    "dashboard/tests/gone.spec.ts": lines("gone"),
    "tests/old.sh": lines("old"),
    "tests/check.sh": lines("check"),
  };
  for (const [file, text] of Object.entries(files))
    writeAt(project, file, text);
  commitAll(project, "intent locations for summary comparison");
  push(project);
}

export function changeSummaryComparisonTests(workspace: string) {
  writeAt(
    workspace,
    "dashboard/tests/folder/a.spec.ts",
    `${lines("a")}changed\n`,
  );
  writeAt(workspace, "dashboard/tests/added.spec.ts", "added\n");
  rmSync(path.join(workspace, "dashboard/tests/gone.spec.ts"));
  mkdirSync(
    path.dirname(path.join(workspace, "dashboard/tests/renamed.spec.ts")),
    {
      recursive: true,
    },
  );
  git(workspace, "mv", "tests/old.sh", "dashboard/tests/renamed.spec.ts");
  writeAt(
    workspace,
    "dashboard/tests/renamed.spec.ts",
    `${lines("old")}renamed\n`,
  );
  // completedPublishedStory commits these with "story implementation".
}
