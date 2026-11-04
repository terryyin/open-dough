// Serves fixed files published at one revision of a repository, as GitHub
// would answer the local `gh` behind the page's dashboard
// (./support/fakeGitHub.ts), observing each read it answers.

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest.ts";
import {
  branchRefAnswer,
  commitAnswer,
  headsAnswer,
  httpErrorAnswer,
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

// Configured ref (default `main`) names one revision of these published files:
// contents, directory listings, and path commit lists/history answer as origin
// would (./pathHistoryAnswers.ts); unanswered paths list but fail as a lost
// connection; checks list the ref and branch heads without observation
// (./originObservation.ts); comparisons follow ref moves
// (./comparisonAnswers.ts) and may be held; once CI is served, Actions and
// branch-by-name history answer through it first.
export type PublishedRevision = {
  readonly revision: string;
  readonly files: Readonly<Record<string, string>>;
  readonly unanswered?: readonly string[];
  readonly committed?: Readonly<Record<string, Date>>;
  // Newest-first path history at this revision; null when not published.
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
  // Answers CI judgment calls from now on; undefined leaves them to published files.
  serveCi(answer: CiAnswerer): void;
  // Branch-head listings fail with HTTP 504 until restored (ref alone still answers).
  failListing(): () => void;
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
  let listingFails = false;
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
      if (listingFails) {
        return Promise.resolve(httpErrorAnswer(504, "Server Error"));
      }
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
    failListing() {
      listingFails = true;
      return () => {
        listingFails = false;
      };
    },
  };
}

export function publishFiles(
  page: Page,
  published: Parameters<typeof publishMovingFiles>[1],
): Promise<ObservedRequest[]> {
  return Promise.resolve(publishMovingFiles(page, published).requests);
}
