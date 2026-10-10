// Trunk Mode closure whose owner evidence is missing, another coordinator's,
// ended, or ambiguous keeps the accepted publication beside an unresolved
// coverage obligation and the workspace, through the installed `finish` with
// real workers and a bare remote. A sibling coordinator's live observer of
// the same target is never registered on, completed, or stopped for it.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import {
  acceptedIncrement,
  coverage,
  siblingCheckouts,
  startReceipt,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { lsRemoteSha } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { closureObservers, observerAccess } from "./trunk-closure-observer.mjs";
import { closureBesideSibling } from "./trunk-closure-owner-test-fixtures.mjs";
import {
  branchSha,
  commitFinalClosure,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

const main = "refs/heads/main";

// The accepted final closure stands unobserved with everything preserved.
async function assertUnresolvedCoverage(
  fixture,
  { result, code },
  { final, ownership, reason },
) {
  assert.equal(code, 1);
  assert.equal(result.ok, false);
  assert.equal(result.step, "observation");
  assert.equal(result.publication, "accepted");
  assert.equal(result.acceptedSha, final);
  assert.equal(await lsRemoteSha(fixture.origin, main), final);
  assert.equal(result.observation.state, "unobserved");
  assert.equal(result.observation.pendingCi, "unobserved");
  assert.equal(result.observation.ownership, ownership);
  assert.match(result.observation.reason, reason);
  assert.equal(result.completion, null);
  assert.equal(result.cleanup, "not-performed");
  assert.equal(existsSync(fixture.execution), true);
  assert.equal(await branchSha(fixture), final);
}

test("finish without the owner's identity, as another coordinator, or after the owner's observer ended reports the accepted closure unobserved, keeps the worktree, and leaves the live sibling alone; a replacing session that follows the gap completes on its own observer", async (t) => {
  const journey = await closureBesideSibling(t, "claude");
  const { fixture, publisher, sibling } = journey;
  const beforeCleanup = await acceptedIncrement(fixture);
  const final = await commitFinalClosure(fixture);
  const pushes = await journey.pushes();
  const finish = (coordinator) =>
    journey.finish(
      { beforeCleanup, final, extra: ["--created-for-work"] },
      coordinator,
    );

  // The unpublished final closure is published once; nothing observes it.
  const unidentified = await finish(null);
  await assertUnresolvedCoverage(fixture, unidentified, {
    final,
    ownership: "unidentified",
    reason: /CLAUDE_CODE_SESSION_ID is unset/,
  });
  assert.equal(pushes(), 1);

  const stranger = await finish("third-coordinator");
  await assertUnresolvedCoverage(fixture, stranger, {
    final,
    ownership: "missing",
    reason:
      /holds no observer of owner\/project main.*--session-json with its session_id, and the agent_id its observer was claimed with, if any.*replaced the coordinator.*receives none of its events.*ci-mailbox\.mjs stop <recorded directory>.*next `deliver` from the execution worktree establishes its own.*rerunning this finish/,
  });
  assert.doesNotMatch(stranger.result.observation.reason, /naming the session/);
  for (const directory of [publisher, sibling])
    assert.doesNotMatch(
      stranger.result.observation.reason,
      new RegExp(directory),
    );
  assert.deepEqual(coverage(publisher), []);
  assert.equal(existsSync(`${publisher}/result.json`), false);
  journey.assertSiblingUntouched();

  // The owner's observer ended before it was told of the final closure.
  await fixture.stopObserver(publisher);
  const ended = await finish();
  await assertUnresolvedCoverage(fixture, ended, {
    final,
    ownership: "ended",
    reason: new RegExp(
      `${publisher} ended \\(.*next \`deliver\` from the execution worktree establishes its own.*rerunning this finish`,
    ),
  });
  assert.deepEqual(coverage(publisher), []);
  assert.equal(pushes(), 1);
  journey.assertSiblingUntouched();

  // The session that replaced that coordinator follows the gap reason: the
  // recorded observer is stopped, its `deliver` establishes its own without a
  // second push, and its rerun completes there.
  const { delivered } = await journey.deliver(
    beforeCleanup,
    [],
    "third-coordinator",
  );
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.receipt.sha, final);
  assert.equal(
    delivered.observation.state,
    "attached",
    delivered.observation.reason,
  );
  const own = delivered.observation.directory;
  assert.match(
    delivered.observation.notifies,
    /^Claude Code session third-coordinator, named by CLAUDE_CODE_SESSION_ID/,
  );
  releaseCi(fixture, { [final]: "success" });
  const replaced = await finish("third-coordinator");
  assert.equal(replaced.code, 0, replaced.stderr);
  assert.equal(replaced.result.observation.directory, own);
  assert.equal(
    replaced.result.observation.notifies,
    delivered.observation.notifies,
  );
  assert.equal(replaced.result.completion.verdict, "success");
  assert.equal(replaced.result.completion.shutdown.status, "confirmed");
  assert.equal(replaced.result.cleanup.worktree, "removed");
  assert.deepEqual(coverage(publisher), []);
  assert.equal(pushes(), 1);
  // That delivery added its readiness probe and its observer; finish none.
  journey.assertSiblingUntouched(4);
});

test("finish chooses none of several live observers its coordinator owns for an accepted closure neither covers", async (t) => {
  const journey = await closureBesideSibling(t, "cursor");
  const { fixture, publisher } = journey;
  const second = await journey.startObserver("publisher");
  await journey.hook("publisher", journey.owner, startReceipt(second));
  const beforeCleanup = await acceptedIncrement(fixture);
  await commitFinalClosure(fixture);
  const final = await acceptedIncrement(fixture);
  const pushes = await journey.pushes();

  const finished = await journey.finish({
    beforeCleanup,
    final,
    extra: ["--created-for-work"],
  });

  await assertUnresolvedCoverage(fixture, finished, {
    final,
    ownership: "ambiguous",
    reason:
      /owns 2 live observers of owner\/project main.*next finish reuses it/,
  });
  assert.deepEqual(
    finished.result.observation.directories.toSorted(),
    [publisher, second].toSorted(),
  );
  assert.deepEqual(coverage(publisher), []);
  assert.deepEqual(coverage(second), []);
  assert.equal(pushes(), 0);
  journey.assertSiblingUntouched(3);
});

test("closure names an observer its coordinator claimed after its observers were listed as one that went live, with the rerun that registers on it", async (t) => {
  const { fixture, startObserver, hook } = await siblingCheckouts(t, "cursor");
  const observers = closureObservers({
    repo: "owner/project",
    branch: "main",
    host: "cursor",
    session: { conversation_id: "late-coordinator" },
    ...(await observerAccess(fixture.execution)),
    storage: fixture.storage,
  });
  assert.deepEqual(observers.directories, []);
  const late = await startObserver("publisher");
  assert.match(
    await hook("publisher", "late-coordinator", startReceipt(late)),
    /CI observer attached to this coordinator/,
  );

  const { gap } = observers.select("a".repeat(40));

  assert.equal(gap.state, "unobserved");
  assert.equal(gap.ownership, "live");
  assert.deepEqual(gap.directories, [late]);
  assert.match(
    gap.reason,
    new RegExp(
      `observer at ${late} went live while this finish ran; rerunning this finish registers on it$`,
    ),
  );
  assert.deepEqual(coverage(late), []);
});
