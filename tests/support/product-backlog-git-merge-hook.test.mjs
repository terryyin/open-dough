// A project's own Git hook around a real merge through
// `product-backlog-git-merge.mjs`: what the hook prints reaches the caller
// only when the hook refuses the adapter's commit, and a hook that passes
// leaves the successful merge showing only its receipt.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  checkout,
  commitBranch,
  gitStatePath,
  headSha,
  isMidMerge,
  parentCount,
  run,
  scratchRepo,
} from "./product-backlog-git-fixture.mjs";

const itemA = "- [Item A](seeds/A.md#a)";
const itemB = "- [Item B](seeds/B.md#b)";
const itemC = "- [Item C](seeds/C.md#c)";

test("merge keeps a passing hook quiet and shows a failing hook's diagnostic", async (t) => {
  // Compatible sibling closures, merged twice in one repository
  // whose own `pre-commit` hook speaks up on every commit the adapter makes:
  // once when the hook passes, once when it refuses the merge commit.
  const ancestor = backlogOf([itemA, itemB], [itemC]);
  const repo = scratchRepo(t, ancestor);
  commitBranch(repo, "close-a", backlogOf([itemB], [itemC]));
  commitBranch(repo, "close-b", backlogOf([itemA], [itemC]));
  const hook = gitStatePath(repo, "hooks/pre-commit");
  const installHook = (exitCode) => {
    writeFileSync(
      hook,
      `#!/bin/sh\necho "project hook marker"\nexit ${exitCode}\n`,
      { mode: 0o755 },
    );
  };
  checkout(repo, "close-a");
  const beforeMerge = headSha(repo);

  installHook(1);
  const blocked = await run(repo, ["merge", "--ref", "close-b"]);

  assert.equal(blocked.code, 1, blocked.stdout + blocked.stderr);
  assert.match(blocked.stdout, /could not be committed/);
  assert.match(blocked.stderr, /project hook marker/);
  assert.equal(isMidMerge(repo), true, "the blocked merge stays in progress");
  repo.git(["merge", "--abort"]);
  assert.equal(headSha(repo), beforeMerge);

  installHook(0);
  const merged = await run(repo, ["merge", "--ref", "close-b"]);

  assert.equal(merged.code, 0, merged.stdout + merged.stderr);
  assert.match(merged.stdout, /accepted/);
  assert.equal(merged.stderr, "", "a passing hook's output stays quiet");
  assert.equal(parentCount(repo), 2, "a real merge commit was made");
});
