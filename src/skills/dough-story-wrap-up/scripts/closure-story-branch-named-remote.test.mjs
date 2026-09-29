// Wrap-up's Story Branch integration and remote execution-branch retirement on
// a named non-default remote and target: history-preserving publication lands
// there, and Dough Land's installed `retire` command deletes the remote
// execution branch only on that remote, leaving origin untouched.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import { remoteHeads } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { runRetirementCommand } from "../../dough-story-refinement/scripts/dough-land-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  ancestorOf,
  commitFile,
  createCleanTrunkFixture,
  executionBranch,
  git,
  lsRemoteSha,
} from "./closure-git-fixtures.mjs";

test("Story Branch integration and remote execution-branch retirement use a named non-default remote and branch", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const namedTarget = "refs/heads/trunk";
  const upstream = join(fixture.fixture, "upstream.git");
  await git(fixture.fixture, "init", "-q", "--bare", "-b", "trunk", upstream);
  await git(integration, "remote", "add", "upstream", upstream);
  await git(integration, "push", "-q", "upstream", `HEAD:${namedTarget}`);
  const originHeads = await remoteHeads(origin);
  const closureSha = await commitFile(
    execution,
    "closure.txt",
    "story closure\n",
    "story closure",
  );
  await git(
    execution,
    "push",
    "-q",
    "upstream",
    `HEAD:refs/heads/${executionBranch}`,
  );
  const siblingSha = await advanceOriginFromAnotherWriter(upstream, {
    file: "sibling.txt",
    branch: "trunk",
  });

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
    remote: "upstream",
    targetRef: namedTarget,
    register: () => {},
  });
  assert.equal(published.classification, "published");
  assert.equal(published.receipt.target, namedTarget);
  assert.equal(await lsRemoteSha(upstream, namedTarget), published.receipt.sha);
  assert.equal(await ancestorOf(execution, closureSha, "upstream/trunk"), true);
  assert.equal(await ancestorOf(execution, siblingSha, "upstream/trunk"), true);

  const retire = () =>
    runRetirementCommand({
      repository: integration,
      worktree: execution,
      branch: executionBranch,
      remote: "upstream",
      targetRef: namedTarget,
      createdForWork: true,
      remoteBranch: executionBranch,
      contained: [published.receipt.sha],
    });
  const removed = await retire();
  assert.equal(removed.code, 0, JSON.stringify(removed.result));
  assert.deepEqual(
    [
      removed.result.worktree,
      removed.result.branch,
      removed.result.remoteBranch,
    ],
    ["removed", "removed", "removed"],
  );
  assert.equal(existsSync(execution), false);
  assert.equal(
    await lsRemoteSha(upstream, `refs/heads/${executionBranch}`),
    "",
  );
  assert.equal(await lsRemoteSha(upstream, namedTarget), published.receipt.sha);
  assert.deepEqual(await remoteHeads(origin), originHeads);

  const rerun = await retire();
  assert.equal(rerun.code, 0, JSON.stringify(rerun.result));
  assert.equal(rerun.result.remoteBranch, "already-absent");
  assert.equal(await lsRemoteSha(upstream, namedTarget), published.receipt.sha);
  assert.deepEqual(await remoteHeads(origin), originHeads);
});
