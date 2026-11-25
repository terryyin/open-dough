// A Dashboard-launched refinement lands its preparation, then a later ad hoc
// follow-up of the same story lands, each through Land's installed session
// close publisher. Every published fact is read back from the origin.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { landingReceiver } from "../dough-execute-plan/dashboard-landing-test-fixtures.mjs";
import { refinementSessionWorkflow } from "../../../src/skills/dough-execute-plan/scripts/session-record.mjs";
import {
  createWorkspace,
  git,
  identityC,
  lsRemoteSha,
  profileOf,
  remoteChanges,
  remoteProfileNames,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";
import {
  closedAt,
  landSession,
  publishedRecord,
  queuedStoryC,
  recordPath,
  refineAndRelease,
  targetRef,
} from "./preparation-session-record-test-fixtures.mjs";

const refinementLaunch = "5a1e0c3d-2b4f-4a6e-8c7d-9e0f1a2b3c4d";
const followUpLaunch = "6b2f1d4e-3c5a-4b7f-9d8e-0f1a2b3c4d5e";

test("a refinement and a later follow-up of its story each publish their own session record under the story", async (t) => {
  const trunk = await queuedStoryC(t);
  const { origin } = await landingReceiver(t);

  const preparation = await createWorkspace(trunk, "c");
  const { receipt: announced } = await startPreparation(
    trunk,
    preparation.workspace,
    identityC,
  );
  assert.equal(announced.status, "announced", JSON.stringify(announced));
  assert.equal(announced.agent, "Akiho-chan");
  await refineAndRelease(preparation.workspace);
  const announcedTip = await lsRemoteSha(trunk.origin, targetRef);

  // The refinement's launch names its story; the session passes none.
  const refinement = await landSession(t, preparation, {
    message: "Keep story C preparation",
    session: { workflow: refinementSessionWorkflow },
    launch: () =>
      makeMe.aLandingContext
        .reportingTo(origin)
        .referencing(refinementLaunch)
        .namingStory(identityC)
        .please(),
  });
  assert.equal(
    refinement.record.status,
    "published",
    JSON.stringify(refinement),
  );
  const prepared = refinement.work.receipt.sha;
  const refinementRecordCommit = await lsRemoteSha(trunk.origin, targetRef);

  // The follow-up's launch and its instruction name the same story.
  const followUp = await createWorkspace(trunk, "follow-up");
  writeFileSync(join(followUp.workspace, "c-follow-up.txt"), "follow-up\n");
  const followed = await landSession(t, followUp, {
    message: "Follow up story C",
    session: { workflow: "ad-hoc", story: identityC },
    launch: () =>
      makeMe.aLandingContext
        .reportingTo(origin)
        .referencing(followUpLaunch)
        .namingStory(identityC)
        .please(),
  });
  assert.equal(followed.record.status, "published", JSON.stringify(followed));

  assert.deepEqual(await publishedRecord(trunk, refinementLaunch), {
    version: 1,
    sessionId: refinementLaunch,
    workflow: "dough-story-refinement",
    closedAt: closedAt.toISOString(),
    story: identityC,
    ranges: [{ base: announcedTip, candidate: prepared }],
  });
  assert.deepEqual(await publishedRecord(trunk, followUpLaunch), {
    version: 1,
    sessionId: followUpLaunch,
    workflow: "ad-hoc",
    closedAt: closedAt.toISOString(),
    story: identityC,
    ranges: [
      {
        base: refinementRecordCommit,
        candidate: followed.work.receipt.sha,
      },
    ],
  });

  // The preparation and its release are one accepted snapshot; the session
  // record follows it in a second one.
  assert.deepEqual((await remoteChanges(trunk, prepared)).sort(), [
    `D\t${profileOf("Akiho")}`,
    `M\t${seedC}`,
  ]);
  assert.deepEqual(await remoteProfileNames(trunk, prepared), [
    ".planning/agents/yui-chan.json",
  ]);
  assert.deepEqual(await remoteChanges(trunk, refinementRecordCommit), [
    `A\t${recordPath(refinementLaunch)}`,
  ]);
  const followUpFiles = await git(
    trunk.origin,
    "diff",
    "--name-only",
    refinementRecordCommit,
    followed.work.receipt.sha,
  );
  assert.equal(followUpFiles.stdout, "c-follow-up.txt\n");
});
