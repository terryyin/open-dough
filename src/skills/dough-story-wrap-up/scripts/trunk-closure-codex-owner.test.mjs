// Trunk Mode closure on Codex settles only on the yielded stream its
// coordinator armed and retained: the installed `stream`, `deliver`, and
// `finish`, real workers, a bare remote, and a controlled CI provider, beside
// a sibling coordinator's live stream of the same target armed from the
// default checkout. Streams and revisions the remote already accepted are
// starting conditions only; every registration, completion, and retirement
// below is a product outcome.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { deliverThroughCli } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  armStream,
  retained,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-codex-test-fixtures.mjs";
import {
  acceptedIncrement,
  countPushes,
  coverage,
  revisions,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import {
  createManagedFixture,
  installManagedDelivery,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-test-fixtures.mjs";
import { lsRemoteSha } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  assertObserverEnded,
  siblingWitness,
} from "./trunk-closure-owner-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  finishThroughCli,
  installClosureSkills,
  installInIntegration,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";

// A publishing coordinator's stream armed in its execution worktree beside a
// sibling coordinator's, armed from the default checkout's own install.
async function closureBesideSiblingStream(t) {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  await installClosureSkills(fixture, ".agents");
  const elsewhere = await installManagedDelivery(
    fixture.teardown,
    fixture.fixture,
    fixture.integration,
  );
  installInIntegration(fixture, ".agents");
  const sibling = await armStream(fixture, {
    coordinator: "sibling",
    skill: elsewhere.skill,
  });
  const publisher = await armStream(fixture, { coordinator: "publisher" });
  return {
    fixture,
    publisher,
    sibling,
    // The installed `finish` with the inputs its caller retained.
    finish: (options, owner = []) =>
      finishThroughCli(fixture, {
        host: "codex",
        platform: ".agents",
        ...options,
        extra: ["--created-for-work", ...(options.extra ?? []), ...owner],
      }),
    assertSiblingUntouched: siblingWitness(fixture, sibling.directory),
  };
}

test("a Codex coordinator's finish publishes its final closure once, completes it on the stream it retained, retires, and a rerun from the management context reuses that ended stream", async (t) => {
  const journey = await closureBesideSiblingStream(t);
  const { fixture, publisher } = journey;
  const owner = retained(publisher.coordinator, publisher.directory);
  const { delivered } = await deliverThroughCli(fixture, {
    host: "codex",
    base: fixture.trunkSha,
    extra: owner,
  });
  assert.equal(delivered.observation.directory, publisher.directory);
  const beforeCleanup = delivered.receipt.sha;
  const final = await commitFinalClosure(fixture);
  releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });
  const pushes = await countPushes(fixture);
  const repository = join(fixture.integration, ".git");

  const { result, code, stderr } = await journey.finish(
    { beforeCleanup, final },
    owner,
  );

  assert.equal(code, 0, stderr);
  assert.equal(pushes(), 1);
  assert.equal(result.acceptedSha, final);
  assert.equal(result.observation.state, "reused", result.observation.reason);
  assert.equal(result.observation.directory, publisher.directory);
  assert.deepEqual(
    coverage(publisher.directory),
    revisions(beforeCleanup, final),
  );
  assert.equal(result.completion.requestedSha, final);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.shutdown.status, "confirmed");
  assertObserverEnded(publisher.directory);
  assert.equal(result.cleanup.worktree, "removed");
  assert.equal(existsSync(fixture.execution), false);
  journey.assertSiblingUntouched();

  const again = await journey.finish(
    {
      beforeCleanup,
      final,
      checkout: fixture.integration,
      extra: ["--repository", repository],
    },
    owner,
  );

  assert.equal(again.code, 0, again.stderr);
  assert.equal(again.result.pushCount, 0);
  assert.equal(again.result.observation.directory, publisher.directory);
  assert.equal(again.result.completion.shutdown.status, "confirmed");
  assert.deepEqual(
    [again.result.cleanup.worktree, again.result.cleanup.branch],
    ["already-absent", "already-absent"],
  );
  assert.equal(pushes(), 1);
  journey.assertSiblingUntouched();
});

test("a Codex finish without its retained stream, or naming a sibling's, reports the accepted closure unobserved and keeps the worktree; its own retained stream then registers it once without pushing", async (t) => {
  const journey = await closureBesideSiblingStream(t);
  const { fixture, publisher, sibling } = journey;
  const beforeCleanup = await acceptedIncrement(fixture);
  await commitFinalClosure(fixture);
  // The interrupted `finish` pushed the final closure and registered nothing.
  const final = await acceptedIncrement(fixture);
  releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });
  const pushes = await countPushes(fixture);

  for (const [owner, ownership, reason] of [
    [[], "unidentified", /Codex closure registers only.*--coordinator and/],
    [
      retained(publisher.coordinator, sibling.directory),
      "foreign",
      /belongs to another coordinator/,
    ],
    [retained("another", publisher.directory), "foreign", /another coordina/],
  ]) {
    const { result, code } = await journey.finish(
      { beforeCleanup, final },
      owner,
    );
    assert.equal(code, 1);
    assert.equal(result.step, "observation");
    assert.equal(result.publication, "accepted");
    assert.equal(result.acceptedSha, final);
    assert.equal(result.observation.state, "unobserved");
    assert.equal(result.observation.ownership, ownership);
    assert.equal(result.observation.directory, undefined);
    assert.match(result.observation.reason, reason);
    assert.match(result.observation.reason, /the next finish registers on it/);
    assert.equal(result.completion, null);
    assert.equal(existsSync(fixture.execution), true);
    assert.equal(await branchSha(fixture), final);
    assert.deepEqual(coverage(publisher.directory), []);
    journey.assertSiblingUntouched();
  }

  const { result, code, stderr } = await journey.finish(
    { beforeCleanup, final },
    retained(publisher.coordinator, publisher.directory),
  );

  assert.equal(code, 0, stderr);
  assert.equal(result.pushCount, 0);
  assert.equal(pushes(), 0);
  assert.equal(result.observation.state, "recovered");
  assert.equal(result.observation.directory, publisher.directory);
  assert.deepEqual(coverage(publisher.directory), revisions(final));
  assert.equal(result.completion.requestedSha, final);
  assert.equal(result.completion.verdict, "success");
  assert.equal(result.completion.shutdown.status, "confirmed");
  assertObserverEnded(publisher.directory);
  assert.equal(result.cleanup.worktree, "removed");
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
  journey.assertSiblingUntouched();
});
