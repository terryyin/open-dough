// Intent's CI wall time history read for the local authenticated read
// boundary (`./authenticatedRead.ts`): `intent=ci-history`, naming nothing
// more. It answers the window of the project's history -- its newest 20
// measured builds as points naming the landings they measure, and its
// landings no build measures as gaps with why (`./landedCiHistoryEntries.ts`)
// -- from this machine's collected landed CI history
// (`./landedCiHistoryStore.ts`) alone and asks no CI, Git or GitHub, so
// opening or refreshing CI status acquires no CI data for it, before or after
// a restart, in whichever dashboard process serves it. Collection is
// `./landedCiCollection.ts`'s. Anything else is refused here.

import { readingCiHistoryOf } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { historyEntries } from "./landedCiHistoryEntries.ts";
import { keptLandedCiHistory } from "./landedCiHistoryStore.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";

export type IntentCiHistoryRead = { readonly kind: "intent-ci-history" };

const historyRefusal =
  "A CI wall time history read names only the Intent request.";

// The CI wall time history read a request names, undefined when it names
// none.
export function parseIntentCiHistoryRead(
  params: URLSearchParams,
): IntentCiHistoryRead | RefusedParameters | undefined {
  if (params.get("intent") !== "ci-history") return undefined;
  if (
    params.getAll("intent").length !== 1 ||
    [...params.keys()].some((name) => name !== "source" && name !== "intent")
  ) {
    return refused(historyRefusal);
  }
  return { kind: "intent-ci-history" };
}

// What a CI wall time history read names as being read.
export function readingIntentCiHistoryOf(source: PublishedSource): string {
  return readingCiHistoryOf(source.repository);
}

export async function performIntentCiHistoryRead(
  source: PublishedSource,
): Promise<Outcome> {
  return answered({
    entries: historyEntries(await keptLandedCiHistory(source.id)),
  });
}
