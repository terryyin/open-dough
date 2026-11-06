// Query-shape parsing for Intent's CI comparison read
// (`./intentCiComparisonRead.ts`): one story identity, refused before any
// `gh` or Git call when malformed.

import { intentReadMixedParameters } from "./intentReadParameters.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";

export type IntentCiComparisonRead = {
  readonly kind: "intent-ci-comparison";
  readonly identity: string;
};

const comparisonRefusal =
  "A CI comparison read names only the Intent request and one story identity.";

// Same bound as a launch request's work identity (`../src/launchRequest.ts`).
const identityLimit = 200;

export function parseIntentCiComparisonRead(
  params: URLSearchParams,
): IntentCiComparisonRead | RefusedParameters | undefined {
  if (params.get("intent") !== "ci-comparison") return undefined;
  if (
    params.getAll("intent").length !== 1 ||
    params.getAll("identity").length !== 1 ||
    params.get("revision") !== null ||
    params.get("judged") !== null ||
    intentReadMixedParameters.some((name) => params.get(name) !== null)
  ) {
    return refused(comparisonRefusal);
  }
  const identity = params.get("identity");
  if (
    identity === null ||
    identity.length < 1 ||
    identity.length > identityLimit ||
    /[\r\n]/.test(identity)
  ) {
    return refused(comparisonRefusal);
  }
  return { kind: "intent-ci-comparison", identity };
}
