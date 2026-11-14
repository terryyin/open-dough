// The automatic CI repeat for a landed revision, from its receipt and runs.
export function repeatDecision(receipt, runs) {
  if (!receipt.eligible) return { action: "none", label: "Receipt refused" };
  const run = runs.find((candidate) => candidate.id === receipt.runId);
  if (!run) return { action: "none", label: "Run unknown" };
  if (run.status === "queued" || run.status === "in_progress") {
    return { action: "wait", label: "CI rerun in progress" };
  }
  if (run.conclusion === "success")
    return { action: "none", label: "CI passed" };
  if (run.attempt < 2) return { action: "rerun", label: "Requesting CI rerun" };
  return { action: "none", label: "CI failed after rerun" };
}
