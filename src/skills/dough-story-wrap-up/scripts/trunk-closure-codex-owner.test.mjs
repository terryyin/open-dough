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
  armingCheckouts,
  assertObserverEnded,
  assertUnresolvedCoverage,
  siblingWitness,
} from "./trunk-closure-owner-test-fixtures.mjs";
import {
  commitFinalClosure,
  finishThroughCli,
  installClosureSkills,
  installInIntegration,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";

// A publishing coordinator's stream beside a sibling coordinator's, armed
// from the default checkout's own install. The publisher's is armed from
// `armedFrom`: its own execution worktree, or the sibling's default checkout.
async function closureBesideSiblingStream(t, armedFrom = "publisher") {
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
  const publisher = await armStream(fixture, {
    coordinator: "publisher",
    skill: armedFrom === "sibling" ? elsewhere.skill : fixture.skill,
  });
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

for (const [armedFrom, where] of Object.entries(armingCheckouts)) {
  test(`a Codex coordinator's finish publishes its final closure once, completes it on the stream it retained from ${where}, retires, and a rerun from the management context reuses that ended stream for its coordinator only`, async (t) => {
    const journey = await closureBesideSiblingStream(t, armedFrom);
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

    const rerun = (retainedOwner) =>
      journey.finish(
        {
          beforeCleanup,
          final,
          checkout: fixture.integration,
          extra: ["--repository", repository],
        },
        retainedOwner,
      );

    const stranger = await rerun(retained("another", publisher.directory));
    assert.equal(stranger.code, 1);
    assert.equal(stranger.result.step, "observation");
    assert.equal(stranger.result.observation.ownership, "foreign");
    assert.equal(stranger.result.completion, null);

    const again = await rerun(owner);

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
}

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
    const unowned = await journey.finish({ beforeCleanup, final }, owner);
    const { observation } = unowned.result;
    await assertUnresolvedCoverage(fixture, unowned, {
      final,
      ownership,
      reason,
    });
    assert.equal(observation.directory, undefined);
    assert.match(observation.reason, /the next finish registers on it/);
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

test("a Codex finish whose retained stream registered the final closure and ended with no CI verdict for it reports that stream ended and keeps the worktree and branch", async (t) => {
  const journey = await closureBesideSiblingStream(t);
  const { fixture, publisher } = journey;
  const owner = retained(publisher.coordinator, publisher.directory);
  const beforeCleanup = await acceptedIncrement(fixture);
  const final = await commitFinalClosure(fixture);
  const { delivered } = await deliverThroughCli(fixture, {
    host: "codex",
    base: beforeCleanup,
    extra: owner,
  });
  assert.equal(delivered.receipt.sha, final);
  assert.equal(delivered.observation.directory, publisher.directory);
  // Stopped before CI released a verdict for the final closure.
  await fixture.stopObserver(publisher.directory);
  assert.deepEqual(coverage(publisher.directory), [final]);

  const ended = await journey.finish({ beforeCleanup, final }, owner);

  await assertUnresolvedCoverage(fixture, ended, {
    final,
    ownership: "ended",
    reason: new RegExp(
      `stream at ${publisher.directory} ended \\(stopped\\), not this coordinator's live stream of owner/project main.*arm \`ci-mailbox\\.mjs stream.*the next finish registers on it`,
    ),
  });
  assert.equal(ended.result.observation.directory, publisher.directory);
  journey.assertSiblingUntouched();
});
