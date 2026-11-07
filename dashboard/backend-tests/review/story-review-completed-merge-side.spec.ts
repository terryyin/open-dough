// An owning merge whose parents each hold story commits the other lacks has no
// known story side, so its directory-rename suggestion is not dismissed as an
// untouched trunk path: the conflict stays mixed work.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import { mergeTreeOutput } from "../../server/mergeTreeOutput.ts";
import { owningMergeEdits } from "../../server/storyCompletedMergeEdits.ts";
import { writeAt } from "../../tests/support/storyReviewWorktree.ts";

const otherProfile = '{"agent":"other"}\n';

function integration() {
  const cwd = mkdtempSync(path.join(tmpdir(), "dough-merge-side-"));
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
  const commit = (message: string) => {
    git("add", "--all");
    git("commit", "--quiet", "-m", message);
    return git("rev-parse", "HEAD");
  };
  git("init", "--quiet", "--initial-branch=main");
  git("config", "user.email", "story@example.test");
  git("config", "user.name", "Story");
  writeAt(cwd, "agents/only.json", '{"agent":"only"}\n');
  commit("base");
  git("checkout", "--quiet", "-b", "story");
  git("mv", "agents", "profiles");
  const storyMove = commit("story moves agents");
  git("checkout", "--quiet", "main");
  writeAt(cwd, "agents/other.json", otherProfile);
  commit("trunk adds a profile");
  writeAt(cwd, "own.txt", "story work on trunk\n");
  const storyOnTrunk = commit("story work on trunk");
  git("checkout", "--quiet", "story");
  const [first, second] = [git("rev-parse", "story"), storyOnTrunk];
  const automatic = mergeTreeOutput(
    spawnSync(
      "git",
      ["merge-tree", "--write-tree", "--name-only", "-z", first, second],
      { cwd, encoding: "utf8" },
    ).stdout,
  );
  if (automatic === undefined) throw new Error("No automatic merge tree");
  spawnSync("git", ["merge", "--quiet", "--no-edit", "main"], { cwd });
  git("rm", "--quiet", "profiles/other.json");
  writeAt(cwd, "agents/other.json", otherProfile);
  const merge = commit("integrate trunk, keeping its profile");
  const resolved = git(
    "diff",
    "--name-only",
    "--no-renames",
    automatic.tree,
    merge,
  ).split("\n");
  return {
    cwd,
    merge,
    first,
    second,
    automatic,
    resolved,
    storyMove,
    storyOnTrunk,
  };
}

test("an owning merge with story commits on both parents keeps a directory-rename conflict mixed", async () => {
  const story = integration();
  const { cwd, merge, first, second, automatic, resolved } = story;
  try {
    expect([...automatic.inseparable]).toEqual(["profiles/other.json"]);
    const decompose = (storyCommits: string[]) =>
      owningMergeEdits(
        merge,
        [first, second],
        automatic,
        resolved,
        storyCommits,
        { cwd, maxBuffer: 1024 * 1024 },
      );
    // Known story side: the suggested move is trunk's untouched profile.
    expect(await decompose([story.storyMove])).toEqual({ conflicts: [] });
    const unknown = await decompose([story.storyMove, story.storyOnTrunk]);
    expect(unknown.conflicts).toEqual(["profiles/other.json"]);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
