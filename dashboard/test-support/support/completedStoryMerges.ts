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

// The story's integration merge also carries `edit`, which Git did not merge.
export function amendIntegrationMerge(
  workspace: string,
  edit: (workspace: string) => void,
) {
  edit(workspace);
  git(workspace, "add", "--all");
  git(workspace, "commit", "--quiet", "--amend", "--no-edit");
}

export function addIntegrationEdit(workspace: string) {
  amendIntegrationMerge(workspace, () => {
    writeAt(workspace, "merge-resolution.txt", "integration edit\n");
  });
}

// Another writer merges two side branches into trunk at once.
export function foreignOctopusMerge(project: string) {
  for (const side of ["octopus-a", "octopus-b"]) {
    git(project, "checkout", "--quiet", "-b", side, "main");
    writeAt(project, `${side}.txt`, `${side}\n`);
    commitAll(project, `another story's ${side} work`);
  }
  git(project, "checkout", "--quiet", "main");
  git(
    project,
    "merge",
    "--quiet",
    "--no-ff",
    "--no-edit",
    "octopus-a",
    "octopus-b",
  );
  git(project, "branch", "--delete", "--force", "octopus-a", "octopus-b");
}

// The story integrates trunk together with its own side line, in one merge
// with three parents.
export function ownOctopusIntegration(workspace: string) {
  const branch = git(workspace, "branch", "--show-current");
  const base = git(workspace, "merge-base", "HEAD", "origin/main");
  git(workspace, "checkout", "--quiet", "-b", "story-side", base);
  writeAt(workspace, "story-side.txt", "side line\n");
  commitAll(workspace, "side line for the story's integration");
  git(workspace, "checkout", "--quiet", branch);
  git(workspace, "merge", "--quiet", "--no-edit", "origin/main", "story-side");
  git(workspace, "branch", "--delete", "--force", "story-side");
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
