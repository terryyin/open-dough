// Managed resume matches the target before the owner: the resuming
// coordinator's observer of another branch stays unused, and the accepted
// revision stays unobserved without a duplicate push.
import assert from "node:assert/strict";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";

test("an observer of another target branch is never adopted, even under this coordinator's claim", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  const accepted = delivered.receipt.sha;
  const claim = readFileSync(join(delivered.observation.directory, "owner"));
  await fixture.stopObserver(delivered.observation.directory);
  rmSync(delivered.observation.directory, { recursive: true, force: true });
  // Only this coordinator's live observer of another branch remains.
  const mismatched = await fixture.startExecutionMailbox(
    {
      mode: "execution",
      repo,
      branch: "other-branch",
      maxDurationMs: 60_000,
    },
    {
      root: fixture.execution,
      storage: fixture.storage,
      env: fixture.env,
    },
  );
  writeFileSync(join(mismatched, "owner"), claim);

  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: accepted,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [accepted],
    defaultCheckout: fixture.integration,
  });

  assert.equal(resumed.observation.state, "unobserved");
  assert.equal(resumed.observation.ownership, "missing");
  assert.equal(resumed.pushCount, 0);
  assert.equal(
    readRevisionCoverage(mismatched).length,
    0,
    "an observer of another branch must not receive the accepted SHA",
  );
});
