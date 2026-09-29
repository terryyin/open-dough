// Wrap-up's Story Branch cleanup through Dough Land's installed `retire`
// command, run as a child process the way the agent runs it once the integrated
// SHA has a completion receipt with confirmed shutdown: after history-preserving
// integration, `--remote-branch` and `--contained` retire the execution
// worktree, its branch, and the remote execution branch, leaving other
// worktrees and the integration checkout as they were.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import { runRetirementCommand } from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  commitFile,
  createCleanTrunkFixture,
  executionBranch,
  git,
  lsRemoteSha,
  plantHumanEdit,
} from "./closure-git-fixtures.mjs";

test("Story Branch cleanup after integration retires the execution worktree, its branch, and the remote execution branch, and nothing else", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const closureSha = await commitFile(
    execution,
    "closure.txt",
    "story closure\n",
    "story closure",
  );
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  await advanceOriginFromAnotherWriter(origin, { file: "sibling.txt" });
  writeFileSync(join(integration, "unrelated.txt"), "unrelated checkout\n");
  await git(integration, "add", "unrelated.txt");
  await git(integration, "commit", "-m", "unrelated integration commit");
  await plantHumanEdit(integration);
  const other = join(fixture.fixture, "other");
  await git(integration, "worktree", "add", "-b", "other/task", other, "HEAD");
  writeFileSync(join(other, "other.txt"), "other workspace\n");
  const integrationBefore = await captureCheckout(integration);

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
    register: () => {},
  });
  assert.notEqual(published.receipt.sha, closureSha);

  const removed = await runRetirementCommand({
    repository: integration,
    worktree: execution,
    branch: executionBranch,
    createdForWork: true,
    remoteBranch: executionBranch,
    contained: [published.receipt.sha],
  });
  assert.equal(removed.code, 0, JSON.stringify(removed.result));
  assert.deepEqual(
    [
      removed.result.worktree,
      removed.result.branch,
      removed.result.remoteBranch,
    ],
    ["removed", "removed", "removed"],
  );
  assert.equal(await lsRemoteSha(origin, `refs/heads/${executionBranch}`), "");
  assert.equal(
    readFileSync(join(other, "other.txt"), "utf8"),
    "other workspace\n",
  );
  assert.equal(
    (await git(other, "branch", "--show-current")).stdout.trim(),
    "other/task",
  );
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );
});
