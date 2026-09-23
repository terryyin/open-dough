// Managed resume recovers accepted publication without duplicate push when a
// live matching owner is still available (lost response or missing attachment).
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { lsRemoteSha, messageCount } from "./publication-test-fixtures.mjs";
import {
  createManagedFixture,
  watchCount,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";

test("lost push response resumes from remote evidence without another push", async (t) => {
  const fixture = await createManagedFixture();
  t.after(async () => {
    await fixture.stopObserver(fixture.observerDirectory);
    fixture.cleanup();
  });

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  fixture.observerDirectory = delivered.observation.directory;
  assert.equal(delivered.observation.state, "attached");
  const accepted = delivered.receipt.sha;
  const pushesBefore = await messageCount(
    fixture.origin,
    trunkTarget,
    "verified increment",
  );

  // Simulate a lost delivery response: caller only retains the candidate SHA.
  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: accepted,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [],
    defaultCheckout: fixture.integration,
  });

  assert.equal(resumed.ok, true);
  assert.equal(resumed.publication, "accepted");
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.receipt.sha, accepted);
  assert.equal(resumed.observation.state, "recovered");
  assert.equal(resumed.observation.directory, delivered.observation.directory);
  assert.equal(
    await messageCount(fixture.origin, trunkTarget, "verified increment"),
    pushesBefore,
  );
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), accepted);
  assert.equal(
    readRevisionCoverage(resumed.observation.directory).some(
      (entry) => entry.sha === accepted.toLowerCase(),
    ),
    true,
  );
});

test("missing observation attachment recovers matching live owner without another push", async (t) => {
  const fixture = await createManagedFixture();
  t.after(async () => {
    await fixture.stopObserver(fixture.observerDirectory);
    fixture.cleanup();
  });

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  fixture.observerDirectory = delivered.observation.directory;
  const accepted = delivered.receipt.sha;
  // Drop coverage to simulate lost attachment after acceptance.
  rmSync(
    join(
      delivered.observation.directory,
      "coverage",
      `${accepted.toLowerCase()}.json`,
    ),
    { force: true },
  );
  assert.equal(readRevisionCoverage(delivered.observation.directory).length, 0);
  const watchesBefore = watchCount(fixture.storage);
  const pushesBefore = await messageCount(
    fixture.origin,
    trunkTarget,
    "verified increment",
  );

  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: accepted,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [accepted],
    defaultCheckout: fixture.integration,
  });

  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.observation.state, "recovered");
  assert.equal(resumed.observation.directory, delivered.observation.directory);
  assert.equal(watchCount(fixture.storage), watchesBefore);
  assert.equal(
    await messageCount(fixture.origin, trunkTarget, "verified increment"),
    pushesBefore,
  );
  assert.equal(
    readRevisionCoverage(resumed.observation.directory).some(
      (entry) => entry.sha === accepted.toLowerCase(),
    ),
    true,
  );
});
