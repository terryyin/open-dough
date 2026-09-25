// Bounded, cached reads of distinct repository files for one published-work
// snapshot, through the local authenticated boundary for every source.

import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { cachedFile, rememberFile } from "./fileContentCache.ts";
import type { PublishedSource } from "./publishedSource.ts";

const fileReadConcurrency = 4;

async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  map: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        const item = items[index];
        if (item === undefined) {
          continue;
        }
        results[index] = await map(item);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

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

export async function loadRepositoryTexts(
  source: PublishedSource,
  revision: string,
  paths: readonly string[],
  signal: AbortSignal,
  problem: string,
): Promise<{
  readonly text: Map<string, string>;
  readonly problems: Map<string, string>;
}> {
  const text = new Map<string, string>();
  const problems = new Map<string, string>();
  await mapPool(paths, fileReadConcurrency, async (path) => {
    try {
      text.set(path, await readCachedFile(source, revision, path, signal));
    } catch {
      // A read that failed, or was abandoned when `signal` ended it, leaves
      // its file as a gap; whether a snapshot with gaps is shown is decided
      // by whoever ended the reads.
      problems.set(path, problem);
    }
  });
  return { text, problems };
}
