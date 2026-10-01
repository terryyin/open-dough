// Refusals of one-shot work in the default checkout (`--one-shot
// --default-main`) through both workflows' actual start entry points, against
// a real bare origin: a checkout on another branch or mid-operation, a
// mismatched checkout or branch, and tracked work asking for the default
// checkout are refused without change, and holder checks still read fetched
// remote trunk rather than the checkout's own content.
import assert from "node:assert/strict";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  occupyDefaultCheckout,
  snapshot,
  startExecutionThere,
} from "./default-checkout-test-fixtures.mjs";
import { git, indexLockPath } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { createPreparationTrunk } from "../../dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import {
  oneShot as oneShotRefinement,
  start as startRefinement,
  useInstalledPayload,
} from "../../dough-story-refinement/scripts/one-shot-refinement-test-fixtures.mjs";

useInstalledPayload();

test("a default checkout on another branch or mid-operation, a mismatched checkout, or tracked work refuses --default-main in both workflows without changing anything", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const checkout = trunk.integration;
  await occupyDefaultCheckout(checkout);
  const elsewhere = join(trunk.fixture, "elsewhere");

  const attempts = (label) => [
    [
      `${label}: execution`,
      () => startExecutionThere(trunk, ["--default-main"]),
    ],
    [
      `${label}: refinement`,
      () => oneShotRefinement(trunk, checkout, undefined, ["--default-main"]),
    ],
  ];
  const refuse = async (cases, status, error) => {
    for (const [label, run] of cases) {
      const before = await snapshot(checkout, trunk.origin);
      const refused = await run();
      assert.equal(refused.code, 1, `${label}: ${JSON.stringify(refused)}`);
      assert.match(refused.receipt.status, status, label);
      assert.match(refused.receipt.error, error, label);
      assert.deepEqual(await snapshot(checkout, trunk.origin), before, label);
    }
  };

  await git(checkout, "switch", "--quiet", "-c", "topic");
  await refuse(
    attempts("another branch"),
    /setup-failed|workspace-selection-failed/,
    /on branch topic, not the target branch main/,
  );
  await git(checkout, "switch", "--quiet", "main");

  const lock = await indexLockPath(checkout);
  writeFileSync(lock, "");
  await refuse(
    attempts("index lock"),
    /setup-failed|workspace-selection-failed/,
    /ongoing Git operation \(index\.lock\)/,
  );
  rmSync(lock);

  await refuse(
    [
      [
        "execution: another integration checkout",
        () =>
          startExecutionThere(trunk, ["--default-main"], {
            integration: elsewhere,
          }),
      ],
      [
        "execution: another branch name",
        () =>
          startExecutionThere(trunk, ["--default-main"], { branch: "topic" }),
      ],
      [
        "execution: tracked",
        () =>
          startCliResult(trunk, "story-branch", ["--default-main"], {
            workspace: checkout,
          }),
      ],
      [
        "refinement: missing checkout",
        () =>
          startRefinement(trunk, elsewhere, ["--one-shot", "--default-main"]),
      ],
      [
        "refinement: assigned",
        () =>
          startRefinement(trunk, checkout, [
            "--default-main",
            "--push-authorized",
          ]),
      ],
    ],
    /^invalid-request$/,
    /--default-main/,
  );
  assert.equal(existsSync(elsewhere), false);
});

test("a default-checkout start still checks holders on fetched remote trunk, which its local content does not hide", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const checkout = trunk.integration;
  await occupyDefaultCheckout(checkout);
  // An ordinary Take publishes from its own workspace; the default checkout's
  // own content keeps it unrefreshed, so locally story A is still queued.
  const taken = await startCliResult(trunk, "trunk");
  assert.equal(taken.receipt.ok, true, taken.stdout);
  assert.notEqual(taken.receipt.maintenance.result, "advanced");
  const before = await snapshot(checkout, trunk.origin);

  const { code, receipt } = await startExecutionThere(
    trunk,
    ["--default-main"],
    { identity: identityA },
  );
  assert.equal(code, 1, JSON.stringify(receipt));
  assert.equal(receipt.status, "source-refused");
  assert.match(receipt.error, /already Taken on fetched trunk/);
  assert.deepEqual(await snapshot(checkout, trunk.origin), before);
});
