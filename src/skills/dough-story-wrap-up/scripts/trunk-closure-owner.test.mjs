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
import {
  acceptedIncrement,
  coverage,
  hosts,
  revisions,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { completeThroughCli } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { git } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import { lsRemoteSha } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  assertObserverEnded,
  closureBesideSibling,
} from "./trunk-closure-owner-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";

// The before-cleanup commit accepted through the publisher's own `deliver`.
async function deliverBeforeCleanup(journey) {
  const { delivered } = await journey.deliver(journey.fixture.trunkSha);
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.directory, journey.publisher);
  return delivered.receipt.sha;
}

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
    assert.equal(result.completion.requestedSha, final);
    assert.equal(result.completion.verdict, "success");
    assert.equal(result.completion.shutdown.status, "confirmed");
    assertObserverEnded(publisher);
    assert.equal(result.cleanup.worktree, "removed");
    assert.equal(existsSync(fixture.execution), false);
    journey.assertSiblingUntouched();
  });

  test(`a ${host} finish registers a final closure the target already holds once on its own observer without pushing, and a rerun from the management context after retirement reuses that ended observer`, async (t) => {
    const journey = await closureBesideSibling(t, host);
    const { fixture, publisher } = journey;
    const beforeCleanup = await deliverBeforeCleanup(journey);
    await commitFinalClosure(fixture);
    // The interrupted `finish` pushed the final closure and registered nothing.
    const final = await acceptedIncrement(fixture);
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
    assert.deepEqual(result.observation, {
      state: "recovered",
      directory: publisher,
      reused: true,
    });
    assert.deepEqual(coverage(publisher), revisions(beforeCleanup, final));
    assert.equal(result.completion.requestedSha, final);
    assert.equal(result.completion.verdict, "success");
    assert.equal(result.completion.shutdown.status, "confirmed");
    assertObserverEnded(publisher);
    assert.equal(result.repository, repository);
    assert.equal(result.cleanup.worktree, "removed");
    assert.equal(existsSync(fixture.execution), false);
    journey.assertSiblingUntouched();

    // The rerun names its owner explicitly where the ambient identity is the
    // sibling's; the owner is computed without the retired worktree.
    const field = host === "cursor" ? "conversation_id" : "session_id";
    const again = await journey.finish(
      {
        beforeCleanup,
        final,
        checkout: fixture.integration,
        extra: [
          ...["--created-for-work", "--repository", repository],
          ...["--session-json", JSON.stringify({ [field]: journey.owner })],
        ],
      },
      "sibling-coordinator",
    );

    assert.equal(again.code, 0, again.stderr);
    assert.equal(again.result.pushCount, 0);
    assert.equal(again.result.observation.directory, publisher);
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

test("a rerun after completion and worktree removal settles only for the owner: without its identity or as another coordinator the accepted closure is reported unobserved and the branch stays", async (t) => {
  const journey = await closureBesideSibling(t, "claude");
  const { fixture, publisher } = journey;
  const beforeCleanup = await deliverBeforeCleanup(journey);
  const final = await commitFinalClosure(fixture);
  const { delivered } = await journey.deliver(beforeCleanup);
  assert.equal(delivered.receipt.sha, final);
  releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });
  // The completion the interrupted `finish` ran.
  const first = await completeThroughCli(fixture, publisher, final);
  assert.equal(first.shutdown.status, "confirmed");
  const repository = join(fixture.integration, ".git");
  await git(fixture.integration, "worktree", "remove", fixture.execution);
  const pushes = await journey.pushes();
  const rerun = (coordinator) =>
    journey.finish(
      {
        beforeCleanup,
        final,
        checkout: fixture.integration,
        extra: ["--created-for-work", "--repository", repository],
      },
      coordinator,
    );

  for (const [coordinator, ownership, reason] of [
    // No ambient identity at all, then one that owns no observer.
    [null, "unidentified", /CLAUDE_CODE_SESSION_ID is unset.*run finish/],
    ["third-coordinator", "missing", /holds no observer.*--session-json/],
  ]) {
    const { result, code } = await rerun(coordinator);
    assert.equal(code, 1);
    assert.equal(result.step, "observation");
    assert.equal(result.publication, "accepted");
    assert.equal(result.acceptedSha, final);
    assert.equal(result.observation.state, "unobserved");
    assert.equal(result.observation.ownership, ownership);
    assert.match(result.observation.reason, reason);
    assert.equal(result.completion, null);
    assert.equal(result.cleanup, "not-performed");
    assert.equal(await branchSha(fixture), final);
  }

  const { result, code, stderr } = await rerun(journey.owner);
  assert.equal(code, 0, stderr);
  assert.equal(result.observation.directory, publisher);
  assert.equal(result.completion.shutdown.status, "confirmed");
  assert.deepEqual(
    [result.cleanup.worktree, result.cleanup.branch],
    ["already-absent", "removed"],
  );
  assert.equal(pushes(), 0);
  journey.assertSiblingUntouched();
});
