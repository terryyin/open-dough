import {
  ensureApplicableProof,
  proofGateResult,
  stopped,
} from "./applicable-candidate-proof.mjs";
import { reconcileOwnedSuffix } from "./owned-suffix-reconciliation.mjs";
import { revParse } from "./publication-git.mjs";

// Reconcile the owned suffix onto onto, then require applicable proof before
// any push. Shared by the initial remote-advance path and the one retry.
export async function reconcileAndRequireProof({
  workspace,
  onto,
  upstream,
  branch,
  backlogPath,
  candidateFallback,
  preRebaseSha,
  previouslyPublishedBase,
  priorSuffixBase,
  validate,
  validatedCandidate,
  reconciliations,
  retry = false,
}) {
  const replay = await reconcileOwnedSuffix({
    workspace,
    onto,
    upstream,
    branch,
    backlogPath,
  });
  const nextReconciliations = reconciliations + 1;
  if (!replay.ok) {
    return {
      ok: false,
      result: stopped("conflict", {
        candidate: await revParse(workspace, branch).catch(
          () => candidateFallback,
        ),
        preRebaseSha,
        remoteTip: onto,
        previouslyPublishedBase,
        ...(retry ? { suffixBase: priorSuffixBase } : {}),
        reconciliations: nextReconciliations,
        replay,
      }),
    };
  }
  const candidate = await revParse(workspace, branch);
  if (!retry && candidate === preRebaseSha && !validatedCandidate) {
    throw new Error("rebase left the pre-rebase SHA as the candidate");
  }
  // Held proof is judged only after rewrite; a further remote advance needs
  // renewed applicable proof even when a prior validatedCandidate was supplied.
  const gate = await ensureApplicableProof({
    validate,
    candidate,
    context: {
      preRebaseSha,
      remoteTip: onto,
      previouslyPublishedBase,
      suffixBase: onto,
      ...(retry ? { retry: true } : {}),
    },
    proofAlreadyHeld:
      !retry && Boolean(validatedCandidate) && candidate === validatedCandidate,
  });
  if (!gate.ok) {
    return {
      ok: false,
      result: proofGateResult(gate, {
        candidate,
        preRebaseSha,
        remoteTip: onto,
        previouslyPublishedBase,
        suffixBase: onto,
        reconciliations: nextReconciliations,
      }),
    };
  }
  return {
    ok: true,
    candidate,
    suffixBase: onto,
    reconciliations: nextReconciliations,
  };
}
