// The coordinator continues from the start result alone: setup readiness,
// only after the accepted claim and only in the owned workspace, then the
// first managed delivery based on the returned accepted revision.
// The result stays the same size however large the default checkout is.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
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
  busyCheckout,
  createQueuedTrunk,
  readyContributing,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import { runReadinessGate } from "./execution-worktree-preparation-readiness-gate.mjs";
import { installManagedDelivery } from "./execution-increment-managed-delivery-test-fixtures.mjs";
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
    const markers = [".setup-ran", ".command-ran"];
    for (const marker of markers) {
      assert.equal(existsSync(join(workspace, marker)), false, marker);
    }

    const readiness = await runReadinessGate(workspace, process.env);
    assert.equal(readiness.ok, true, readiness.report);
    assert.deepEqual(
      readiness.invocations.map(({ role }) => role),
      ["setup", "command", "delegate"],
    );
    assert.equal(
      readiness.invocations.every(({ cwd }) => cwd === workspace),
      true,
    );
    for (const marker of markers) {
      assert.equal(existsSync(join(workspace, marker)), true, marker);
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

    writeFileSync(join(workspace, "feature.txt"), "first increment\n");
    await git(workspace, "add", "feature.txt");
    await git(workspace, "commit", "-m", "first verified increment");
    const increment = await revParse(workspace, "HEAD");

    const delivery = await installManagedDelivery(
      trunk,
      trunk.fixture,
      workspace,
    );
    const targetRef =
      mode === "trunk" ? "refs/heads/main" : `refs/heads/${branch}`;
    const delivered = await delivery.deliverManagedExecutionIncrement({
      ...delivery.requestBase,
      workspace,
      branch,
      previouslyPublishedBase: receipt.publishedSha,
      targetRef,
      repo: "owner/project",
    });

    assert.equal(delivered.ok, true, JSON.stringify(delivered));
    assert.equal(delivered.publication, "accepted");
    assert.equal(delivered.receipt.sha, increment);
    assert.equal(await lsRemoteSha(trunk.origin, targetRef), increment);
    assert.equal(
      await revParse(workspace, `${increment}^`),
      receipt.publishedSha,
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
