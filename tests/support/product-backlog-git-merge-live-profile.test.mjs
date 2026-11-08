// Live agent profiles through a merge by the backlog adapter: when one side
// completes the story whose profile was the last in `agents/`, Git must not
// read that as the whole directory moving into `done/` and carry the other
// side's live profile along. Real scratch repositories, real `complete`, and
// the real adapter CLI, asserted on the committed merge.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  assertCatalogDoneAgrees,
  assertCommittedCatalogCurrent,
  completeAndCommit,
  done,
  fileNames,
  items,
  profilePath,
  takeAndCommit,
} from "./product-backlog-git-done-catalog-fixture.mjs";
import {
  checkout,
  isMidMerge,
  parentCount,
  refSha,
  run,
  scratchRepo,
} from "./product-backlog-git-fixture.mjs";

const doneFiles = (repo, rev) =>
  repo
    .git(["ls-tree", "--name-only", `${rev}:${done}`])
    .trim()
    .split("\n")
    .sort();

// A story-branch execution profile reporting its host and model, which its
// done record carries too: that shared text is what makes Git pair a released
// profile with the done record replacing it as a rename.
const executing = (name, identity) =>
  makeMe.anAgentProfile
    .executing({
      name,
      identity,
      mode: "story-branch",
      branch: `story-${identity}`,
      host: "claude",
      model: "opus",
    })
    .please();

// The adapter's answer, with the index state it left, for a failure message.
const outcome = (repo, result) =>
  `${result.stdout}${result.stderr}\n${repo.git(["status", "--short"])}`;

const exists = (repo, rev, path) =>
  repo.git(["ls-tree", "--name-only", rev, "--", path]).trim() !== "";

// The adapter accepted and committed the merge, keeping the `live` agent's
// profile at the blob `liveBlob`, releasing the `released` agent's, and
// publishing only `record` beside a current catalog.
async function assertAcceptedKeeping(
  repo,
  merged,
  { live, liveBlob, released, record },
) {
  assert.equal(merged.code, 0, outcome(repo, merged));
  assert.equal(merged.stdout.trim(), "accepted");
  assert.equal(isMidMerge(repo), false);
  assert.equal(repo.git(["ls-files", "-u"]), "", "no file-location conflict");
  assert.equal(parentCount(repo), 2);
  assert.equal(refSha(repo, `HEAD:${profilePath(live)}`), liveBlob);
  assert.equal(exists(repo, "HEAD", profilePath(released)), false);
  assert.deepEqual(doneFiles(repo, "HEAD"), [".catalog.json", record]);
  const committed = assertCommittedCatalogCurrent(repo.git, "HEAD");
  assert.deepEqual(fileNames(committed), [record]);
  assert.equal(repo.git(["status", "--porcelain"]), "");
  await assertCatalogDoneAgrees(repo);
}

test("merging trunk that completed the story holding the last profile keeps the branch's own new profile in agents/", async (t) => {
  const repo = scratchRepo(t, backlogOf([], items("A", "B")));
  // Base: agents/ holds only A's profile.
  takeAndCommit(repo, executing("pyo", "A#A"));
  // The story branch takes B, adding its profile beside A's.
  repo.git(["checkout", "-q", "-b", "story-b"]);
  takeAndCommit(repo, executing("joey", "B#B"));
  const blobB = refSha(repo, `HEAD:${profilePath("joey")}`);
  // Trunk completes A: its profile is replaced by A's done record.
  checkout(repo, "main");
  await completeAndCommit(repo, "A");
  checkout(repo, "story-b");

  const merged = await run(repo, ["merge", "--ref", "main"]);

  await assertAcceptedKeeping(repo, merged, {
    live: "joey",
    liveBlob: blobB,
    released: "pyo",
    record: "A_A.json",
  });
});

test("merging trunk that took another story into a branch completing the last profile's story releases only its own profile", async (t) => {
  const repo = scratchRepo(t, backlogOf([], items("B", "C")));
  // Base: agents/ holds only B's profile.
  takeAndCommit(repo, executing("joey", "B#B"));
  // The story branch completes B: its profile is replaced by B's done record.
  repo.git(["checkout", "-q", "-b", "story-b"]);
  await completeAndCommit(repo, "B");
  // Trunk meanwhile takes C.
  checkout(repo, "main");
  takeAndCommit(repo, executing("Akiho", "C#C"));
  const blobC = refSha(repo, `HEAD:${profilePath("Akiho")}`);
  checkout(repo, "story-b");

  const merged = await run(repo, ["merge", "--ref", "main"]);

  await assertAcceptedKeeping(repo, merged, {
    live: "Akiho",
    liveBlob: blobC,
    released: "joey",
    record: "B_B.json",
  });
});
