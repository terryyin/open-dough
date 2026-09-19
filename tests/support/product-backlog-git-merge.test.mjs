// The clean-result half of real Git merge reconciliation through
// `product-backlog-git-merge.mjs`: a real merge Git resolves without any
// conflict of its own, gated by the shared resolver's semantic checks before
// acceptance — including the historical clean-duplicate case and a clean
// direction dispute a plain text merge would combine silently — plus a
// validated fast-forward candidate. The genuine-textual-conflict case and its
// human-recovery journey live in `product-backlog-git-merge-conflict.test.mjs`.
// Every case here performs a real `git merge` (or real plumbing that stands
// in for one identically) in a scratch repository and asserts on real Git
// and file-system state afterward: index stages, `MERGE_HEAD`, ref
// positions, and the worktree's own bytes.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  checkout,
  commitBranch,
  headSha,
  isMidMerge,
  occurrences,
  parentCount,
  run,
  scratchRepo,
  textMerge,
  unresolvedPaths,
} from "./product-backlog-git-fixture.mjs";

const itemA = "- [Item A](seeds/A.md#a)";
const itemB = "- [Item B](seeds/B.md#b)";
const itemC = "- [Item C](seeds/C.md#c)";
const itemD = "- [Item D](seeds/D.md#d)";

test("merge resolves concurrent sibling closures through a real Git merge, with no Git conflict", async (t) => {
  // Ancestor Taken = [A, B]; one side closes A and leaves B, the other
  // closes B and leaves A. Neither side changed the other's item at all, so
  // this is the compatible-conflict example the plan and the seed both name:
  // a real merge must resolve to an empty Taken.
  const ancestor = backlogOf([itemA, itemB], [itemC]);
  const repo = scratchRepo(t, ancestor);
  commitBranch(repo, "close-a", backlogOf([itemB], [itemC]));
  commitBranch(repo, "close-b", backlogOf([itemA], [itemC]));
  checkout(repo, "close-a");

  const merged = await run(repo, ["merge", "--ref", "close-b"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.equal(repo.read(), backlogOf([], [itemC]));
  assert.equal(unresolvedPaths(repo), "", "nothing was left unmerged");
  assert.equal(isMidMerge(repo), false, "the merge was committed");
  assert.equal(parentCount(repo), 2, "a real merge commit was made");
});

test("merge stops the historical clean-duplicate case a plain text merge lets through", async (t) => {
  // The case an ordinary text merge accepts and then duplicates: each
  // branch moved B to a different place, and neither move is the ancestor's
  // order, so nothing establishes which one holds.
  const ancestor = backlogOf([], [itemA, itemB, itemC, itemD]);
  const repo = scratchRepo(t, ancestor);
  const acbd = backlogOf([], [itemA, itemC, itemB, itemD]);
  const acdb = backlogOf([], [itemA, itemC, itemD, itemB]);
  commitBranch(repo, "acbd", acbd);
  commitBranch(repo, "acdb", acdb);

  const text = await textMerge(repo, "main", "acbd", "acdb");
  assert.equal(
    text.conflicts,
    0,
    "a text merge refused these versions itself, so this proves no contrast",
  );
  assert.equal(
    occurrences(text.merged, itemB),
    2,
    "a text merge silently duplicated the moved entry",
  );

  checkout(repo, "acbd");
  const merged = await run(repo, ["merge", "--ref", "acdb"]);

  assert.equal(merged.code, 1);
  assert.equal(isMidMerge(repo), true);
  assert.notEqual(unresolvedPaths(repo), "");
  assert.match(
    merged.stdout + merged.stderr,
    /the versions put the entries they share in different orders/,
  );
  assert.equal(
    occurrences(repo.read(), itemB),
    2,
    "still both full sides, not a duplicate result",
  );
});

test("merge stops a clean direction dispute a plain text merge would combine silently", async (t) => {
  const spread =
    "Enable agents to execute stories in parallel while collaborating through\n" +
    "trunk-based development, with each agent working in its own Git worktree.\n" +
    "Keep one readable Markdown list as the authority for what is queued and\n" +
    "taken, so a human can read the backlog without running anything.";
  const sequential = spread.replace(
    "execute stories in parallel",
    "execute stories one at a time",
  );
  const scheduled = spread.replace(
    "so a human can read the backlog without running anything.",
    "so a human decides which stories run in parallel next.",
  );
  const ancestor = backlogOf([], [itemA], spread);
  const repo = scratchRepo(t, ancestor);
  commitBranch(repo, "sequential", backlogOf([], [itemA], sequential));
  commitBranch(repo, "scheduled", backlogOf([], [itemA], scheduled));

  const text = await textMerge(repo, "main", "sequential", "scheduled");
  assert.equal(
    text.conflicts,
    0,
    "a text merge refused these versions itself, so this proves no contrast",
  );
  assert.ok(
    text.merged.includes("execute stories one at a time") &&
      text.merged.includes(
        "so a human decides which stories run in parallel next.",
      ),
    "a text merge combined both edits into one paragraph nobody wrote",
  );

  checkout(repo, "sequential");
  const merged = await run(repo, ["merge", "--ref", "scheduled"]);

  assert.equal(merged.code, 1);
  assert.equal(isMidMerge(repo), true);
  assert.match(
    merged.stdout + merged.stderr,
    /"## Near-future direction": the versions give it different text/,
  );
});

test("merge validates a fast-forward candidate before advancing the managed target", async (t) => {
  const ancestor = backlogOf([], [itemA]);
  const repo = scratchRepo(t, ancestor);
  commitBranch(repo, "ahead", backlogOf([], ["- Item A with no link"]));
  const before = headSha(repo);

  const refused = await run(repo, ["merge", "--ref", "ahead"]);

  assert.equal(refused.code, 1);
  assert.match(
    refused.stdout + refused.stderr,
    /is not a backlog this tool can read, so the current branch was not advanced/,
  );
  assert.equal(headSha(repo), before, "the managed target was not advanced");
  assert.equal(
    isMidMerge(repo),
    false,
    "a fast-forward candidate never enters a merge",
  );

  // Repair `ahead` with a valid candidate and retry: this is a pure
  // fast-forward, so it advances once validated, and nothing was merged.
  checkout(repo, "ahead");
  repo.write(backlogOf([], [itemA, "- [Item B](seeds/B.md#b)"]));
  repo.git(["commit", "-aq", "-m", "fix ahead"]);
  const afterFix = repo.git(["rev-parse", "ahead"]).trim();
  checkout(repo, "main");

  const accepted = await run(repo, ["merge", "--ref", "ahead"]);

  assert.equal(accepted.code, 0, accepted.stdout + accepted.stderr);
  assert.equal(
    headSha(repo),
    afterFix,
    "the managed target advanced to the validated candidate",
  );
  assert.equal(repo.read(), backlogOf([], [itemA, "- [Item B](seeds/B.md#b)"]));
});
