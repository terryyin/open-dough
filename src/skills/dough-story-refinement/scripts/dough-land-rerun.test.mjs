// Git mechanics (not guidance-following): a Dough Land stop keeps every
// resource, and a rerun continues from real Git and remote state without a
// second commit or push. Native agent evidence is not this file.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  exec,
  git,
  lsRemoteSha,
  messageCount,
  pushCandidate,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  landWorktree,
  planReviewedEdits,
} from "./dough-land-test-fixtures.mjs";
import { createPreparationFixture } from "./preparation-publication-test-fixtures.mjs";

test("Dough Land keeps every resource after a push rejected into a conflict, and a rerun after resolution publishes once", async (t) => {
  const { origin, integration, preparation, preparationBranch, cleanup } =
    await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  planReviewedEdits(preparation);
  const before = await captureCheckout(integration);
  let conflictingSha;
  const stopped = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
    message: "Land reviewed SEED-1 refinement",
    beforePush: async ({ attempt }) => {
      if (attempt === 0) {
        conflictingSha = await advanceOriginFromAnotherWriter(origin, {
          file: "seed-draft.md",
          body: "SEED-1: another writer's conflicting goal\n",
          message: "another writer's conflicting SEED-1",
        });
      }
    },
  });

  assert.equal(stopped.stopped, "publish");
  assert.equal(stopped.publication.status, "conflict");
  assert.equal(stopped.publication.reconciliations, 1);
  assert.equal(stopped.refresh, "not-attempted");
  assert.equal(stopped.cleanup, "not-performed");
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), conflictingSha);
  assert.equal(existsSync(preparation), true);
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  const unresolved = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
  });
  assert.equal(unresolved.stopped, "unfinished-operation");
  assert.equal(unresolved.commit, "none");
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), conflictingSha);
  assert.equal(existsSync(preparation), true);

  writeFileSync(
    join(preparation, "seed-draft.md"),
    "SEED-1: refined goal, scope, and key examples\n",
  );
  await git(preparation, "add", "seed-draft.md");
  await exec("git", [
    "-C",
    preparation,
    "-c",
    "core.editor=true",
    "rebase",
    "--continue",
  ]);

  const rerun = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
  });
  assert.equal(rerun.stopped, null);
  assert.equal(rerun.commit, "nothing-to-commit");
  assert.equal(rerun.publication.publication, "accepted");
  const acceptedSha = rerun.publication.receipt.sha;
  await assertRemoteCandidate(origin, acceptedSha);
  assert.equal(
    (
      await git(
        origin,
        "rev-list",
        "--count",
        `${conflictingSha}..${acceptedSha}`,
      )
    ).stdout.trim(),
    "2",
  );
  assert.equal(
    await messageCount(
      origin,
      "refs/heads/main",
      "Land reviewed SEED-1 refinement",
    ),
    1,
  );
  assert.equal(
    await messageCount(origin, "refs/heads/main", "Refine SEED-1 draft"),
    1,
  );
  assert.equal(rerun.refresh.result, "advanced");
  assert.equal(rerun.cleanup.removed, true);
  assert.equal(existsSync(preparation), false);
});

test("rerunning Dough Land after an accepted push whose refresh and retirement never ran commits and pushes nothing again, then refreshes and retires", async (t) => {
  const { origin, integration, preparation, preparationBranch, cleanup } =
    await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  writeFileSync(join(preparation, "plan-draft.md"), "PLAN-1: two slices\n");
  await git(preparation, "add", "-A");
  await git(preparation, "commit", "-m", "Land reviewed SEED-1 refinement");
  const landedSha = await revParse(preparation, preparationBranch);
  await pushCandidate(preparation, landedSha);
  const laterRemote = await advanceOriginFromAnotherWriter(origin, {
    file: "later-writer.txt",
    body: "later work\n",
    message: "later writer's increment",
  });

  const rerun = await landWorktree({
    worktree: preparation,
    branch: preparationBranch,
    defaultCheckout: integration,
  });

  assert.equal(rerun.stopped, null);
  assert.equal(rerun.commit, "nothing-to-commit");
  assert.equal(rerun.publication.publication, "already-accepted");
  assert.equal(rerun.publication.pushed, false);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), laterRemote);
  assert.equal(
    await messageCount(
      origin,
      "refs/heads/main",
      "Land reviewed SEED-1 refinement",
    ),
    1,
  );
  assert.equal(rerun.refresh.result, "advanced");
  assert.equal(await revParse(integration, "HEAD"), laterRemote);
  assert.equal(rerun.cleanup.removed, true);
  assert.equal(existsSync(preparation), false);
});
