// Server-side memo of answers at a resolved commit of a source's repository
// and of what the commits between two revisions of its configured ref
// touched: a read at a revision the ref named later is answered from what is
// held at the revision it is compared with when GitHub's account of the
// commits between says none touched it. Which reads are kept under which
// entries, and which are never compared, is the readers'
// (`./pinnedTexts.ts`).

import type { PublishedSource } from "../src/publishedSource.ts";
import { commitViaGh, type CommitRecord } from "./ghCommit.ts";
import {
  touchedAt,
  touchedBetweenViaGh,
  unlessFailed,
} from "./commitsBetween.ts";
import { RevisionMemo, recalledAsJson } from "./revisionMemo.ts";

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

export class PinnedMemo {
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
    this.memo.keptAnew(PinnedMemo.latestKey(source), revision);
  }

  // Notes that the source's configured ref named `revision` for this process:
  // when this process answered the source's backlog at another revision
  // last, reads at `revision` may be answered from what it holds there, as
  // far as GitHub's account of the commits between allows. A revision keeps
  // the first revision it is compared with. A branch head is never named
  // here, so reads at one are never compared.
  namedByRef(source: PublishedSource, revision: string): void {
    const base = this.memo.held(PinnedMemo.latestKey(source));
    const key = PinnedMemo.key(source, revision, sinceEntry);
    if (
      base === undefined ||
      base === revision ||
      this.memo.held(key) !== undefined
    ) {
      return;
    }
    this.memo.kept(key, base);
  }

  // A listed file's text kept under its blob sha, or else what `read`
  // answers, then kept there.
  protected blobRecalled(
    source: PublishedSource,
    sha: string,
    read: () => Promise<string>,
  ): Promise<string> {
    return this.memo.recalled(PinnedMemo.blobKey(source, sha), read);
  }

  remember(
    source: PublishedSource,
    revision: string,
    path: string,
    text: string,
  ): void {
    this.memo.kept(PinnedMemo.key(source, revision, path), text);
  }

  // What is kept under `entry` at `revision`, or else what `read` answers,
  // then kept there. Every memo below shares this rule; each kind of answer
  // is kept under its own `entry` shape.
  protected recalled(
    source: PublishedSource,
    revision: string,
    entry: string,
    read: () => Promise<string>,
  ): Promise<string> {
    return this.memo.recalled(PinnedMemo.key(source, revision, entry), read);
  }

  // What is held under `entry` at the revision `revision` is compared with,
  // when GitHub's account of the commits between says none touched the path
  // it is kept under (all of `entry` before any NUL) -- identical text is
  // never that evidence; undefined when nothing is held there or the account
  // establishes nothing. What the commits between touched is remembered, or that it establishes
  // nothing; a failure to learn it is not.
  private async unchangedSince(
    source: PublishedSource,
    revision: string,
    entry: string,
    signal: AbortSignal,
  ): Promise<string | undefined> {
    const base = this.memo.held(PinnedMemo.key(source, revision, sinceEntry));
    const held =
      base === undefined
        ? undefined
        : this.memo.held(PinnedMemo.key(source, base, entry));
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
    const [path = entry] = entry.split("\0");
    return touched !== null && !touchedAt(touched, path) ? held : undefined;
  }

  // What is kept under `entry` at `revision`, or else what is held unchanged
  // at the revision it is compared with, or else what `read` answers; either
  // is then kept at `revision` as its own.
  protected recalledOrUnchanged(
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

  protected recalledOrUnchangedJson<T>(
    source: PublishedSource,
    revision: string,
    entry: string,
    signal: AbortSignal,
    read: () => Promise<T>,
  ): Promise<T> {
    return recalledAsJson(
      (text) => this.recalledOrUnchanged(source, revision, entry, signal, text),
      read,
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

  // A commit's own record -- who committed it and every file it changed --
  // remembered under that commit with an entry that starts with NUL, which
  // no file path ever does. Whichever path or read asks, GitHub is asked
  // about a commit once.
  protected commitRecorder(source: PublishedSource, signal: AbortSignal) {
    return (commit: string): Promise<CommitRecord> =>
      this.recalledJson(source, commit, "\0commit", () =>
        commitViaGh(source.repository, commit, signal),
      );
  }
}
