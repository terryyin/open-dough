// Server-side memo of repository file text, directory listings, last commit
// times, and profile additions at a resolved commit, of each commit's own
// record, of each listed Git blob's text, and of what the commits between two
// revisions of a source's configured ref touched, for the local authenticated
// read boundary (`./authenticatedRead.ts`).

import type { PublishedSource } from "../src/publishedSource.ts";
import {
  listRepositoryDirectoryViaGh,
  readRepositoryFileViaGh,
  type ListedFile,
} from "./ghContents.ts";
import { lastCommitTimeViaGh } from "./ghRead.ts";
import { commitViaGh, type CommitRecord } from "./ghCommit.ts";
import {
  touchedAt,
  touchedBetweenViaGh,
  unlessFailed,
} from "./commitsBetween.ts";
import { RevisionMemo, recalledAsJson } from "./revisionMemo.ts";
import {
  commitChangeOf,
  findAddition,
  listPathCommitsViaGh,
  type ProfileAddition,
} from "./ghProfileAddition.ts";

// File text at a commit never changes, so what one request already read at a
// pinned revision can decide a later request's reachability (or answer it)
// without asking GitHub again. Kept (`./revisionMemo.ts`) only under a resolved
// commit -- never a moving ref -- or a Git blob's sha, which names exactly one
// text; only the revision a source's backlog was last answered at is kept by
// source, deciding only what a revision the ref names next is compared with.

// Which revision a revision the configured ref named is compared with, kept
// at that revision; what the commits between touched is kept beside it, under
// the revision compared with.
const sinceEntry = "\0since";

// A file a pinned directory listing names, by its repository path, with the
// sha of its Git blob.
export type ListedPath = { readonly path: string; readonly sha: string };

export class PinnedTexts {
  private readonly memo = new RevisionMemo();

  private static key(source: PublishedSource, revision: string, path: string) {
    return `${source.repository}\0${revision}\0${path}`;
  }

  // A blob is kept in place of a revision under `blob`, which no commit sha
  // ever is.
  private static blobKey(source: PublishedSource, sha: string) {
    return `${source.repository}\0blob\0${sha}`;
  }

  // The latest revision at which the source's backlog was answered is kept in
  // place of a revision under `latest`, which no commit sha ever is.
  private static latestKey(source: PublishedSource) {
    return `${source.repository}\0latest\0${source.backlogPath}`;
  }

  // Notes that this process answered the source's backlog at `revision`.
  answeredBacklog(source: PublishedSource, revision: string): void {
    this.memo.keptAnew(PinnedTexts.latestKey(source), revision);
  }

  // Notes that the source's configured ref named `revision` for this process:
  // when this process answered the source's backlog at another revision
  // last, reads at `revision` may be answered from what it holds there, as
  // far as GitHub's account of the commits between allows. A revision keeps
  // the first revision it is compared with. A branch head is never named
  // here, so reads at one are never compared.
  namedByRef(source: PublishedSource, revision: string): void {
    const base = this.memo.held(PinnedTexts.latestKey(source));
    const key = PinnedTexts.key(source, revision, sinceEntry);
    if (
      base === undefined ||
      base === revision ||
      this.memo.held(key) !== undefined
    ) {
      return;
    }
    this.memo.kept(key, base);
  }

  remember(
    source: PublishedSource,
    revision: string,
    path: string,
    text: string,
  ): void {
    this.memo.kept(PinnedTexts.key(source, revision, path), text);
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
    return this.memo.recalled(PinnedTexts.key(source, revision, entry), read);
  }

  // What is held under `entry` at the revision `revision` is compared with,
  // when GitHub's account of the commits between says none touched it;
  // undefined when nothing is held there or the account establishes nothing.
  // What the commits between touched is remembered, or that it establishes
  // nothing; a failure to learn it is not.
  private async unchangedSince(
    source: PublishedSource,
    revision: string,
    entry: string,
    signal: AbortSignal,
  ): Promise<string | undefined> {
    const base = this.memo.held(PinnedTexts.key(source, revision, sinceEntry));
    const held =
      base === undefined
        ? undefined
        : this.memo.held(PinnedTexts.key(source, base, entry));
    if (base === undefined || held === undefined) {
      return undefined;
    }
    const touched = await unlessFailed(signal, () =>
      this.recalledJson(source, revision, `${sinceEntry}\0${base}`, () =>
        touchedBetweenViaGh(
          source.repository,
          { base, head: revision },
          this.commitRecorder(source, signal),
          signal,
        ),
      ),
    );
    return touched !== null && !touchedAt(touched, entry) ? held : undefined;
  }

  // What is kept under `entry` at `revision`, or else what is held unchanged
  // at the revision it is compared with, or else what `read` answers; either
  // is then kept at `revision` as its own.
  private recalledOrUnchanged(
    source: PublishedSource,
    revision: string,
    entry: string,
    signal: AbortSignal,
    read: () => Promise<string>,
  ): Promise<string> {
    return this.recalled(
      source,
      revision,
      entry,
      async () =>
        (await this.unchangedSince(source, revision, entry, signal)) ??
        (await read()),
    );
  }

  private recalledJson<T>(
    source: PublishedSource,
    revision: string,
    entry: string,
    read: () => Promise<T>,
  ): Promise<T> {
    return recalledAsJson(
      (text) => this.recalled(source, revision, entry, text),
      read,
    );
  }

  reader(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (path: string): Promise<string> =>
      this.recalledOrUnchanged(source, revision, path, signal, () =>
        readRepositoryFileViaGh(source.repository, path, revision, signal),
      );
  }

  // A directory's listed files, each with its blob sha, at a commit,
  // remembered the same way. A listing is kept under its directory with a
  // trailing `/`, which no file path ever has, and is unchanged only when no
  // touched path lies under it.
  lister(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (directory: string): Promise<readonly ListedFile[]> =>
      recalledAsJson(
        (text) =>
          this.recalledOrUnchanged(
            source,
            revision,
            `${directory}/`,
            signal,
            text,
          ),
        () =>
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
      this.memo.recalled(PinnedTexts.blobKey(source, sha), () =>
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

  // A commit's own record -- who committed it and every file it changed --
  // remembered under that commit with an entry that starts with NUL, which
  // no file path ever does. Whichever path or read asks, GitHub is asked
  // about a commit once.
  commitRecorder(source: PublishedSource, signal: AbortSignal) {
    return (commit: string): Promise<CommitRecord> =>
      this.recalledJson(source, commit, "\0commit", () =>
        commitViaGh(source.repository, commit, signal),
      );
  }

  // Which commit added a profile's current allocation as of a commit, and
  // who committed it, remembered the same way under the path with a trailing
  // NUL. Each walked commit's change to the path is derived from that
  // commit's remembered record, so a later revision's walk asks GitHub only
  // for its list.
  adder(source: PublishedSource, revision: string, signal: AbortSignal) {
    const recordOf = this.commitRecorder(source, signal);
    return (path: string): Promise<ProfileAddition> =>
      this.recalledJson(source, revision, `${path}\0added`, async () =>
        findAddition(
          await listPathCommitsViaGh(source.repository, path, revision, signal),
          async (commit) => commitChangeOf(await recordOf(commit), path),
        ),
      );
  }
}
