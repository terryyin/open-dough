// Gap-or-summary read of one comparison endpoint proof before a scope path
// is classified (`./ciScopeComparisonTiming.ts`,
// `./ciScopeComparisonCounts.ts`): checking, no-build and unavailable share
// the same kinds for timing and counted-results wording.

import type { CiProofEntry } from "./ciProof.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

export type EndpointProofRead =
  | { readonly kind: "checking" }
  | { readonly kind: "status"; readonly text: string }
  | { readonly kind: "summary"; readonly entries: readonly CiProofEntry[] };

export function endpointProofReadOf(
  proof: ComparisonEndpointProof,
): EndpointProofRead {
  if (proof.kind === "checking") return { kind: "checking" };
  if (proof.kind === "no-build")
    return { kind: "status", text: proof.explanation };
  if (proof.kind === "unavailable") return { kind: "status", text: proof.line };
  return { kind: "summary", entries: proof.entries };
}
