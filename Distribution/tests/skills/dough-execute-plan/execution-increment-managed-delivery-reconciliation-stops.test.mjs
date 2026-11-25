// Managed delivery reconciliation stops: backlog semantics, conflict, and
// exhausted racing-push retry. Success and needs-validation paths stay in
// execution-increment-managed-delivery-reconciliation.test.mjs.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { rebaseInProgress } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-git-operation-state.mjs";
import { backlogOf } from "../../support/product-backlog-fixture.mjs";
import { makeMe } from "../../support/makeMe.mjs";
import { readRevisionCoverage } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox.mjs";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  advanceOriginBacklog,
  assertAffectedCombination,
  backlogSuffixDescription,
  backlogPath,
  itemA,
  itemB,
  itemC,
  itemD,
  ownedD,
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

// A trunk.txt trunk commit, whose bytes the affected check and the planted
// human edit read, and a workspace on exec/story one unpublished
// increment.txt commit ahead.
const trunkWithOneIncrement = makeMe.aRepository
  .withRevision("trunk", { files: { "trunk.txt": "base\n" } })
  .withWorkspace("exec/story", { from: "trunk" })
  .withUnpublishedRevision("increment", {
    files: { "increment.txt": "increment\n" },
  })
  .please();

test("sibling backlog change preserves backlog semantics through the rebase adapter", async (t) => {
  const fixture = await createManagedFixture({
    description: trunkWithOneIncrement,
  });
  t.after(fixture.cleanup);

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
      await assertAffectedCombination(fixture, candidate);
      return { ok: true };
    },
  });

  assert.equal(delivered.ok, true, JSON.stringify(delivered));
  assert.equal(
    (
      await git(fixture.execution, "rev-parse", `${delivered.receipt.sha}^`)
    ).stdout.trim(),
    siblingSha,
  );
  await assertAffectedCombination(fixture, delivered.receipt.sha);
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
  assert.equal(rebaseInProgress(fixture.execution), "rebase-merge");
  assert.match(
    (await git(fixture.execution, "ls-files", "-u", "--", backlogPath)).stdout,
    /PRODUCT-BACKLOG/,
  );
});

test("second push rejection preserves the first rewritten candidate and reports contention", async (t) => {
  const fixture = await createManagedFixture({
    description: backlogSuffixDescription(
      backlogOf([], [itemA, itemB, itemC, ownedD]),
    ),
  });
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const before = await captureCheckout(integration);
  const attempts = [];
  let checkedSha;
  let siblingSha;
  let secondWriter;
  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
    validate: async (sha) => {
      checkedSha = sha;
      await assertAffectedCombination(fixture, sha);
      return true;
    },
    beforePush: async ({ attempt }) => {
      attempts.push(attempt);
      if (attempt === 0) {
        siblingSha = await advanceOriginBacklog(
          origin,
          backlogOf([], [itemA, siblingB, itemC, itemD]),
          "sibling backlog change",
        );
      } else {
        secondWriter = await advanceOriginFromAnotherWriter(origin);
      }
    },
  });

  assert.equal(delivered.ok, false);
  assert.equal(delivered.publication, "stopped");
  assert.equal(delivered.report, "persistent-contention");
  assert.equal(delivered.status, "persistent-contention");
  assert.equal(delivered.receipt, null);
  assert.equal(delivered.maintenance, null);
  assert.equal(delivered.reconciliations, 1);
  assert.deepEqual(attempts, [0, 1]);
  const { candidate } = delivered;
  assert.equal(candidate, checkedSha);
  assert.notEqual(candidate, fixture.candidateSha);
  assert.equal(await revParse(execution, "exec/story"), candidate);
  assert.equal(
    (
      await git(execution, "rev-list", "--parents", "-1", candidate)
    ).stdout.trim(),
    `${candidate} ${siblingSha}`,
  );
  assert.equal(
    (
      await git(
        execution,
        "ls-tree",
        "--name-only",
        candidate,
        "other-writer.txt",
      )
    ).stdout,
    "",
  );
  assert.equal(delivered.remoteTip, secondWriter);
  assert.equal(await lsRemoteSha(origin, trunkTarget), secondWriter);
  assert.notEqual(secondWriter, candidate);
  assert.equal(rebaseInProgress(execution), undefined);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});
