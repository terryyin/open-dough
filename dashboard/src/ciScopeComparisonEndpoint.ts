// Gap-or-summary read of one comparison endpoint proof before a scope path
// is classified per unit (`./ciScopeComparisonUnits.ts`), and the kinds that
// stand in for a scope's figures at that endpoint, shared by counts and
// timing (`./ciScopeComparisonCounts.ts`, `./ciScopeComparisonTiming.ts`)
// and their wording: checking, a no-build or unavailable status, the scope
// absent or without a file breakdown, and, in one compared row, none of the
// scope's results in the row's units.

import type { CiProofEntry } from "./ciProof.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

type EndpointReadGap =
  | { readonly kind: "checking" }
  | { readonly kind: "status"; readonly text: string };

export type EndpointProofRead =
  | EndpointReadGap
  | { readonly kind: "summary"; readonly entries: readonly CiProofEntry[] };

// What stands in for a scope's figures at an endpoint: its read gap, the
// scope absent from its summary, or no file breakdown to say what it holds.
export type ScopeEndpointGap =
  | EndpointReadGap
  | { readonly kind: "absent" }
  | { readonly kind: "no-breakdown" };

// What stands in for a compared row's figures at an endpoint: the scope's
// gap, or the scope's results there in none of the row's units.
export type RowEndpointGap = ScopeEndpointGap | { readonly kind: "unreported" };

export function endpointProofReadOf(
  proof: ComparisonEndpointProof,
): EndpointProofRead {
  if (proof.kind === "checking") return { kind: "checking" };
  if (proof.kind === "no-build")
    return { kind: "status", text: proof.explanation };
  if (proof.kind === "unavailable") return { kind: "status", text: proof.line };
  return { kind: "summary", entries: proof.entries };
}
