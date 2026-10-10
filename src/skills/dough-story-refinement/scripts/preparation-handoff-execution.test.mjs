// Handoff from preparation to execution in one worktree: the production
// preparation `start` and `release`, the Dough Land Git model without its
// retirement, then the production execution `start` with the same path and
// branch.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { createdForRecords } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { startCliResult } from "../../dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { takenIdentities } from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import {
  backlogFile,
  createPreparationTrunk,
  git,
  identityC,
  linkC,
  lsRemoteSha,
  planStoryC,
  recorder,
  refineStoryC,
  releasePreparation,
  remoteFile,
  revParse,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";

const branch = "claude/story-c";
const planned = [
  "record-state",
  ...["--identity", identityC, "--link", linkC],
  ...["--refinement", "refined", "--approach", "planned"],
  ...["--plan", "../slice-plans/C/PLAN.md"],
];

// A preparation worktree that `start` created at fetched trunk, holding a
// refined story, its plan, a recorded `ready` assessment, and a staged release.
async function readyPreparation(t) {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const workspace = join(trunk.fixture, "owned", "prep-c");
  const { receipt: announced } = await startPreparation(
    trunk,
    workspace,
    identityC,
    ["--branch", branch],
  );
  assert.equal(announced.status, "announced", JSON.stringify(announced));
  assert.equal(announced.selection.created, true);

  refineStoryC(workspace);
  planStoryC(workspace);
  await recorder(workspace, ...planned);
  const { basis } = JSON.parse(
    await recorder(workspace, "read-state", "--link", linkC),
  );
  await recorder(
    workspace,
    ...planned,
    ...["--assessment", "ready"],
    ...["--expect-document", basis.document, "--expect-plan", basis.plan],
  );
  const release = await releasePreparation(workspace, identityC);
  assert.equal(release.receipt.status, "release-staged");
  return { trunk, workspace, announced: announced.publishedSha };
}

for (const [mode, publishesBranch] of [
  ["story-branch", true],
  ["trunk", false],
]) {
  test(`a landed preparation worktree continues as the ${mode} execution workspace on its own branch`, async (t) => {
    const { trunk, workspace, announced } = await readyPreparation(t);
    const created = await createdForRecords(workspace);
    assert.equal(created.length, 1, JSON.stringify(created));

    // The handoff's landing keeps the worktree: no retirement.
    const landing = await landWorktree({
      worktree: workspace,
      branch,
      defaultCheckout: trunk.integration,
      createdForWork: false,
      message: "Keep story C preparation",
    });
    assert.equal(landing.stopped, null, JSON.stringify(landing));
    assert.equal(landing.cleanup.removed, false);
    const landed = await lsRemoteSha(trunk.origin, "refs/heads/main");
    assert.equal(await revParse(trunk.origin, `${landed}^`), announced);
    assert.equal(await revParse(workspace, "HEAD"), landed);
    assert.equal(await lsRemoteSha(trunk.origin, `refs/heads/${branch}`), "");

    const { receipt } = await startCliResult(
      trunk,
      mode,
      ["--host", "claude"],
      { name: "c", identity: identityC, workspace, branch },
    );
    assert.equal(receipt.ok, true, JSON.stringify(receipt));
    assert.equal(receipt.status, "published");
    assert.equal(receipt.created, false);
    assert.equal(receipt.startingRevision, landed);

    // The Take is the next commit on trunk; only Story Branch Mode publishes
    // the branch, at that same commit.
    const taken = receipt.publishedSha;
    assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), taken);
    assert.equal(await revParse(trunk.origin, `${taken}^`), landed);
    assert.equal(
      await lsRemoteSha(trunk.origin, `refs/heads/${branch}`),
      publishesBranch ? taken : "",
    );
    assert.deepEqual(
      takenIdentities(await remoteFile(trunk, taken, backlogFile)),
      [identityC],
    );
    assert.deepEqual(await createdForRecords(workspace), created);
    assert.equal(await revParse(workspace, "HEAD"), taken);
    assert.equal((await git(workspace, "status", "--porcelain")).stdout, "");
  });
}
