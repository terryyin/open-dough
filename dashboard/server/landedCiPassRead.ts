import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ListedRun } from "./baseCiNearest.ts";
import type { RevisionCiLookup } from "./baseCiRevisionNearest.ts";
import type { RevisionCiProviders } from "./baseCiRevisionLookupSource.ts";
import type { readCiProofArtifact } from "./ciProofArtifact.ts";
import {
  comparisonBuildSource,
  type ComparisonBuildSource,
} from "./comparisonBuildSource.ts";
import { lookupContext, workflowOf } from "./intentCiComparisonSlots.ts";

// One project's CI as a pass reads it: the Landed rule's lookup over the
// project's own CI read, with each revision's runs listed once in the pass,
// or that the CI could not be read.
export type PassRead =
  | { readonly kind: "unread" }
  | {
      readonly kind: "read";
      readonly builds: ComparisonBuildSource;
    };

export function landedCiReadSignal(stopped: AbortSignal): AbortSignal {
  return AbortSignal.any([stopped, AbortSignal.timeout(readWaitLimitMs)]);
}

// The lookup with each revision's runs listed once.
function listingOnce(lookup: RevisionCiLookup): RevisionCiLookup {
  const listed = new Map<string, Promise<readonly ListedRun[]>>();
  return {
    ...lookup,
    listRunsAt: (sha) => {
      const known = listed.get(sha);
      if (known !== undefined) return known;
      const runs = lookup.listRunsAt(sha);
      listed.set(sha, runs);
      return runs;
    },
  };
}

// The project's CI read for one pass, made when first asked for, so a pass
// that resolves no landing of the project asks its CI nothing.
export function passRead(
  source: PublishedSource,
  checkout: string,
  stopped: AbortSignal,
  {
    providers,
    readArtifact,
  }: {
    providers?: RevisionCiProviders;
    readArtifact?: typeof readCiProofArtifact;
  } = {},
): () => Promise<PassRead> {
  let made: Promise<PassRead> | undefined;
  const make = async (): Promise<PassRead> => {
    const signal = landedCiReadSignal(stopped);
    const evidence = await lookupContext(source, signal, undefined, {
      checkout,
      ...(providers === undefined ? {} : { providers }),
    });
    if ("unavailable" in evidence) return { kind: "unread" };
    const { call, lookupOrGap } = evidence;
    if ("state" in lookupOrGap) return { kind: "unread" };
    return {
      kind: "read",
      builds: comparisonBuildSource(
        listingOnce(lookupOrGap),
        call,
        workflowOf(call),
        {
          repository: source.repository,
          signal,
          ...(readArtifact === undefined ? {} : { read: readArtifact }),
        },
      ),
    };
  };
  return () => {
    made ??= make();
    return made;
  };
}
