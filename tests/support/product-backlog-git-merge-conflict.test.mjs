// The conflicted half of real Git merge reconciliation through
// `product-backlog-git-merge.mjs`: a genuine textual conflict Git itself
// cannot resolve, and the explicit, validation-only human-recovery step that
// follows one. Clean-but-disputed and fast-forward gating live alongside the
// concurrent-closures case in `product-backlog-git-merge.test.mjs`. Every
// case here performs a real `git merge` in a scratch repository and asserts
// on real Git and file-system state afterward: index stages, `MERGE_HEAD`,
// ref positions, and the worktree's own bytes.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  checkout,
  commitBranch,
  isMidMerge,
  linkedWorktree,
  parentCount,
  run,
  scratchRepo,
  stage,
  stageResolution,
  unresolvedPaths,
} from "./product-backlog-git-fixture.mjs";

const itemC = "- [Item C](seeds/C.md#c)";

test("merge stops a genuine textual conflict Git itself cannot resolve, and leaves it recoverable", async (t) => {
  const ancestor = backlogOf([], [itemC]);
  const repo = scratchRepo(t, ancestor);
  const renamedOne = backlogOf([], ["- [Item C1](seeds/C.md#c)"]);
  const renamedTwo = backlogOf([], ["- [Item C2](seeds/C.md#c)"]);
  commitBranch(repo, "rename-c1", renamedOne);
  commitBranch(repo, "rename-c2", renamedTwo);
  checkout(repo, "rename-c1");

  const merged = await run(repo, ["merge", "--ref", "rename-c2"]);

  assert.equal(merged.code, 1);
  assert.equal(isMidMerge(repo), true, "Git is still mid-merge");
  assert.notEqual(unresolvedPaths(repo), "", "the path is left unmerged");
  // The real stages Git recorded for the path are the real ancestor/ours/
  // theirs blobs, untouched by whatever this tool wrote into the worktree.
  assert.equal(stage(repo, 1), ancestor);
  assert.equal(stage(repo, 2), renamedOne);
  assert.equal(stage(repo, 3), renamedTwo);
  assert.match(merged.stderr, /the versions give it different titles/);
  // No partial write: the worktree file is real conflict markers holding
  // both full sides, not half of either candidate.
  const worktree = repo.read();
  assert.match(worktree, /^<<<<<<< ours$/m);
  assert.match(worktree, /^=======$/m);
  assert.match(worktree, /^>>>>>>> theirs$/m);
  assert.ok(worktree.includes("Item C1"));
  assert.ok(worktree.includes("Item C2"));
});

test("merge's human recovery validates a supplied result without rerunning disputed reconciliation", async (t) => {
  const ancestor = backlogOf([], [itemC]);
  const repo = scratchRepo(t, ancestor);
  const renamedOne = backlogOf([], ["- [Item C1](seeds/C.md#c)"]);
  const renamedTwo = backlogOf([], ["- [Item C2](seeds/C.md#c)"]);
  commitBranch(repo, "rename-c1", renamedOne);
  commitBranch(repo, "rename-c2", renamedTwo);
  checkout(repo, "rename-c1");
  const stopped = await run(repo, ["merge", "--ref", "rename-c2"]);
  assert.equal(stopped.code, 1);

  // An invalid human candidate — a line this tool cannot parse at all —
  // stays stopped: still mid-merge, no commit made.
  stageResolution(repo, backlogOf([], ["- Item C with no link at all"]));
  const invalid = await run(repo, ["continue"]);
  assert.equal(invalid.code, 1);
  assert.match(invalid.stdout + invalid.stderr, /Unsupported entry/);
  assert.equal(
    isMidMerge(repo),
    true,
    "still mid-merge after an invalid supply",
  );

  // A valid human resolution that matches neither branch's own text is
  // accepted exactly as supplied. Deciding on a third reading is exactly
  // the disagreement `mergeBacklogs` itself would refuse, so accepting it
  // unchanged is only explicable if this step validates rather than
  // re-reconciles.
  const decided = backlogOf([], ["- [Item C, resolved by hand](seeds/C.md#c)"]);
  stageResolution(repo, decided);
  const accepted = await run(repo, ["continue"]);

  assert.equal(accepted.code, 0, accepted.stdout + accepted.stderr);
  assert.equal(repo.read(), decided);
  assert.equal(isMidMerge(repo), false, "the merge was committed");
  assert.equal(parentCount(repo), 2);
});

test("merge's human recovery continues a merge stopped in a linked Git worktree", async (t) => {
  // `continue` recognises the stopped merge by `MERGE_HEAD`, which in a
  // linked worktree is that worktree's own state rather than a file under a
  // `.git` directory in the checkout.
  const repo = scratchRepo(t, backlogOf([], [itemC]));
  commitBranch(repo, "rename-c1", backlogOf([], ["- [Item C1](seeds/C.md#c)"]));
  commitBranch(repo, "rename-c2", backlogOf([], ["- [Item C2](seeds/C.md#c)"]));
  const worktree = linkedWorktree(t, repo, "rename-c1");
  const stopped = await run(worktree, ["merge", "--ref", "rename-c2"]);
  assert.equal(stopped.code, 1);
  assert.equal(isMidMerge(worktree), true, "this worktree is mid-merge");
  assert.notEqual(unresolvedPaths(worktree), "");

  const decided = backlogOf([], ["- [Item C, resolved by hand](seeds/C.md#c)"]);
  stageResolution(worktree, decided);
  const accepted = await run(worktree, ["continue"]);

  assert.equal(accepted.code, 0, accepted.stdout + accepted.stderr);
  assert.match(accepted.stdout, /accepted/);
  assert.equal(worktree.read(), decided);
  assert.equal(isMidMerge(worktree), false, "the merge was committed");
  assert.equal(parentCount(worktree), 2);
});

test("merge's human recovery refuses a staged candidate that does not match the worktree", async (t) => {
  const ancestor = backlogOf([], [itemC]);
  const repo = scratchRepo(t, ancestor);
  commitBranch(repo, "rename-c1", backlogOf([], ["- [Item C1](seeds/C.md#c)"]));
  commitBranch(repo, "rename-c2", backlogOf([], ["- [Item C2](seeds/C.md#c)"]));
  checkout(repo, "rename-c1");
  await run(repo, ["merge", "--ref", "rename-c2"]);

  // Stage one candidate, then edit the worktree to something else without
  // restaging it — the situation `git add` alone cannot make safe by
  // accident, and the situation a caller trusting only the worktree file
  // would miss.
  const staged = backlogOf([], ["- [Item C, staged](seeds/C.md#c)"]);
  stageResolution(repo, staged);
  repo.write(backlogOf([], ["- [Item C, edited after staging](seeds/C.md#c)"]));

  const outcome = await run(repo, ["continue"]);

  assert.equal(outcome.code, 1);
  assert.match(
    outcome.stdout + outcome.stderr,
    /does not match the bytes staged/,
  );
  assert.equal(isMidMerge(repo), true, "still stopped, nothing committed");
});
