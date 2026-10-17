// Git model of the Dough Land sequence for tests (not guidance-following).
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { publishExecutionIncrement } from "../../dough-execute-plan/scripts/execution-increment-publication.mjs";
import {
  ongoingOperation,
  refreshDefaultCheckout,
} from "../../dough-execute-plan/scripts/maintain-default-checkout.mjs";
import {
  git,
  revParse,
} from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { managementContext } from "../../dough-execute-plan/scripts/publication-git.mjs";
import { preserved } from "../../dough-land/scripts/retirement-checks.mjs";
import { isAncestor } from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import {
  checkPlannedCompletion,
  runClosureCheckCommand,
  runRetirementCommand,
} from "./dough-land-command-fixtures.mjs";

export {
  runClosureCheckCommand,
  runRetirementCommand,
} from "./dough-land-command-fixtures.mjs";

// The reviewed worktree holds a committed seed draft plus uncommitted edits: a
// changed tracked file and a new untracked plan.
export function planReviewedEdits(worktree) {
  writeFileSync(
    join(worktree, "seed-draft.md"),
    "SEED-1: refined goal, scope, and key examples\n",
  );
  writeFileSync(join(worktree, "plan-draft.md"), "PLAN-1: two slices\n");
}

// Retirement observed from the repository: the fetched target contains the
// accepted SHA and the retired branch is gone.
export async function assertRetiredFrom(
  repository,
  branch,
  acceptedSha,
  remoteRef,
) {
  await git(repository, "fetch", "-q", remoteRef.split("/")[0]);
  await git(repository, "merge-base", "--is-ancestor", acceptedSha, remoteRef);
  await assert.rejects(
    git(repository, "rev-parse", "--verify", `refs/heads/${branch}`),
  );
}

// Dough Land "Retire the worktree", which preparation's "Close or retain the
// workspace" links, through the installed retirement command, which holds the
// ownership gate. The confirmed-disposition, identity, and
// created-for-this-work facts are supplied by the caller, not derived by
// scanning file content.
export async function closeOrRetainWorkspace({
  preparation,
  preparationBranch,
  confirmedDisposition,
  identity,
  createdForWork,
  repository,
  remote = "origin",
  targetBranch = "main",
}) {
  if (!confirmedDisposition) {
    return preserved(
      "no confirmed disposition (publication unconfirmed, interrupted, or no decision made)",
      preparation,
      preparationBranch,
    );
  }
  const { result } = await runRetirementCommand({
    repository,
    worktree: preparation,
    branch: preparationBranch,
    remote,
    targetRef: `refs/heads/${targetBranch}`,
    identity,
    createdForWork,
  });
  return result;
}

async function topLevel(checkout) {
  try {
    return (await git(checkout, "rev-parse", "--show-toplevel")).stdout.trim();
  } catch {
    // An unusable default checkout path is not the worktree being landed.
    return null;
  }
}

// Git mechanics for the Dough Land sequence (not guidance-following): resolve
// the worktree, its management context, and the target; commit everything in
// the worktree; publish through the shared publisher; attempt the shared
// optional default-checkout refresh; then retire when the caller gate holds.
// A resolved executionPlan is checked before staging; this model does not
// discover execution identity or judge planless completion. With no default checkout the
// refresh is not applicable. A rerun starts from real Git state: nothing to
// commit creates no commit, and a tip the fetched target already contains is
// not pushed again. Every stop keeps all resources and names the unfinished
// step. `beforePush` lets a test race another writer against the push;
// `onFetchedTarget` is a calling skill's own check on each fetched target tip.
export async function landWorktree({
  worktree,
  branch,
  defaultCheckout,
  remote = "origin",
  target = "refs/heads/main",
  identity = undefined,
  createdForWork = true,
  message = "Land reviewed worktree changes",
  beforePush,
  onFetchedTarget = undefined,
  executionPlan = undefined,
  retirementAuthorized = true,
}) {
  const notDone = { refresh: "not-attempted", cleanup: "not-performed" };
  if (!worktree || !branch) {
    return { stopped: "missing-worktree", commit: "none", ...notDone };
  }
  if (!target || !target.startsWith("refs/heads/")) {
    return { stopped: "missing-target", commit: "none", ...notDone };
  }
  const worktreeTop = await topLevel(worktree);
  if (defaultCheckout && (await topLevel(defaultCheckout)) === worktreeTop) {
    return { stopped: "default-checkout", commit: "none", ...notDone };
  }
  const repository = await managementContext(worktree);
  const operation = await ongoingOperation(worktree);
  if (operation) {
    return {
      stopped: "unfinished-operation",
      operation,
      commit: "none",
      ...notDone,
    };
  }

  // Execution identity and the selected plan are caller-resolved facts, not a
  // Taken-membership classifier. Invoke the same read-only production checker
  // the guidance calls before staging, including already-accepted reruns.
  if (executionPlan) {
    const completion = await checkPlannedCompletion(executionPlan);
    if (!completion.ok) {
      return {
        stopped: "execution-completion",
        completion,
        commit: "none",
        ...notDone,
      };
    }
  }

  let commit = "nothing-to-commit";
  if ((await git(worktree, "status", "--porcelain")).stdout !== "") {
    await git(worktree, "add", "-A");
    await git(worktree, "commit", "-m", message);
    commit = "created";
  }

  const targetBranch = target.slice("refs/heads/".length);
  await git(worktree, "fetch", remote);
  const remoteRef = `${remote}/${targetBranch}`;
  const tip = await revParse(worktree, branch);
  let publication;
  if (await isAncestor(worktree, tip, remoteRef)) {
    publication = { ok: true, publication: "already-accepted", pushed: false };
  } else {
    const base = (
      await git(worktree, "merge-base", branch, remoteRef)
    ).stdout.trim();
    publication = await publishExecutionIncrement({
      workspace: worktree,
      branch,
      previouslyPublishedBase: base,
      targetRef: target,
      remote,
      validate: () => true,
      beforePush,
      onFetchedTarget: async (context) => {
        const { result } = await runClosureCheckCommand({
          checkout: worktree,
          remote,
          targetRef: target,
        });
        if (!result.ok) {
          return {
            status: result.status,
            fields: { ownership: result.ownership, error: result.error },
          };
        }
        return onFetchedTarget?.(context);
      },
    });
    if (!publication.ok) {
      return { stopped: "publish", commit, publication, ...notDone };
    }
    publication = { ...publication, pushed: true };
  }

  const refresh = await refreshDefaultCheckout({
    checkout: defaultCheckout,
    remote,
    integrationBranch: targetBranch,
  });
  const cleanup = await closeOrRetainWorkspace({
    preparation: worktree,
    preparationBranch: branch,
    confirmedDisposition: retirementAuthorized,
    identity,
    createdForWork,
    repository,
    remote,
    targetBranch,
  });
  return { stopped: null, commit, publication, refresh, cleanup, repository };
}
