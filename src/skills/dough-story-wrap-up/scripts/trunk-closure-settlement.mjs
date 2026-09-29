// Settles the final closure for Trunk Mode `finish`. A final closure the
// target already holds is recognized through resumeInterruptedPublication
// without a second push, on the matching observer that covers it, live or
// already ended, so completion can be reused or repeated. An unpublished one
// is published once through managed delivery, rebased when the target moved.
// Once the execution worktree is gone, only an accepted closure is settled,
// from the recorded management context and the observer's checkout path.
import { existsSync, realpathSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import {
  isLiveMatchingMailbox,
  listMatchingMailboxes,
} from "../../dough-execute-plan/scripts/ci-mailbox-match.mjs";
import { listRegisteredRevisions } from "../../dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs";
import { deliverManagedExecutionIncrement } from "../../dough-execute-plan/scripts/execution-increment-delivery.mjs";
import { observerAdapter } from "../../dough-execute-plan/scripts/execution-increment-resume.mjs";
import { targetBranchName } from "../../dough-execute-plan/scripts/publication-git.mjs";
import { resumeInterruptedPublication } from "../../dough-execute-plan/scripts/publication-resume.mjs";
import { isAncestor } from "../../dough-land/scripts/worktree-retirement.mjs";

const publicationRecoveries = {
  conflict:
    "resolve the rebase stopped in the worktree under Resolve a publication rebase conflict, then rerun finish with the rebased tip as --final and the fetched target tip it extends as --previously-published-base",
  "candidate-mismatch":
    "the branch tip is not --final; commit the final closure or name the branch tip as --final, then rerun finish",
};

// The canonical checkout path an observer was started for, also after that
// worktree was removed: its parent still resolves as it did then.
export function observerRoot(workspace) {
  return existsSync(workspace)
    ? realpathSync(workspace)
    : join(realpathSync(dirname(workspace)), basename(workspace));
}

// The one matching mailbox that covers `sha`, preferring a live one; else the
// one live matching mailbox, which has yet to register it. Otherwise none.
function closureMailbox({ repo, branch, root, storage, sha }) {
  const matches = listMatchingMailboxes({ repo, branch, root, storage });
  const live = matches.filter((directory) =>
    isLiveMatchingMailbox(directory, { repo, branch, root, storage }),
  );
  const covering = matches.filter((directory) =>
    listRegisteredRevisions(directory).includes(sha.toLowerCase()),
  );
  const chosen = [
    covering.filter((directory) => live.includes(directory)),
    covering,
    covering.length ? [] : live,
  ].find((candidates) => candidates.length > 0);
  if (chosen?.length === 1) return { directory: chosen[0] };
  return {
    reason: chosen
      ? "ambiguous matching observers for the final closure"
      : "no matching observer covers the final closure",
  };
}

// Recognizes the accepted final closure without pushing, registers it on a
// live matching observer that lacks it, and reports that observer.
async function resumeAcceptedClosure({
  inspection,
  final,
  targetRef,
  remote,
  repo,
  root,
  storage,
}) {
  const found = closureMailbox({
    repo,
    branch: targetBranchName(targetRef),
    root,
    storage,
    sha: final,
  });
  const resumed = await resumeInterruptedPublication({
    ownedWorkspace: inspection,
    candidateSha: final,
    publishedRevisions: [final],
    observer: found.directory
      ? observerAdapter(found.directory, targetRef)
      : null,
    targetRef,
    remote,
  });
  return {
    acceptedSha: final,
    pushCount: resumed.pushCount,
    observation: found.directory
      ? { state: "recovered", directory: found.directory, reused: true }
      : { state: "unobserved", pendingCi: "unobserved", reason: found.reason },
    startReceipt: null,
  };
}

// Closure commits carry records, not behavior proof, so a non-conflicting
// rebase onto a moved target invalidates no proof: the rebased closure is
// published once.
async function publishFinalClosure(request) {
  const delivered = await deliverManagedExecutionIncrement({
    ...request,
    validatedCandidate: request.final,
    validate: async () => ({ ok: true }),
  });
  const observation = delivered.observation;
  const startReceipt = delivered.startReceipt ?? null;
  if (!delivered.ok) {
    return {
      stopped: delivered.status === "conflict" ? "conflict" : "publish",
      publication: delivered.publication,
      status: delivered.status,
      candidate: delivered.candidate ?? null,
      remoteTip: delivered.remoteTip ?? null,
      error: delivered.error,
      recovery:
        publicationRecoveries[delivered.status] ??
        `publication stopped with ${delivered.status}; recover it under Resume an interrupted publication, then rerun finish`,
      observation,
      startReceipt,
    };
  }
  return {
    acceptedSha: delivered.receipt.sha,
    pushCount: 1,
    observation,
    startReceipt,
  };
}

// Returns the accepted final closure with its observer, or `stopped` naming
// the unfinished step with nothing pushed or retired.
export async function settleFinalClosure(request) {
  const { workspace, inspection, tracking, final } = request;
  if (await isAncestor(inspection, final, tracking)) {
    return resumeAcceptedClosure(request);
  }
  if (inspection !== workspace) {
    return {
      stopped: "context",
      publication: "not-attempted",
      reason:
        "execution worktree is absent before the final closure is accepted",
      recovery:
        "report the unpublished final closure as the gap; nothing can publish it without its worktree",
    };
  }
  return publishFinalClosure(request);
}
