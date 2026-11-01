// Committed Cucumber proof a Gherkin Intent location declares, read at the
// same pinned revision as its feature files for the Intent locations read
// (`./intentLocationsRead.ts`): one recursive Git tree of the proof
// directory (`./ghTrees.ts`), each `.json` file's text by its blob sha
// (`./pinnedTexts.ts`), and the latest observation of each scenario across
// every file (`../src/cucumberProof.ts`). Rate limits still fail the whole
// read; any other unreadable or malformed proof file leaves the location's
// Purpose readable and reports its proof unreadable.

import { readingPathAt } from "../src/authenticatedReadRules.ts";
import {
  latestObservations,
  parseProofFile,
  type ProofObservation,
} from "../src/cucumberProof.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { rateLimitStop } from "./ghFailure.ts";
import type { TreeEntry } from "./ghTrees.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import type { IntentLocationProof } from "./intentLocationsSettings.ts";

// A feature file the location lists, by repository path, with its blob sha.
export type ListedFeature = { readonly path: string; readonly sha: string };

async function proofFilesUnder(
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
  directory: string,
  signal: AbortSignal,
): Promise<readonly ProofObservation[] | undefined> {
  const entries: readonly TreeEntry[] = await pinned.treeLister(
    source,
    revision,
    signal,
  )(directory);
  const readBlob = pinned.blobReader(source, revision, signal);
  const files = entries
    .filter((entry) => entry.type === "blob" && entry.path.endsWith(".json"))
    .map((entry) => ({ path: `${directory}/${entry.path}`, sha: entry.sha }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const parsed = await Promise.all(
    files.map(async (file) => parseProofFile(await readBlob(file))),
  );
  if (parsed.some((observations) => observations === undefined)) {
    return undefined;
  }
  return parsed.flatMap((observations) => observations ?? []);
}

// The declared proof of a location's listed features at the revision.
export async function locationProofAt(
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
  directory: string,
  features: readonly ListedFeature[],
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<IntentLocationProof> {
  naming(readingPathAt(directory, revision));
  let observations: readonly ProofObservation[] | undefined;
  try {
    observations = await proofFilesUnder(
      pinned,
      source,
      revision,
      directory,
      signal,
    );
  } catch (error) {
    if (rateLimitStop(error) !== undefined || signal.aborted) throw error;
    observations = undefined;
  }
  if (observations === undefined) {
    return { path: directory, problem: "unreadable" };
  }
  const listed = new Set(features.map((feature) => feature.path));
  return {
    path: directory,
    featureBlobs: Object.fromEntries(
      features.map((feature) => [feature.path, feature.sha]),
    ),
    observations: latestObservations(
      observations.filter((observation) => listed.has(observation.feature)),
    ),
  };
}
