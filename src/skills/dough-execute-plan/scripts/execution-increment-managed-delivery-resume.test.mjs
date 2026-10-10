// Managed resume recovers accepted publication without duplicate push when a
// coordinator's live observer is still available (lost response or missing
// attachment).
import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  exec,
  git,
  lsRemoteSha,
  messageCount,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  createManagedFixture,
  watchCount,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";

test("lost push response resumes the retained multi-commit comparison after another writer advances without another push", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  writeFileSync(
    join(fixture.execution, "second-increment.txt"),
    "second increment\n",
  );
  await git(fixture.execution, "add", "second-increment.txt");
  await git(fixture.execution, "commit", "-m", "second verified increment");
  const firstWriter = await advanceOriginFromAnotherWriter(fixture.origin);
  const checkoutBefore = await captureCheckout(fixture.integration);
  let retained;
  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
    validate: async () => ({ ok: true }),
    beforePush: (comparison) => {
      retained = comparison;
    },
  });
  assert.equal(delivered.observation.state, "attached");
  const accepted = delivered.receipt.sha;
  assert.equal(retained.candidate, accepted);
  assert.equal(retained.suffixBase, firstWriter);
  assert.equal(delivered.suffixBase, retained.suffixBase);
  assert.notEqual(
    await revParse(fixture.execution, `${accepted}^`),
    retained.suffixBase,
  );
  const laterWriter = await advanceOriginFromAnotherWriter(fixture.origin, {
    file: "later-writer.txt",
    message: "later writer's increment",
  });
  const coverageBefore = readRevisionCoverage(delivered.observation.directory);
  const watchesBefore = watchCount(fixture.storage);
  const pushesBefore = await messageCount(
    fixture.origin,
    trunkTarget,
    "verified increment",
  );

  // Simulate a lost delivery response: use only the pair retained before push.
  const resumed = await fixture.resumeManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    candidateSha: retained.candidate,
    suffixBase: retained.suffixBase,
    targetRef: trunkTarget,
    repo,
    publishedRevisions: [],
    defaultCheckout: fixture.integration,
  });

  assert.equal(resumed.ok, true);
  assert.equal(resumed.publication, "accepted");
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.receipt.sha, accepted);
  assert.equal(resumed.suffixBase, retained.suffixBase);
  assert.deepEqual(
    (
      await git(
        fixture.execution,
        "diff",
        "--name-only",
        resumed.suffixBase,
        resumed.receipt.sha,
      )
    ).stdout
      .trim()
      .split("\n"),
    ["increment.txt", "second-increment.txt"],
  );
  assert.equal(resumed.observation.state, "recovered");
  assert.equal(resumed.observation.directory, delivered.observation.directory);
  assert.equal(
    await messageCount(fixture.origin, trunkTarget, "verified increment"),
    pushesBefore,
  );
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), laterWriter);
  assert.equal(watchCount(fixture.storage), watchesBefore);
  assert.deepEqual(
    readRevisionCoverage(resumed.observation.directory),
    coverageBefore,
  );
  assert.equal(
    readRevisionCoverage(resumed.observation.directory).some(
      (entry) => entry.sha === accepted.toLowerCase(),
    ),
    true,
  );
  assertCheckoutUnchanged(
    checkoutBefore,
    await captureCheckout(fixture.integration),
  );
});

test("missing observation attachment recovers its coordinator's live observer without another push", async (t) => {
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
  assert.equal(Object.hasOwn(resumed, "suffixBase"), false);
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

test("the installed resume CLI accepts the retained comparison and its named remote", async (t) => {
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
  await git(fixture.execution, "remote", "rename", "origin", "landing-origin");
  const { stdout } = await exec(
    process.execPath,
    [
      join(fixture.skill, "scripts/execution-increment-resume.mjs"),
      "resume",
      "--remote",
      "landing-origin",
      "--workspace",
      fixture.execution,
      "--candidate-sha",
      delivered.receipt.sha,
      "--suffix-base",
      delivered.suffixBase,
      "--target-ref",
      trunkTarget,
      "--repo",
      repo,
      "--host",
      "cursor",
    ],
    { cwd: fixture.execution, env: fixture.env },
  );
  const resumed = JSON.parse(stdout.trim());
  fixture.stopAtTeardown(resumed.observation?.directory);
  assert.equal(resumed.ok, true);
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.suffixBase, delivered.suffixBase);
  assert.deepEqual(resumed.receipt, delivered.receipt);
  assert.deepEqual(
    (
      await git(
        fixture.execution,
        "diff",
        "--name-only",
        resumed.suffixBase,
        resumed.receipt.sha,
      )
    ).stdout
      .trim()
      .split("\n"),
    ["increment.txt"],
  );
});
