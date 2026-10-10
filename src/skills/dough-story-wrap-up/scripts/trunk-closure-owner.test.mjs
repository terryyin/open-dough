// Trunk Mode closure keeps its observer owner beside a sibling coordinator's
// live observer of the same repository and target: the installed `deliver`
// and `finish`, the installed host hook's own claims, real workers, a bare
// remote, and a controlled CI provider. Observers, claims, and revisions the
// remote already accepted are starting conditions only; every registration,
// completion, and retirement below is a product outcome.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { recordedVerdict } from "../../dough-execute-plan/scripts/ci-mailbox-await.mjs";
import { readRevisionCoverage } from "../../dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
import {
  coverage,
  hosts,
  revisions,
  startReceipt,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { completeThroughCli } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { lsRemoteSha } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  armingCheckouts,
  assertCompletedAndStopped,
  assertObserverEnded,
  closureBesideSibling,
  deliverBeforeCleanup,
  pushFinalClosure,
} from "./trunk-closure-owner-test-fixtures.mjs";
import {
  commitFinalClosure,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";

// Where each host's rerun journey arms its publisher's observer. The arming
// checkout reaches an observer's owner and access only through the identity
// the repository's worktrees share, which no host changes, so one host arms
// from the default checkout. Each host names its coordinator by its own
// session field from its execution worktree.
const rerunArming = { claude: ["publisher", "sibling"], cursor: ["publisher"] };

for (const host of Object.keys(hosts)) {
  test(`a ${host} coordinator's finish publishes its final closure once, registers and completes it on its own observer, and retires while the sibling's observer stays live`, async (t) => {
    const journey = await closureBesideSibling(t, host);
    const { fixture, publisher } = journey;
    const beforeCleanup = await deliverBeforeCleanup(journey);
    const final = await commitFinalClosure(fixture);
    releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });
    const pushes = await journey.pushes();

    const { result, code, stderr } = await journey.finish({
      beforeCleanup,
      final,
      extra: ["--created-for-work"],
    });

    assert.equal(code, 0, stderr);
    assert.equal(pushes(), 1);
    assert.equal(result.acceptedSha, final);
    assert.equal(await lsRemoteSha(fixture.origin, main), final);
    assert.equal(result.observation.state, "reused");
    assert.equal(result.observation.directory, publisher);
    assert.deepEqual(coverage(publisher), revisions(beforeCleanup, final));
    assertCompletedAndStopped(result, publisher, final);
    assert.equal(result.cleanup.worktree, "removed");
    assert.equal(existsSync(fixture.execution), false);
    journey.assertSiblingUntouched();
  });

  for (const armedFrom of rerunArming[host]) {
    test(`a ${host} finish registers a final closure the target already holds once without pushing on its own observer armed from ${armingCheckouts[armedFrom]}, and a rerun from the management context after retirement reuses that ended observer for its owner only`, async (t) => {
      const journey = await closureBesideSibling(t, host, armedFrom);
      const { fixture, publisher } = journey;
      const beforeCleanup = await deliverBeforeCleanup(journey);
      const final = await pushFinalClosure(fixture);
      releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });
      const pushes = await journey.pushes();
      const repository = join(fixture.integration, ".git");

      const { result, code, stderr } = await journey.finish({
        beforeCleanup,
        final,
        extra: ["--created-for-work"],
      });

      assert.equal(code, 0, stderr);
      assert.equal(result.pushCount, 0);
      const { notifies, ...observation } = result.observation;
      assert.deepEqual(observation, {
        state: "recovered",
        directory: publisher,
        reused: true,
      });
      assert.match(
        notifies,
        new RegExp(`${journey.owner}, named by ${hosts[host].variable}`),
      );
      assert.deepEqual(coverage(publisher), revisions(beforeCleanup, final));
      assertCompletedAndStopped(result, publisher, final);
      assert.equal(result.repository, repository);
      assert.equal(result.cleanup.worktree, "removed");
      assert.equal(existsSync(fixture.execution), false);
      journey.assertSiblingUntouched();

      // The rerun names its owner explicitly where the ambient identity is the
      // sibling's; the owner is computed without the retired worktree.
      const rerun = (session) =>
        journey.rerunFromManagement({ beforeCleanup, final }, session);

      const stranger = await rerun("third-coordinator");
      assert.equal(stranger.code, 1);
      assert.equal(stranger.result.step, "observation");
      assert.equal(stranger.result.observation.ownership, "missing");
      assert.equal(stranger.result.completion, null);

      const again = await rerun(journey.owner);

      assert.equal(again.code, 0, again.stderr);
      assert.equal(again.result.pushCount, 0);
      assert.equal(again.result.observation.directory, publisher);
      assert.match(
        again.result.observation.notifies,
        new RegExp(`${journey.owner}, named by --session-json`),
      );
      assert.equal(again.result.completion.verdict, "success");
      assert.equal(again.result.completion.shutdown.status, "confirmed");
      assert.deepEqual(
        [again.result.cleanup.worktree, again.result.cleanup.branch],
        ["already-absent", "already-absent"],
      );
      assert.deepEqual(coverage(publisher), revisions(beforeCleanup, final));
      assert.equal(pushes(), 0);
      assert.equal(await lsRemoteSha(fixture.origin, main), final);
      journey.assertSiblingUntouched();
    });
  }
}

