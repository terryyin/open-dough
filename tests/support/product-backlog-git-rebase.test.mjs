// Real Git rebase reconciliation through `product-backlog-git-rebase.mjs`:
// at least two unpublished commits, a genuine textual conflict on the first
// replayed commit, human recovery that validates without rerunning disputed
// reconciliation, and the unpublished suffix's exactly-once replay. Every
// case here performs a real `git rebase` in a scratch repository and asserts
// on real Git and file-system state afterward — rebase metadata, index
// stages, ref positions, and the worktree's own bytes — never a mocked
// function call. Clean (non-conflicting) replay acceptance is slice 3's
// claim, not exercised here. A second, independent conflict later in the
// same rebase is `product-backlog-git-rebase-sequence.test.mjs`'s claim, not
// exercised here.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  commitBranch,
  commitOn,
  headSha,
  isMidRebase,
  linkedWorktree,
  parentCount,
  rebaseStop,
  refSha,
  runRebase,
  scratchRepo,
  stage,
  stageResolution,
  unresolvedPaths,
} from "./product-backlog-git-fixture.mjs";

const itemC = "- [Item C](seeds/C.md#c)";
const itemD = "- [Item D](seeds/D.md#d)";
const destRenamedC = "- [Item C, dest renamed](seeds/C.md#c)";
const featureRenamedC = "- [Item C, feature renamed](seeds/C.md#c)";
const resolvedC = "- [Item C, resolved by hand](seeds/C.md#c)";

// Builds the shared starting shape every case here rebases: `main` holds the
// ancestor; `dest` is one further real commit on `main` (the destination
// being rebased onto); `feature` is a branch off the original ancestor with
// two further real commits — the first renames Item C incompatibly with
// `dest`'s own rename, so its replay must conflict, and the second adds an
// unrelated entry, so it can only reach `dest` by being replayed after the
// first is resolved. `feature` is left checked out, holding both commits,
// with nothing rebased yet.
function buildConflictingFeature(t) {
  const ancestor = backlogOf([], [itemC]);
  const repo = scratchRepo(t, ancestor);
  commitBranch(repo, "dest", backlogOf([], [destRenamedC]), "dest renames C");
  repo.git(["checkout", "-q", "-b", "feature"]);
  commitOn(repo, backlogOf([], [featureRenamedC]), "feature renames C");
  commitOn(repo, backlogOf([], [featureRenamedC, itemD]), "feature adds D");
  return repo;
}

test("rebase stops a genuine textual conflict on the first replayed commit, identified by real revisions", async (t) => {
  const repo = buildConflictingFeature(t);
  const originalTip = headSha(repo);
  const firstCommit = repo.git(["rev-parse", "HEAD^"]).trim();
  const firstCommitParent = repo.git(["rev-parse", "HEAD^^"]).trim();
  const destTip = refSha(repo, "dest");

  const rebased = await runRebase(repo, ["rebase", "--ref", "dest"]);

  assert.equal(rebased.code, 1);
  assert.equal(isMidRebase(repo), true, "Git is still mid-rebase");
  assert.notEqual(unresolvedPaths(repo), "", "the path is left unmerged");

  // Real revisions, not intent inferred from "ours"/"theirs": the commit
  // actually being replayed is the first feature commit, its real parent is
  // the shared ancestor, and this step's destination is `dest`'s own tip —
  // read from Git's own rebase state, the same as the production message.
  const stop = rebaseStop(repo);
  assert.equal(stop.replayedCommit, firstCommit);
  assert.equal(stop.replayedParent, firstCommitParent);
  assert.equal(stop.destination, destTip);

  const output = rebased.stdout + rebased.stderr;
  assert.ok(output.includes(firstCommit), "names the replayed commit's sha");
  assert.ok(output.includes(firstCommitParent), "names its real parent");
  assert.ok(output.includes(destTip), "names the real destination");
  assert.match(output, /"ours".*destination/s);
  assert.match(output, /"theirs".*replayed commit/s);

  // The real index stages Git recorded are the real ancestor/destination/
  // replayed-commit blobs — during a rebase, stage 2 ("ours") is the
  // destination and stage 3 ("theirs") is the commit being replayed, the
  // reverse of what those words mean during an ordinary merge.
  assert.equal(stage(repo, 1), backlogOf([], [itemC]));
  assert.equal(stage(repo, 2), backlogOf([], [destRenamedC]));
  assert.equal(stage(repo, 3), backlogOf([], [featureRenamedC]));

  // No partial write: the worktree file is real conflict markers holding
  // both full sides.
  const worktree = repo.read();
  assert.match(worktree, /^<<<<<<< ours$/m);
  assert.match(worktree, /^=======$/m);
  assert.match(worktree, /^>>>>>>> theirs$/m);
  assert.ok(worktree.includes("dest renamed"));
  assert.ok(worktree.includes("feature renamed"));

  // The unpublished suffix is completely untouched: `feature` itself is a
  // real branch ref, and Git never moves it until the whole rebase
  // completes, so it still points exactly at its pre-rebase tip, and so does
  // `ORIG_HEAD`, which Git sets the moment a rebase starts.
  assert.equal(refSha(repo, "feature"), originalTip);
  assert.equal(refSha(repo, "ORIG_HEAD"), originalTip);
});

