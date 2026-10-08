// Server-side memo of repository file text, directory listings, last commit
// times, and profile additions at a resolved commit, and of each listed Git
// blob's text, for the local authenticated read boundary
// (`./authenticatedRead.ts`); each is kept under its own entry shape and
// reused across revisions as `./pinnedMemo.ts` allows.

import type { PublishedSource } from "../src/publishedSource.ts";
import {
  listRepositoryDirectoryViaGh,
  readRepositoryFileViaGh,
  type ListedFile,
} from "./ghContents.ts";
import { lastCommitTimeViaGh } from "./ghCommitTime.ts";
import {
  commitChangeOf,
  findAddition,
  listPathCommitsViaGh,
  type ProfileAddition,
} from "./ghProfileAddition.ts";
import { PinnedMemo } from "./pinnedMemo.ts";

// A file a pinned directory listing names, by its repository path, with the
// sha of its Git blob.
export type ListedPath = { readonly path: string; readonly sha: string };

export class PinnedTexts extends PinnedMemo {
  // The backlog is read at the revision itself, never compared: membership
  // never waits on GitHub's account of what changed, which only the records
  // it names wait on.
  reader(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (path: string): Promise<string> => {
      const read = () =>
        readRepositoryFileViaGh(source.repository, path, revision, signal);
      return path === source.backlogPath
        ? this.recalled(source, revision, path, read)
        : this.recalledOrUnchanged(source, revision, path, signal, read);
    };
  }

  // A directory's listed files, each with its blob sha, at a commit,
  // remembered the same way. A listing is kept under its directory with a
  // trailing `/`, which no file path ever has, and is unchanged only when no
  // touched path lies under it.
  lister(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (directory: string): Promise<readonly ListedFile[]> =>
      this.recalledOrUnchangedJson(
        source,
        revision,
        `${directory}/`,
        signal,
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
      this.blobRecalled(source, revision, sha, () =>
        readRepositoryFileViaGh(source.repository, path, revision, signal),
      );
  }

  // When a path was last committed as of a commit, remembered the same way:
  // the history behind a commit never changes either. Kept under the path
  // with a trailing NUL, which no file path ever has.
  committer(source: PublishedSource, revision: string, signal: AbortSignal) {
    return (path: string): Promise<string> =>
      this.recalledOrUnchanged(
        source,
        revision,
        `${path}\0committed`,
        signal,
        () => lastCommitTimeViaGh(source.repository, path, revision, signal),
      );
  }

  // Which commit added a profile's current allocation as of a commit, and
  // who committed it, remembered the same way under the path with a trailing
  // NUL: each assignment keeps its own addition, whoever else the same human
  // credits. The path's history as of the commit is remembered the same way,
  // and each walked commit's change to the path is derived from that commit's
  // remembered record. So a walk a failure ended asks GitHub again only from
  // the step that failed, and a later revision's walk asks only for its list.
  adder(source: PublishedSource, revision: string, signal: AbortSignal) {
    const recordOf = this.commitRecorder(source, revision, signal);
    return (path: string): Promise<ProfileAddition> =>
      this.recalledOrUnchangedJson(
        source,
        revision,
        `${path}\0added`,
        signal,
        async () =>
          findAddition(
            await this.recalledOrUnchangedJson(
              source,
              revision,
              `${path}\0history`,
              signal,
              () =>
                listPathCommitsViaGh(source.repository, path, revision, signal),
            ),
            async (commit) => commitChangeOf(await recordOf(commit), path),
          ),
      );
  }
}
