// In-memory cache of repository file text for one browser session, keyed by
// source repository, pinned revision, and path. No polling and no persistence.
// Retained text stays within a byte budget: each hit refreshes LRU order, and a
// write that would take the session over the budget removes least-recently-used
// entries until it fits. A miss rereads through the ordinary read path.

export const fileContentCacheBudgetBytes = 16 * 1024 * 1024;

const utf8 = new TextEncoder();

type Entry = { readonly text: string; readonly bytes: number };

const cache = new Map<string, Entry>();
let retainedBytes = 0;

function key(
  repository: string,
  revision: string,
  repositoryPath: string,
): string {
  return `${repository}\0${revision}\0${repositoryPath}`;
}

function forget(entryKey: string, entry: Entry): void {
  cache.delete(entryKey);
  retainedBytes -= entry.bytes;
}

function evictUntilWithinBudget(): void {
  while (retainedBytes > fileContentCacheBudgetBytes && cache.size > 0) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    // A single entry larger than the budget stays so the current pin can still
    // hit; further writes continue to prefer newer keys.
    if (cache.size === 1) {
      break;
    }
    const entry = cache.get(oldest);
    if (entry === undefined) {
      break;
    }
    forget(oldest, entry);
  }
}

export function retainedFileContentBytes(): number {
  return retainedBytes;
}

export function forgetCachedFiles(): void {
  cache.clear();
  retainedBytes = 0;
}

export function cachedFile(
  repository: string,
  revision: string,
  repositoryPath: string,
): string | undefined {
  const entryKey = key(repository, revision, repositoryPath);
  const entry = cache.get(entryKey);
  if (entry === undefined) {
    return undefined;
  }
  // Refresh LRU: Map iteration order is insertion order.
  cache.delete(entryKey);
  cache.set(entryKey, entry);
  return entry.text;
}

export function rememberFile(
  repository: string,
  revision: string,
  repositoryPath: string,
  text: string,
): void {
  const entryKey = key(repository, revision, repositoryPath);
  const prior = cache.get(entryKey);
  if (prior !== undefined) {
    forget(entryKey, prior);
  }
  const entry = { text, bytes: utf8.encode(text).byteLength };
  cache.set(entryKey, entry);
  retainedBytes += entry.bytes;
  evictUntilWithinBudget();
}
