// One-shot work in the default checkout (`--one-shot --default-main`) through
// the actual start entry points of both workflows: one-shot execution's
// `execution-start.mjs` and one-shot refinement's installed
// `preparation-assignment.mjs`, against a real bare origin. The start takes
// the default checkout exactly as it is, with staged, unstaged, untracked and
// deleted content and an unpublished local commit: nothing is reset,
// refreshed, created, or pushed, the receipt names the checkout's actual role,
// path, branch and HEAD, and a result committed there keeps all of that
// content. Refusals and fetched-trunk holder checks are in
// default-checkout-session-refusal.test.mjs.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  queuedReadyRepository,
  queuedRepositoryWithRoughStory,
  roughStoryC,
} from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import {
  commitAllAndAssertRetained,
  occupyDefaultCheckout,
  snapshot,
  startExecutionThere,
} from "./default-checkout-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  git,
} from "./publication-test-fixtures.mjs";
import {
  backlogFile,
  identityC,
  refineStoryC,
  remoteFile,
  remoteProfileNames,
  seedC,
} from "../../dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import {
  oneShot as oneShotRefinement,
  recordRefined,
  stateBlock,
  useInstalledPayload,
} from "../../dough-story-refinement/scripts/one-shot-refinement-test-fixtures.mjs";

useInstalledPayload();

test("one-shot execution with --default-main works in the dirty default checkout, diverged from fetched trunk, without changing it, creating anything, or pushing", async (t) => {
  const trunk = await materializeRepository(queuedReadyRepository().please());
  t.after(trunk.cleanup);
  const checkout = trunk.integration;
  await occupyDefaultCheckout(checkout);
  const fetched = await advanceOriginFromAnotherWriter(trunk.origin);
  const before = await snapshot(checkout, trunk.origin);

  const { code, receipt } = await startExecutionThere(trunk, [
    "--default-main",
  ]);
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.deepEqual(receipt, {
    ok: true,
    status: "prepared",
    role: "default-checkout",
    workspace: checkout,
    branch: "main",
    startingRevision: before.head,
    fetched,
    created: false,
  });
  assert.deepEqual(await snapshot(checkout, trunk.origin), before);

  writeFileSync(join(checkout, "feature.txt"), "one-shot result\n");
  const result = await commitAllAndAssertRetained(
    checkout,
    trunk.origin,
    before,
    "one-shot result",
  );
  assert.equal(
    (await git(checkout, "show", `${result}:feature.txt`)).stdout,
    "one-shot result\n",
  );
});

test("one-shot refinement with --default-main records its facts in the dirty default checkout, leaving the story queued and nothing published", async (t) => {
  const trunk = await materializeRepository(
    queuedRepositoryWithRoughStory(roughStoryC).please(),
  );
  t.after(trunk.cleanup);
  const checkout = trunk.integration;
  const queue = await remoteFile(trunk, "main", backlogFile);
  await occupyDefaultCheckout(checkout);
  const before = await snapshot(checkout, trunk.origin);

  // The integration checkout and the workspace name the same checkout.
  const { code, receipt } = await oneShotRefinement(
    trunk,
    checkout,
    undefined,
    ["--default-main"],
  );
  assert.equal(code, 0, JSON.stringify(receipt));
  assert.deepEqual(receipt, {
    ok: true,
    status: "prepared",
    tracking: "one-shot",
    identity: identityC,
    role: "default-checkout",
    workspace: checkout,
    branch: "main",
    startingRevision: before.head,
    fetched: trunk.trunkSha,
    created: false,
  });
  assert.deepEqual(await snapshot(checkout, trunk.origin), before);

  refineStoryC(checkout);
  await recordRefined(checkout);
  const result = await commitAllAndAssertRetained(
    checkout,
    trunk.origin,
    before,
    "Refine story C",
  );
  assert.deepEqual(await stateBlock(checkout, result), {
    schemaVersion: 1,
    refinement: "refined",
    approach: "unselected",
  });
  assert.equal(
    (await git(checkout, "show", `${result}:${backlogFile}`)).stdout,
    queue,
  );
  assert.equal(await remoteFile(trunk, "main", backlogFile), queue);
  assert.doesNotMatch(await remoteFile(trunk, "main", seedC), /C is useful/);
  assert.deepEqual(await remoteProfileNames(trunk), []);
});

test("a clean default checkout behind fetched trunk stays at its own HEAD: neither workflow's default-checkout start fast-forwards it", async (t) => {
  const trunk = await materializeRepository(
    queuedRepositoryWithRoughStory(roughStoryC).please(),
  );
  t.after(trunk.cleanup);
  const checkout = trunk.integration;
  const fetched = await advanceOriginFromAnotherWriter(trunk.origin);
  const before = await snapshot(checkout, trunk.origin);
  assert.equal(before.head, trunk.trunkSha);

  const execution = await startExecutionThere(trunk, ["--default-main"]);
  assert.equal(execution.code, 0, JSON.stringify(execution.receipt));
  const refinement = await oneShotRefinement(trunk, checkout, undefined, [
    "--default-main",
  ]);
  assert.equal(refinement.code, 0, JSON.stringify(refinement.receipt));
  for (const { receipt } of [execution, refinement]) {
    assert.equal(receipt.startingRevision, trunk.trunkSha);
    assert.equal(receipt.fetched, fetched);
  }
  assert.deepEqual(await snapshot(checkout, trunk.origin), before);
});
