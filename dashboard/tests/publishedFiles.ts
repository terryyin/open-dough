// Serves fixed files published at one revision of a repository, as GitHub
// would answer the local `gh` behind the page's dashboard
// (./support/fakeGitHub.ts), observing each read it answers.

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest.ts";
import {
  branchRefAnswer,
  commitAnswer,
  headsAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
} from "./originAnswers.ts";
import {
  directoryListingAnswer,
  listedFiles,
  unansweredFile,
} from "./listingAnswers.ts";
import {
  commitAnswerIn,
  commitListIn,
  madeCommitAnswer,
  type MadeCommit,
  type PathHistories,
} from "./pathHistoryAnswers.ts";
import {
  aheadByAnswer,
  changedBetween,
  compareAnswer,
} from "./comparisonAnswers.ts";
import { observe, type ObservedRequest } from "./originObservation.ts";

// A repository whose configured ref (default `main`) names one revision at which these files are
// published: every contents read at that revision is observed and answered
// with the file's bytes, or not-found for any other path, and a directory
// listing with the published files directly in that directory. A commit list
// for a path at that revision is observed and answered with the commit time
// `committed` gives that path, or with the commits `history` lists for it,
// as many as it asks for, each of which answers for its own change to that
// path; a published agent profile nothing else dates was added by a commit of
// its own (./pathHistoryAnswers.ts); for any other path the connection fails.
// Each of `branches` is a published branch head, answered and observed the
// same way at its own revision; any other branch is not published. Each of
// `unanswered` is listed in its directory, but reading it fails as a lost
// connection would. A check
// lists the configured ref and every published branch head; checks are answered but not
// observed (./originObservation.ts). A comparison of two revisions the ref
// named, joined by its moves from the base to the head, is observed and
// answered as ahead by the commits those moves were made by, naming the files
// that differ between the two published revisions, and each of those commits
// with every file it changed; joined through a move that names none, it
// answers no connection. The reverse, from a later revision the ref named to
// an earlier one, is answered behind, and any other comparison diverged, both
// observed. While comparisons are held, each one asked is observed at once
// and answered only once they are released.
export type PublishedRevision = {
  readonly revision: string;
  readonly files: Readonly<Record<string, string>>;
  readonly unanswered?: readonly string[];
  readonly committed?: Readonly<Record<string, Date>>;
  // Each path's history as of this revision, newest first; null when it is
  // not published.
  readonly history?: PathHistories;
};

function publishedAt(
  revisions: readonly PublishedRevision[],
  revision: string,
): PublishedRevision | undefined {
  return revisions.find((each) => each.revision === revision);
}

// Published files whose configured ref and branch heads move while the page is open.
// Every revision ever published stays readable, as commits do.
export type MovingFiles = {
  readonly requests: ObservedRequest[];
  // The configured ref names `at` from now on, moved there by the commits
  // `by`, oldest first, when given.
  moveTrunk(at: PublishedRevision, by?: readonly MadeCommit[]): void;
  // `branch` is published at `at` from now on, or, given undefined, deleted.
  moveBranch(branch: string, at: PublishedRevision | undefined): void;
  // Holds every comparison asked from now on until the returned release.
  holdComparisons(): () => void;
};

