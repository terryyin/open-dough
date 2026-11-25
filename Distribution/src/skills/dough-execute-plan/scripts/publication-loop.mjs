import {
  git,
  lsRemoteSha,
  originTrackingRef,
  pushExactRef,
  readTrackingTip,
  tryPushExactRef,
} from "./publication-git.mjs";

// The caller prepares its candidate against each fetched tip, or reports
// a stop or prior acceptance. Exact confirmation reads the live ref; resume
// checks containment in the fetched tip. Integration keeps its tracking ref
// current after each answered push, even when both attempts are rejected.
export async function publishExactCandidate({
  workspace,
  remote,
  targetRef,
  prepareCandidate,
  acceptsFetchedCandidate,
  retryRejected = false,
  fetchAfterPush = false,
}) {
  const tracking = originTrackingRef(targetRef, remote);
  let remoteTip = null;
  let pushIssued = false;
  const result = { pushCount: 0, rejectedPushCount: 0, supersededSha: null };
  let timeout;
  const transport = async (stage, operation) => {
    try {
      return await operation();
    } catch (error) {
      if (error?.code === "transport-timeout") {
        timeout = {
          error,
          stage,
          remoteTip,
          pushIssued,
          pushCount: result.pushCount,
        };
      }
      throw error;
    }
  };
  const fetch = (stage) =>
    transport(stage, () => git(workspace, "fetch", remote));
  const liveTip = (stage) =>
    transport(stage, () => lsRemoteSha(remote, targetRef, workspace));
  const push = retryRejected ? tryPushExactRef : pushExactRef;
  const retries = retryRejected ? 1 : 0;

  try {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      await fetch(attempt ? "fetch-after-rejection" : "fetch");
      remoteTip = await readTrackingTip(workspace, tracking);
      const prepared = await prepareCandidate({ attempt, remoteTip });
      if (prepared.stop) return { ...result, stop: prepared.stop };
      if (prepared.alreadyPublished)
        return { ...result, acceptedTip: remoteTip };

      pushIssued = true;
      const { candidate } = prepared;
      const pushed = await transport(attempt ? "retry-push" : "push", () =>
        push(workspace, candidate, remote, targetRef),
      );
      if (pushed?.rejected) {
        result.rejectedPushCount += 1;
        result.supersededSha = candidate;
        continue;
      }
      result.pushCount += 1;
      if (fetchAfterPush || acceptsFetchedCandidate)
        await fetch("confirmation-fetch");
      const tip = acceptsFetchedCandidate
        ? await readTrackingTip(workspace, tracking)
        : await liveTip("confirmation-tip");
      const accepted = acceptsFetchedCandidate
        ? tip && (await acceptsFetchedCandidate(candidate, tip))
        : tip === candidate;
      return { ...result, acceptedTip: accepted ? tip : null };
    }
    if (fetchAfterPush) {
      await fetch("fetch-after-rejection");
      return { ...result, contended: true };
    }
    return {
      ...result,
      contended: true,
      contentionTip: await liveTip("contention-tip"),
    };
  } catch (error) {
    if (timeout && timeout.error === error) return { timeout };
    throw error;
  }
}
