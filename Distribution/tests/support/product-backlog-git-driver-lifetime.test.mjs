import assert from "node:assert/strict";
import { cpSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { backlogOf, direction } from "./product-backlog-fixture.mjs";
import {
  checkoutOf,
  linkedWorktree,
  runCli,
} from "./product-backlog-git-fixture.mjs";
import {
  assertCommittedCatalogCurrent,
  completeAndCommit,
  completingBranch,
  doneRecord,
  entries,
  fileNames,
} from "./product-backlog-git-done-catalog-fixture.mjs";

test("both registered merge drivers survive retiring the registering worktree", async (t) => {
  const repo = await checkoutOf(
    t,
    makeMe.aRepository
      .withRevision("ancestor", {
        backlog: { taken: entries("A", "B", "C"), direction },
      })
      .please(),
  );
  const installed = "runtime skill's";
  cpSync(
    fileURLToPath(new URL("../../src/skills", import.meta.url)),
    join(repo.directory, installed),
    { recursive: true },
  );
  completeAndCommit(repo, doneRecord("A", "2026-10-06T10:00:00.000Z"));
  completingBranch(repo, "close-b", [
    doneRecord("B", "2026-10-06T10:00:00.000Z"),
  ]);
  completingBranch(repo, "close-c", [
    doneRecord("C", "2026-10-06T10:00:00.000Z"),
  ]);
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
