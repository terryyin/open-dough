// Preparation from announcement to landing through the production `start` and
// `release` commands and the real preparation recorder. Landing itself uses
// the Dough Land Git model; it neither adds nor removes an assignment.
import assert from "node:assert/strict";
import { test } from "node:test";
import { startCliResult } from "../../dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { landWorktree } from "./dough-land-test-fixtures.mjs";
import {
  backlogCli,
  backlogFile,
  createPreparationTrunk,
  createWorkspace,
  exec,
  git,
  identityC,
  lsRemoteSha,
  planC,
  planStoryC,
  profileOf,
  publishAssignment,
  read,
  recorder,
  refineStoryC,
  releasePreparation,
  remoteChanges,
  remoteFile,
  remoteProfileNames,
  seedC,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";

const link = "seeds/C.md#c";

// Records story C as refined through the canonical preparation recorder,
// with the approach and any further facts given.
const recordStoryC = ["record-state", "--identity", identityC, "--link", link];
const recordRefined = (workspace, ...facts) =>
  recorder(workspace, ...recordStoryC, "--refinement", "refined", ...facts);

// Two data variations of one journey: what the preparation session writes
// and records through the canonical recorder before keep.
const results = [
  {
    name: "refinement alone",
    async prepare({ workspace }) {
      refineStoryC(workspace);
      await recordRefined(workspace, "--approach", "unselected");
    },
    landed: [`M\t${seedC}`],
    facts: {
      refinement: "refined",
      approach: { kind: "unselected" },
      assessment: "absent",
    },
  },
  {
    name: "a planned result",
    async prepare({ trunk, workspace, announced }) {
      refineStoryC(workspace);
      await recordRefined(workspace, "--approach", "unselected");
      // Slice planning continues the same preparation session.
      const planning = await startPreparation(trunk, workspace, identityC);
      assert.equal(planning.receipt.status, "continued");
      assert.equal(planning.receipt.allocation, announced.allocation);
      assert.equal(planning.receipt.agent, announced.agent);
      planStoryC(workspace);
      const planned = ["--approach", "planned", "--plan", "../quick/C/PLAN.md"];
      await recordRefined(workspace, ...planned);
      const { basis } = JSON.parse(
        await recorder(workspace, "read-state", "--link", link),
      );
      await recordRefined(
        workspace,
        ...planned,
        "--assessment",
        "ready",
        "--expect-document",
        basis.document,
        "--expect-plan",
        basis.plan,
      );
    },
    landed: [`M\t${seedC}`, `A\t${planC}`],
    facts: {
      refinement: "refined",
      approach: { kind: "planned", plan: "../quick/C/PLAN.md" },
      assessment: "ready",
    },
  },
];

for (const result of results) {
  test(`landing ${result.name} releases only its own assignment in the same snapshot and keeps the story queued with recorded facts`, async (t) => {
    const trunk = await createPreparationTrunk();
    t.after(trunk.cleanup);
    // Yui executes other work; Akiho prepares the same story elsewhere.
    await publishAssignment(trunk, "Yui", {
      identity: "SEED-X#x",
      mode: "trunk",
      branch: "origin/main",
    });
    await publishAssignment(trunk, "Akiho", {
      identity: identityC,
      activity: "preparation",
    });
    const queue = await remoteFile(trunk, "main", backlogFile);
    const others = {
      Yui: await remoteFile(trunk, "main", profileOf("Yui")),
      Akiho: await remoteFile(trunk, "main", profileOf("Akiho")),
    };
    const { workspace, branch } = await createWorkspace(trunk, "c");
    const { receipt: announced } = await startPreparation(
      trunk,
      workspace,
      identityC,
    );
    assert.equal(announced.status, "announced", JSON.stringify(announced));
    assert.equal(announced.agent, "Yuma-chan");

    await result.prepare({ trunk, workspace, announced });
    const recorded = read(workspace, seedC);
    const recordedState = JSON.parse(
      await recorder(workspace, "read-state", "--link", link),
    );

    const release = await releasePreparation(workspace, identityC);
    assert.equal(release.code, 0, JSON.stringify(release.receipt));
    assert.equal(release.receipt.status, "release-staged");
    assert.equal(release.receipt.allocation, announced.allocation);
    // Until the keep lands, remote trunk still shows the assignment.
    assert.notEqual(await remoteFile(trunk, "main", profileOf("Yuma")), null);

    const landing = await landWorktree({
      worktree: workspace,
      branch,
      defaultCheckout: trunk.integration,
      message: "Keep story C preparation",
    });
    assert.equal(landing.stopped, null, JSON.stringify(landing));
    const landed = await lsRemoteSha(trunk.origin, "refs/heads/main");
    assert.deepEqual(
      (await remoteChanges(trunk, landed)).sort(),
      [...result.landed, `D\t${profileOf("Yuma")}`].sort(),
    );
    assert.equal(await remoteFile(trunk, landed, backlogFile), queue);
    assert.equal(await remoteFile(trunk, landed, seedC), recorded);
    assert.deepEqual(await remoteProfileNames(trunk, landed), [
      ".planning/agents/akiho-chan.json",
      ".planning/agents/yui-chan.json",
    ]);
    for (const [name, text] of Object.entries(others))
      assert.equal(await remoteFile(trunk, landed, profileOf(name)), text);

    // The published facts are the recorder's, read back from landed trunk.
    const published = JSON.parse(
      await recorder(trunk.integration, "read-state", "--link", link),
    );
    assert.equal(landing.refresh.result, "advanced");
    assert.deepEqual(published, recordedState);
    assert.deepEqual(
      {
        refinement: published.refinement,
        approach: published.approach,
        assessment: published.assessment.status,
      },
      result.facts,
    );
  });
}

test("new work after landing continues the rotation with fresh tool and model, and execution completion still removes only its own entry and profile", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const first = await createWorkspace(trunk, "c");
  const { receipt: yui } = await startPreparation(
    trunk,
    first.workspace,
    identityC,
    ["--host", "claude", "--model", "claude-opus-5-5"],
  );
  assert.equal(yui.agent, "Yui-chan");
  refineStoryC(first.workspace);
  assert.equal(
    (await releasePreparation(first.workspace, identityC)).receipt.status,
    "release-staged",
  );
  const landing = await landWorktree({
    worktree: first.workspace,
    branch: first.branch,
    defaultCheckout: trunk.integration,
  });
  assert.equal(landing.stopped, null, JSON.stringify(landing));
  assert.deepEqual(await remoteProfileNames(trunk), []);

  // The same conversation goes on to prepare story B: Yui is free again, but
  // rotation continues after it, recording the tool and model now reported.
  const second = await createWorkspace(trunk, "b");
  const { receipt: akiho } = await startPreparation(
    trunk,
    second.workspace,
    "SEED-B#b",
    ["--host", "codex", "--model", "gpt-x"],
  );
  assert.equal(akiho.status, "announced", JSON.stringify(akiho));
  assert.equal(akiho.agent, "Akiho-chan");
  assert.deepEqual(
    JSON.parse(await remoteFile(trunk, "main", profileOf("Akiho"))),
    {
      schemaVersion: 1,
      agent: "Akiho-chan",
      email: "akiho-chan@example.org",
      activity: "preparation",
      identity: "SEED-B#b",
      host: "codex",
      model: "gpt-x",
    },
  );

  // Execution of story A takes the next name and completes through the
  // backlog command, which leaves Akiho's preparation in place.
  const execution = await startCliResult(trunk, "trunk");
  assert.equal(execution.receipt.agent, "Yuma-chan");
  await exec(
    process.execPath,
    [backlogCli, "complete", "--identity", "SEED-A#a"],
    { cwd: execution.workspace },
  );
  await git(execution.workspace, "add", "--all", ".planning");
  await git(execution.workspace, "commit", "--quiet", "-m", "close story A");
  await git(execution.workspace, "push", "--quiet", "origin", "HEAD:main");
  assert.deepEqual(await remoteChanges(trunk, "main"), [
    `M\t${backlogFile}`,
    `D\t${profileOf("Yuma")}`,
  ]);
  assert.deepEqual(await remoteProfileNames(trunk), [
    ".planning/agents/akiho-chan.json",
  ]);
  assert.doesNotMatch(await remoteFile(trunk, "main", backlogFile), /SEED-A#a/);
  assert.match(await remoteFile(trunk, "main", backlogFile), /SEED-B#b/);
});
