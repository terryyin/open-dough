// Shared Git-mechanics setup for wrap-up closure proofs.
// These helpers do not prove that an agent follows the guidance.
import { execFile } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  authorizedRemote,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  messageCount,
  plantHumanEdit,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { configureAgentAuthorship } from "../../dough-execute-plan/scripts/workspace-agent-authorship.mjs";
import { agentIdentity } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  authorizedRemote,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  messageCount,
  plantHumanEdit,
  revParse,
};

export const trunkTarget = "refs/heads/main";
export const executionBranch = "exec/story";

// A script's exit code and what it printed, run in `env`.
export const runScriptIn = (env, script, ...args) =>
  new Promise((resolve) => {
    execFile(
      process.execPath,
      [script, ...args],
      { env },
      (error, stdout, stderr) => {
        resolve({ code: error?.code ?? 0, stdout, stderr });
      },
    );
  });

// A script's exit code and what it printed.
export const runScript = (script, ...args) =>
  runScriptIn(process.env, script, ...args);

const integrationCli = fileURLToPath(
  new URL(
    "../../dough-execute-plan/scripts/history-preserving-publication.mjs",
    import.meta.url,
  ),
);

// The installed integration command.
export function integrateCommand(workspace, publishedTip) {
  const args = ["integrate", "--workspace", workspace];
  args.push("--published-tip", publishedTip, "--branch", executionBranch);
  return runScript(integrationCli, ...args);
}

export async function commitFile(workspace, file, body, message) {
  writeFileSync(join(workspace, file), body);
  await git(workspace, "add", file);
  await git(workspace, "commit", "-m", message);
  return revParse(workspace, "HEAD");
}

export const currentBranch = async (workspace) =>
  (await git(workspace, "branch", "--show-current")).stdout.trim();

export const porcelainStatus = async (workspace) =>
  (await git(workspace, "status", "--porcelain")).stdout;

export async function remoteCommitCount(remote, ref = trunkTarget) {
  return Number((await git(remote, "rev-list", "--count", ref)).stdout.trim());
}

// A published Story Branch tip and another writer's trunk commit that both
// change `shared.txt`, so integrating that tip stops on a conflict.
export async function publishStoryConflictingWithTrunk(origin, execution) {
  const closureSha = await commitFile(
    execution,
    "shared.txt",
    "story\n",
    "story closure",
  );
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  const trunkSha = await advanceOriginFromAnotherWriter(origin, {
    file: "shared.txt",
    body: "trunk\n",
  });
  return { closureSha, trunkSha };
}

// An owned workspace whose agent authors its commits and whose configured Git
// user is the developer, with a published Story Branch tip that trunk has
// moved past, so integrating it needs a merge commit.
export async function agentStoryBehindTrunk(t) {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;
  await configureAgentAuthorship(execution, agentIdentity("Yui"));
  const closureSha = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  const trunkBefore = await advanceOriginFromAnotherWriter(origin);
  return { ...fixture, closureSha, trunkBefore };
}

// Stages `body` as the resolution of that conflict, leaving the commit.
export async function stageSharedResolution(workspace, body) {
  writeFileSync(join(workspace, "shared.txt"), body);
  await git(workspace, "add", "shared.txt");
}

// Commits `body` as the resolution of that conflict, answering the merge.
export async function commitSharedResolution(workspace, body) {
  await stageSharedResolution(workspace, body);
  await git(workspace, "commit", "--no-edit");
  return revParse(workspace, "HEAD");
}
