// Wrap-up's cleanup gates (confirmed completion receipt, no checkout-bound
// observer, remote execution branch; Trunk Mode passes none) around Dough
// Land's retirement core, whose work-scoped ownership gate takes the caller's
// identity and created-for-this-work fact. No default checkout is needed.
import {
  git,
  lsRemoteSha,
} from "../../dough-execute-plan/scripts/publication-git.mjs";
import {
  canonical,
  isAncestor,
  preserved,
  retireWorktree,
  trunkTarget,
  unverifiedRemoval,
} from "../../dough-land/scripts/worktree-retirement.mjs";

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

export async function removeExecutionResources({
  repository,
  execution,
  branch,
  observer,
  identity,
  createdForWork,
  closureShas,
  remoteBranch,
  remote = "origin",
  targetRef = trunkTarget,
}) {
  if (hostsThisWorktree(observer, execution)) {
    return preserved("active checkout-bound observer", execution, branch);
  }
  const remoteExecutionBranch =
    typeof remoteBranch === "string" && remoteBranch !== "" ? remoteBranch : "";
  const remoteRef = `refs/heads/${remoteExecutionBranch}`;
  const shas = Array.isArray(closureShas) ? closureShas : [];
  let remoteTip = "";
  const result = await retireWorktree({
    repository,
    worktree: execution,
    branch,
    remote,
    targetRef,
    identity,
    createdForWork,
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
      { worktree: result.worktree, branch: result.branch },
    );
  }
  return result;
}
