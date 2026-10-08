// Merges through `product-backlog-git-merge.mjs` whose outcome Git's own
// history decides before any reconciliation: a fast-forward candidate is
// validated before the managed target advances, and a ref the current branch
// already contains stops with a report instead of entering a merge. Each case
// runs the real adapter in a scratch repository and asserts on real ref
// positions, merge state, and worktree bytes afterward. Real merges through
// the registered driver live in `product-backlog-git-merge.test.mjs`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  checkout,
  commitBranch,
  commitOn,
  headSha,
  isMidMerge,
  run,
  scratchRepo,
} from "./product-backlog-git-fixture.mjs";

const itemA = "- [Item A](seeds/A.md#a)";
const itemB = "- [Item B](seeds/B.md#b)";
const itemC = "- [Item C](seeds/C.md#c)";

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
  repo.write(backlogOf([], [itemA, itemB]));
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
  assert.equal(repo.read(), backlogOf([], [itemA, itemB]));
});

test("merge stops with a report, changing nothing, when the branch already contains the ref", async (t) => {
  // `ahead` is two commits past `main`, so merging `main` into it is neither
  // a fast-forward nor a merge Git would record: there is nothing to merge.
  const repo = scratchRepo(t, backlogOf([], [itemA]));
  commitBranch(repo, "ahead", backlogOf([], [itemA, itemB]));
  checkout(repo, "ahead");
  commitOn(repo, backlogOf([], [itemA, itemB, itemC]), "further");
  const before = headSha(repo);

  const stopped = await run(repo, ["merge", "--ref", "main"]);

  assert.equal(stopped.code, 1);
  assert.match(
    stopped.stdout,
    /already contains main; nothing was merged or changed/,
  );
  assert.doesNotMatch(stopped.stderr, /Error:|\n\s+at /);
  assert.equal(isMidMerge(repo), false, "Git never entered a merge");
  assert.equal(headSha(repo), before, "the branch did not move");
  assert.equal(repo.git(["status", "--porcelain"]), "", "nothing changed");
});
