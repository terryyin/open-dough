import assert from "node:assert/strict";
import { cpSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { backlogOf } from "./product-backlog-fixture.mjs";
import {
  linkedWorktree,
  runCli,
  scratchRepo,
} from "./product-backlog-git-fixture.mjs";
import {
  assertCommittedCatalogCurrent,
  completeAndCommit,
  completingBranch,
  fileNames,
  items,
} from "./product-backlog-git-done-catalog-fixture.mjs";

test("both registered merge drivers survive retiring the registering worktree", async (t) => {
  const repo = scratchRepo(t, backlogOf(items("A", "B", "C"), []));
  const installed = "runtime skill's";
  cpSync(
    fileURLToPath(new URL("../../src/skills", import.meta.url)),
    join(repo.directory, installed),
    { recursive: true },
  );
  await completeAndCommit(repo, "A");
  await completingBranch(repo, "close-b", ["B"]);
  await completingBranch(repo, "close-c", ["C"]);
  const before = repo.git(["rev-parse", "close-b"]).trim();
  const workspace = linkedWorktree(t, repo, "close-b");
  const registered = await runCli(
    join(
      workspace.directory,
      installed,
      "dough-product-backlog/scripts/product-backlog-git-merge.mjs",
    ),
    workspace,
    ["merge", "--ref", "close-c"],
  );
  assert.equal(registered.code, 0, registered.stdout + registered.stderr);
  repo.git(["worktree", "remove", workspace.directory]);
  repo.git(["checkout", "-q", "-b", "surviving-checkout", before]);
  repo.git(["merge", "--quiet", "--no-edit", "close-c"]);
  assert.equal(repo.read().trimEnd(), backlogOf([], []).trimEnd());
  assert.deepEqual(fileNames(assertCommittedCatalogCurrent(repo.git, "HEAD")), [
    "A_A.json",
    "B_B.json",
    "C_C.json",
  ]);
});
