// Merges around a completed published story (./completedPublishedStory.ts):
// other stories' resolutions on trunk, and the story's own integration edits
// that Git did not report as conflicted.
import { resolveStoryConflict } from "./completedStoryPublication.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";

// Another story's merge on trunk resolves a conflict. With
// `non-owning-story-file` it resolves a file this story also changed: in
// Story Branch Mode the story's change stays separable; in Trunk Mode, where
// the story's line is already on trunk, the resolution also rewrites it.
export function resolveForeignMerge(
  project: string,
  variant: "unrelated-merge" | "non-owning-story-file",
  shared: string,
) {
  git(project, "checkout", "--quiet", "-b", "foreign");
  const [file, branchText, trunkText, resolution] =
    variant === "unrelated-merge"
      ? [
          "unrelated.txt",
          "other branch\n",
          "other trunk\n",
          "other story's resolution\n",
        ]
      : [
          "shared.txt",
          shared.replace("line 5\n", "foreign five\n"),
          shared.replace("line 5\n", "trunk five\n"),
          shared
            .replace("line 5\n", "foreign resolution of shared\n")
            .replace("story first\n", "foreign rewrites story\n"),
        ];
  writeAt(project, file, branchText);
  commitAll(project, "another story's branch work");
  git(project, "checkout", "--quiet", "main");
  writeAt(project, file, trunkText);
  commitAll(project, "another story's trunk work");
  resolveStoryConflict(
    project,
    ["merge", "--quiet", "--no-ff", "--no-edit", "foreign"],
    file,
    resolution,
    "resolve another story's conflict",
  );
  git(project, "branch", "--delete", "--force", "foreign");
}

// Trunk files the story's integration will move or restore.
export function placeMergeEditFiles(project: string) {
  writeAt(project, "agents/only.json", '{"agent":"only"}\n');
  writeAt(project, "checks/before.test.mjs", lines("check"));
}

// The story moves the whole `agents/` folder, so `merge-tree` suggests
// moving any agent profile trunk adds there as well.
export function moveAgentsFolder(workspace: string) {
  git(workspace, "mv", "agents", "profiles");
}

const otherProfile = '{"agent":"other"}\n';

export function addTrunkAgentProfile(project: string) {
  writeAt(project, "agents/other.json", otherProfile);
}

// The story's integration merge also adds a file Git did not merge.
export function addIntegrationEdit(workspace: string) {
  writeAt(workspace, "merge-resolution.txt", "integration edit\n");
  git(workspace, "add", "--all");
  git(workspace, "commit", "--quiet", "--amend", "--no-edit");
}

// Edits the story's integration merge makes beyond its conflict resolution:
// it restores trunk's agent profile where trunk had it, renames a test file,
// and adds a file.
export function editIntegrationMerge(workspace: string) {
  git(workspace, "rm", "--quiet", "profiles/other.json");
  writeAt(workspace, "agents/other.json", otherProfile);
  git(workspace, "mv", "checks/before.test.mjs", "checks/after.test.mjs");
  writeAt(workspace, "checks/after.test.mjs", `${lines("check")}renamed\n`);
  addIntegrationEdit(workspace);
}
