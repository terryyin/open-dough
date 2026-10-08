// Planning observation, not a product regression test: two real observers,
// distinct host owners, installed managed delivery, and a disposable remote.
// It prints current behavior and tears down every fixture-owned worker.
import { join } from "node:path";
import {
  createManagedFixture,
  installManagedDelivery,
  waitForFailureEvent,
} from "../../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import { deliverThroughCli } from "../../../src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  bindHostObserver,
  deliverHostBoundary,
} from "../../../src/skills/dough-execute-plan/scripts/ci-host-bridge.mjs";
import {
  completeRevision,
  readDeliveryProgress,
  readRevisionCoverage,
} from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox.mjs";
import { isLiveMatchingMailbox } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-match.mjs";
import { awaitWorkerState } from "../../../src/skills/dough-execute-plan/scripts/watch-ci-test-fixtures.mjs";
import { lsRemoteSha } from "../../../src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs";

const fixture = await createManagedFixture();
try {
  const siblingRuntime = await installManagedDelivery(
    fixture.teardown,
    fixture.fixture,
    fixture.integration,
  );
  const request = {
    mode: "execution",
    repo: "owner/project",
    branch: "main",
    maxDurationMs: 60000,
  };
  const options = (root) => ({
    root,
    storage: fixture.storage,
    env: fixture.env,
  });
  const directories = [
    await fixture.startExecutionMailbox(request, options(fixture.execution)),
    await siblingRuntime.startExecutionMailbox(
      request,
      options(fixture.integration),
    ),
  ].sort();
  const [sibling, publisher] = directories;
  for (const directory of directories) {
    await awaitWorkerState(
      directory,
      () =>
        isLiveMatchingMailbox(directory, {
          ...request,
          ...options(fixture.execution),
        }),
      "observer is live",
    );
  }
  const publisherSession = { session_id: "publisher-coordinator" };
  const siblingSession = { session_id: "sibling-coordinator" };
  const bridge = (directory, session, workspace, skill) =>
    bindHostObserver({
      host: "claude",
      session,
      receipt: `CI_OBSERVER ${JSON.stringify({ directory })}\n`,
      workspace,
      hookPath: join(skill, "scripts/ci-host-hook.mjs"),
      env: fixture.env,
    });
  const bound = [
    await bridge(publisher, publisherSession, fixture.execution, fixture.skill),
    await bridge(sibling, siblingSession, fixture.integration, siblingRuntime.skill),
  ];
  if (!bound.every((result) => result.attached)) {
    throw new Error("Both starting owner bindings must attach");
  }
  const { delivered, code } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    host: "claude",
    env: { ...fixture.env, CLAUDE_CODE_SESSION_ID: publisherSession.session_id },
  });
  if (code || !delivered?.ok) throw new Error(JSON.stringify(delivered));
  const sha = delivered.receipt.sha;
  fixture.releaseFailure(sha);
  await waitForFailureEvent(delivered.observation.directory);
  const boundary = (session, workspace, skill) =>
    deliverHostBoundary({
      host: "claude",
      session,
      workspace,
      hookPath: join(skill, "scripts/ci-host-hook.mjs"),
      env: fixture.env,
    });
  const siblingBefore = readDeliveryProgress(sibling).deliveredThrough;
  const publisherOutput = await boundary(
    publisherSession,
    fixture.execution,
    fixture.skill,
  );
  const siblingAfterPublisher = readDeliveryProgress(sibling).deliveredThrough;
  const siblingOutput = await boundary(
    siblingSession,
    fixture.integration,
    siblingRuntime.skill,
  );
  const completion = await completeRevision(publisher, sha, {
    deadlineMs: 250,
    root: fixture.execution,
    storage: fixture.storage,
  });
  console.log(JSON.stringify({
    node: process.version,
    bothOwnersBound: true,
    publisherSortsAfterSibling: publisher > sibling,
    publication: delivered.publication,
    remoteAcceptedShaMatches:
      await lsRemoteSha(fixture.origin, "refs/heads/main") === sha,
    selectedSibling: delivered.observation.directory === sibling,
    publisherCoverage: readRevisionCoverage(publisher).map((entry) => entry.sha),
    siblingCoverageContainsAcceptedSha: readRevisionCoverage(sibling).some(
      (entry) => entry.sha === sha.toLowerCase(),
    ),
    publisherReceivedFailure: /CI_FAILURE/.test(JSON.stringify(publisherOutput)),
    siblingReceivedFailure: /CI_FAILURE/.test(JSON.stringify(siblingOutput)),
    publisherLeftSiblingAcknowledgmentUnchanged: siblingBefore === siblingAfterPublisher,
    publisherCompletion: {
      unresolvedReason: completion.unresolvedReason,
      shutdown: completion.shutdown.status,
    },
  }, null, 2));
} finally {
  await fixture.cleanup();
}
