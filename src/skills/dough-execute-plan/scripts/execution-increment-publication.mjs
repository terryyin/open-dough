// Git mechanics for one validated execution increment or owned repair.
// The caller supplies the owned workspace, the owned unpublished suffix,
// the authorized remote target, and how the accepted result is registered.
// This pushes only that target. Stash, checkout refresh, and observer startup
// stay with their own owners. Managed observation belongs to
// execution-increment-delivery.mjs. Installed guidance is the agent's contract.
import {
  git,
  lsRemoteSha,
  originTrackingRef,
  pushExactRef,
  revParse,
} from "./publication-git.mjs";

async function fetchedTarget(workspace, targetRef, remote = "origin") {
  try {
    return await revParse(workspace, originTrackingRef(targetRef, remote));
  } catch (error) {
    const text = `${error.stderr ?? ""}\n${error.message ?? ""}`;
    if (
      error.code === 128 ||
      /unknown revision|Needed a single revision|ambiguous argument/.test(text)
    ) {
      return null;
    }
    throw error;
  }
}

export async function publishExecutionIncrement({
  workspace,
  branch,
  previouslyPublishedBase,
  targetRef,
  register,
  remote = "origin",
}) {
  await git(workspace, "fetch", remote);
  const remoteTip = await fetchedTarget(workspace, targetRef, remote);
  const preRebaseSha = await revParse(workspace, branch);
  let candidate = preRebaseSha;
  if (remoteTip && remoteTip !== previouslyPublishedBase) {
    await git(
      workspace,
      "rebase",
      "--onto",
      remoteTip,
      previouslyPublishedBase,
      branch,
    );
    candidate = await revParse(workspace, branch);
    if (candidate === preRebaseSha) {
      throw new Error("rebase left the pre-rebase SHA as the candidate");
    }
  }
  await pushExactRef(workspace, candidate, remote, targetRef);
  await git(workspace, "fetch", remote);
  const remoteUrl = (
    await git(workspace, "remote", "get-url", remote)
  ).stdout.trim();
  const acceptedTip = await lsRemoteSha(remoteUrl, targetRef);
  if (acceptedTip !== candidate) {
    throw new Error("remote did not accept the candidate");
  }
  const receipt = { sha: candidate, target: targetRef };
  register?.(receipt);
  return { ok: true, receipt, preRebaseSha };
}
