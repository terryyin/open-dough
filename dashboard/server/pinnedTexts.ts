// Server-side memo of repository file text, directory listings, last
// commit times, and profile additions at a resolved commit, of each
// commit's change to a path, and of each listed Git blob's text, for the
// local authenticated read boundary (`./authenticatedRead.ts`).

import type { PublishedSource } from "../src/publishedSource.ts";
import {
  listRepositoryDirectoryViaGh,
  readRepositoryFileViaGh,
  type ListedFile,
} from "./ghContents.ts";
import { lastCommitTimeViaGh } from "./ghCommitTime.ts";
import {
  commitChangeViaGh,
  findAddition,
  listPathCommitsViaGh,
  type ProfileAddition,
} from "./ghProfileAddition.ts";

// File text at a commit never changes, so what one request already read at a
// pinned revision can decide a later request's reachability (or answer it)
// without asking GitHub again. Bounded, in memory, per launched server, and
// only ever keyed by a resolved commit -- never by a moving ref -- or by a
// Git blob's sha, which names exactly one text. Failures are not remembered.
const pinnedTextLimit = 500;

// A file a pinned directory listing names, by its repository path, with the
// sha of its Git blob.
export type ListedPath = { readonly path: string; readonly sha: string };

export class PinnedTexts {
  private readonly texts = new Map<string, string>();

  private static key(source: PublishedSource, revision: string, path: string) {
    return `${source.repository}\0${revision}\0${path}`;
  }

  // A blob is kept in place of a revision under `blob`, which no commit sha
  // ever is.
  private static blobKey(source: PublishedSource, sha: string) {
    return `${source.repository}\0blob\0${sha}`;
  }

  remember(
    source: PublishedSource,
    revision: string,
    path: string,
    text: string,
  ): void {
    this.kept(PinnedTexts.key(source, revision, path), text);
  }

  private kept(key: string, text: string): void {
    this.texts.set(key, text);
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
  private recalled(
    source: PublishedSource,
    revision: string,
    entry: string,
    read: () => Promise<string>,
  ): Promise<string> {
    return this.recalledAt(PinnedTexts.key(source, revision, entry), read);
  }

  private async recalledAt(
    key: string,
    read: () => Promise<string>,
  ): Promise<string> {
    const known = this.texts.get(key);
    if (known !== undefined) {
      return known;
    }
    const text = await read();
    this.kept(key, text);
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

  // A directory's listed files, each with its blob sha, at a commit,
  // remembered the same way. A listing is kept under its directory with a
  // trailing `/`, which no file path ever has.
  lister(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (directory: string): Promise<readonly ListedFile[]> =>
      this.recalledJson(source, revision, `${directory}/`, () =>
        listRepositoryDirectoryViaGh(
          source.repository,
          directory,
          revision,
          signal,
        ),
      );
  }

  // A listed file's text, read at a commit whose listing names it and
  // remembered under its blob sha: any later revision whose listing names the
  // same blob asks GitHub nothing for it.
  blobReader(source: PublishedSource, revision: string, signal: AbortSignal) {
    return ({ path, sha }: ListedPath): Promise<string> =>
      this.recalledAt(PinnedTexts.blobKey(source, sha), () =>
        readRepositoryFileViaGh(source.repository, path, revision, signal),
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
  // NUL. Each step of the walk is remembered too: the path's history as of
  // the commit, and what each walked commit changed about the path under
  // that commit. So a walk a failure ended asks GitHub again only from the
  // step that failed, and a later revision's walk asks only for its list.
  adder(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (path: string): Promise<ProfileAddition> =>
      this.recalledJson(source, revision, `${path}\0added`, async () =>
        findAddition(
          await this.recalledJson(source, revision, `${path}\0history`, () =>
            listPathCommitsViaGh(source.repository, path, revision, signal),
          ),
          (commit) =>
            this.recalledJson(source, commit, `${path}\0change`, () =>
              commitChangeViaGh(source.repository, commit, path, signal),
            ),
        ),
      );
  }
}
