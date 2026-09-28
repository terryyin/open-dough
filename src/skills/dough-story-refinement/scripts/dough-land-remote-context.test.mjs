// Git mechanics (not guidance-following): Dough Land runs from the worktree's
// repository management context and its named remote target rather than a
// default checkout. Without one, landing and a rerun after a conflict publish
// once, report refresh not applicable, and retire the repository's last
// worktree; a named non-default remote and branch are published, refreshed,
// and retired against. Native agent evidence is not this file.
import assert from "node:assert/strict";
import { existsSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { ownedWorktreeOnly } from "../../dough-execute-plan/scripts/default-checkout-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertRemoteCandidate,
  exec,
  git,
  lsRemoteSha,
  messageCount,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  assertRetiredFrom,
  landWorktree,
  planReviewedEdits,
} from "./dough-land-test-fixtures.mjs";
import {
  cloneFile,
  createPreparationFixture,
  worktreeCount,
} from "./preparation-publication-test-fixtures.mjs";

test("Dough Land without a default checkout publishes, reports refresh not applicable, and retires the repository's last worktree from its retained Git directory", async (t) => {
  const prepared = await createPreparationFixture("preparation-publication-");
  t.after(prepared.cleanup);
  const { repository, workspace, branch } = await ownedWorktreeOnly(
    prepared,
    "owned-landing",
    "prep/owned-landing",
  );
  planReviewedEdits(workspace);
  const siblingSha = await advanceOriginFromAnotherWriter(prepared.origin);
  assert.equal(await worktreeCount(repository), 2);

  const landed = await landWorktree({
    worktree: workspace,
    branch,
    message: "Land reviewed owned-only refinement",
  });

  assert.equal(landed.stopped, null);
  assert.equal(landed.commit, "created");
  assert.equal(landed.publication.publication, "accepted");
  const acceptedSha = landed.publication.receipt.sha;
  await assertRemoteCandidate(prepared.origin, acceptedSha);
  await git(
    prepared.origin,
    "merge-base",
    "--is-ancestor",
    siblingSha,
    acceptedSha,
  );
  assert.equal(
    await cloneFile(prepared.origin, "plan-draft.md"),
    "PLAN-1: two slices\n",
  );
  assert.deepEqual(landed.refresh, { result: "not applicable" });
  assert.equal(landed.repository, realpathSync(repository));
  assert.equal(landed.cleanup.removed, true);
  assert.equal(existsSync(workspace), false);
  assert.equal(await worktreeCount(repository), 1);
  await assertRetiredFrom(repository, branch, acceptedSha, "origin/main");
});

test("without a default checkout, a conflicted Dough Land keeps the repository's only worktree and branch, and a rerun after resolution publishes once and retires it", async (t) => {
  const prepared = await createPreparationFixture("preparation-publication-");
  t.after(prepared.cleanup);
  const { origin } = prepared;
  const { repository, workspace, branch } = await ownedWorktreeOnly(
    prepared,
    "owned-conflict",
    "prep/owned-conflict",
  );
  planReviewedEdits(workspace);
  let conflictingSha;
  const stopped = await landWorktree({
    worktree: workspace,
    branch,
    message: "Land reviewed owned-only refinement",
    beforePush: async ({ attempt }) => {
      if (attempt === 0) {
        conflictingSha = await advanceOriginFromAnotherWriter(origin, {
          file: "plan-draft.md",
          body: "PLAN-1: another writer's plan\n",
          message: "another writer's conflicting plan",
        });
      }
    },
  });

  assert.equal(stopped.stopped, "publish");
  assert.equal(stopped.publication.status, "conflict");
  assert.equal(stopped.refresh, "not-attempted");
  assert.equal(stopped.cleanup, "not-performed");
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), conflictingSha);
  assert.equal(existsSync(workspace), true);
  assert.equal(await worktreeCount(repository), 2);
  await git(repository, "rev-parse", "--verify", `refs/heads/${branch}`);

  writeFileSync(join(workspace, "plan-draft.md"), "PLAN-1: two slices\n");
  await git(workspace, "add", "plan-draft.md");
  await exec("git", [
    "-C",
    workspace,
    "-c",
    "core.editor=true",
    "rebase",
    "--continue",
  ]);

  const rerun = await landWorktree({ worktree: workspace, branch });
  assert.equal(rerun.stopped, null);
  assert.equal(rerun.commit, "nothing-to-commit");
  assert.equal(rerun.publication.publication, "accepted");
  const acceptedSha = rerun.publication.receipt.sha;
  await assertRemoteCandidate(origin, acceptedSha);
  assert.equal(
    await messageCount(
      origin,
      "refs/heads/main",
      "Land reviewed owned-only refinement",
    ),
    1,
  );
  assert.deepEqual(rerun.refresh, { result: "not applicable" });
  assert.equal(rerun.cleanup.removed, true);
  assert.equal(existsSync(workspace), false);
  assert.equal(await worktreeCount(repository), 1);
  await assertRetiredFrom(repository, branch, acceptedSha, "origin/main");
});

test("Dough Land publishes to a named non-default remote and branch, refreshes a default checkout on that branch, and retires against that target", async (t) => {
  const {
    fixture,
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    cleanup,
  } = await createPreparationFixture("preparation-publication-");
  t.after(cleanup);
  const upstream = join(fixture, "upstream.git");
  await exec("git", ["init", "-q", "--bare", "-b", "trunk", upstream]);
  await git(integration, "remote", "add", "upstream", upstream);
  await git(
    integration,
    "push",
    "-q",
    "upstream",
    `${trunkSha}:refs/heads/trunk`,
  );
  await git(integration, "fetch", "-q", "upstream");
  await git(integration, "switch", "-q", "-c", "trunk", "upstream/trunk");
  planReviewedEdits(preparation);
  const siblingSha = await advanceOriginFromAnotherWriter(upstream, {
    file: "sibling.txt",
    branch: "trunk",
  });

  const landed = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
    remote: "upstream",
    target: "refs/heads/trunk",
  });

  assert.equal(landed.stopped, null);
  assert.equal(landed.publication.publication, "accepted");
  const acceptedSha = landed.publication.receipt.sha;
  assert.equal(landed.publication.receipt.target, "refs/heads/trunk");
  assert.equal(await lsRemoteSha(upstream, "refs/heads/trunk"), acceptedSha);
  await git(upstream, "merge-base", "--is-ancestor", siblingSha, acceptedSha);
  assert.equal(
    (await git(upstream, "show", `${acceptedSha}:plan-draft.md`)).stdout,
    "PLAN-1: two slices\n",
  );
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
  assert.equal(landed.refresh.result, "advanced");
  assert.equal(await revParse(integration, "HEAD"), acceptedSha);
  assert.equal(landed.cleanup.removed, true);
  assert.equal(existsSync(preparation), false);
  await assertRetiredFrom(
    integration,
    preparationBranch,
    acceptedSha,
    "upstream/trunk",
  );
});
