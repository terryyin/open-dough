// The clean-result half of real Git merge reconciliation through
// `product-backlog-git-merge.mjs`: a real merge Git resolves without any
// conflict of its own, gated by the shared resolver's semantic checks before
// acceptance — including the historical clean-duplicate case and a clean
// direction dispute a plain text merge would combine silently. Outcomes Git's
// history alone decides live in `product-backlog-git-merge-ancestry.test.mjs`;
// the genuine-textual-conflict case and its human-recovery journey live in
// `product-backlog-git-merge-conflict.test.mjs`.
// Every case here performs a real `git merge` (or real plumbing that stands
// in for one identically) in a scratch repository and asserts on real Git
// and file-system state afterward: index stages, `MERGE_HEAD`, ref
// positions, and the worktree's own bytes. A successful merge shows only its
// receipt; `product-backlog-git-merge-hook.test.mjs` covers a project hook,
// and `product-backlog-git-merge-agent-credit.test.mjs` an agent's workspace.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  checkout,
  commitBranch,
  headSha,
  isMidMerge,
  linkedWorktree,
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
  assert.equal(merged.stderr, "", "a successful merge shows only its receipt");
});

test("merge reconciles through the registered driver when run from a linked Git worktree", async (t) => {
  // The same compatible sibling closures as above, but the checkout the
  // adapter runs in is a linked worktree, where `.git` is a file rather than
  // a directory. A plain text merge conflicts on these adjacent closures, so
  // the empty Taken is only reachable through the registered driver.
  const ancestor = backlogOf([itemA, itemB], [itemC]);
  const repo = scratchRepo(t, ancestor);
  commitBranch(repo, "close-a", backlogOf([itemB], [itemC]));
  commitBranch(repo, "close-b", backlogOf([itemA], [itemC]));
  const closeB = repo.git(["rev-parse", "close-b"]).trim();
  const worktree = linkedWorktree(t, repo, "close-a");

  const merged = await run(worktree, ["merge", "--ref", "close-b"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.match(merged.stdout, /accepted/);
  assert.equal(worktree.read(), backlogOf([], [itemC]));
  assert.equal(unresolvedPaths(worktree), "", "nothing was left unmerged");
  assert.equal(isMidMerge(worktree), false, "the merge was committed");
  assert.equal(parentCount(worktree), 2, "a real merge commit was made");
  assert.equal(
    worktree.git(["rev-parse", "HEAD^2"]).trim(),
    closeB,
    "the merge commit's second parent is the merged ref",
  );
  assert.match(
    worktree.git(["check-attr", "merge", "--", ".planning/PRODUCT-BACKLOG.md"]),
    /merge: dough-product-backlog/,
    "the driver is in effect for the backlog path in this worktree",
  );
  assert.equal(headSha(repo), repo.git(["rev-parse", "main"]).trim());
  assert.equal(isMidMerge(repo), false, "the primary checkout was not merged");
});

test("merge reconciles through the registered driver in a repository whose Git directory has no info/", async (t) => {
  // A repository made without templates (`git init --template=`, or under an
  // `init.templateDir` holding only hooks) has no `info/`, where the driver's
  // attribute is registered. The adjacent sibling closures conflict in a
  // plain text merge, so the empty Taken is only reachable through the
  // registered driver.
  const ancestor = backlogOf([itemA, itemB], [itemC]);
  const repo = scratchRepo(t, ancestor, ["--template="]);
  commitBranch(repo, "close-a", backlogOf([itemB], [itemC]));
  commitBranch(repo, "close-b", backlogOf([itemA], [itemC]));
  checkout(repo, "close-a");

  const merged = await run(repo, ["merge", "--ref", "close-b"]);

  assert.equal(merged.stderr, "");
  assert.equal(merged.code, 0);
  assert.equal(repo.read(), backlogOf([], [itemC]));
  assert.equal(isMidMerge(repo), false, "the merge was committed");
  assert.match(
    repo.git(["check-attr", "merge", "--", ".planning/PRODUCT-BACKLOG.md"]),
    /merge: dough-product-backlog/,
    "the driver is in effect for the backlog path",
  );
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
