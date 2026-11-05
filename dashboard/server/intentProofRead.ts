// Committed proof an Intent location of a proof kind declares, read at the
// same pinned revision as its files for the Intent locations read
// (`./intentLocationsRead.ts`): one recursive Git tree of the proof
// directory (`./ghTrees.ts`), each `.json` file's text by its blob sha
// (`./pinnedTexts.ts`) parsed by the location's kind (`../src/proofKinds.ts`),
// and the last successful proof of each case across every file
// (`../src/proofCases.ts`), answered in the case model's own fields whatever
// the kind. Rate limits still fail the whole read; any other failed read or
// malformed proof file leaves the location's Purpose readable and reports
// which, naming the first such file.

import { readingPathAt } from "../src/authenticatedReadRules.ts";
import {
  latestSuccessfulObservations,
  type CaseObservation,
} from "../src/proofCases.ts";
import type { ProofKind } from "../src/proofKinds.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { rateLimitStop } from "./ghFailure.ts";
import type { TreeEntry } from "./ghTrees.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import type {
  IntentLocationProof,
  IntentProofProblem,
} from "./intentLocationsSettings.ts";

// A file the location lists, by repository path, with its blob sha.
export type ListedFile = { readonly path: string; readonly sha: string };

type ProofRead =
  | { readonly observations: readonly CaseObservation[] }
  | { readonly problem: IntentProofProblem; readonly file?: string };

// A failed read leaves the location's Purpose readable unless it is a rate
// limit, or the read was given up, which fail the whole Intent read.
function rethrownUnlessReadFailure(error: unknown, signal: AbortSignal) {
  if (rateLimitStop(error) !== undefined || signal.aborted) throw error;
}

async function proofFilesUnder(
  proofKind: ProofKind,
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
  directory: string,
  signal: AbortSignal,
): Promise<ProofRead> {
  let entries: readonly TreeEntry[];
  try {
    entries = await pinned.treeLister(source, revision, signal)(directory);
  } catch (error) {
    rethrownUnlessReadFailure(error, signal);
    return { problem: "unreadable" };
  }
  const readBlob = pinned.blobReader(source, revision, signal);
  const files = entries
    .filter((entry) => entry.type === "blob" && entry.path.endsWith(".json"))
    .map((entry) => ({ path: `${directory}/${entry.path}`, sha: entry.sha }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const read = await Promise.allSettled(files.map((file) => readBlob(file)));
  for (const text of read) {
    if (text.status === "rejected") {
      rethrownUnlessReadFailure(text.reason, signal);
    }
  }
  const observations: CaseObservation[] = [];
  for (const [at, file] of files.entries()) {
    const text = read[at];
    if (text === undefined || text.status === "rejected") {
      return { problem: "unreadable", file: file.path };
    }
    const parsed = proofKind.parseFile(text.value);
    if (parsed === undefined) return { problem: "malformed", file: file.path };
    observations.push(...parsed);
  }
  return { observations };
}

// The declared proof of a location's listed files at the revision.
export async function locationProofAt(
  proofKind: ProofKind,
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
  directory: string,
  files: readonly ListedFile[],
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<IntentLocationProof> {
  naming(readingPathAt(directory, revision));
  const read = await proofFilesUnder(
    proofKind,
    pinned,
    source,
    revision,
    directory,
    signal,
  );
  if ("problem" in read) return { path: directory, ...read };
  const listed = new Set(files.map((file) => file.path));
  return {
    path: directory,
    fileBlobs: Object.fromEntries(files.map((file) => [file.path, file.sha])),
    observations: latestSuccessfulObservations(
      read.observations.filter((observation) => listed.has(observation.file)),
    ),
  };
}
