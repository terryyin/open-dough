// How long one proof observation, or a sum of them, took: shared by file Proof
// row cells (`./ProofObservationCells.tsx`) and summary sums
// (`./intentSummaryProofCost.ts`).

// Fractional milliseconds, as Vitest proof records them, read rounded.
export function durationWords(ms: number): string {
  if (Math.round(ms) < 1000) return `${String(Math.round(ms))} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const seconds = Math.round(ms / 1000);
  return `${String(Math.floor(seconds / 60))}m ${String(seconds % 60)}s`;
}
