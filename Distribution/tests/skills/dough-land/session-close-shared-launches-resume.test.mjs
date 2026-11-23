// Two Dashboard launches open in one shared checkout: each interrupted close
// resumes as its own session given its landing context, a published close
// leaves no saved close state, and a close naming neither launch is refused
// rather than guessed.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import {
  publishSessionClose,
  resumeSessionClose,
} from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { readGitPathJson } from "../../../src/skills/dough-execute-plan/scripts/git-path-json-store.mjs";
import { beginNativeSession } from "../../../src/skills/dough-execute-plan/scripts/execution-session-evidence.mjs";
import { managementContext } from "../../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import {
  git,
  lsRemoteSha,
  revParse,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import {
  landingContextFile,
  landingReceiver,
} from "../dough-execute-plan/dashboard-landing-test-fixtures.mjs";
import {
  closedAt,
  oneUnpublishedEdit,
  publishedRecord,
  targetRef,
} from "./session-close-test-fixtures.mjs";
import { acceptedPushes, recordingPushes } from "./session-close-faults.mjs";

const branch = "land/ad-hoc";
const launchA = "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa";
const launchB = "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb";

function readCloseState(workspace, sessionId) {
  return readGitPathJson(
    workspace,
    `open-dough/session-close/${sessionId}.json`,
  );
}

// Both launches' landing contexts, planted as open for the one checkout.
async function twoOpenLaunches(t, fixture) {
  const expectation = {
    repository: await managementContext(fixture.execution),
    workspace: fixture.execution,
    branch,
  };
  const launch = async (reference) =>
    landingContextFile(
      t,
      makeMe.aLandingContext
        .referencing(reference)
        .reportingTo((await landingReceiver(t)).origin)
        .please(),
      expectation,
    );
  return { a: await launch(launchA), b: await launch(launchB) };
}

const identity = (fixture, landingContext) => ({
  now: () => closedAt,
  workspace: fixture.execution,
  branch,
  targetRef,
  session: { workflow: "ad-hoc" },
  landingContext,
});

// The push reaches origin but its answer never returns to the close.
const unansweredPush =
  ({ execution }) =>
  async ({ candidate }) => {
    await git(
      execution,
      "push",
      "--quiet",
      "origin",
      `${candidate}:${targetRef}`,
    );
    throw new Error("push result lost");
  };

const interruptedClose = (fixture, landingContext, previouslyPublishedBase) =>
  assert.rejects(
    publishSessionClose({
      ...identity(fixture, landingContext),
      ...makeMe.anIncrementPublication
        .with({ branch, targetRef, previouslyPublishedBase })
        .please(),
      landingContext,
      beforePush: unansweredPush(fixture),
    }),
    /push result lost/,
  );

async function commitAnotherEdit({ execution }) {
  await writeFile(join(execution, "second.txt"), "second\n");
  await git(execution, "add", "second.txt");
  await git(execution, "commit", "-q", "-m", "second launch's edit");
  return revParse(execution, "HEAD");
}

test("two launches' closes interrupted in one checkout each resume as their own session", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  await recordingPushes(fixture);
  const launches = await twoOpenLaunches(t, fixture);

  await interruptedClose(fixture, launches.a, fixture.trunkSha);
  const workA = await lsRemoteSha(fixture.origin, targetRef);
  const workB = await commitAnotherEdit(fixture);
  await interruptedClose(fixture, launches.b, workA);

  for (const landingContext of [launches.a, launches.b]) {
    const resumed = await resumeSessionClose(identity(fixture, landingContext));
    assert.equal(resumed.record.status, "published", JSON.stringify(resumed));
  }

  const pushes = await acceptedPushes(fixture);
  assert.deepEqual(pushes.slice(0, 2), [workA, workB]);
  assert.equal(pushes.length, 4);
  const ranges = async (reference) =>
    JSON.parse(await publishedRecord(fixture, reference)).ranges;
  assert.deepEqual(await ranges(launchA), [
    { base: fixture.trunkSha, candidate: workA },
  ]);
  assert.deepEqual(await ranges(launchB), [{ base: workA, candidate: workB }]);
  for (const sessionId of [launchA, launchB])
    assert.equal(
      readCloseState(fixture.execution, sessionId),
      undefined,
      sessionId,
    );
});

test("a launch's close that publishes directly leaves no saved close state", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  const launches = await twoOpenLaunches(t, fixture);

  const closed = await publishSessionClose({
    ...identity(fixture, launches.a),
    ...makeMe.anIncrementPublication
      .with({ branch, targetRef, previouslyPublishedBase: fixture.trunkSha })
      .please(),
  });

  assert.equal(closed.record.status, "published", JSON.stringify(closed));
  assert.equal(readCloseState(fixture.execution, launchA), undefined);
});

test("a close naming neither open launch is refused even with an unclosed native session", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  await twoOpenLaunches(t, fixture);
  beginNativeSession(fixture.execution, { workflow: "ad-hoc" });

  const resumed = await resumeSessionClose(identity(fixture, undefined));
  const closed = await publishSessionClose({
    ...identity(fixture, undefined),
    ...makeMe.anIncrementPublication
      .with({ branch, targetRef, previouslyPublishedBase: fixture.trunkSha })
      .please(),
  });

  for (const refused of [resumed, closed])
    assert.equal(
      refused.work.status,
      "session-identity-missing",
      JSON.stringify(refused),
    );
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
});
