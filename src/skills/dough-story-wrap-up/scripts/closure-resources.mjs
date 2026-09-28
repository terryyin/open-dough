// Git mechanics for Dough Land "Retire the worktree" (`retireWorktree`), which
// wrap-up's cleanup runs behind its own gates (confirmed completion receipt, no
// checkout-bound observer, remote execution branch; Trunk Mode passes none).
// No default checkout is needed.
import { existsSync, realpathSync } from "node:fs";
import {
  git,
  lsRemoteSha,
  originTrackingRef,
  resolveManagementContext,
} from "../../dough-execute-plan/scripts/publication-git.mjs";

export const trunkTarget = "refs/heads/main";

function canonical(path) {
  return existsSync(path) ? realpathSync(path) : path;
}

// True when the Git command succeeds, false when it answers no (exit 1).
async function succeeds(repo, ...args) {
  try {
    await git(repo, ...args);
    return true;
  } catch (error) {
    if (error.code === 1) {
      return false;
    }
    throw error;
  }
}

export function isAncestor(repo, ancestor, descendant) {
  return succeeds(repo, "merge-base", "--is-ancestor", ancestor, descendant);
}

function refExists(repo, ref) {
  return succeeds(repo, "show-ref", "--verify", "--quiet", ref);
}

export async function findWorktree(repository, execution) {
  const { stdout } = await git(repository, "worktree", "list", "--porcelain");
  const wanted = canonical(execution);
  const blocks = stdout.split("\n\n").filter((block) => block.trim() !== "");
  for (const block of blocks) {
    const lines = block.split("\n");
    const pathLine = lines.find((line) => line.startsWith("worktree "));
    const path = pathLine?.slice("worktree ".length);
    if (!path || canonical(path) !== wanted) {
      continue;
    }
    const branchLine = lines.find((line) => line.startsWith("branch "));
    return {
      path,
      branch: branchLine ? branchLine.slice("branch refs/heads/".length) : null,
    };
  }
  return null;
}

export function preserved(reason, execution, branch) {
  return {
    removed: false,
    partial: false,
    worktree: "preserved",
    branch: "preserved",
    reason,
    path: execution,
    branchName: branch,
  };
}

function unverifiedRemoval(
  reason,
  execution,
  branch,
  worktree = "preserved",
  branchResult = "preserved",
) {
  return {
    ...preserved(reason, execution, branch),
    partial: true,
    worktree,
    branch: branchResult,
  };
}

function hostsThisWorktree(observer, execution) {
  return (
    Boolean(observer?.bound && !observer.stopped) &&
    (!observer.checkout ||
      canonical(observer.checkout) === canonical(execution))
  );
}

function bothRegistered(observer, closureShas, targetRef) {
  return (
    observer?.bound === true &&
    observer.stopped === true &&
    closureShas.every((sha) =>
      observer.receipts.some(
        (receipt) => receipt.sha === sha && receipt.target === targetRef,
      ),
    )
  );
}

// From the management context: keep a dirty, ambiguous, or other checkout and
// a branch the fetched target lacks; else remove the worktree and safely delete
// the branch, verified, accepting either already absent on a rerun. Once
// containment is known, `holdReason` may name a caller's own obligation that
// keeps both.
export async function retireWorktree({
  repository,
  execution,
  branch,
  remote = "origin",
  targetRef = trunkTarget,
  holdReason,
}) {
  const management = await resolveManagementContext(repository, execution);
  if (!management) {
    return preserved("management context unavailable", execution, branch);
  }
  const listed = await findWorktree(management, execution);
  if ((!listed && existsSync(execution)) || listed?.branch === null) {
    return preserved("ambiguous checkout", execution, branch);
  }
  if (listed && listed.branch !== branch) {
    return preserved("another workspace", execution, branch);
  }
  if (listed) {
    const status = (await git(execution, "status", "--porcelain")).stdout;
    if (status !== "") {
      return preserved("dirty checkout", execution, branch);
    }
  }
  await git(management, "fetch", remote);
  const tracking = originTrackingRef(targetRef, remote);
  const branchRef = `refs/heads/${branch}`;
  const branchPresent = await refExists(management, branchRef);
  const contained =
    !branchPresent || (await isAncestor(management, branch, tracking));
  const held =
    (await holdReason?.({ management, tracking, contained })) ||
    (!contained && "unique unpublished work");
  if (held) {
    return preserved(held, execution, branch);
  }
  const worktree = listed ? "removed" : "already-absent";
  if (listed) {
    await git(management, "worktree", "remove", execution);
    if (await findWorktree(management, execution)) {
      return unverifiedRemoval(
        "worktree removal was not verified",
        execution,
        branch,
      );
    }
  }
  if (branchPresent) {
    // `git branch -d` treats a branch as merged when its tip is in its
    // upstream, so point the upstream at the fetched target. Never force.
    await git(management, "branch", `--set-upstream-to=${tracking}`, branch);
    await git(management, "branch", "-d", branch);
    if (await refExists(management, branchRef)) {
      return unverifiedRemoval(
        "local branch removal was not verified",
        execution,
        branch,
        worktree,
      );
    }
  }
  return {
    removed: true,
    partial: false,
    worktree,
    branch: branchPresent ? "removed" : "already-absent",
    reason: null,
    repository: management,
  };
}

export async function removeExecutionResources({
  repository,
  execution,
  branch,
  observer,
  sessionOwned,
  closureShas,
  remoteBranch,
  remote = "origin",
  targetRef = trunkTarget,
}) {
  if (hostsThisWorktree(observer, execution)) {
    return preserved("active checkout-bound observer", execution, branch);
  }
  if (sessionOwned !== true) {
    return preserved("another workspace", execution, branch);
  }
  const remoteExecutionBranch =
    typeof remoteBranch === "string" && remoteBranch !== "" ? remoteBranch : "";
  const remoteRef = `refs/heads/${remoteExecutionBranch}`;
  const shas = Array.isArray(closureShas) ? closureShas : [];
  let remoteTip = "";
  const result = await retireWorktree({
    repository,
    execution,
    branch,
    remote,
    targetRef,
    holdReason: async ({ management, tracking, contained }) => {
      remoteTip = remoteExecutionBranch
        ? await lsRemoteSha(remote, remoteRef, management)
        : "";
      if (remoteTip && !(await isAncestor(management, remoteTip, tracking))) {
        return "remote execution tip is not integrated";
      }
      let published =
        (remoteExecutionBranch ? shas.length >= 1 : shas.length === 2) &&
        shas.every((sha) => typeof sha === "string" && sha !== "");
      for (const sha of shas) {
        published &&= await isAncestor(management, sha, tracking);
      }
      if (!published || !contained) {
        return "unique unpublished work";
      }
      return bothRegistered(observer, shas, targetRef)
        ? null
        : "observer obligation unfinished";
    },
  });
  if (!result.removed || !remoteTip) {
    return result;
  }
  const management = result.repository;
  await git(management, "push", remote, "--delete", remoteExecutionBranch);
  if (await lsRemoteSha(remote, remoteRef, management)) {
    return unverifiedRemoval(
      "remote branch removal was not verified",
      execution,
      branch,
      result.worktree,
      result.branch,
    );
  }
  return result;
}
