// Wrap-up's cleanup gates (confirmed completion receipt, no checkout-bound
// observer) around Dough Land's retirement core, which also checks the closure
// revisions' containment, deletes a Story Branch remote execution branch (Trunk
// Mode passes none), and applies the work-scoped ownership gate to the caller's
// identity and created-for-this-work fact. No default checkout is needed.
import {
  canonical,
  preserved,
  retireWorktree,
  trunkTarget,
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
  const shas = Array.isArray(closureShas) ? closureShas : [];
  const named =
    (remoteExecutionBranch ? shas.length >= 1 : shas.length === 2) &&
    shas.every((sha) => typeof sha === "string" && sha !== "");
  return retireWorktree({
    repository,
    worktree: execution,
    branch,
    remote,
    targetRef,
    identity,
    createdForWork,
    remoteBranch: remoteExecutionBranch,
    contained: named ? shas : [],
    holdReason: async () => {
      if (!named) return "unique unpublished work";
      return bothRegistered(observer, shas, targetRef)
        ? null
        : "observer obligation unfinished";
    },
  });
}
