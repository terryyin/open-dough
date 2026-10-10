// Shared starting conditions for closure's observer-selection proofs: a
// coordinator's observers of one target as closure reads them, claimed
// through the installed hook with real workers, some ended after registering
// the final closure, and the records those wrote through the observer's own
// writer, `observeRevisionCoverage`.
import assert from "node:assert/strict";
import {
  observeRevisionCoverage,
  readRevisionCoverage,
  registerPushedRevision,
} from "../../dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
import { startReceipt } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { closureObservers, observerAccess } from "./trunk-closure-observer.mjs";

// `coordinator`'s observers of the shared target, as closure reads them.
export async function observersOf(fixture, coordinator = "coordinator") {
  return closureObservers({
    repo: "owner/project",
    branch: "main",
    host: "cursor",
    session: { conversation_id: coordinator },
    root: await observerAccess(fixture.execution),
    storage: fixture.storage,
  });
}

// A live observer started from the publisher's checkout that `coordinator`
// claimed through the installed hook.
export async function claimed(
  { startObserver, hook },
  coordinator = "coordinator",
) {
  const directory = await startObserver("publisher");
  assert.match(
    await hook("publisher", coordinator, startReceipt(directory)),
    /CI observer attached to this coordinator/,
  );
  return directory;
}

// `count` of the coordinator's observers that each registered `sha`, then
// ended.
export async function endedCovering(checkouts, sha, count) {
  const ended = [];
  while (ended.length < count) ended.push(await claimed(checkouts));
  for (const directory of ended) {
    registerPushedRevision(directory, sha);
    await checkouts.fixture.stopObserver(directory);
  }
  return ended;
}

// The ended observer at `directory` records the CI attempts `runs`, as its
// worker did on each poll while it ran. An attempt's `conclusion` gives the
// record's state: `success`, `failure`, or `cancelled` for `incomplete`.
export const attempt = (headSha, conclusion) => ({
  headSha,
  status: "completed",
  conclusion,
  databaseId: 1,
  attempt: 1,
});
export const observe = (directory, ...runs) =>
  observeRevisionCoverage(directory, runs, {
    repo: "owner/project",
    branch: "main",
  });
export const states = (directories, sha) =>
  directories.map((directory) => {
    const record = readRevisionCoverage(directory).find(
      (revision) => revision.sha === sha,
    );
    return record.basis?.state
      ? `${record.state}:${record.basis.state}`
      : record.state;
  });
