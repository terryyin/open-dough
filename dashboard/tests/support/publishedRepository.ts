// A repository as published on GitHub, answering the fake GitHub's `gh`
// calls (./fakeGitHub.ts) from its files, revision, and history.

import {
  commitAnswer,
  headsAnswer,
  noConnection,
  rawFileAnswer,
} from "../originAnswers.ts";
import { directoryListingAnswer, listedFiles } from "../listingAnswers.ts";
import {
  commitAnswerIn,
  commitListIn,
  type PathHistories,
} from "../pathHistoryAnswers.ts";
import type { RepositoryAnswerer } from "./fakeGitHub.ts";

// Answers `revision` for any ref, and as the only branch head `main` of a
// head listing; for any content read, the named file in
// `files` or else `backlog`; for a directory listing, the `files` in that
// directory; and for a path's commit list, the commits `history` lists for
// it, or else its time in `committed`, as many as it asks for, each listed
// commit answering for its own change to that path; a published agent
// profile nothing else dates was added by a commit of its own
// (../pathHistoryAnswers.ts).
export function publishes(published: {
  readonly revision: string;
  readonly defaultBranch?: string;
  readonly backlog?: string;
  readonly files?: Readonly<Record<string, string>>;
  readonly committed?: Readonly<Record<string, Date>>;
  readonly history?: PathHistories;
}): RepositoryAnswerer {
  return ({ request }) => {
    if (request.kind === "repository")
      return Promise.resolve({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          default_branch: published.defaultBranch ?? "main",
        }),
      });
    if (request.kind === "commit-list") {
      // A path with no published history or commit time is unreachable, not
      // an unrecognized CLI shape (same as ../publishedFiles.ts).
      return Promise.resolve(
        commitListIn(published, request.path, request.perPage) ?? noConnection,
      );
    }
    if (request.kind === "commit") {
      return Promise.resolve(
        commitAnswerIn([published], request.sha) ?? noConnection,
      );
    }
    if (request.kind === "ref") {
      return Promise.resolve(commitAnswer(published.revision));
    }
    if (request.kind === "matching-refs") {
      return Promise.resolve(headsAnswer({ main: published.revision }));
    }
    if (request.kind === "content") {
      const { files, backlog } = published;
      const body =
        files !== undefined && Object.hasOwn(files, request.path)
          ? files[request.path]
          : backlog;
      return Promise.resolve(rawFileAnswer(body ?? ""));
    }
    if (request.kind === "listing") {
      return Promise.resolve(
        directoryListingAnswer(
          request.path,
          listedFiles(published.files ?? {}),
        ),
      );
    }
    return Promise.resolve({
      exitCode: 1,
      stderr: "fake gh: unrecognized invocation\n",
    });
  };
}
