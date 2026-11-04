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
  treeListingAnswer,
  unansweredFile,
} from "./listingAnswers.ts";
import {
  commitAnswerIn,
  commitListIn,
  madeCommitAnswer,
  type MadeCommit,
  type PathHistories,
} from "./pathHistoryAnswers.ts";
import { refMoveComparisons } from "./comparisonAnswers.ts";
import { observe, type ObservedRequest } from "./originObservation.ts";
import { isCiJudgmentCall, type CiAnswerer } from "./support/baseCiActions.ts";
import { isActionsRequest } from "./support/ghActionsRequest.ts";

// A repository whose configured ref (default `main`) names one revision at which these files are
// published: every contents read at that revision is observed and answered
// with the file's bytes, or not-found for any other path, and a directory
// listing with the published files directly in that directory. A commit list
// for a path at that revision is observed and answered with the commit time
// `committed` gives that path, or with the commits `history` lists for it,
// as many as it asks for, each of which answers for its own change to that
// path; a published agent profile nothing else dates was added by a commit of
// its own (./pathHistoryAnswers.ts); for any other path GitHub's empty commit
// list answers (established absence), not a lost connection.
// Each of `branches` is a published branch head, answered and observed the
// same way at its own revision; any other branch is not published. Each of
// `unanswered` is listed in its directory, but reading it fails as a lost
// connection would. A check
// lists the configured ref and every published branch head; checks are answered but not
// observed (./originObservation.ts). A comparison is answered from the ref's
// moves (`refMoveComparisons`, ./comparisonAnswers.ts) and observed unless it
// has no connection; each commit a move was made by answers with every file it
// changed. While comparisons are held, each one asked is observed at once
// and answered only once they are released. Once CI is served, the selected
// check's Actions answers and the history listing of a branch by its name
// (`commits?sha=<branch>`, no path) are answered by it first, each observed;
// until then they have no answer.
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
  // Answers CI judgment calls (Actions workflow and runs, and a branch's
  // history by name) with `answer` from now on; undefined leaves a call to
  // the published files.
  serveCi(answer: CiAnswerer): void;
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
  const comparisons = refMoveComparisons(
    (revision) => publishedAt(revisions, revision)?.files,
  );
  const madeCommits = new Map<string, MadeCommit>();
  let comparisonsHeld: Promise<void> = Promise.resolve();
  let ci: CiAnswerer | undefined;
  githubFor(page).serve(repository, async (call) => {
    const { request } = call;
    if (ci !== undefined && isCiJudgmentCall(call)) {
      const answer = await ci(call);
      if (answer !== undefined) {
        observe(requests, call);
        return answer;
      }
    }
    if (request.kind === "repository")
      return Promise.resolve({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ default_branch: ref }),
      });
    if (request.kind === "ref" && request.ref === ref) {
      observe(requests, call);
      return Promise.resolve(commitAnswer(trunk.revision));
    }
    if (request.kind === "matching-refs") {
      observe(requests, call);
      return Promise.resolve(
        headsAnswer({
          ...Object.fromEntries(
            [...branches].map(([branch, at]) => [branch, at.revision]),
          ),
          [ref]: trunk.revision,
        }),
      );
    }
    if (request.kind === "branch") {
      observe(requests, call);
      const head = branches.get(request.branch);
      return Promise.resolve(
        head === undefined
          ? notFoundAnswer()
          : branchRefAnswer(request.branch, head.revision),
      );
    }
    if (request.kind === "compare") {
      const { base, head } = request;
      const unconnected = comparisons.unconnected(base, head);
      if (unconnected !== undefined) return unconnected;
      observe(requests, call);
      await comparisonsHeld;
      return comparisons.answer(base, head, request.perPage);
    }
    if (request.kind === "commit") {
      const made = madeCommits.get(request.sha);
      if (made !== undefined) {
        observe(requests, call);
        return Promise.resolve(madeCommitAnswer(made));
      }
      const answer = commitAnswerIn(revisions, request.sha);
      if (answer === undefined) {
        return Promise.resolve(noConnection);
      }
      observe(requests, call);
      return Promise.resolve(answer);
    }
    if (
      request.kind === "unknown" ||
      request.kind === "ref" ||
      isActionsRequest(request)
    ) {
      return Promise.resolve(noConnection);
    }
    const at = publishedAt(revisions, request.revision);
    if (at === undefined) {
      return Promise.resolve(noConnection);
    }
    observe(requests, call);
    if (request.kind === "commit-list") {
      return Promise.resolve(commitListIn(at, request.path, request.perPage));
    }
    if (request.kind === "listing") {
      return Promise.resolve(
        directoryListingAnswer(request.path, [
          ...listedFiles(at.files).filter(
            ({ path }) => at.unanswered?.includes(path) !== true,
          ),
          ...(at.unanswered ?? []).map(unansweredFile),
        ]),
      );
    }
    if (request.kind === "tree") {
      return Promise.resolve(treeListingAnswer(request.path, at.files));
    }
    if (at.unanswered?.includes(request.path) === true) {
      return Promise.resolve(noConnection);
    }
    const body = Object.hasOwn(at.files, request.path)
      ? at.files[request.path]
      : undefined;
    return Promise.resolve(
      body === undefined ? notFoundAnswer() : rawFileAnswer(body),
    );
  });
  return {
    requests,
    moveTrunk(at, by) {
      comparisons.moved(trunk.revision, at.revision, by);
      for (const made of by ?? []) {
        madeCommits.set(made.sha, made);
      }
      trunk = at;
      revisions.push(at);
    },
    serveCi(answer) {
      ci = answer;
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
