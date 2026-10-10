// Shared starting condition for closure-ownership proofs: the closure
// fixture's execution worktree beside a sibling coordinator's live observer
// of the same repository and target, started from the default checkout and
// claimed through the installed host hook. The publishing coordinator's
// observer is claimed the same way, from its execution worktree or from the
// default checkout. A project below its Git toplevel is the other starting
// condition. Tests run the installed `deliver` and `finish` as each
// coordinator's host does and own every assertion on what those commands
// registered, completed, and retired; the journey steps and the completion
// witness several suites repeat are named here.
import assert from "node:assert/strict";
import { appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  readDeliveryProgress,
  readWorkerIdentity,
} from "../../dough-execute-plan/scripts/ci-mailbox.mjs";
import { isLiveMatchingMailbox } from "../../dough-execute-plan/scripts/ci-mailbox-match.mjs";
import { checkMailboxWorkerLiveness } from "../../dough-execute-plan/scripts/ci-mailbox-worker-process.mjs";
import {
  acceptedIncrement,
  countPushes,
  coverage,
  hosts,
  siblingCheckouts,
  startReceipt,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { fixtureTeardown } from "../../dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import {
  git,
  installManagedDelivery,
  watchCount,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  createCleanTrunkFixture,
  lsRemoteSha,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  finishThroughCli,
  installClosureSkills,
  installInIntegration,
} from "./trunk-closure-test-fixtures.mjs";

const publisherCoordinator = "publisher-coordinator";
const attached = /CI observer attached to this coordinator/;

// Where a publishing coordinator armed its observer, by the fixture checkout
// that armed it.
export const armingCheckouts = {
  publisher: "its execution worktree",
  sibling: "the default checkout",
};

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
// publisher's from `armedFrom`, its own execution worktree or the sibling's
// default checkout, and the sibling's from the default checkout, where
// closure is installed too for a rerun after retirement.
export async function closureBesideSibling(t, host, armedFrom = "publisher") {
  const checkouts = await siblingCheckouts(t, host);
  const { fixture, startObserver, hook, env } = checkouts;
  const { platform } = hosts[host];
  const sessionField = host === "cursor" ? "conversation_id" : "session_id";
  const repository = join(fixture.integration, ".git");
  await installClosureSkills(fixture, platform);
  installInIntegration(fixture, platform);
  const publisher = await startObserver(armedFrom);
  const sibling = await startObserver("sibling");
  assert.match(
    await hook(armedFrom, publisherCoordinator, startReceipt(publisher)),
    attached,
  );
  assert.match(
    await hook("sibling", "sibling-coordinator", startReceipt(sibling)),
    attached,
  );
  // The installed `finish` of `closure` rerun from the management context
  // once the execution worktree is retired, as `coordinator`'s host runs it.
  const rerun = (closure, coordinator, extra = []) =>
    finishThroughCli(fixture, {
      host,
      platform,
      env: env(coordinator),
      checkout: fixture.integration,
      ...closure,
      extra: ["--created-for-work", "--repository", repository, ...extra],
    });
  return {
    fixture,
    hook,
    startObserver,
    owner: publisherCoordinator,
    publisher,
    sibling,
    // Counts the pushes the bare remote receives from now on.
    pushes: () => countPushes(fixture),
    deliver: (base, extra = [], coordinator = publisherCoordinator) =>
      checkouts.deliver(base, coordinator, extra),
    // The installed `finish` as `coordinator`'s host runs it.
    finish: (options, coordinator = publisherCoordinator) =>
      finishThroughCli(fixture, {
        host,
        platform,
        env: env(coordinator),
        ...options,
      }),
    // That rerun with no `--session-json`: its owner is `coordinator`'s
    // ambient session, or none when `coordinator` is null.
    ambientRerunFromManagement: (closure, coordinator = publisherCoordinator) =>
      rerun(closure, coordinator),
    // That rerun naming `session` as its owner where the ambient identity is
    // the sibling's.
    rerunFromManagement: (closure, session) =>
      rerun(closure, "sibling-coordinator", [
        "--session-json",
        JSON.stringify({ [sessionField]: session }),
      ]),
    assertSiblingUntouched: siblingWitness(fixture, sibling),
  };
}

// The before-cleanup commit accepted through the publisher's own `deliver`.
export async function deliverBeforeCleanup(journey) {
  const { delivered } = await journey.deliver(journey.fixture.trunkSha);
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.directory, journey.publisher);
  return delivered.receipt.sha;
}

// The final closure an interrupted `finish` pushed and registered nowhere.
export async function pushFinalClosure(fixture) {
  await commitFinalClosure(fixture);
  return acceptedIncrement(fixture);
}

// `finish` completed `final` as passed on `observer` and stopped it.
export function assertCompletedAndStopped(result, observer, final) {
  assert.equal(result.completion.requestedSha, final);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.shutdown.status, "confirmed");
  assertObserverEnded(observer);
}

// The accepted final closure stands unobserved with everything preserved.
export async function assertUnresolvedCoverage(
  fixture,
  { result, code },
  { final, ownership, reason },
) {
  assert.equal(code, 1);
  assert.equal(result.ok, false);
  assert.equal(result.step, "observation");
  assert.equal(result.publication, "accepted");
  assert.equal(result.acceptedSha, final);
  assert.equal(await lsRemoteSha(fixture.origin, "refs/heads/main"), final);
  assert.equal(result.observation.state, "unobserved");
  assert.equal(result.observation.pendingCi, "unobserved");
  assert.equal(result.observation.ownership, ownership);
  assert.match(result.observation.reason, reason);
  assert.equal(result.completion, null);
  assert.equal(result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), final);
}

// A Claude Code project in a directory below its execution worktree's Git
// toplevel, with managed delivery and closure installed in that project.
// `finish` runs the installed command there for `coordinator`.
export async function closureBelowToplevel(t, coordinator = "below-toplevel") {
  const base = await createCleanTrunkFixture();
  const teardown = fixtureTeardown(base.fixture);
  t.after(teardown.cleanup);
  const project = join(base.execution, "proj");
  const installed = await installManagedDelivery(
    teardown,
    base.fixture,
    project,
    [".claude"],
  );
  await installClosureSkills({ execution: project }, ".claude");
  const common = (
    await git(
      base.execution,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    )
  ).stdout.trim();
  appendFileSync(join(common, "info/exclude"), "proj/\n");
  const fixture = { ...base, ...installed };
  const env = { ...installed.env, CLAUDE_CODE_SESSION_ID: coordinator };
  return {
    fixture,
    project,
    env,
    finish: (options) =>
      finishThroughCli(
        { ...fixture, execution: project },
        { env, checkout: project, ...options },
      ),
  };
}
