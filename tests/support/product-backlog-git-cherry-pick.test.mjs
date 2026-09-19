// Real Git cherry-pick reconciliation through
// `product-backlog-git-cherry-pick.mjs`: a genuine textual conflict on a
// single picked commit, identified by real revisions read from Git's own
// `CHERRY_PICK_HEAD` (never guessed), human recovery that validates without
// rerunning disputed reconciliation, and a staged candidate that does not
// match the worktree. Every case here performs a real `git cherry-pick` in a
// scratch repository and asserts on real Git and file-system state
// afterward — `CHERRY_PICK_HEAD`, the sequencer, index stages, and the
// worktree's own bytes — never a mocked function call. Clean-pick
// acceptance, the merge-commit/mainline refusal, the "empty" stop, and
// multi-commit sequences are the other files in this suite's claim, not
// exercised here.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  cherryPickStop,
  isMidCherryPick,
  runCherryPick,
} from "./product-backlog-git-cherry-pick-fixture.mjs";
import {
  checkout,
  commitBranch,
  headSha,
  refSha,
  scratchRepo,
  stage,
  stageResolution,
  unresolvedPaths,
} from "./product-backlog-git-fixture.mjs";

const itemC = "- [Item C](seeds/C.md#c)";

// `dest` and `feature` both branch from the shared ancestor and each rename
// the same entry incompatibly, so picking `feature`'s commit onto `dest`
// must conflict. `feature` is left untouched by a cherry-pick — unlike a
// merge or rebase, nothing about the source commit's own branch ever moves.
function buildConflictingPick(t) {
  const ancestor = backlogOf([], [itemC]);
  const repo = scratchRepo(t, ancestor);
  commitBranch(
    repo,
    "dest",
    backlogOf([], ["- [Item C, dest renamed](seeds/C.md#c)"]),
    "dest renames C",
  );
  commitBranch(
    repo,
    "feature",
    backlogOf([], ["- [Item C, feature renamed](seeds/C.md#c)"]),
    "feature renames C",
  );
  checkout(repo, "dest");
  return repo;
}

test("cherry-pick stops a genuine textual conflict, identified by real revisions from CHERRY_PICK_HEAD", async (t) => {
  const repo = buildConflictingPick(t);
  const featureTip = refSha(repo, "feature");
  const featureParent = repo.git(["rev-parse", `${featureTip}^`]).trim();
  const destTip = headSha(repo);

  const picked = await runCherryPick(repo, ["pick", "--ref", featureTip]);

  assert.equal(picked.code, 1);
  assert.equal(isMidCherryPick(repo), true, "Git is still mid-cherry-pick");
  assert.notEqual(unresolvedPaths(repo), "", "the path is left unmerged");

  // Real revisions, read from `CHERRY_PICK_HEAD`, not guessed: the commit
  // actually being picked is `feature`'s own tip, its real parent is the
  // shared ancestor, and the destination is `dest`'s own tip.
  const stop = cherryPickStop(repo);
  assert.equal(stop.pickedCommit, featureTip);
  assert.equal(stop.pickedParent, featureParent);
  assert.equal(stop.destination, destTip);

  const output = picked.stdout + picked.stderr;
  assert.ok(output.includes(featureTip), "names the picked commit's sha");
  assert.ok(output.includes(featureParent), "names its real parent");
  assert.ok(output.includes(destTip), "names the real destination");

  // Unlike a rebase, cherry-pick's stages are never reversed: stage 2
  // ("ours") is the destination, and stage 3 ("theirs") is the picked
  // commit, the same convention an ordinary merge uses.
  assert.equal(stage(repo, 1), backlogOf([], [itemC]));
  assert.equal(
    stage(repo, 2),
    backlogOf([], ["- [Item C, dest renamed](seeds/C.md#c)"]),
  );
  assert.equal(
    stage(repo, 3),
    backlogOf([], ["- [Item C, feature renamed](seeds/C.md#c)"]),
  );

  // No partial write: the worktree file is real conflict markers holding
  // both full sides.
  const worktree = repo.read();
  assert.match(worktree, /^<<<<<<< ours$/m);
  assert.match(worktree, /^=======$/m);
  assert.match(worktree, /^>>>>>>> theirs$/m);
  assert.ok(worktree.includes("dest renamed"));
  assert.ok(worktree.includes("feature renamed"));

  // `feature` itself never moves — a cherry-pick never touches the source
  // commit's own branch.
  assert.equal(refSha(repo, "feature"), featureTip);
});

test("cherry-pick's human recovery validates a supplied result without rerunning disputed reconciliation, accepted exactly once", async (t) => {
  const repo = buildConflictingPick(t);
  const featureTip = refSha(repo, "feature");
  const destTipBefore = headSha(repo);
  const stopped = await runCherryPick(repo, ["pick", "--ref", featureTip]);
  assert.equal(stopped.code, 1);

  // An invalid human candidate — a line this tool cannot parse at all —
  // stays stopped: still mid-cherry-pick, nothing committed.
  stageResolution(repo, backlogOf([], ["- Item C with no link at all"]));
  const invalid = await runCherryPick(repo, ["continue"]);
  assert.equal(invalid.code, 1);
  assert.match(invalid.stdout + invalid.stderr, /Unsupported entry/);
  assert.equal(isMidCherryPick(repo), true, "still mid-cherry-pick");
  assert.equal(headSha(repo), destTipBefore, "dest still unmoved");

  // A valid human resolution that matches neither branch's own text is
  // accepted exactly as supplied.
  const decided = backlogOf([], ["- [Item C, resolved by hand](seeds/C.md#c)"]);
  stageResolution(repo, decided);
  const accepted = await runCherryPick(repo, ["continue"]);

  assert.equal(accepted.code, 0, accepted.stdout + accepted.stderr);
  assert.match(accepted.stdout + accepted.stderr, /cherry-pick completed/);
  assert.equal(isMidCherryPick(repo), false, "the cherry-pick finished");
  assert.equal(repo.read(), decided, "the human decision stands");

  // A real, new commit landed on `dest`, distinct from `destTipBefore` and
  // from `featureTip` (a cherry-pick always makes its own new commit, never
  // reusing the source commit's own sha).
  const newTip = headSha(repo);
  assert.notEqual(newTip, destTipBefore);
  assert.notEqual(newTip, featureTip);
});

test("cherry-pick's human recovery refuses a staged candidate that does not match the worktree", async (t) => {
  const repo = buildConflictingPick(t);
  await runCherryPick(repo, ["pick", "--ref", refSha(repo, "feature")]);

  const staged = backlogOf([], ["- [Item C, staged](seeds/C.md#c)"]);
  stageResolution(repo, staged);
  repo.write(backlogOf([], ["- [Item C, edited after staging](seeds/C.md#c)"]));

  const outcome = await runCherryPick(repo, ["continue"]);

  assert.equal(outcome.code, 1);
  assert.match(
    outcome.stdout + outcome.stderr,
    /does not match the bytes staged/,
  );
  assert.equal(isMidCherryPick(repo), true, "still stopped");
});
