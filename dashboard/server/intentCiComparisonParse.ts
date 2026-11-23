// Query-shape parsing for Intent's CI comparison read
// (`./intentCiComparisonRead.ts`): one story identity and an optional
// pair of commit IDs, refused before any `gh` or Git call when malformed.

import type { CiComparisonRange } from "../src/selectedCiComparison.ts";
import { intentReadMixedParameters } from "./intentReadParameters.ts";
import {
  isPinnedRevision,
  refused,
  type RefusedParameters,
} from "./refusedParameters.ts";

export type IntentCiComparisonRead = {
  readonly kind: "intent-ci-comparison";
  readonly identity: string;
  readonly range?: CiComparisonRange;
};

const comparisonRefusal =
  "A CI comparison read names only the Intent request and one story identity.";
const rangeRefusal =
  "A selected CI comparison needs one start and one end commit ID.";

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
  const read = { kind: "intent-ci-comparison", identity } as const;
  if (!params.has("start") && !params.has("end")) return read;
  const start = params.get("start");
  const end = params.get("end");
  if (
    params.getAll("start").length !== 1 ||
    params.getAll("end").length !== 1 ||
    !isPinnedRevision(start) ||
    !isPinnedRevision(end)
  )
    return refused(rangeRefusal);
  return { ...read, range: { start, end } };
}
