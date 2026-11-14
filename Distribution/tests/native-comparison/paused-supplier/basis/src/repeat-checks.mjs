// The automatic CI repeat for a landed revision, from its receipt and runs.
export function repeatDecision(receipt, runs) {
  if (!receipt.eligible) return { action: "none", label: "Receipt refused" };
  const run = runs.find((candidate) => candidate.id === receipt.runId);
  if (!run) return { action: "none", label: "Run unknown" };
  if (run.conclusion === "success")
    return { action: "none", label: "CI passed" };
  return { action: "none", label: "CI failed" };
}
