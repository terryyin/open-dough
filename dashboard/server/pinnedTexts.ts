// Server-side memo of repository file text, directory listings, and last
// commit times at a resolved commit, for the local authenticated read
// boundary (`./authenticatedRead.ts`).

import type { PublishedSource } from "../src/publishedSource";
import {
  listRepositoryDirectoryViaGh,
  readRepositoryFileViaGh,
} from "./ghContents";
import { lastCommitTimeViaGh } from "./ghRead";

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

  // A directory's listed file names at a commit, remembered the same way. A
  // listing is kept under its directory with a trailing `/`, which no file
  // path ever has.
  lister(source: PublishedSource, revision: string, signal: AbortSignal) {
    return async (directory: string): Promise<readonly string[]> => {
      const key = PinnedTexts.key(source, revision, `${directory}/`);
      const known = this.texts.get(key);
      if (known !== undefined) {
        return JSON.parse(known) as string[];
      }
      const names = await listRepositoryDirectoryViaGh(
        source.repository,
        directory,
        revision,
        signal,
      );
      this.remember(source, revision, `${directory}/`, JSON.stringify(names));
      return names;
    };
  }

  // When a path was last committed as of a commit, remembered the same way:
  // the history behind a commit never changes either. Kept under the path
  // with a trailing NUL, which no file path ever has.
  committer(source: PublishedSource, revision: string, signal: AbortSignal) {
    return async (path: string): Promise<string> => {
      const key = PinnedTexts.key(source, revision, `${path}\0committed`);
      const known = this.texts.get(key);
      if (known !== undefined) {
        return known;
      }
      const committedAt = await lastCommitTimeViaGh(
        source.repository,
        path,
        revision,
        signal,
      );
      this.remember(source, revision, `${path}\0committed`, committedAt);
      return committedAt;
    };
  }
}
