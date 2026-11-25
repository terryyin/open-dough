// Two closes interrupted in one shared checkout each resume from their own
// saved state, given only the session identity or landing context: the
// accepted work is not pushed again, and each record keeps its exact range.
import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { reportingReference } from "../../support/launchLandingTestData.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import {
  publishSessionClose,
  resumeSessionClose,
} from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  git,
  lsRemoteSha,
  revParse,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import {
  aLaunchLandingContext,
  closedAt,
  closingStory,
  nativeSession,
  oneUnpublishedEdit,
  publishedRecord,
  targetRef,
} from "./session-close-test-fixtures.mjs";
import { acceptedPushes, recordingPushes } from "./session-close-faults.mjs";

const landBranch = { branch: "land/ad-hoc", targetRef };

const close = (fixture, session, publication) =>
  publishSessionClose({
    now: () => closedAt,
    workspace: fixture.execution,
    session: { workflow: "ad-hoc", story: closingStory, ...session },
    ...makeMe.anIncrementPublication.with(landBranch).please(),
    ...publication,
  });

// A fresh resume that knows only the session and where it closes.
const resume = (fixture, identity) =>
  resumeSessionClose({
    now: () => closedAt,
    workspace: fixture.execution,
    ...landBranch,
    ...identity,
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

async function commitAnotherEdit({ execution }) {
  await writeFile(join(execution, "second.txt"), "second\n");
  await git(execution, "add", "second.txt");
  await git(execution, "commit", "-q", "-m", "second session's edit");
  return revParse(execution, "HEAD");
}

test("two closes interrupted in one checkout each resume from their own saved state", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  await recordingPushes(fixture);
  const landingContext = await aLaunchLandingContext(t, closedAt);
  const intervening = await advanceOriginFromAnotherWriter(fixture.origin);

  const launchClose = {
    landingContext,
    previouslyPublishedBase: fixture.trunkSha,
  };
  const rebased = await close(fixture, {}, launchClose);
  assert.equal(
    rebased.work.status,
    "needs-validation",
    JSON.stringify(rebased),
  );
  await assert.rejects(
    close(
      fixture,
      {},
      {
        ...launchClose,
        validatedCandidate: rebased.work.candidate,
        beforePush: unansweredPush(fixture),
      },
    ),
    /push result lost/,
  );
  const launchWork = await lsRemoteSha(fixture.origin, targetRef);

  const nativeWork = await commitAnotherEdit(fixture);
  await writeFile(join(fixture.origin, "refuse-records"), "");
  const nativeClose = await close(
    fixture,
    { sessionId: nativeSession },
    { previouslyPublishedBase: launchWork },
  );
  assert.equal(
    nativeClose.record.status,
    "stopped",
    JSON.stringify(nativeClose),
  );
  await rm(join(fixture.origin, "refuse-records"));

  const nativeResumed = await resume(fixture, {
    session: {
      sessionId: nativeSession,
      workflow: "ad-hoc",
      story: closingStory,
    },
  });
  assert.equal(
    nativeResumed.record.status,
    "published",
    JSON.stringify(nativeResumed),
  );
  const launchResumed = await resume(fixture, {
    session: { workflow: "ad-hoc" },
    landingContext,
  });
  assert.equal(
    launchResumed.record.status,
    "published",
    JSON.stringify(launchResumed),
  );

  const pushes = await acceptedPushes(fixture);
  assert.deepEqual(pushes.slice(0, 3), [intervening, launchWork, nativeWork]);
  assert.equal(pushes.length, 5);
  assert.equal(
    await publishedRecord(fixture),
    `${JSON.stringify(nativeClose.record.record, null, 2)}\n`,
  );
  assert.deepEqual(nativeClose.record.record.ranges, [
    { base: launchWork, candidate: nativeWork },
  ]);
  assert.deepEqual(
    JSON.parse(await publishedRecord(fixture, reportingReference)).ranges,
    [
      {
        base: intervening,
        candidate: launchWork,
        uncertainty: "shared-checkout",
      },
    ],
  );
});
