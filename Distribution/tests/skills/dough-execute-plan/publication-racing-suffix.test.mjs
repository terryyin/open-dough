// A rejected push replays the owned backlog suffix onto the current tip.
// A replay conflict preserves the original candidate and stops before retry.
import assert from "node:assert/strict";
import { makeMe } from "../../support/makeMe.mjs";
import { publishExecutionIncrement } from "../../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs";
import { test } from "node:test";
import { rebaseInProgress } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-git-operation-state.mjs";
import { backlogOf } from "../../support/product-backlog-fixture.mjs";
import {
  advanceOriginBacklog,
  assertAffectedCombination,
  backlogPath,
  createBacklogSuffixFixture,
  itemA,
  itemB,
  itemC,
  itemD,
  otherD,
  ownedD,
  siblingB,
} from "./publication-racing-suffix-fixtures.mjs";
import {
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  git,
  lsRemoteSha,
  plantHumanEdit,
  revParse,
} from "./publication-test-fixtures.mjs";

test("a rejected push is reconciled once onto the other writer's commit, then the combined candidate is accepted", async (t) => {
  const ownedBacklog = backlogOf([], [itemA, itemB, itemC, ownedD]);
  const fixture = await createBacklogSuffixFixture(ownedBacklog);
  const { origin, integration, execution, trunkSha, cleanup } = fixture;
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  let siblingSha;
  const attempts = [];
  let checkedSha;
  const outcome = await publishExecutionIncrement({
    workspace: execution,
    ...makeMe.anIncrementPublication
      .with({
        previouslyPublishedBase: trunkSha,
        branch: "exec/story",
        targetRef: "refs/heads/main",
        defaultCheckout: integration,
      })
      .please(),
    beforePush: async ({ attempt }) => {
      attempts.push(attempt);
      if (attempt === 0) {
        siblingSha = await advanceOriginBacklog(
          origin,
          backlogOf([], [itemA, siblingB, itemC, itemD]),
          "sibling backlog change",
        );
      }
    },
    validate: async (sha) => {
      checkedSha = sha;
      await assertAffectedCombination(fixture, sha);
      return true;
    },
  });

  assert.equal(outcome.publication, "accepted");
  assert.equal(outcome.reconciliations, 1);
  assert.deepEqual(attempts, [0, 1]);
  const { sha } = outcome.receipt;
  assert.equal(checkedSha, sha);
  assert.equal(
    (await git(execution, "rev-parse", `${sha}^`)).stdout.trim(),
    siblingSha,
    "published ancestry keeps the other writer's commit as the parent",
  );
  assert.equal(
    (await git(execution, "log", "--format=%s", `${siblingSha}..${sha}`))
      .stdout,
    "verified increment\n",
    "only the owned suffix is replayed",
  );
  await git(execution, "fetch", "origin");
  await assertRemoteCandidate(origin, sha);
  const after = await captureCheckout(integration);
  assertCheckoutUnchanged(before, after);
  assert.equal(after.head, trunkSha);
  assert.equal(outcome.maintenance, "deferred");
  assert.equal(rebaseInProgress(execution), undefined);
});

test("conflicting backlog intent preserves the rejected candidate and does not retry the push", async (t) => {
  const ownedBacklog = backlogOf([], [itemA, itemB, itemC, ownedD]);
  const fixture = await createBacklogSuffixFixture(ownedBacklog);
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    fixture;
  t.after(cleanup);

  const before = await captureCheckout(integration);
  let siblingSha;
  const attempts = [];
  let checked = false;
  const outcome = await publishExecutionIncrement({
    workspace: execution,
    ...makeMe.anIncrementPublication
      .with({
        previouslyPublishedBase: trunkSha,
        branch: "exec/story",
        targetRef: "refs/heads/main",
      })
      .please(),
    beforePush: async ({ attempt }) => {
      attempts.push(attempt);
      if (attempt === 0) {
        siblingSha = await advanceOriginBacklog(
          origin,
          backlogOf([], [itemA, itemB, itemC, otherD]),
          "conflicting rename of D",
        );
      }
    },
    validate: () => {
      checked = true;
      return true;
    },
  });

  assert.equal(outcome.publication, "stopped");
  assert.equal(outcome.status, "conflict");
  assert.equal(outcome.reconciliations, 1);
  assert.deepEqual(attempts, [0]);
  assert.equal(
    checked,
    false,
    "a conflict stops before affected revalidation and the retry push",
  );
  assert.match(
    outcome.replay.stdout + outcome.replay.stderr,
    /unresolved|conflict/i,
  );
  assert.equal(outcome.remoteTip, siblingSha);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), siblingSha);
  assert.equal(await revParse(execution, "exec/story"), candidateSha);
  assert.equal(rebaseInProgress(execution), "rebase-merge");
  assert.match(
    (await git(execution, "ls-files", "-u", "--", backlogPath)).stdout,
    /PRODUCT-BACKLOG/,
  );
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});
