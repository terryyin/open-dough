import {
  git,
  lsRemoteSha,
  originTrackingRef,
  pushExactRef,
  readTrackingTip,
  tryPushExactRef,
} from "./publication-git.mjs";

// The caller prepares its candidate against each fetched tip, or reports
// a stop or prior acceptance. Fresh publication confirms the live ref exactly.
// Resume supplies a containment check for the fetched confirmation tip.
export async function publishExactCandidate({
  workspace,
  remote,
  targetRef,
  prepareCandidate,
  acceptsFetchedCandidate,
  retryRejected = false,
}) {
  const tracking = originTrackingRef(targetRef, remote);
  let remoteTip = null;
  let pushIssued = false;
  let pushCount = 0;
  let timeout;
  const transport = async (stage, operation) => {
    try {
      return await operation();
    } catch (error) {
      if (error?.code === "transport-timeout") {
        timeout = Object.assign(error, {
          stage,
          remoteTip,
          pushIssued,
          pushCount,
        });
      }
      throw error;
    }
  };
  const fetch = async (stage) => {
    await transport(stage, () => git(workspace, "fetch", remote));
    return readTrackingTip(workspace, tracking);
  };
  const liveTip = (stage) =>
    transport(stage, () => lsRemoteSha(remote, targetRef, workspace));
  const push = retryRejected ? tryPushExactRef : pushExactRef;
  const retries = retryRejected ? 1 : 0;

  try {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      remoteTip = await fetch(attempt ? "fetch-after-rejection" : "fetch");
      const prepared = await prepareCandidate({ attempt, remoteTip });
      if (prepared.stop) return { stop: prepared.stop, pushCount };
      if (prepared.alreadyPublished)
        return { acceptedTip: remoteTip, pushCount };

      pushIssued = true;
      const { candidate } = prepared;
      const pushed = await transport(attempt ? "retry-push" : "push", () =>
        push(workspace, candidate, remote, targetRef),
      );
      if (pushed?.rejected) continue;
      pushCount += 1;
      const tip = acceptsFetchedCandidate
        ? await fetch("confirmation-fetch")
        : await liveTip("confirmation-tip");
      const accepted = acceptsFetchedCandidate
        ? tip && (await acceptsFetchedCandidate(candidate, tip))
        : tip === candidate;
      return { acceptedTip: accepted ? tip : null, pushCount };
    }
    return { contentionTip: await liveTip("contention-tip") };
  } catch (error) {
    if (timeout && error === timeout) return { timeout };
    throw error;
  }
}
