// Shared steps for session records of landed preparations: a queued story C
// with another developer's assignment, a preparation refined and released
// through the production commands, and Dough Land's commit and installed
// session close publisher.
import assert from "node:assert/strict";
import {
  queuedRepositoryWithRoughStory,
  roughStoryC,
} from "../../support/queued-repository.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { makeMe } from "../../support/makeMe.mjs";
import { landingContextFile } from "../dough-execute-plan/dashboard-landing-test-fixtures.mjs";
import { publishSessionClose } from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import {
  git,
  identityC,
  linkC,
  recorder,
  refineStoryC,
  releasePreparation,
  remoteFile,
} from "./preparation-assignment-test-fixtures.mjs";

export const closedAt = new Date("2026-11-21T09:00:00.000Z");
export const targetRef = "refs/heads/main";
export const recordPath = (sessionId) => `.planning/sessions/${sessionId}.json`;

// Story C is queued while Yui executes other work.
export async function queuedStoryC(t) {
  const trunk = await materializeRepository(
    queuedRepositoryWithRoughStory(roughStoryC)
      .withRevision("assign-yui", {
        message: "assign Yui",
        agentProfiles: [
          makeMe.anAgentProfile
            .executing({ name: "Yui", identity: "SEED-X#x" })
            .please(),
        ],
      })
      .please(),
  );
  t.after(trunk.cleanup);
  return trunk;
}

// Refinement's write and recorded facts, then the staged release.
export async function refineAndRelease(workspace) {
  refineStoryC(workspace);
  await recorder(
    workspace,
    "record-state",
    "--identity",
    identityC,
    "--link",
    linkC,
    "--refinement",
    "refined",
    "--approach",
    "unselected",
  );
  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.receipt.status, "release-staged");
}

// What Dough Land does with a reviewed workspace: commit everything, then
// close the session through the installed publisher, with the launch's
// landing context when `close.launch` gives one.
export async function landSession(t, { workspace, branch }, close) {
  await git(workspace, "add", "-A");
  await git(workspace, "commit", "-q", "-m", close.message);
  await git(workspace, "fetch", "-q", "origin");
  const base = (
    await git(workspace, "merge-base", branch, "origin/main")
  ).stdout.trim();
  const launch = close.launch?.();
  return publishSessionClose({
    now: () => closedAt,
    workspace,
    session: close.session,
    ...(launch ? { landingContext: await landingContextFile(t, launch) } : {}),
    ...makeMe.anIncrementPublication
      .with({ branch, previouslyPublishedBase: base, targetRef })
      .please(),
  });
}

export async function publishedRecord(trunk, sessionId) {
  return JSON.parse(await remoteFile(trunk, "main", recordPath(sessionId)));
}
