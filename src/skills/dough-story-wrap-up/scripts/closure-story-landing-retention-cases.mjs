// A launch's landing pair that cannot be retained before the push, kept with
// the integration entry: the run fails with its retry command and nothing
// pushed. A resolved merge, which no ref holds, stays checked out for the next
// run; a merge the next run can build again returns the workspace to its
// branch.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  commitSharedResolution,
  createCleanTrunkFixture,
  currentBranch,
  executionBranch,
  git,
  lsRemoteSha,
  porcelainStatus,
  publishStoryConflictingWithTrunk,
  revParse,
  trunkTarget,
} from "./closure-git-fixtures.mjs";

// A launch's landing context whose dashboard refuses the connection.
function unreachableLandingContext(t) {
  const directory = mkdtempSync(join(tmpdir(), "dough-landing-context-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, "landing-context.json");
  writeFileSync(
    file,
    JSON.stringify({
      origin: "http://127.0.0.1:9",
      source: "open-dough",
      host: "claude",
      reference: "launch-reference",
      identity: "SEED-A#a",
      remote: "origin",
      target: trunkTarget,
    }),
  );
  return file;
}

test("a resolved merge whose landing pair cannot be retained stays in the workspace, and the next run publishes it", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;
  const { closureSha, trunkSha } = await publishStoryConflictingWithTrunk(
    origin,
    execution,
  );
  const publish = (landingContext) =>
    publishHistoryPreservingCandidate({
      ownedWorkspace: execution,
      publishedTip: closureSha,
      branch: executionBranch,
      landingContext,
    });
  assert.equal((await publish()).classification, "preserved");
  const resolved = await commitSharedResolution(execution, "story and trunk\n");

  await assert.rejects(
    publish(unreachableLandingContext(t)),
    /Retry reporting only: /,
  );
  assert.equal(await revParse(execution, "HEAD"), resolved);
  assert.equal(await currentBranch(execution), "");
  assert.equal(await porcelainStatus(execution), "");
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkSha);

  const published = await publish();
  assert.equal(published.classification, "published");
  assert.deepEqual(published.receipt, { sha: resolved, target: trunkTarget });
  assert.equal(await lsRemoteSha(origin, trunkTarget), resolved);
  assert.equal(await currentBranch(execution), executionBranch);
});

test("a rebuilt merge whose landing pair cannot be retained returns the workspace to its branch", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;
  const closureSha = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  const trunkSha = await advanceOriginFromAnotherWriter(origin);

  await assert.rejects(
    publishHistoryPreservingCandidate({
      ownedWorkspace: execution,
      publishedTip: closureSha,
      branch: executionBranch,
      landingContext: unreachableLandingContext(t),
    }),
    /Retry reporting only: /,
  );
  assert.equal(await currentBranch(execution), executionBranch);
  assert.equal(await revParse(execution, "HEAD"), closureSha);
  assert.equal(await porcelainStatus(execution), "");
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkSha);
});
