// Server-side memo of repository file text at a resolved commit, for the
// local authenticated read boundary (`./authenticatedRead.ts`).

import type { PublishedSource } from "../src/publishedSource";
import { readRepositoryFileViaGh } from "./ghRead";

// File text at a commit never changes, so what one request already read at a
// pinned revision can decide a later request's reachability (or answer it)
// without asking GitHub again. Bounded, in memory, per launched server, and
// only ever keyed by a resolved commit -- never by a moving ref. Failures are
// not remembered.
const pinnedTextLimit = 500;

export class PinnedTexts {
  private readonly texts = new Map<string, string>();

  private static key(source: PublishedSource, revision: string, path: string) {
    return `${source.repository}\0${revision}\0${path}`;
  }

  remember(
    source: PublishedSource,
    revision: string,
    path: string,
    text: string,
  ): void {
    this.texts.set(PinnedTexts.key(source, revision, path), text);
    while (this.texts.size > pinnedTextLimit) {
      const oldest = this.texts.keys().next().value;
      if (oldest === undefined) {
        break;
      }
      this.texts.delete(oldest);
    }
  }

  reader(source: PublishedSource, revision: string, signal: AbortSignal) {
    return async (path: string): Promise<string> => {
      const known = this.texts.get(PinnedTexts.key(source, revision, path));
      if (known !== undefined) {
        return known;
      }
      const text = await readRepositoryFileViaGh(
        source.repository,
        path,
        revision,
        signal,
      );
      this.remember(source, revision, path, text);
      return text;
    };
  }
}
