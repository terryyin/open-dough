// Git mechanics (not guidance-following): resume classifies a retained
// preparation candidate from the fetched remote, using the same recovery
// owner as execution. An unpublished candidate is pushed once. A lost
// success followed by another writer's advance is already published.
// Cleanup stays a separate step. Native agent evidence is not this file.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { resumeInterruptedPublication } from "../../dough-execute-plan/scripts/publication-resume.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  git,
  lsRemoteSha,
  messageCount,
  plantHumanEdit,
  pushCandidate,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import {
  closeOrRetainWorkspace,
  createPreparationFixture,
  worktreeCount,
} from "./preparation-publication-test-fixtures.mjs";

test("resume pushes a candidate that is not on the remote yet, without a second commit or a change to the human edit", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const worktreesBefore = await worktreeCount(integration);
  const commitsBefore = Number(
    (await git(preparation, "rev-list", "--count", "HEAD")).stdout.trim(),
  );
  const publishedRevisions = [];

  const published = await resumeInterruptedPublication({
    ownedWorkspace: preparation,
    defaultCheckout: integration,
    candidateSha: preparationSha,
    publishedRevisions,
    observer: null,
  });

  assert.equal(published.classification, "not-on-remote");
  assert.equal(published.completedObligation, "publish");
  assert.equal(published.pushCount, 1);
  assert.equal(published.acceptedPublicationCount, 1);
  assert.deepEqual(publishedRevisions, [preparationSha]);
  assert.equal(published.registration.reason, "no-observer");
  assert.equal(published.remaining.registration, "not-applicable");
  assert.equal(published.maintenance, "deferred");
  assert.equal(published.remaining.maintenancePerformed, false);
  assert.equal(published.cleanup, "not-performed");
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), preparationSha);
  assert.equal(await revParse(preparation, "origin/main"), preparationSha);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(
    (await git(origin, "rev-parse", `${preparationSha}^`)).stdout.trim(),
    trunkSha,
  );
  assert.equal(
    await messageCount(origin, "refs/heads/main", "Refine SEED-1 draft"),
    1,
  );
  assert.equal(
    Number(
      (await git(preparation, "rev-list", "--count", "HEAD")).stdout.trim(),
    ),
    commitsBefore,
  );
  assert.equal(await worktreeCount(integration), worktreesBefore);
  assert.equal(existsSync(preparation), true);
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  const again = await resumeInterruptedPublication({
    ownedWorkspace: preparation,
    defaultCheckout: integration,
    candidateSha: preparationSha,
    publishedRevisions,
    observer: null,
  });
  assert.equal(again.classification, "already-published");
  assert.equal(again.pushCount, 0);
  assert.equal(again.acceptedPublicationCount, 1);
  assert.equal(again.completedObligation, "none");
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), preparationSha);
  assert.equal(await worktreeCount(integration), worktreesBefore);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});

test("a lost push response followed by another writer's advance is already published and leaves cleanup separate", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  await pushCandidate(preparation, preparationSha);
  const laterRemote = await advanceOriginFromAnotherWriter(origin, {
    file: "later-writer.txt",
    body: "later work\n",
    message: "later writer's increment",
  });
  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const worktreesBefore = await worktreeCount(integration);
  const remoteCountBefore = Number(
    (await git(origin, "rev-list", "--count", "refs/heads/main")).stdout.trim(),
  );
  const publishedRevisions = [];

  const resumed = await resumeInterruptedPublication({
    ownedWorkspace: preparation,
    defaultCheckout: integration,
    candidateSha: preparationSha,
    publishedRevisions,
    observer: null,
  });

  assert.equal(resumed.classification, "already-published");
  assert.equal(resumed.completedObligation, "record-published-identity");
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.acceptedSha, preparationSha);
  assert.equal(resumed.acceptedPublicationCount, 1);
  assert.deepEqual(publishedRevisions, [preparationSha]);
  assert.equal(resumed.registration.reason, "no-observer");
  assert.equal(resumed.maintenance, "deferred");
  assert.equal(resumed.remaining.maintenancePerformed, false);
  assert.equal(resumed.cleanup, "not-performed");
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), laterRemote);
  assert.equal(
    (await git(origin, "rev-parse", `${laterRemote}^`)).stdout.trim(),
    preparationSha,
  );
  assert.equal(
    await messageCount(origin, "refs/heads/main", "Refine SEED-1 draft"),
    1,
  );
  assert.equal(
    Number(
      (
        await git(origin, "rev-list", "--count", "refs/heads/main")
      ).stdout.trim(),
    ),
    remoteCountBefore,
  );
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(existsSync(preparation), true);
  assert.equal(await worktreeCount(integration), worktreesBefore);
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  const again = await resumeInterruptedPublication({
    ownedWorkspace: preparation,
    defaultCheckout: integration,
    candidateSha: preparationSha,
    publishedRevisions,
    observer: null,
  });
  assert.equal(again.completedObligation, "none");
  assert.equal(again.pushCount, 0);
  assert.equal(again.acceptedPublicationCount, 1);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), laterRemote);
  assert.equal(existsSync(preparation), true);

  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: resumed.classification === "already-published",
    sessionCreated: true,
  });
  assert.equal(resources.removed, true);
  assert.equal(existsSync(preparation), false);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), laterRemote);
  assert.equal(
    await messageCount(origin, "refs/heads/main", "Refine SEED-1 draft"),
    1,
  );
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});

test("an interrupted keep that never reached the remote does not remove the workspace", async (t) => {
  const {
    origin,
    integration,
    preparation,
    preparationBranch,
    trunkSha,
    preparationSha,
    cleanup,
  } = await createPreparationFixture("preparation-publication-");
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const resources = await closeOrRetainWorkspace({
    integration,
    preparation,
    preparationBranch,
    confirmedDisposition: false,
    sessionCreated: true,
  });

  assert.equal(resources.removed, false);
  assert.match(resources.reason, /no confirmed disposition/);
  assert.equal(existsSync(preparation), true);
  assert.equal(await revParse(preparation, preparationBranch), preparationSha);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});
