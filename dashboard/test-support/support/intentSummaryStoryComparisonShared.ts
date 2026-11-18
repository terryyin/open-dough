// Shared trunk setup and story file edits for the Intent Summary CI timing
// comparison publisher (./intentSummaryStoryComparisonFixture.ts) and its
// declared history (./intentSummaryStoryComparisonRepository.ts).

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../Distribution/tests/support/repository-revision-files.mjs";
import { intentSettingsText } from "./intentSettingsFile.ts";
import { intentSettings } from "./intentStoryWorktree.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { publishDeclaredTrunk } from "./storyCiComparisonBaseline.ts";
import { lines, writeAt } from "./storyReviewWorktree.ts";

export const summaryComparisonChanges = {
  modified: "Modified dashboard/tests/folder/a.spec.ts",
  mergeEdited: "Modified dashboard/tests/folder/nested/c.spec.ts",
  added: "Added dashboard/tests/added.spec.ts",
  deleted: "Deleted dashboard/tests/gone.spec.ts",
  renamed: "Renamed tests/old.sh → dashboard/tests/renamed.spec.ts",
} as const;

// One domain shape for the CLI publisher and the declared sort history.
export const summaryComparisonTrunkRevision = makeMe.aRepository
  .withRevision("locations", {
    backlog: null,
    files: {
      ".planning/open-dough.json": intentSettingsText(intentSettings),
      "dashboard/tests/folder/a.spec.ts": lines("a"),
      "dashboard/tests/folder/nested/c.spec.ts": lines("c"),
      "dashboard/tests/root.spec.ts": lines("root"),
      "dashboard/tests/gone.spec.ts": lines("gone"),
      "tests/old.sh": lines("old"),
      "tests/check.sh": lines("check"),
    },
  })
  .please().revisions[0];

export const summaryComparisonChangeRevision = makeMe.aRepository
  .withRevision("changed tests", {
    backlog: null,
    files: {
      "dashboard/tests/folder/a.spec.ts": `${lines("a")}changed\n`,
      "dashboard/tests/added.spec.ts": "added\n",
      "dashboard/tests/renamed.spec.ts": `${lines("old")}renamed\n`,
    },
    remove: ["dashboard/tests/gone.spec.ts", "tests/old.sh"],
  })
  .please().revisions[0];

// Publishes trunk's files: Intent settings and the sources the summary
// compares.
export async function publishSummaryComparisonTrunk(origin: StartOrigin) {
  await publishDeclaredTrunk(
    origin,
    makeMe.aRepository.withRevision(
      "locations",
      summaryComparisonTrunkRevision,
    ),
  );
}

export function changeSummaryComparisonTests(workspace: string) {
  writeRevisionFiles(workspace, summaryComparisonChangeRevision);
  // completedPublishedStory commits these with "story implementation".
}

// The story's integration merge edits an Intent test file neither side of the
// merge changed.
export function editSummaryComparisonTestInMerge(workspace: string) {
  writeAt(
    workspace,
    "dashboard/tests/folder/nested/c.spec.ts",
    `${lines("c")}merge edit\n`,
  );
}
