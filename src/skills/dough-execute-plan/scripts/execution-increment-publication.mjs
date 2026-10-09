// Git mechanics for a validated execution increment or owned repair, with its
// owned workspace/suffix, authorized target and acceptance registration.
// A previously published base that no fetched remote ref holds stops at once.
// `onFetchedTarget` may stop on each fetched target tip before anything is
// rewritten. When another writer advances the target, only that owned suffix
// is reconciled; a changed candidate requires applicable proof before any
// push. `beforePush` retains candidate and suffixBase together before each
// push, including after reconciliation. One retry recovers a racing push;
// conflict or a second rejection preserves recoverable Git state. Stash,
// checkout refresh and observer startup stay with their owners; managed
// observation belongs to execution-increment-delivery.mjs.
import { reconcileAndRequireProof } from "./reconciled-candidate-proof.mjs";
import {
  retainLandingComparison,
  captureAcceptedLanding,
} from "./dashboard-landing.mjs";
import { fetchedTargetStop, stopped } from "./applicable-candidate-proof.mjs";
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
  landingContext,
  onFetchedTarget,
}) {
  await git(workspace, "fetch", remote);
  let remoteTip = await fetchedTarget(workspace, targetRef, remote);
  const preRebaseSha = await revParse(workspace, branch);
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
  let candidate = preRebaseSha;
  let suffixBase = previouslyPublishedBase;
  let reconciliations = 0;
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

  const preparePush = async (attempt) => {
    const comparison = { candidate, suffixBase };
    if (landingContext)
      await retainLandingComparison(landingContext, comparison, {
        remote,
        targetRef,
      });
    await beforePush?.({ attempt, ...comparison });
  };
  await preparePush(0);
  let push = await tryPushExactRef(workspace, candidate, remote, targetRef);
  if (push.rejected) {
    await git(workspace, "fetch", remote);
    remoteTip = await fetchedTarget(workspace, targetRef, remote);
    const heldRetry = await held(1);
    if (heldRetry) return heldRetry;
    const stop = await reconcileOnto(remoteTip, suffixBase, true);
    if (stop) return stop;

    if (beforeRetryPush) {
      await beforeRetryPush();
    }
    await preparePush(1);
    push = await tryPushExactRef(workspace, candidate, remote, targetRef);
    if (push.rejected) {
      return stopped("persistent-contention", {
        candidate,
        preRebaseSha,
        remoteTip: await lsRemoteSha(remote, targetRef, workspace),
        previouslyPublishedBase,
        suffixBase,
        reconciliations,
      });
    }
  }

  await git(workspace, "fetch", remote);
  const acceptedTip = await lsRemoteSha(remote, targetRef, workspace);
  if (acceptedTip !== candidate) {
    throw new Error("remote did not accept the candidate");
  }
  const receipt = { sha: candidate, target: targetRef };
  const landing = landingContext
    ? await captureAcceptedLanding(landingContext, {
        base: suffixBase,
        revision: candidate,
        remote,
        target: targetRef,
      })
    : undefined;
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
    ...(landing === undefined ? {} : { landing }),
    receipt,
    preRebaseSha,
    remoteTip: acceptedTip,
    suffixBase,
    reconciliations,
    maintenance,
  };
}
