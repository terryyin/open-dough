// Bounded, cached reads of distinct repository files for one published-work
// snapshot, through the local authenticated boundary for every source.
// Settled outcomes for the active observation (`./observationOutcomes.ts`)
// retain each path's validated success or typed failure without storing
// failure bodies as content.

import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { mapPool } from "./boundedPool.ts";
import { cachedFile, rememberFile } from "./fileContentCache.ts";
import {
  gapCauseFromOutcome,
  settleAnswered,
  settleGapCause,
  shouldAsk,
  type ObservationOutcomes,
  type ReadQuestion,
} from "./observationOutcomes.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { gapCauseOf, limitGapProblem, type GapCause } from "./readWaitBound.ts";

const fileReadConcurrency = 4;

async function readCachedFile(
  source: PublishedSource,
  revision: string,
  repositoryPath: string,
  signal: AbortSignal,
): Promise<string> {
  const hit = cachedFile(source.repository, revision, repositoryPath);
  if (hit !== undefined) {
    return hit;
  }
  const text = await readRepositoryFileAt(
    source,
    repositoryPath,
    revision,
    signal,
  );
  rememberFile(source.repository, revision, repositoryPath, text);
  return text;
}

function fileQuestion(
  source: PublishedSource,
  revision: string,
  path: string,
): ReadQuestion {
  return {
    sourceId: source.id,
    revision,
    operation: "file",
    path,
  };
}

export async function loadRepositoryTexts(
  source: PublishedSource,
  revision: string,
  paths: readonly string[],
  signal: AbortSignal,
  problem: string,
  outcomes: ObservationOutcomes,
  bound: AbortSignal,
): Promise<{
  readonly text: Map<string, string>;
  readonly problems: Map<string, GapCause>;
}> {
  const text = new Map<string, string>();
  const problems = new Map<string, GapCause>();
  await mapPool(paths, fileReadConcurrency, async (path) => {
    const question = fileQuestion(source, revision, path);
    const prior = outcomes.of(question);
    if (!shouldAsk(outcomes, question) && prior !== undefined) {
      if (prior.kind === "answered") {
        const hit = cachedFile(source.repository, revision, path);
        if (hit !== undefined) {
          text.set(path, hit);
          return;
        }
        // Cache miss for an answered path: ask again below.
      } else {
        const gap = gapCauseFromOutcome(prior, problem);
        if (gap !== undefined) {
          problems.set(path, gap);
          return;
        }
      }
    }
    try {
      text.set(path, await readCachedFile(source, revision, path, signal));
      settleAnswered(outcomes, question);
    } catch (error) {
      // A read that failed, or was ended when the owned bound passed, leaves
      // its file as a gap with typed failure meaning; caller departure does
      // not settle. Whether a snapshot with gaps is shown is decided by
      // whoever ended the reads.
      const cause = gapCauseOf(error, signal, bound, path, problem);
      settleGapCause(outcomes, question, cause);
      // Public gap text stays the caller's wording (or the rate-limit form);
      // typed recovery/bound meaning is retained on the cause and outcomes.
      problems.set(path, {
        ...cause,
        problem: limitGapProblem(error) ?? problem,
      });
    }
  });
  return { text, problems };
}
