// The first-delivery journey a start result carries: setup readiness in the
// started workspace, then one verified increment delivered to remote
// acceptance on top of the published claim.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import { runReadinessGate } from "./execution-worktree-preparation-readiness-gate.mjs";
import { installManagedDelivery } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { setupMarkers } from "./workspace-publication-fixtures.mjs";

// Runs the readiness gate in `workspace` and asserts setup ran only there,
// commits one increment, delivers it through managed delivery to `targetRef`,
// and asserts origin accepted it with `publishedSha` as its parent. Returns
// the readiness result for each caller's own assertions.
export async function deliverFirstIncrement(
  trunk,
  { workspace, branch, publishedSha, targetRef = "refs/heads/main" },
) {
  const readiness = await runReadinessGate(workspace, process.env);
  assert.equal(readiness.ok, true, readiness.report);
  assert.equal(
    readiness.invocations.every(({ cwd }) => cwd === workspace),
    true,
  );
  for (const marker of setupMarkers)
    assert.equal(existsSync(join(workspace, marker)), true, marker);

  writeFileSync(join(workspace, "feature.txt"), "first increment\n");
  await git(workspace, "add", "feature.txt");
  await git(workspace, "commit", "-m", "first verified increment");
  const increment = await revParse(workspace, "HEAD");
  const delivery = await installManagedDelivery(
    trunk,
    trunk.fixture,
    workspace,
  );
  const delivered = await delivery.deliverManagedExecutionIncrement({
    ...delivery.requestBase,
    workspace,
    branch,
    previouslyPublishedBase: publishedSha,
    targetRef,
    repo: "owner/project",
  });
  assert.equal(delivered.ok, true, JSON.stringify(delivered));
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.receipt.sha, increment);
  assert.equal(await lsRemoteSha(trunk.origin, targetRef), increment);
  assert.equal(await revParse(workspace, `${increment}^`), publishedSha);
  return readiness;
}
