// Git mechanics (not guidance-following): resume classifies a retained
// execution candidate from fetched remote ancestry. Interruption before
// acceptance publishes that SHA once. A lost success after a rewritten
// push, followed by another writer's advance, stays published.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { resumeInterruptedPublication } from "../../../src/skills/dough-execute-plan/scripts/publication-resume.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  captureCheckout,
  git,
  messageCount,
  plantHumanEdit,
  pushCandidate,
  revParse,
  worktreeCount,
} from "./publication-test-fixtures.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";

// A trunk.txt trunk commit, which the planted human edit changes, and a
// workspace on exec/story one unpublished "verified increment" commit ahead.
const trunkWithOneIncrement = makeMe.aRepository
  .withRevision("trunk", { files: { "trunk.txt": "base\n" } })
  .withWorkspace("exec/story", { from: "trunk" })
  .withUnpublishedRevision("increment", {
    files: { "increment.txt": "increment\n" },
    message: "verified increment",
  })
  .please();

test("an interrupted publication before acceptance pushes the retained candidate once and does not commit again", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await materializeRepository(trunkWithOneIncrement);
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const commitsBefore = Number(
    (await git(execution, "rev-list", "--count", "HEAD")).stdout.trim(),
  );
  const worktreesBefore = await worktreeCount(integration);

  const published = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    defaultCheckout: integration,
    candidateSha,
  });

  assert.equal(published.classification, "not-on-remote");
  assert.equal(published.pushCount, 1);
  assert.equal(published.acceptedSha, candidateSha);
  assert.equal(published.maintenance, "deferred");
  assert.equal(published.cleanup, "not-performed");
  assert.equal(await revParse(execution, "HEAD"), candidateSha);
  assert.equal(await revParse(execution, "exec/story"), candidateSha);
  assert.equal(
    Number((await git(execution, "rev-list", "--count", "HEAD")).stdout.trim()),
    commitsBefore,
  );
  assert.equal(
    await messageCount(origin, "refs/heads/main", "verified increment"),
    1,
  );
  assert.equal(
    (await git(origin, "rev-parse", `${candidateSha}^`)).stdout.trim(),
    trunkSha,
  );
  assert.equal(await worktreeCount(integration), worktreesBefore);
  assertCheckoutUnchanged(before, await captureCheckout(integration));

  const again = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    defaultCheckout: integration,
    candidateSha,
  });
  assert.equal(again.classification, "already-published");
  assert.equal(again.pushCount, 0);
  assert.equal(again.acceptedSha, candidateSha);
  assert.equal(
    await messageCount(origin, "refs/heads/main", "verified increment"),
    1,
  );
  assert.equal(await revParse(execution, "HEAD"), candidateSha);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});

test("a lost success after a rewritten push stays published when another writer advances", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await materializeRepository(trunkWithOneIncrement);
  t.after(cleanup);

  await plantHumanEdit(integration);
  const before = await captureCheckout(integration);
  const firstRemote = await advanceOriginFromAnotherWriter(origin);
  await git(execution, "fetch", "origin");
  await git(execution, "rebase", "--onto", firstRemote, trunkSha, "exec/story");
  const rewrittenSha = await revParse(execution, "exec/story");
  assert.notEqual(rewrittenSha, candidateSha);
  await pushCandidate(execution, rewrittenSha);
  const laterRemote = await advanceOriginFromAnotherWriter(origin, {
    file: "later-writer.txt",
    body: "later work\n",
    message: "later writer's increment",
  });
  const remoteCountBefore = Number(
    (await git(origin, "rev-list", "--count", "refs/heads/main")).stdout.trim(),
  );
  const commitsBefore = Number(
    (await git(execution, "rev-list", "--count", "HEAD")).stdout.trim(),
  );
  const worktreesBefore = await worktreeCount(integration);

  const resumed = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    defaultCheckout: integration,
    candidateSha: rewrittenSha,
    supersededShas: [candidateSha],
  });

  assert.equal(resumed.classification, "already-published");
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.acceptedSha, rewrittenSha);
  assert.equal(resumed.maintenance, "deferred");
  assert.equal(resumed.cleanup, "not-performed");
  assert.equal(await revParse(origin, "refs/heads/main"), laterRemote);
  assert.equal(
    (await git(origin, "rev-parse", `${laterRemote}^`)).stdout.trim(),
    rewrittenSha,
  );
  assert.equal(
    (await git(origin, "rev-parse", `${rewrittenSha}^`)).stdout.trim(),
    firstRemote,
  );
  let preRebaseOnRemote = true;
  try {
    await git(
      execution,
      "merge-base",
      "--is-ancestor",
      candidateSha,
      "origin/main",
    );
  } catch (error) {
    preRebaseOnRemote = false;
    assert.equal(error.code, 1);
  }
  assert.equal(preRebaseOnRemote, false);
  assert.equal(
    await messageCount(origin, "refs/heads/main", "verified increment"),
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
  assert.equal(await revParse(execution, "HEAD"), rewrittenSha);
  assert.equal(
    Number((await git(execution, "rev-list", "--count", "HEAD")).stdout.trim()),
    commitsBefore,
  );
  assert.equal(await worktreeCount(integration), worktreesBefore);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});
