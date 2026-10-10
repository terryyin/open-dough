// Shared starting condition for closure-ownership proofs: the closure
// fixture's execution worktree beside a sibling coordinator's live observer
// of the same repository and target, started from the default checkout and
// claimed through the installed host hook. The publishing coordinator's
// observer is claimed the same way. Tests run the installed `deliver` and
// `finish` as each coordinator's host does and own every assertion on what
// those commands registered, completed, and retired.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  readDeliveryProgress,
  readWorkerIdentity,
} from "../../dough-execute-plan/scripts/ci-mailbox.mjs";
import { isLiveMatchingMailbox } from "../../dough-execute-plan/scripts/ci-mailbox-match.mjs";
import { checkMailboxWorkerLiveness } from "../../dough-execute-plan/scripts/ci-mailbox-worker-process.mjs";
import {
  countPushes,
  coverage,
  hosts,
  siblingCheckouts,
  startReceipt,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { watchCount } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  finishThroughCli,
  installClosureSkills,
  installInIntegration,
} from "./trunk-closure-test-fixtures.mjs";

const publisherCoordinator = "publisher-coordinator";
const attached = /CI observer attached to this coordinator/;

// What stays true of a sibling observer at `directory` of the fixture's
// target, whatever the publisher's closure did: it is live on the same
// worker, was told of no revision, was asked nothing, and delivered nothing
// more. It was started from the default checkout, which outlives the
// execution worktree. `observers` counts every observer the test started, so
// closure added none.
export function siblingWitness(fixture, directory) {
  const target = {
    repo: "owner/project",
    branch: "main",
    root: fixture.integration,
    storage: fixture.storage,
  };
  const worker = readWorkerIdentity(directory).pid;
  const progress = readDeliveryProgress(directory);
  return (observers = 2) => {
    assert.deepEqual(coverage(directory), []);
    assert.equal(isLiveMatchingMailbox(directory, target), true);
    assert.equal(readWorkerIdentity(directory).pid, worker);
    assert.equal(existsSync(join(directory, "stop")), false);
    assert.equal(existsSync(join(directory, "result.json")), false);
    assert.deepEqual(readDeliveryProgress(directory), progress);
    assert.equal(watchCount(fixture.storage), observers);
  };
}

// The observer at `directory` ended with its worker gone.
export function assertObserverEnded(directory) {
  assert.equal(existsSync(join(directory, "result.json")), true);
  assert.equal(
    checkMailboxWorkerLiveness(readWorkerIdentity(directory), directory),
    "dead",
  );
}

// Two `host` coordinators' claimed live observers of the shared target: the
// publisher's from its execution worktree, the sibling's from the default
// checkout, where closure is installed too for a rerun after retirement.
export async function closureBesideSibling(t, host) {
  const checkouts = await siblingCheckouts(t, host);
  const { fixture, startObserver, hook, env } = checkouts;
  const { platform } = hosts[host];
  await installClosureSkills(fixture, platform);
  installInIntegration(fixture, platform);
  const publisher = await startObserver("publisher");
  const sibling = await startObserver("sibling");
  assert.match(
    await hook("publisher", publisherCoordinator, startReceipt(publisher)),
    attached,
  );
  assert.match(
    await hook("sibling", "sibling-coordinator", startReceipt(sibling)),
    attached,
  );
  return {
    fixture,
    hook,
    startObserver,
    owner: publisherCoordinator,
    publisher,
    sibling,
    // Counts the pushes the bare remote receives from now on.
    pushes: () => countPushes(fixture),
    deliver: (base, extra = []) =>
      checkouts.deliver(base, publisherCoordinator, extra),
    // The installed `finish` as `coordinator`'s host runs it.
    finish: (options, coordinator = publisherCoordinator) =>
      finishThroughCli(fixture, {
        host,
        platform,
        env: env(coordinator),
        ...options,
      }),
    assertSiblingUntouched: siblingWitness(fixture, sibling),
  };
}
