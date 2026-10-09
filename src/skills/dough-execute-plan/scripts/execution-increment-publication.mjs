// Git mechanics for one validated execution increment or owned repair.
// The caller supplies the owned workspace, the owned unpublished suffix,
// the authorized remote target, and how the accepted result is registered.
// A previously published base that no fetched remote ref holds stops at once.
// `onFetchedTarget` may stop on each fetched target tip before anything is
// rewritten. When another writer advances the target, only that owned suffix
// is reconciled; a changed candidate requires applicable proof before any
// push. One reconciliation retry recovers a racing push; conflict or a second
// rejection preserves recoverable Git state. A fetch, push, or remote-tip read
// that outlasts the transport bound stops with the attempt's facts and
// rewrites nothing. Stash, checkout refresh, and observer startup stay with
// their own owners, managed observation with execution-increment-delivery.mjs.
// The owned suffix's reconciliation and proof gate live in
// execution-increment-reconciliation.mjs. Installed guidance is the agent's
// contract.
import { fetchedTargetStop, stopped } from "./applicable-candidate-proof.mjs";
import { reconcileAndRequireProof } from "./execution-increment-reconciliation.mjs";
import { defaultBacklogPath } from "./owned-suffix-reconciliation.mjs";
import {
  fetchedTarget,
  git,
  inspectDefaultCheckoutMaintenance,
  lsRemoteSha,
  remoteHolds,
  revParse,
  tryPushExactRef,
} from "./publication-git.mjs";

export async function publishExecutionIncrement({
  workspace,
  branch,
  previouslyPublishedBase,
  targetRef,
  register,
  remote = "origin",
  validate,
  validatedCandidate,
  defaultCheckout,
  backlogPath = defaultBacklogPath,
  beforeRetryPush,
  beforePush,
  onFetchedTarget,
}) {
  const preRebaseSha = await revParse(workspace, branch);
  let candidate = preRebaseSha;
  let suffixBase = previouslyPublishedBase;
  let reconciliations = 0;
  let remoteTip = null;
  let pushIssued = false;
  // Runs one remote transport step. A step that outlasts the bound becomes a
  // `transport-timeout` stop naming that stage with this attempt's facts;
  // other failures throw as before.
  const transport = async (stage, operation) => {
    try {
      return { value: await operation() };
    } catch (error) {
      if (error?.code !== "transport-timeout") throw error;
      return {
        stop: stopped("transport-timeout", {
          stage,
          pushIssued,
          boundMs: error.boundMs,
          remote,
          target: targetRef,
          candidate,
          preRebaseSha,
          previouslyPublishedBase,
          suffixBase,
          remoteTip,
          reconciliations,
        }),
      };
    }
  };
  const fetchTarget = async (stage) => {
    const fetched = await transport(stage, () =>
      git(workspace, "fetch", remote),
    );
    if (!fetched.stop) {
      remoteTip = await fetchedTarget(workspace, targetRef, remote);
    }
    return fetched;
  };
  const push = async (stage) => {
    pushIssued = true;
    return transport(stage, () =>
      tryPushExactRef(workspace, candidate, remote, targetRef),
    );
  };
  const readTip = (stage) =>
    transport(stage, () => lsRemoteSha(remote, targetRef, workspace));

  const fetched = await fetchTarget("fetch");
  if (fetched.stop) return fetched.stop;
  // Commits under a base the remote does not hold are not this suffix: pushing
  // would publish them and reconciling would rebase them off the branch.
  if (!(await remoteHolds(workspace, previouslyPublishedBase, remote))) {
    return stopped("unpublished-base", {
      candidate: preRebaseSha,
      preRebaseSha,
      remoteTip,
      previouslyPublishedBase,
    });
  }
  const held = (attempt) =>
    fetchedTargetStop(onFetchedTarget, attempt, {
      candidate,
      preRebaseSha,
      remoteTip,
      previouslyPublishedBase,
      suffixBase,
      reconciliations,
    });
  // Reconciles, advancing this attempt's state, or returns the stop.
  const reconcileOnto = async (onto, upstream, retry = false) => {
    const rewritten = await reconcileAndRequireProof({
      workspace,
      onto,
      upstream,
      branch,
      backlogPath,
      candidateFallback: candidate,
      preRebaseSha,
      previouslyPublishedBase,
      priorSuffixBase: suffixBase,
      validate,
      validatedCandidate,
      reconciliations,
      retry,
    });
    if (!rewritten.ok) return rewritten.result;
    ({ candidate, suffixBase, reconciliations } = rewritten);
    return null;
  };
  if (validatedCandidate && preRebaseSha !== validatedCandidate) {
    return stopped("candidate-mismatch", {
      candidate: preRebaseSha,
      validatedCandidate,
      preRebaseSha,
      remoteTip,
      previouslyPublishedBase,
    });
  }
  if (validatedCandidate) {
    candidate = validatedCandidate;
  }

  const heldFirst = await held(0);
  if (heldFirst) return heldFirst;
  // Validated resume supplies previouslyPublishedBase as the tip the candidate
  // already extends. Only a further remote advance rewrites again.
  if (remoteTip && remoteTip !== previouslyPublishedBase) {
    const stop = await reconcileOnto(remoteTip, previouslyPublishedBase);
    if (stop) return stop;
  }

  if (beforePush) {
    await beforePush({ attempt: 0, candidate });
  }
  let pushed = await push("push");
  if (pushed.stop) return pushed.stop;
  if (pushed.value.rejected) {
    const refetched = await fetchTarget("fetch-after-rejection");
    if (refetched.stop) return refetched.stop;
    const heldRetry = await held(1);
    if (heldRetry) return heldRetry;
    const stop = await reconcileOnto(remoteTip, suffixBase, true);
    if (stop) return stop;

    if (beforeRetryPush) {
      await beforeRetryPush();
    }
    if (beforePush) {
      await beforePush({ attempt: 1, candidate });
    }
    pushed = await push("retry-push");
    if (pushed.stop) return pushed.stop;
    if (pushed.value.rejected) {
      const contended = await readTip("contention-tip");
      if (contended.stop) return contended.stop;
      return stopped("persistent-contention", {
        candidate,
        preRebaseSha,
        remoteTip: contended.value,
        previouslyPublishedBase,
        suffixBase,
        reconciliations,
      });
    }
  }

  const confirming = await fetchTarget("confirmation-fetch");
  if (confirming.stop) return confirming.stop;
  const confirmed = await readTip("confirmation-tip");
  if (confirmed.stop) return confirmed.stop;
  const acceptedTip = confirmed.value;
  if (acceptedTip !== candidate) {
    throw new Error("remote did not accept the candidate");
  }
  const receipt = { sha: candidate, target: targetRef };
  register?.(receipt);
  const maintenance = await inspectDefaultCheckoutMaintenance(
    workspace,
    defaultCheckout,
    remote,
    targetRef,
  );
  return {
    ok: true,
    publication: "accepted",
    receipt,
    preRebaseSha,
    remoteTip: acceptedTip,
    suffixBase,
    reconciliations,
    maintenance,
  };
}
