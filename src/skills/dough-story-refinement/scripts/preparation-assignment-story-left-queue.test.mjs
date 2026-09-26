// Keeping a preparation whose story has left the queue, through the
// production `release` command: on fetched trunk it stops before staging,
// reports where the story is now, and leaves every choice to the developer.
// Another writer's Take, completion or removal is the only fixture change;
// the stop itself is the product's.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  identityA,
  startCliResult,
} from "../../dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import {
  abandonPreparation,
  backlogCli,
  backlogFile,
  createPreparationTrunk,
  createWorkspace,
  exec,
  git,
  lsRemoteSha,
  releasePreparation,
  remoteChanges,
  remoteFile,
  startPreparation,
} from "./preparation-assignment-test-fixtures.mjs";
import { snapshot } from "./preparation-assignment-recovery-fixtures.mjs";

const remoteTip = (trunk) => lsRemoteSha(trunk.origin, "refs/heads/main");

const seedA = ".planning/seeds/A.md";
const planA = ".planning/slice-plans/A/PLAN.md";

// Queued story A, already Takeable, prepared again in its own workspace:
// announced on trunk, with a committed seed revision and an uncommitted plan
// revision as the retained draft.
async function preparedStoryA(trunk) {
  const { workspace } = await createWorkspace(trunk, "a");
  const { receipt: announced } = await startPreparation(
    trunk,
    workspace,
    identityA,
  );
  assert.equal(announced.status, "announced", JSON.stringify(announced));
  const append = (path, text) =>
    writeFileSync(
      join(workspace, path),
      readFileSync(join(workspace, path), "utf8") + text,
    );
  append(seedA, "\nA clarified example.\n");
  await git(workspace, "commit", "--quiet", "-am", "clarify story A");
  append(planA, "\n### 2. Another slice\n");
  return { workspace, announced };
}

// What must stay untouched: the workspace's commits, index, and draft, and
// the remote trunk still holding the assignment.
async function untouched(trunk, workspace, profile) {
  return {
    workspace: await snapshot(workspace, [seedA, planA]),
    index: (await git(workspace, "ls-files", "--stage")).stdout,
    remote: await remoteTip(trunk),
    assignment: await remoteFile(trunk, "main", profile),
  };
}

function assertStopped(release, announced, story) {
  assert.equal(release.code, 1, JSON.stringify(release.receipt));
  const { receipt } = release;
  assert.equal(receipt.status, "story-left-queue");
  assert.equal(receipt.identity, identityA);
  assert.equal(receipt.allocation, announced.allocation);
  assert.deepEqual(receipt.story, story);
  assert.deepEqual(
    receipt.choices.map(({ choice }) => choice),
    ["abandon", "discard", "separate-work"],
  );
}

test("keeping a preparation whose story was Taken, then completed, stops for the developer with where the story is now", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace, announced } = await preparedStoryA(trunk);
  const kept = await untouched(trunk, workspace, announced.profile);
  assert.notEqual(kept.assignment, null);

  // Another developer Takes story A through execution startup.
  const execution = await startCliResult(trunk, "trunk");
  assert.equal(execution.code, 0, JSON.stringify(execution.receipt));
  const taken = await untouched(trunk, workspace, announced.profile);
  const executionProfile = `.planning/agents/${execution.receipt.agent.toLowerCase()}.json`;
  const owner = JSON.parse(await remoteFile(trunk, "main", executionProfile));

  const release = await releasePreparation(workspace, identityA);
  assertStopped(release, announced, {
    place: "taken",
    owners: [
      {
        path: executionProfile,
        agent: execution.receipt.agent,
        identity: identityA,
        activity: "execution",
        mode: owner.mode,
        branch: owner.branch,
        allocation: taken.remote,
      },
    ],
  });
  assert.equal(release.receipt.fetched, taken.remote);
  assert.deepEqual(await untouched(trunk, workspace, announced.profile), {
    ...kept,
    remote: taken.remote,
  });
  // Asking again gives the same stop and still changes nothing.
  assert.deepEqual(await releasePreparation(workspace, identityA), release);

  // The execution completes story A through the backlog command.
  await exec(
    process.execPath,
    [backlogCli, "complete", "--identity", identityA],
    { cwd: execution.workspace },
  );
  await git(execution.workspace, "commit", "--quiet", "-am", "close story A");
  await git(execution.workspace, "push", "--quiet", "origin", "HEAD:main");
  const completed = await remoteTip(trunk);
  assert.deepEqual((await remoteChanges(trunk, completed)).sort(), [
    `D\t${executionProfile}`,
    `M\t${backlogFile}`,
  ]);
  assertStopped(await releasePreparation(workspace, identityA), announced, {
    place: "absent",
  });
  assert.deepEqual(await untouched(trunk, workspace, announced.profile), {
    ...kept,
    remote: completed,
  });
});

test("keeping a preparation whose story entry was removed stops, and abandoning it still ends only the assignment", async (t) => {
  const trunk = await createPreparationTrunk();
  t.after(trunk.cleanup);
  const { workspace, announced } = await preparedStoryA(trunk);

  // Another writer removes story A's entry from the backlog.
  const { integration } = trunk;
  await git(integration, "pull", "--quiet", "--ff-only", "origin", "main");
  const backlog = join(integration, backlogFile);
  const lines = readFileSync(backlog, "utf8").split("\n");
  writeFileSync(
    backlog,
    lines.filter((line) => !line.includes(identityA)).join("\n"),
  );
  await git(integration, "commit", "--quiet", "-am", "drop story A");
  await git(integration, "push", "--quiet", "origin", "HEAD:main");
  const kept = await untouched(trunk, workspace, announced.profile);

  assertStopped(await releasePreparation(workspace, identityA), announced, {
    place: "absent",
  });
  assert.deepEqual(await untouched(trunk, workspace, announced.profile), kept);

  // The developer chooses to abandon: only the assignment ends.
  const { receipt } = await abandonPreparation(trunk, workspace, identityA);
  assert.equal(receipt.status, "abandoned", JSON.stringify(receipt));
  const ended = await remoteTip(trunk);
  assert.deepEqual(await remoteChanges(trunk, ended), [
    `D\t${announced.profile}`,
  ]);
  assert.deepEqual(
    (await snapshot(workspace, [seedA, planA])).files,
    kept.workspace.files,
  );
});
