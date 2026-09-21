// Git mechanics (not guidance-following), not proof an agent follows guidance.
// A stopped default-checkout refresh leaves the accepted closure on trunk.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { publishTrunkClosureRevision } from "./closure-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  commitFile,
  createCleanTrunkFixture,
  createClosureObserver,
  executionBranch,
  git,
  lsRemoteSha,
  publishArgs,
  publishCompletedIncrement,
  revParse,
  trunkTarget,
} from "./closure-publication-fixtures.mjs";

test("a stopped default-checkout refresh does not erase accepted closure publication", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const increment = await publishCompletedIncrement(fixture);
  await git(integration, "checkout", "-b", "side");
  const sideHead = await revParse(integration, "HEAD");
  const observer = createClosureObserver(execution);
  const beforePreRebase = await commitFile(
    execution,
    "before-cleanup.txt",
    "before cleanup\n",
    "before-cleanup closure",
  );
  await advanceOriginFromAnotherWriter(origin);

  const published = await publishTrunkClosureRevision(
    publishArgs(fixture, observer, increment.receipt.sha),
  );
  assert.equal(published.maintenance.result, "stopped");
  assert.equal(published.maintenance.reason, "unexpected-branch");
  assert.equal(published.receipt.target, trunkTarget);
  assert.notEqual(published.receipt.sha, beforePreRebase);
  assert.equal(await lsRemoteSha(origin, trunkTarget), published.receipt.sha);
  assert.equal(await revParse(integration, "HEAD"), sideHead);
  assert.equal(
    (await git(integration, "branch", "--show-current")).stdout.trim(),
    "side",
  );
  assert.equal(await lsRemoteSha(origin, `refs/heads/${executionBranch}`), "");
  assert.equal(existsSync(execution), true);
  assert.equal(
    await revParse(execution, executionBranch),
    published.receipt.sha,
  );
});
