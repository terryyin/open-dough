import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  createManagedFixture,
  git,
  waitForFailureEvent,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  installCustomReuseProvider,
  publishCustomTarget,
} from "./ci-reuse-custom-test-fixtures.mjs";
import { ignoreInstalledSkills } from "./ci-reuse-journey-test-fixtures.mjs";
import { waitTarget } from "./ci-reuse-trunk-test-fixtures.mjs";
import { completeThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { checkMailboxWorkerLiveness } from "./ci-mailbox-worker-process.mjs";
import { readWorkerIdentity } from "./ci-mailbox-store.mjs";
import { readRevisionCoverage } from "./ci-mailbox.mjs";
import { awaitWorkerState } from "./watch-ci-test-fixtures.mjs";

test("custom pending then failed fresh rerun replaces earlier green target A in actual completion evidence", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  await ignoreInstalledSkills(fixture);
  const provider = await installCustomReuseProvider(fixture);
  await provider.direct(fixture.candidateSha);
  const publication = await publishCustomTarget(fixture, "story");
  const green = await provider.target(publication.receipt.sha);
  await waitTarget(publication.directory, green);
  const release = join(fixture.fixture, "release-covered");
  const blocked = join(fixture.fixture, "blocked-covered.mjs");
  const command = provider.coveredCommand(publication.receipt.sha, true);
  writeFileSync(
    blocked,
    `
import { spawnSync } from 'node:child_process';
import { guardFixtureProcess, waitForFixtureRelease } from ${JSON.stringify(new URL("./ci-process-lifetime-test-fixtures.mjs", import.meta.url).href)};
guardFixtureProcess(${JSON.stringify(fixture.fixture)});
await waitForFixtureRelease(${JSON.stringify(release)});
const result = spawnSync(${JSON.stringify(command[0])}, ${JSON.stringify(command.slice(1))}, {stdio:'inherit'});
process.exit(result.status ?? 1);
`,
  );
  const failing = provider.target(publication.receipt.sha, {
    fresh: true,
    covered: [process.execPath, blocked],
    runId: green.attempt.runId,
    attemptId: "rerun:opaque/failed",
  });
  let failed;
  try {
    await awaitWorkerState(
      publication.directory,
      () =>
        readRevisionCoverage(publication.directory).some(
          (revision) =>
            revision.sha === publication.receipt.sha &&
            revision.state === "pending" &&
            revision.checkedBy.attemptId === "rerun:opaque/failed",
        ),
      "current pending rerun coverage replacing older success",
    );
  } finally {
    writeFileSync(release, "release\n");
    failed = await failing;
  }
  assert.equal(failed.decision.reuse, false);
  assert.equal(failed.attempt.outcome, "failure");
  assert.equal(provider.count(publication.receipt.sha), 2);
  assert.equal(provider.count(publication.receipt.sha, "target-only"), 2);
  await waitForFailureEvent(publication.directory);
  const completion = await completeThroughCli(
    fixture,
    publication.directory,
    publication.receipt.sha,
  );
  assert.equal(
    completion.verdict,
    "failure",
    JSON.stringify(completion.effectiveEvidence),
  );
  assert.deepEqual(completion.effectiveEvidence.revision.checkedBy, {
    runId: failed.attempt.runId,
    attemptId: failed.attempt.attemptId,
  });
  assert.equal(completion.shutdown.status, "retained");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(
    JSON.parse(readFileSync(new URL(green.attempt.url), "utf8")).target.outcome,
    "success",
    "historical evidence report remains inspectable after its replacement",
  );
  assert.equal(
    checkMailboxWorkerLiveness(
      readWorkerIdentity(publication.directory),
      publication.directory,
    ),
    "alive",
  );
  assert.equal(
    (await git(fixture.integration, "rev-parse", "exec/story")).stdout.trim(),
    publication.receipt.sha,
  );
});
