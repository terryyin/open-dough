// A grown one-shot attempt on a queued story escalates by moving the story's
// existing entry to Taken, without a readiness assessment, and restoring the
// attempt's edits over that claim. A holder that appeared meanwhile refuses
// the escalation with the edits untouched. Driven through the real startup
// CLI against a local bare remote.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  git,
  lsRemoteSha,
  remoteHeads,
  revParse,
} from "./publication-test-fixtures.mjs";
import { startCliResult } from "./workspace-publication-fixtures.mjs";
import {
  changedPaths,
  listed,
  pushFromElsewhere,
} from "./workspace-publication-admission-fixtures.mjs";
import {
  createSiblingTrunk,
  identityB,
  identityB2,
  remoteLists,
  remoteText,
  rivalPreparation,
  rivalTake,
  seedB,
  startQueuedOneShot,
} from "./one-shot-queued-test-fixtures.mjs";
import {
  assertOneClaim,
  attemptOverClaim,
  carriedSha,
  escalate,
  growAttempt,
  workspaceBytes,
} from "./one-shot-escalation-test-fixtures.mjs";

const queued = { identity: identityB, link: "seeds/B.md#b", title: "Story B" };

test("a grown queued attempt moves its entry to Taken and keeps its edits over the claim", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const started = await startQueuedOneShot(trunk);
  assert.equal(started.receipt.status, "prepared", started.stdout);
  const { workspace } = started;
  growAttempt(workspace);
  const attempt = workspaceBytes(workspace);

  const { receipt } = await escalate(trunk, "story-branch", "story", queued);
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.deepEqual(receipt.carried, { restored: true });
  const sha = receipt.publishedSha;
  assert.equal(await revParse(trunk.origin, `${sha}^`), trunk.trunkSha);
  assert.deepEqual(await changedPaths(trunk, sha), [
    "A\t.planning/agents/yui-chan.json",
    "M\t.planning/PRODUCT-BACKLOG.md",
  ]);
  // The existing entry moved, linking its declared plan; siblings keep order.
  await assertOneClaim(trunk, sha, trunk.trunkSha, identityB);
  assert.deepEqual(await remoteLists(trunk, sha), {
    taken: [identityB],
    queued: ["SEED-A#a", identityB2],
  });
  const [entry] = (await listed(trunk, sha)).filter(
    (item) => item.identity === identityB,
  );
  assert.equal(entry.plan.target, "slice-plans/B/PLAN.md");
  assert.equal(await revParse(workspace, "HEAD"), sha);
  const restored = await attemptOverClaim(trunk, attempt, sha);
  assert.deepEqual(workspaceBytes(workspace), restored);
  assert.equal(await carriedSha(workspace, "story"), undefined);

  // Its published preparation already supports execution: continuation
  // reports the same claim and writes nothing.
  const continued = await startCliResult(
    trunk,
    "story-branch",
    ["--host", "claude"],
    { identity: identityB, name: "story" },
  );
  assert.equal(continued.receipt.status, "existing", continued.stdout);
  assert.equal(continued.receipt.publishedSha, sha);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), sha);
  assert.deepEqual(workspaceBytes(workspace), restored);
});

test("escalation takes a queued Ready story changed since review, and continuation reports the change without renewing its review", async (t) => {
  const trunk = await createSiblingTrunk();
  t.after(trunk.cleanup);
  const { workspace } = await startQueuedOneShot(trunk);
  growAttempt(workspace);
  const revised = await pushFromElsewhere(trunk, seedB, (text) =>
    text.replace("Execute B.", "Execute B, revised."),
  );

  const { receipt } = await escalate(trunk, "story-branch", "story", queued);
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.deepEqual(receipt.carried, { restored: true });
  assert.equal(
    await revParse(trunk.origin, `${receipt.publishedSha}^`),
    revised,
  );
  await assertOneClaim(trunk, receipt.publishedSha, revised, identityB);
  const heads = await remoteHeads(trunk.origin);
  const attempt = workspaceBytes(workspace);
  const reviewedSource = await remoteText(trunk, revised, seedB);

  const continued = await startCliResult(
    trunk,
    "story-branch",
    ["--host", "claude"],
    { identity: identityB, name: "story" },
  );
  assert.equal(continued.code, 0, continued.stdout);
  assert.equal(continued.receipt.status, "existing", continued.stdout);
  assert.equal(continued.receipt.changedSinceReview, true);
  assert.equal(continued.receipt.publishedSha, receipt.publishedSha);
  assert.equal(await revParse(workspace, "HEAD"), receipt.publishedSha);
  assert.equal(await remoteHeads(trunk.origin), heads);
  assert.deepEqual(workspaceBytes(workspace), attempt);
  assert.equal(await remoteText(trunk, "main", seedB), reviewedSource);
});

for (const [holder, rival, status] of [
  ["a preparation announcement", rivalPreparation, "source-refused"],
  ["another developer's Take", rivalTake, "conflict"],
]) {
  test(`${holder} that appeared during the attempt refuses its escalation with the edits untouched`, async (t) => {
    const trunk = await createSiblingTrunk();
    t.after(trunk.cleanup);
    const { workspace } = await startQueuedOneShot(trunk);
    growAttempt(workspace);
    const attempt = workspaceBytes(workspace);
    const rivalSha = await rival(trunk);

    const { receipt } = await escalate(trunk, "story-branch", "story", queued);
    assert.equal(receipt.status, status, JSON.stringify(receipt));
    if (status === "source-refused")
      assert.match(
        receipt.error,
        /held on fetched trunk by .+ for preparation/,
      );
    assert.equal(receipt.carried, undefined);
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), rivalSha);
    assert.equal(await revParse(workspace, "HEAD"), trunk.trunkSha);
    assert.deepEqual(workspaceBytes(workspace), attempt);
    assert.equal(await carriedSha(workspace, "story"), undefined);
    assert.notEqual((await git(workspace, "status", "--porcelain")).stdout, "");
  });
}