test("rebase's human recovery validates a supplied result without rerunning disputed reconciliation, then replays the remaining suffix exactly once", async (t) => {
  const repo = buildConflictingFeature(t);
  const originalTip = headSha(repo);
  const destTipBefore = refSha(repo, "dest");
  const stopped = await runRebase(repo, ["rebase", "--ref", "dest"]);
  assert.equal(stopped.code, 1);

  // An invalid human candidate — a line this tool cannot parse at all —
  // stays stopped: still mid-rebase, nothing replayed further, and the
  // suffix (feature's second commit) untouched.
  stageResolution(repo, backlogOf([], ["- Item C with no link at all"]));
  const invalid = await runRebase(repo, ["continue"]);
  assert.equal(invalid.code, 1);
  assert.match(invalid.stdout + invalid.stderr, /Unsupported entry/);
  assert.equal(
    isMidRebase(repo),
    true,
    "still mid-rebase after an invalid supply",
  );
  assert.equal(refSha(repo, "feature"), originalTip, "feature still unmoved");

  // A valid human resolution that matches neither branch's own text is
  // accepted exactly as supplied, and the remaining commit — which only adds
  // Item D, untouched by the dispute — is then replayed automatically,
  // completing the rebase.
  const decided = backlogOf([], [resolvedC]);
  stageResolution(repo, decided);
  const accepted = await runRebase(repo, ["continue"]);

  assert.equal(accepted.code, 0, accepted.stdout + accepted.stderr);
  assert.match(accepted.stdout + accepted.stderr, /rebase completed/);
  assert.equal(isMidRebase(repo), false, "the rebase finished");
  assert.equal(
    repo.read(),
    backlogOf([], [resolvedC, itemD]),
    "the human decision stands, and D's addition was combined onto it",
  );

  // The whole rebase completed: two commits are present, both real, neither
  // duplicated, and `feature` (still unpublished — never pushed or merged
  // into any shared target) was updated to the new tip only now that
  // everything succeeded.
  const newTip = headSha(repo);
  assert.equal(
    refSha(repo, "feature"),
    newTip,
    "feature now published to its own new tip",
  );
  assert.notEqual(
    newTip,
    originalTip,
    "the tip is the rebased commit, not the old one",
  );
  assert.equal(
    parentCount(repo, newTip),
    1,
    "an ordinary replayed commit, not a merge",
  );
  const subjects = repo
    .git(["log", "--format=%s", `dest..${newTip}`])
    .trim()
    .split("\n");
  assert.deepEqual(subjects, ["feature adds D", "feature renames C"]);
  assert.equal(
    repo.git(["rev-list", "--count", `dest..${newTip}`]).trim(),
    "2",
    "exactly two commits ahead of dest — neither replayed twice nor dropped",
  );

  // `dest` (the shared destination) was never advanced or otherwise
  // published to by this rebase.
  assert.equal(refSha(repo, "dest"), destTipBefore);
});

test("rebase's human recovery refuses a staged candidate that does not match the worktree", async (t) => {
  const repo = buildConflictingFeature(t);
  await runRebase(repo, ["rebase", "--ref", "dest"]);

  const staged = backlogOf([], ["- [Item C, staged](seeds/C.md#c)"]);
  stageResolution(repo, staged);
  repo.write(backlogOf([], ["- [Item C, edited after staging](seeds/C.md#c)"]));

  const outcome = await runRebase(repo, ["continue"]);

  assert.equal(outcome.code, 1);
  assert.match(
    outcome.stdout + outcome.stderr,
    /does not match the bytes staged/,
  );
  assert.equal(
    isMidRebase(repo),
    true,
    "still stopped, nothing replayed further",
  );
});

test("rebase stops on real revisions and continues to completion when run from a linked Git worktree", async (t) => {
  // In a linked worktree `.git` is a file, and the rebase's own state
  // directory is that worktree's, not a directory under the checkout. The
  // stop can only name the replayed commit, and `continue` can only find the
  // rebase it resumes, by reading that state where Git really keeps it.
  const repo = buildConflictingFeature(t);
  const firstCommit = repo.git(["rev-parse", "feature^"]).trim();
  const destTip = refSha(repo, "dest");
  repo.git(["checkout", "-q", "main"]);
  const worktree = linkedWorktree(t, repo, "feature");

  const stopped = await runRebase(worktree, ["rebase", "--ref", "dest"]);

  assert.equal(stopped.code, 1);
  assert.equal(isMidRebase(worktree), true, "this worktree is mid-rebase");
  assert.notEqual(unresolvedPaths(worktree), "", "the path is left unmerged");
  const output = stopped.stdout + stopped.stderr;
  assert.ok(output.includes(firstCommit), "names the replayed commit's sha");
  assert.ok(output.includes(destTip), "names the real destination");

  const decided = backlogOf([], [resolvedC]);
  stageResolution(worktree, decided);
  const accepted = await runRebase(worktree, ["continue"]);

  assert.equal(accepted.code, 0, accepted.stdout + accepted.stderr);
  assert.match(accepted.stdout + accepted.stderr, /rebase completed/);
  assert.equal(isMidRebase(worktree), false, "the rebase finished");
  assert.equal(worktree.read(), backlogOf([], [resolvedC, itemD]));
  assert.equal(
    worktree.git(["merge-base", "feature", "dest"]).trim(),
    destTip,
    "feature now sits on top of dest",
  );
  assert.equal(refSha(worktree, "feature"), headSha(worktree));
});
