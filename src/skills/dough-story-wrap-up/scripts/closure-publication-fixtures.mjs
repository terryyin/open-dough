// Shared Git-mechanics setup for Trunk Mode closure proofs.
// These helpers do not prove that an agent follows the guidance.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { publishExecutionIncrement } from "../../dough-execute-plan/scripts/execution-increment-publication.mjs";
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

export function createClosureObserver(checkout) {
  const receipts = [];
  return {
    bound: true,
    stopped: false,
    checkout,
    receipts,
    register(sha, target = trunkTarget) {
      receipts.push({ sha, target });
    },
    stop() {
      this.stopped = true;
    },
  };
}

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

export async function publishCompletedIncrement(fixture) {
  return publishExecutionIncrement({
    workspace: fixture.execution,
    branch: executionBranch,
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
  });
}

export async function remoteCommitCount(origin) {
  return Number(
    (await git(origin, "rev-list", "--count", "refs/heads/main")).stdout.trim(),
  );
}

export function publishArgs(
  fixture,
  observer,
  previouslyPublishedBase,
  extras = {},
) {
  return {
    workspace: fixture.execution,
    branch: executionBranch,
    previouslyPublishedBase,
    observer,
    defaultCheckout: fixture.integration,
    declaredOwner: "coordinator",
    requester: "coordinator",
    // Closure proofs that race another writer renew applicable proof explicitly.
    validate: async () => ({ ok: true }),
    ...extras,
  };
}

export function resumeArgs(fixture, fields) {
  return {
    ownedWorkspace: fixture.execution,
    defaultCheckout: fixture.integration,
    integration: fixture.integration,
    branch: executionBranch,
    declaredOwner: "coordinator",
    requester: "coordinator",
    sessionOwned: true,
    supersededShas: [],
    validate: async () => ({ ok: true }),
    ...fields,
  };
}
