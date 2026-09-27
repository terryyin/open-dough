// Server-side memo of repository file text, directory listings, last
// commit times, and profile additions at a resolved commit, and of each
// commit's change to a path, for the local authenticated read boundary
// (`./authenticatedRead.ts`).

import type { PublishedSource } from "../src/publishedSource.ts";
import {
  listRepositoryDirectoryViaGh,
  readRepositoryFileViaGh,
} from "./ghContents.ts";
import { lastCommitTimeViaGh } from "./ghRead.ts";
import {
  commitChangeViaGh,
  findAddition,
  listPathCommitsViaGh,
  type ProfileAddition,
} from "./ghProfileAddition.ts";

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

  // What is kept under `entry` at `revision`, or else what `read` answers,
  // then kept there. Every memo below shares this rule; each kind of answer
  // is kept under its own `entry` shape.
  private async recalled(
    source: PublishedSource,
    revision: string,
    entry: string,
    read: () => Promise<string>,
  ): Promise<string> {
    const known = this.texts.get(PinnedTexts.key(source, revision, entry));
    if (known !== undefined) {
      return known;
    }
    const text = await read();
    this.remember(source, revision, entry, text);
    return text;
  }

  private async recalledJson<T>(
    source: PublishedSource,
    revision: string,
    entry: string,
    read: () => Promise<T>,
  ): Promise<T> {
    return JSON.parse(
      await this.recalled(source, revision, entry, async () =>
        JSON.stringify(await read()),
      ),
    ) as T;
  }

  reader(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (path: string): Promise<string> =>
      this.recalled(source, revision, path, () =>
        readRepositoryFileViaGh(source.repository, path, revision, signal),
      );
  }

  // A directory's listed file names at a commit, remembered the same way. A
  // listing is kept under its directory with a trailing `/`, which no file
  // path ever has.
  lister(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (directory: string): Promise<readonly string[]> =>
      this.recalledJson(source, revision, `${directory}/`, () =>
        listRepositoryDirectoryViaGh(
          source.repository,
          directory,
          revision,
          signal,
        ),
      );
  }

  // When a path was last committed as of a commit, remembered the same way:
  // the history behind a commit never changes either. Kept under the path
  // with a trailing NUL, which no file path ever has.
  committer(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (path: string): Promise<string> =>
      this.recalled(source, revision, `${path}\0committed`, () =>
        lastCommitTimeViaGh(source.repository, path, revision, signal),
      );
  }

  // Which commit added a profile's current allocation as of a commit, and
  // who committed it, remembered the same way under the path with a trailing
  // NUL. What each walked commit changed about the path is remembered under
  // that commit, so a later revision's walk asks GitHub only for its list.
  adder(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (path: string): Promise<ProfileAddition> =>
      this.recalledJson(source, revision, `${path}\0added`, async () =>
        findAddition(
          await listPathCommitsViaGh(source.repository, path, revision, signal),
          (commit) =>
            this.recalledJson(source, commit, `${path}\0change`, () =>
              commitChangeViaGh(source.repository, commit, path, signal),
            ),
        ),
      );
  }
}
