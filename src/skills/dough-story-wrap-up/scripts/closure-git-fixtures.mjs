// Shared Git-mechanics setup for wrap-up closure proofs.
// These helpers do not prove that an agent follows the guidance.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
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

export async function ancestorOf(workspace, ancestorSha, descendant) {
  try {
    await git(
      workspace,
      "merge-base",
      "--is-ancestor",
      ancestorSha,
      descendant,
    );
    return true;
  } catch (error) {
    if (error.code === 1) {
      return false;
    }
    throw error;
  }
}

export async function commitFile(workspace, file, body, message) {
  writeFileSync(join(workspace, file), body);
  await git(workspace, "add", file);
  await git(workspace, "commit", "-m", message);
  return revParse(workspace, "HEAD");
}

export async function remoteCommitCount(origin) {
  return Number(
    (await git(origin, "rev-list", "--count", "refs/heads/main")).stdout.trim(),
  );
}
