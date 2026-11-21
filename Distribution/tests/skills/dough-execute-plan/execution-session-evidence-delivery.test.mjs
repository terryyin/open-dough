// Managed delivery keeps each accepted increment's exact pair, in order, in
// the execution's local session evidence under the launch reference: another
// writer's commit and a refused candidate never enter, a retry keeps the
// rewritten accepted pair, and a resumed accepted increment joins once.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { reportingReference } from "../../support/launchLandingTestData.mjs";
import {
  advanceOriginFromAnotherWriter,
  git,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";
import {
  landingContextFile,
  landingReceiver,
} from "./dashboard-landing-test-fixtures.mjs";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { readSessionEvidence } from "../../../src/skills/dough-execute-plan/scripts/execution-session-evidence.mjs";

const targetRef = "refs/heads/main";

async function commitIncrement(workspace, file) {
  writeFileSync(join(workspace, file), `${file}\n`);
  await git(workspace, "add", file);
  await git(workspace, "commit", "--quiet", "-m", file);
}

test("two accepted increments with another writer between keep their exact accepted pairs under the launch reference", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const receiver = await landingReceiver(t);
  const landingContext = await landingContextFile(
    t,
    makeMe.aLandingContext.reportingTo(receiver.origin).please(),
  );
  const request = {
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    targetRef,
    repo: "owner/project",
  };

  const first = await fixture.deliverManagedExecutionIncrement({
    ...request,
    previouslyPublishedBase: fixture.trunkSha,
    landingContext,
  });
  assert.equal(first.ok, true, JSON.stringify(first));

  await advanceOriginFromAnotherWriter(fixture.origin);
  await commitIncrement(fixture.execution, "second.txt");
  let racingTip, refused;
  const second = await fixture.deliverManagedExecutionIncrement({
    ...request,
    previouslyPublishedBase: first.receipt.sha,
    validate: async () => ({ ok: true }),
    beforePush: async ({ attempt, candidate }) => {
      if (attempt !== 0) return;
      refused = candidate;
      racingTip = await advanceOriginFromAnotherWriter(fixture.origin, {
        file: "racing.txt",
      });
    },
  });
  assert.equal(second.ok, true, JSON.stringify(second));
  assert.notEqual(second.receipt.sha, refused);
  assert.equal(
    await lsRemoteSha(fixture.origin, targetRef),
    second.receipt.sha,
  );

  const evidence = readSessionEvidence(fixture.execution);
  assert.equal(evidence.sessionId, reportingReference);
  assert.deepEqual(evidence.ranges, [
    { base: fixture.trunkSha, candidate: first.receipt.sha },
    { base: racingTip, candidate: second.receipt.sha },
  ]);
});

test("an increment whose push response was lost joins the session evidence once, in order, when resumed and accepted", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const request = {
    ...fixture.requestBase,
    workspace: fixture.execution,
    targetRef,
    repo: "owner/project",
  };
  const first = await fixture.deliverManagedExecutionIncrement({
    ...request,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
  });
  assert.equal(first.ok, true, JSON.stringify(first));

  // The second push reaches the remote but its result is lost.
  await commitIncrement(fixture.execution, "second.txt");
  const interrupted = (
    await git(fixture.execution, "rev-parse", "HEAD")
  ).stdout.trim();
  await git(fixture.execution, "push", "origin", `${interrupted}:${targetRef}`);
  const resume = {
    ...request,
    candidateSha: interrupted,
    suffixBase: first.receipt.sha,
    publishedRevisions: [],
  };
  const resumed = await fixture.resumeManagedExecutionIncrement(resume);
  assert.equal(resumed.ok, true, JSON.stringify(resumed));
  assert.equal(resumed.pushCount, 0);
  const again = await fixture.resumeManagedExecutionIncrement(resume);
  assert.equal(again.ok, true, JSON.stringify(again));

  assert.deepEqual(readSessionEvidence(fixture.execution).ranges, [
    { base: fixture.trunkSha, candidate: first.receipt.sha },
    { base: first.receipt.sha, candidate: interrupted },
  ]);
});