export function publishMovingFiles(
  page: Page,
  published: PublishedRevision & {
    readonly repository: string;
    readonly ref?: string;
    readonly branches?: Readonly<Record<string, PublishedRevision>>;
  },
): MovingFiles {
  const requests: ObservedRequest[] = [];
  const { repository, ref = "main" } = published;
  let trunk: PublishedRevision = published;
  const branches = new Map(Object.entries(published.branches ?? {}));
  const revisions = [published, ...branches.values()];
  // Each move of the ref in order, with the commits it was made by when it
  // names them.
  const moves: {
    readonly from: string;
    readonly to: string;
    readonly by: readonly MadeCommit[] | undefined;
  }[] = [];
  // The moves that took the ref from `base` to `head`, oldest first, or
  // undefined when it never moved from one to the other.
  const movesBetween = (base: string, head: string) => {
    for (let first = 0; first < moves.length; first += 1) {
      if (moves[first]?.from !== base) continue;
      const last = moves.findIndex(({ to }, at) => at >= first && to === head);
      if (last !== -1) return moves.slice(first, last + 1);
    }
    return undefined;
  };
  const madeCommits = new Map<string, MadeCommit>();
  let comparisonsHeld: Promise<void> = Promise.resolve();
  githubFor(page).serve(repository, async (call) => {
    const { request } = call;
    if (request.kind === "repository")
      return {
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ default_branch: ref }),
      };
    if (request.kind === "ref" && request.ref === ref) {
      observe(requests, call);
      return commitAnswer(trunk.revision);
    }
    if (request.kind === "matching-refs") {
      observe(requests, call);
      return headsAnswer({
        ...Object.fromEntries(
          [...branches].map(([branch, at]) => [branch, at.revision]),
        ),
        [ref]: trunk.revision,
      });
    }
    if (request.kind === "branch") {
      observe(requests, call);
      const head = branches.get(request.branch);
      return head === undefined
        ? notFoundAnswer()
        : branchRefAnswer(request.branch, head.revision);
    }
    if (request.kind === "compare") {
      const { base, head } = request;
      const forward = movesBetween(base, head);
      if (forward?.some(({ by }) => by === undefined) === true) {
        return noConnection;
      }
      observe(requests, call);
      await comparisonsHeld;
      if (forward === undefined) {
        return compareAnswer(
          movesBetween(head, base) === undefined ? "diverged" : "behind",
        );
      }
      return aheadByAnswer(
        forward.flatMap(({ by = [] }) => by.map(({ sha }) => sha)),
        request.perPage,
        changedBetween(
          publishedAt(revisions, base)?.files ?? {},
          publishedAt(revisions, head)?.files ?? {},
        ),
      );
    }
    if (request.kind === "commit") {
      const made = madeCommits.get(request.sha);
      if (made !== undefined) {
        observe(requests, call);
        return madeCommitAnswer(made);
      }
      const answer = commitAnswerIn(revisions, request.sha);
      if (answer === undefined) {
        return noConnection;
      }
      observe(requests, call);
      return answer;
    }
    if (request.kind === "unknown" || request.kind === "ref") {
      return noConnection;
    }
    const at = publishedAt(revisions, request.revision);
    if (at === undefined) {
      return noConnection;
    }
    observe(requests, call);
    if (request.kind === "commit-list") {
      return commitListIn(at, request.path, request.perPage) ?? noConnection;
    }
    if (request.kind === "listing") {
      return directoryListingAnswer(request.path, [
        ...listedFiles(at.files).filter(
          ({ path }) => at.unanswered?.includes(path) !== true,
        ),
        ...(at.unanswered ?? []).map(unansweredFile),
      ]);
    }
    if (at.unanswered?.includes(request.path) === true) {
      return noConnection;
    }
    const body = Object.hasOwn(at.files, request.path)
      ? at.files[request.path]
      : undefined;
    return body === undefined ? notFoundAnswer() : rawFileAnswer(body);
  });
  return {
    requests,
    moveTrunk(at, by) {
      moves.push({ from: trunk.revision, to: at.revision, by });
      for (const made of by ?? []) {
        madeCommits.set(made.sha, made);
      }
      trunk = at;
      revisions.push(at);
    },
    holdComparisons() {
      let release: () => void = () => undefined;
      comparisonsHeld = new Promise((resolve) => {
        release = resolve;
      });
      return release;
    },
    moveBranch(branch, at) {
      if (at === undefined) {
        branches.delete(branch);
        return;
      }
      branches.set(branch, at);
      revisions.push(at);
    },
  };
}

export function publishFiles(
  page: Page,
  published: Parameters<typeof publishMovingFiles>[1],
): Promise<ObservedRequest[]> {
  return Promise.resolve(publishMovingFiles(page, published).requests);
}