// How the owner's observer that registered the final closure ended: after it
// completed the closure CI passed, or stopped before CI released it. Each
// returns the verdict its record then holds.
const endedRecords = {
  "a recorded success": async ({ fixture, publisher }, release, final) => {
    release();
    const receipt = await completeThroughCli(fixture, publisher, final);
    assert.equal(receipt.shutdown.status, "confirmed");
    return "success";
  },
  "only a cancelled attempt": async ({ fixture, publisher }, release) => {
    await fixture.stopObserver(publisher);
    release();
    return undefined;
  },
};

for (const [record, end] of Object.entries(endedRecords)) {
  test(`finish registers, completes, and stops its coordinator's live observer that never registered the final closure before retiring, beside its ended observer that registered it with ${record}`, async (t) => {
    const journey = await closureBesideSibling(t, "claude");
    const { fixture, publisher } = journey;
    const beforeCleanup = await deliverBeforeCleanup(journey);
    const final = await commitFinalClosure(fixture);
    const { delivered } = await journey.deliver(beforeCleanup);
    assert.equal(delivered.receipt.sha, final);
    assert.equal(delivered.observation.directory, publisher);
    const verdict = await end(
      journey,
      () =>
        releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" }),
      final,
    );
    assertObserverEnded(publisher);
    assert.equal(recordedVerdict(publisher, final), verdict);
    const endedRecord = readRevisionCoverage(publisher);
    // Armed from the default checkout, the owner's second observer stays
    // reachable once the execution worktree is retired.
    const live = await journey.startObserver("sibling");
    assert.match(
      await journey.hook("sibling", journey.owner, startReceipt(live)),
      /CI observer attached to this coordinator/,
    );
    const pushes = await journey.pushes();

    const { result, code, stderr } = await journey.finish({
      beforeCleanup,
      final,
      extra: ["--created-for-work"],
    });

    assert.equal(code, 0, stderr);
    assert.equal(pushes(), 0);
    assert.equal(result.observation.state, "recovered");
    assert.equal(result.observation.directory, live);
    assert.deepEqual(coverage(live), revisions(final));
    assertCompletedAndStopped(result, live, final);
    assert.equal(result.cleanup.worktree, "removed");
    assert.equal(existsSync(fixture.execution), false);
    assert.deepEqual(readRevisionCoverage(publisher), endedRecord);
    journey.assertSiblingUntouched(3);
  });
}
