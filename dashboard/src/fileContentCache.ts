// In-memory cache of repository file text for one browser session, keyed by
// source repository, pinned revision, and path. No polling and no persistence.
// Retained text stays within a byte budget, least recently used first out
// (`./byteBudgetedMemo.ts`). A miss rereads through the ordinary read path.

import { byteBudgetedMemo } from "./byteBudgetedMemo.ts";

export const fileContentCacheBudgetBytes = 16 * 1024 * 1024;

const utf8 = new TextEncoder();

const cache = byteBudgetedMemo<string>(
  fileContentCacheBudgetBytes,
  (text) => utf8.encode(text).byteLength,
);

function key(
  repository: string,
  revision: string,
  repositoryPath: string,
): string {
  return `${repository}\0${revision}\0${repositoryPath}`;
}

export function retainedFileContentBytes(): number {
  return cache.retainedBytes();
}

export function forgetCachedFiles(): void {
  cache.clear();
}

export function cachedFile(
  repository: string,
  revision: string,
  repositoryPath: string,
): string | undefined {
  return cache.get(key(repository, revision, repositoryPath));
}

export function rememberFile(
  repository: string,
  revision: string,
  repositoryPath: string,
  text: string,
): void {
  cache.set(key(repository, revision, repositoryPath), text);
}
