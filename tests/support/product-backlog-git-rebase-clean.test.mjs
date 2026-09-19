// Slice 3's own claim: a multi-commit rebase that finishes with no Git
// conflict at any step is still checked, before a managed caller could
// publish it, against the whole-rebase aggregate comparison of the true
// pre-rebase tip and the true destination-at-start. Every case here performs
// a real, multi-commit `git rebase` in a scratch repository that Git itself
// resolves without any conflict, then asserts on the gate's own outcome and
// on real Git/file-system state — the rebase's local commits, the branch's
// own ref, and the worktree's bytes — never a mocked function call.
//
// This file covers the gate's refusal path: the mechanism proved here
// (confirmed empirically against this project's installed Git before this
// was written) is that an earlier replayed commit changes a value to
// coincidentally match the destination's own concurrent change — silently
// absorbing the divergence, since that step's own three-way view sees the
// destination and the replayed commit agreeing — and a later commit changes
// the same value again, unopposed as far as that step alone can see.
// Composed, this reaches a Git-conflict-free result the whole-rebase
// aggregate comparison — the true pre-rebase tip against the true
// destination-at-start — refuses as a genuine two-sided dispute. The gate's
// acceptance path (a genuinely compatible clean replay, a human-resolved
// earlier conflict whose clean suffix survives, and the disputed-result
// recovery/`validate` path) is
// `product-backlog-git-rebase-clean-accepted.test.mjs`'s claim, not
// exercised here.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  checkout,
  commitOn,
  isMidRebase,
  occurrences,
  runRebase,
  scratchRepo,
  unresolvedPaths,
} from "./product-backlog-git-fixture.mjs";

const itemA = "- [Item A](seeds/A.md#a)";
const itemB = "- [Item B](seeds/B.md#b)";
const itemC = "- [Item C](seeds/C.md#c)";
const itemD = "- [Item D](seeds/D.md#d)";

const originalDirection =
  "Enable agents to execute stories in parallel while collaborating through\n" +
  "trunk-based development, with each agent working in its own Git worktree.";
const destinationDirection = originalDirection.replace(
  "execute stories in parallel",
  "execute stories one at a time",
);
const branchFirstDirection = destinationDirection; // masks the divergence
const branchFinalDirection = originalDirection.replace(
  "execute stories in parallel",
  "execute stories only overnight",
);

test("rebase stops a clean direction dispute no single replayed commit ever conflicted on", async (t) => {
  const ancestor = backlogOf([], [itemA], originalDirection);
  const repo = scratchRepo(t, ancestor);

  // feature, from the original ancestor: commit1 sets the same direction
  // text destination is about to set independently (accepted with no
  // conflict, since the destination and this commit's own change agree);
  // commit2 changes it again, which no single step ever sees as opposed by
  // the destination.
  repo.git(["checkout", "-q", "-b", "feature"]);
  commitOn(
    repo,
    backlogOf([], [itemA], branchFirstDirection),
    "feature also sets destination's direction",
  );
  commitOn(
    repo,
    backlogOf([], [itemA], branchFinalDirection),
    "feature changes direction again",
  );

  checkout(repo, "main");
  commitOn(
    repo,
    backlogOf([], [itemA], destinationDirection),
    "destination changes direction",
  );
  checkout(repo, "feature");

  const rebased = await runRebase(repo, ["rebase", "--ref", "main"]);

  assert.equal(rebased.code, 1, rebased.stdout + rebased.stderr);
  assert.equal(
    isMidRebase(repo),
    false,
    "Git itself never stopped mid-rebase; every step replayed clean",
  );
  assert.equal(
    unresolvedPaths(repo),
    "",
    "nothing is left unmerged; this was never a Git conflict",
  );
  assert.match(
    rebased.stdout + rebased.stderr,
    /no Git conflict in .* at any step, but the whole-rebase aggregate comparison/,
  );
  assert.match(
    rebased.stdout + rebased.stderr,
    /the rebase's local commits are left exactly where the rebase completed them/,
  );
  assert.match(
    rebased.stdout + rebased.stderr,
    /"## Near-future direction": the versions give it different text/,
  );

  // The completed, disputed local commits are left exactly where the rebase
  // put them: unpublished and fully recoverable, not aborted or reset.
  assert.equal(
    repo.read(),
    backlogOf([], [itemA], branchFinalDirection),
    "the rebase's own local result is untouched by this refusal",
  );
});

test("rebase stops the duplicate-move regression no single replayed commit ever conflicted on", async (t) => {
  const ancestor = backlogOf([], [itemA, itemB, itemC, itemD]);
  const repo = scratchRepo(t, ancestor);

  repo.git(["checkout", "-q", "-b", "feature"]);
  commitOn(
    repo,
    backlogOf([], [itemA, itemC, itemB, itemD]),
    "feature also moves B after C, matching destination's own move",
  );
  commitOn(
    repo,
    backlogOf([], [itemA, itemC, itemD, itemB]),
    "feature moves B again, to the end",
  );

  checkout(repo, "main");
  commitOn(
    repo,
    backlogOf([], [itemA, itemC, itemB, itemD]),
    "destination moves B after C",
  );
  checkout(repo, "feature");

  const rebased = await runRebase(repo, ["rebase", "--ref", "main"]);

  assert.equal(rebased.code, 1, rebased.stdout + rebased.stderr);
  assert.equal(isMidRebase(repo), false, "every step replayed clean");
  assert.equal(unresolvedPaths(repo), "", "this was never a Git conflict");
  assert.match(
    rebased.stdout + rebased.stderr,
    /no Git conflict in .* at any step, but the whole-rebase aggregate comparison/,
  );
  assert.equal(
    occurrences(repo.read(), itemB),
    1,
    "the rebase's own local result names Item B once, not duplicated",
  );
});
