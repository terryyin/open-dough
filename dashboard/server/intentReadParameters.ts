// Shared Intent read parameter rules for the local authenticated read
// boundary (`./requestedRead.ts`): every Intent kind names only a pinned
// revision and refuses the same mixed companions. Kind-specific parsers
// (`./intentLocationsRead.ts`, `./intentCandidatesRead.ts`) supply the
// `intent` value and refusal text.

import { listedReadParameters } from "./listedReadParameters.ts";
import {
  isPinnedRevision,
  refused,
  unpinnedRevision,
  type RefusedParameters,
} from "./refusedParameters.ts";

export const intentReadMixedParameters = [
  "path",
  "since",
  "committed",
  "file",
  "branch",
  "head",
  ...listedReadParameters.filter((name) => name !== "intent"),
];

// One pinned Intent kind, undefined when the request names no Intent value
// or a different Intent value.
export function parsePinnedIntentRead<K extends string>(
  params: URLSearchParams,
  intentValue: string,
  kind: K,
  refusal: string,
):
  | { readonly kind: K; readonly revision: string }
  | RefusedParameters
  | undefined {
  const intent = params.get("intent");
  if (intent === null || intent !== intentValue) return undefined;
  if (
    params.getAll("intent").length !== 1 ||
    intentReadMixedParameters.some((name) => params.get(name) !== null)
  ) {
    return refused(refusal);
  }
  const revision = params.get("revision");
  if (!isPinnedRevision(revision)) {
    return unpinnedRevision;
  }
  return { kind, revision };
}
