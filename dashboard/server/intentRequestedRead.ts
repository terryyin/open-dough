// The Intent reads a request may name for the local authenticated read
// boundary (`./requestedRead.ts`): locations, Test Optimization Candidates,
// CI status (`./intentCiStatusRead.ts`), the CI proof of the run a CI status
// judgment named (`./intentCiProofRead.ts`), or a refusal when `intent` is
// present but unknown. Each known kind parses in its own module.

import {
  parseIntentCandidatesRead,
  type IntentCandidatesRead,
} from "./intentCandidatesRead.ts";
import {
  parseIntentLocationsRead,
  type IntentLocationsRead,
} from "./intentLocationsRead.ts";
import {
  parseIntentCiProofRead,
  type IntentCiProofRead,
} from "./intentCiProofRead.ts";
import {
  parseIntentCiStatusRead,
  type IntentCiStatusRead,
} from "./intentCiStatusRead.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";

export type IntentRequestedRead =
  | IntentLocationsRead
  | IntentCandidatesRead
  | IntentCiStatusRead
  | IntentCiProofRead;

const unknownIntentRefusal =
  "An Intent read names only a pinned revision and a known Intent request.";

// The Intent read a request names, undefined when it names none.
export function parseIntentRequestedRead(
  params: URLSearchParams,
): IntentRequestedRead | RefusedParameters | undefined {
  const locations = parseIntentLocationsRead(params);
  if (locations !== undefined) return locations;
  const candidates = parseIntentCandidatesRead(params);
  if (candidates !== undefined) return candidates;
  const ciStatus = parseIntentCiStatusRead(params);
  if (ciStatus !== undefined) return ciStatus;
  const ciProof = parseIntentCiProofRead(params);
  if (ciProof !== undefined) return ciProof;
  if (params.get("intent") !== null) {
    return refused(unknownIntentRefusal);
  }
  return undefined;
}
