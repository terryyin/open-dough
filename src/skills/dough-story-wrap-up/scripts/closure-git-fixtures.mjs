// Shared Git-mechanics setup for wrap-up closure proofs.
// These helpers do not prove that an agent follows the guidance.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
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

export async function commitFile(workspace, file, body, message) {
  writeFileSync(join(workspace, file), body);
  await git(workspace, "add", file);
  await git(workspace, "commit", "-m", message);
  return revParse(workspace, "HEAD");
}

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

// Stages `body` as the resolution of that conflict, leaving the commit.
export async function stageSharedResolution(workspace, body) {
  writeFileSync(join(workspace, "shared.txt"), body);
  await git(workspace, "add", "shared.txt");
}
