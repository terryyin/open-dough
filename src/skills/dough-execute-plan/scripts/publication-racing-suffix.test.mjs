// Git mechanics (not guidance-following): a rejected push of an owned suffix
// is reconciled once through the backlog rebase adapter when that suffix
// touches the backlog, then pushed once. A conflict or a second rejection
// preserves that state and does not loop. Lost-response classification is not this file.
import assert from "node:assert/strict";
import { test } from "node:test";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
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
  publishRacingSuffix,
  rebaseInProgress,
  siblingB,
} from "./publication-racing-suffix-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  assertRemoteCandidate,
  captureCheckout,
  git,
  lsRemoteSha,
  maintenanceFromInspection,
  plantHumanEdit,
  revParse,
} from "./publication-test-fixtures.mjs";

test("a rejected push is reconciled once onto the other writer's commit, then the combined candidate is accepted", async (t) => {
  const ownedBacklog = backlogOf([], [itemA, itemB, itemC, ownedD]);
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createBacklogSuffixFixture(ownedBacklog);
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const siblingSha = await advanceOriginBacklog(
    origin,
    backlogOf([], [itemA, siblingB, itemC, itemD]),
    "sibling backlog change",
  );

  let checkedSha;
  const outcome = await publishRacingSuffix({
    workspace: execution,
    origin,
    candidateSha,
    previouslyPublishedBase: trunkSha,
    branch: "exec/story",
    affectedCheck: async (sha) => {
      checkedSha = sha;
      await assertAffectedCombination(execution, sha);
    },
  });

  assert.equal(outcome.status, "published");
  assert.equal(outcome.replays, 1);
  assert.equal(checkedSha, outcome.sha);
  assert.equal(
    (await git(execution, "rev-parse", `${outcome.sha}^`)).stdout.trim(),
    siblingSha,
    "published ancestry keeps the other writer's commit as the parent",
  );
  assert.equal(
    (
      await git(
        execution,
        "log",
        "--format=%s",
        `${siblingSha}..${outcome.sha}`,
      )
    ).stdout,
    "verified increment\n",
    "only the owned suffix is replayed",
  );
  await git(execution, "fetch", "origin");
  await assertRemoteCandidate(origin, outcome.sha);
  const after = await captureCheckout(integration);
  assertCheckoutUnchanged(before, after);
  assert.equal(after.head, trunkSha);
  assert.equal(maintenanceFromInspection(after, outcome.sha), "deferred");
  assert.equal(await rebaseInProgress(execution), false);
});

test("conflicting backlog intent preserves the rejected candidate and does not retry the push", async (t) => {
  const ownedBacklog = backlogOf([], [itemA, itemB, itemC, ownedD]);
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createBacklogSuffixFixture(ownedBacklog);
  t.after(cleanup);

  const before = await captureCheckout(integration);
  const siblingSha = await advanceOriginBacklog(
    origin,
    backlogOf([], [itemA, itemB, itemC, otherD]),
    "conflicting rename of D",
  );

  let checked = false;
  const outcome = await publishRacingSuffix({
    workspace: execution,
    origin,
    candidateSha,
    previouslyPublishedBase: trunkSha,
    branch: "exec/story",
    affectedCheck: () => {
      checked = true;
    },
  });

  assert.equal(outcome.status, "preserved");
  assert.equal(outcome.reason, "conflict");
  assert.equal(outcome.replays, 1);
  assert.equal(
    checked,
    false,
    "a conflict stops before affected revalidation and the retry push",
  );
  assert.match(
    outcome.replay.stdout + outcome.replay.stderr,
    /unresolved|conflict/i,
  );
  assert.equal(outcome.remoteSha, siblingSha);
  assert.equal(await revParse(execution, "exec/story"), candidateSha);
  assert.equal(await rebaseInProgress(execution), true);
  assert.match(
    (await git(execution, "ls-files", "-u", "--", backlogPath)).stdout,
    /PRODUCT-BACKLOG/,
  );
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});

test("a second rejection preserves the once-rewritten candidate and does not reconcile again", async (t) => {
  const ownedBacklog = backlogOf([], [itemA, itemB, itemC, ownedD]);
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createBacklogSuffixFixture(ownedBacklog);
  t.after(cleanup);

  const before = await captureCheckout(integration);
  const siblingSha = await advanceOriginBacklog(
    origin,
    backlogOf([], [itemA, siblingB, itemC, itemD]),
    "sibling backlog change",
  );

  let checkedSha;
  const outcome = await publishRacingSuffix({
    workspace: execution,
    origin,
    candidateSha,
    previouslyPublishedBase: trunkSha,
    branch: "exec/story",
    affectedCheck: async (sha) => {
      checkedSha = sha;
      await assertAffectedCombination(execution, sha);
    },
    beforeRetryPush: () => advanceOriginFromAnotherWriter(origin),
  });

  assert.equal(outcome.status, "preserved");
  assert.equal(outcome.reason, "persistent-contention");
  assert.equal(outcome.replays, 1);
  assert.equal(checkedSha, outcome.localSha);
  assert.notEqual(outcome.remoteSha, siblingSha);
  assert.notEqual(outcome.localSha, candidateSha);
  assert.equal(await revParse(execution, "exec/story"), outcome.localSha);
  assert.equal(
    (await git(execution, "rev-parse", `${outcome.localSha}^`)).stdout.trim(),
    siblingSha,
    "the one replay stays based on the first remote advance",
  );
  let absorbed = true;
  try {
    await git(
      execution,
      "merge-base",
      "--is-ancestor",
      outcome.remoteSha,
      outcome.localSha,
    );
  } catch {
    absorbed = false;
  }
  assert.equal(absorbed, false, "the later remote commit was not absorbed");
  assert.equal(
    (
      await git(execution, "ls-tree", "-r", "--name-only", outcome.localSha)
    ).stdout.includes("other-writer.txt"),
    false,
  );
  assert.equal(await rebaseInProgress(execution), false);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), outcome.remoteSha);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});
