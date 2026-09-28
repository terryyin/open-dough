// The coordinator continues from the start result alone: setup readiness,
// only after the accepted claim and only in the owned workspace, then the
// first managed delivery based on the returned accepted revision.
// The result stays the same size however large the default checkout is.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  readyContributing,
  setupMarkers,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { busyCheckout } from "./default-checkout-test-fixtures.mjs";
import { deliverFirstIncrement } from "./workspace-publication-startup-delivery-test-fixtures.mjs";
import { agentModes } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

for (const mode of agentModes) {
  test(`a ${mode} start result alone carries setup and the first delivery to remote acceptance`, async (t) => {
    const trunk = await createQueuedTrunk({ contributing: readyContributing });
    t.after(trunk.cleanup);
    const branch = `exec/${mode}`;
    const { receipt, code, workspace } = await startCliResult(trunk, mode);
    assert.equal(code, 0);
    assert.equal(receipt.ok, true, JSON.stringify(receipt));
    assert.equal(receipt.created, true);
    for (const marker of setupMarkers) {
      assert.equal(existsSync(join(workspace, marker)), false, marker);
    }

    const readiness = await deliverFirstIncrement(trunk, {
      workspace,
      branch,
      publishedSha: receipt.publishedSha,
      targetRef: mode === "trunk" ? "refs/heads/main" : `refs/heads/${branch}`,
    });
    assert.deepEqual(
      readiness.invocations.map(({ role }) => role),
      ["setup", "command", "delegate"],
    );
    for (const marker of setupMarkers) {
      assert.equal(existsSync(join(trunk.integration, marker)), false, marker);
    }
    assert.equal(
      await revParse(trunk.integration, "HEAD"),
      receipt.publishedSha,
    );
    assert.equal(
      (await git(trunk.integration, "status", "--porcelain")).stdout,
      "",
    );
  });
}

test("the start result does not grow with tracked inventory or dirty patch volume", async (t) => {
  const small = await createQueuedTrunk();
  const large = await createQueuedTrunk();
  t.after(small.cleanup);
  t.after(large.cleanup);
  await busyCheckout(small, 1, 1);
  await busyCheckout(large, 1500, 2000);
  const smallBefore = await captureCheckout(small.integration);
  const largeBefore = await captureCheckout(large.integration);

  const compact = await startCliResult(small, "trunk");
  const busy = await startCliResult(large, "trunk");

  for (const { receipt } of [compact, busy]) {
    assert.equal(receipt.ok, true, JSON.stringify(receipt));
    assert.deepEqual(receipt.maintenance, {
      result: "deferred",
      reason: "pending-edit",
    });
  }
  assert.equal(
    Buffer.byteLength(busy.stdout),
    Buffer.byteLength(compact.stdout),
    busy.stdout,
  );
  assert.doesNotMatch(busy.stdout, /inventory|staged\.txt|unrelated patch/);
  assert.equal(
    await lsRemoteSha(large.origin, "refs/heads/main"),
    busy.receipt.publishedSha,
  );
  assertCheckoutUnchanged(
    smallBefore,
    await captureCheckout(small.integration),
  );
  assertCheckoutUnchanged(
    largeBefore,
    await captureCheckout(large.integration),
  );
});
