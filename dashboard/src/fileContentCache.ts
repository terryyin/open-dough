// In-memory cache of repository file text for one browser session, keyed by
// source repository, pinned revision, and path. No polling and no persistence.

const cache = new Map<string, string>();

function key(
  repository: string,
  revision: string,
  repositoryPath: string,
): string {
  return `${repository}\0${revision}\0${repositoryPath}`;
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
