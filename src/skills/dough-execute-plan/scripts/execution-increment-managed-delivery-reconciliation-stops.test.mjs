// Managed delivery reconciliation stops: backlog semantics, conflict, and
// exhausted racing-push retry. Success and needs-validation paths stay in
// execution-increment-managed-delivery-reconciliation.test.mjs.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  advanceOriginBacklog,
  assertAffectedCombination,
  backlogPath,
  itemA,
  itemB,
  itemC,
  itemD,
  ownedD,
  rebaseInProgress,
  siblingB,
} from "./publication-racing-suffix-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  lsRemoteSha,
  plantHumanEdit,
  revParse,
} from "./publication-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";
const otherD = "- [Item D, other writer](seeds/D.md#d)";

test("sibling backlog change preserves backlog semantics through the rebase adapter", async (t) => {
  const fixture = await createManagedFixture();
  t.after(async () => {
    await fixture.stopObserver(fixture.observerDirectory);
    fixture.cleanup();
  });

  // Seed the shared backlog on trunk so sibling and owned edits share a base.
  mkdirSync(join(fixture.integration, ".planning"), { recursive: true });
  writeFileSync(
    join(fixture.integration, backlogPath),
    backlogOf([], [itemA, itemB, itemC, itemD]),
  );
  await git(fixture.integration, "add", backlogPath);
  await git(fixture.integration, "commit", "-m", "seed backlog");
  await git(fixture.integration, "push", "origin", "main");
  const trunkSha = await revParse(fixture.integration, "main");
  await git(fixture.execution, "fetch", "origin");
  await git(fixture.execution, "rebase", "origin/main");

  writeFileSync(
    join(fixture.execution, backlogPath),
    backlogOf([], [itemA, itemB, itemC, ownedD]),
  );
  writeFileSync(join(fixture.execution, "increment.txt"), "increment\n");
  await git(fixture.execution, "add", backlogPath, "increment.txt");
  await git(fixture.execution, "commit", "--amend", "--no-edit");
  const candidateSha = await revParse(fixture.execution, "exec/story");
  const siblingSha = await advanceOriginBacklog(
    fixture.origin,
    backlogOf([], [itemA, siblingB, itemC, itemD]),
    "sibling backlog change",
  );
  await plantHumanEdit(fixture.integration);
  const before = await captureCheckout(fixture.integration);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: trunkSha,
    targetRef: trunkTarget,
    repo,
    defaultCheckout: fixture.integration,
    validate: async (candidate) => {
      await assertAffectedCombination(fixture.execution, candidate);
      return { ok: true };
    },
  });
  fixture.observerDirectory = delivered.observation.directory;

  assert.equal(delivered.ok, true, JSON.stringify(delivered));
  assert.equal(
    (
      await git(fixture.execution, "rev-parse", `${delivered.receipt.sha}^`)
    ).stdout.trim(),
    siblingSha,
  );
  await assertAffectedCombination(fixture.execution, delivered.receipt.sha);
  assert.notEqual(delivered.receipt.sha, candidateSha);
  assert.equal(
    readRevisionCoverage(delivered.observation.directory)[0].sha,
    delivered.receipt.sha.toLowerCase(),
  );
  assertCheckoutUnchanged(before, await captureCheckout(fixture.integration));
});

test("conflict stops and preserves recoverable work without pushing", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  mkdirSync(join(fixture.integration, ".planning"), { recursive: true });
  writeFileSync(
    join(fixture.integration, backlogPath),
    backlogOf([], [itemA, itemB, itemC, itemD]),
  );
  await git(fixture.integration, "add", backlogPath);
  await git(fixture.integration, "commit", "-m", "seed backlog");
  await git(fixture.integration, "push", "origin", "main");
  const trunkSha = await revParse(fixture.integration, "main");
  await git(fixture.execution, "fetch", "origin");
  await git(fixture.execution, "rebase", "origin/main");

  writeFileSync(
    join(fixture.execution, backlogPath),
    backlogOf([], [itemA, itemB, itemC, ownedD]),
  );
  await git(fixture.execution, "add", backlogPath);
  await git(fixture.execution, "commit", "-m", "owned backlog change");
  const candidateSha = await revParse(fixture.execution, "exec/story");
  const siblingSha = await advanceOriginBacklog(
    fixture.origin,
    backlogOf([], [itemA, itemB, itemC, otherD]),
    "conflicting rename of D",
  );

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: trunkSha,
    targetRef: trunkTarget,
    repo,
    validate: async () => ({ ok: true }),
  });

  assert.equal(delivered.ok, false);
  assert.equal(delivered.publication, "stopped");
  assert.equal(delivered.status, "conflict");
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), siblingSha);
  assert.equal(await revParse(fixture.execution, "exec/story"), candidateSha);
  assert.equal(await rebaseInProgress(fixture.execution), true);
  assert.match(
    (await git(fixture.execution, "ls-files", "-u", "--", backlogPath)).stdout,
    /PRODUCT-BACKLOG/,
  );
});

test("second push rejection stops after one reconciliation retry", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  let pushAttempt = 0;
  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
    validate: async () => ({ ok: true }),
    beforePush: async () => {
      pushAttempt += 1;
      await advanceOriginFromAnotherWriter(fixture.origin, {
        file: `race-${pushAttempt}.txt`,
        body: `race ${pushAttempt}\n`,
        message: `racing push ${pushAttempt}`,
      });
    },
  });

  assert.equal(delivered.ok, false);
  assert.equal(delivered.publication, "stopped");
  assert.equal(delivered.status, "persistent-contention");
  assert.equal(delivered.reconciliations, 1);
  assert.equal(pushAttempt, 2);
  assert.notEqual(delivered.candidate, fixture.candidateSha);
  assert.notEqual(
    await lsRemoteSha(fixture.origin, trunkTarget),
    delivered.candidate,
  );
  assert.equal(await rebaseInProgress(fixture.execution), false);
});
