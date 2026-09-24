// Serves fixed files published at one revision of a repository, as GitHub
// would answer the local `gh` behind the page's dashboard
// (./support/fakeGitHub.ts), observing each read it answers.

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest";
import {
  branchRefAnswer,
  commitAnswer,
  commitListFor,
  directoryListingAnswer,
  headsAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
} from "./originAnswers";
import { observe, type ObservedRequest } from "./originObservation";

// A repository whose `main` names one revision at which these files are
// published: every contents read at that revision is observed and answered
// with the file's bytes, or not-found for any other path, and a directory
// listing with the published files directly in that directory. A commit list
// for a path at that revision is observed and answered with the commit time
// `committed` gives that path; for any other path the connection fails.
// Each of `branches` is a published branch head, answered and observed the
// same way at its own revision; any other branch is not published. A check
// lists `main` and every published branch head; checks are answered but not
// observed (./originObservation.ts).
export type PublishedRevision = {
  readonly revision: string;
  readonly files: Readonly<Record<string, string>>;
  readonly committed?: Readonly<Record<string, Date>>;
};

function publishedAt(
  revisions: readonly PublishedRevision[],
  revision: string,
): PublishedRevision | undefined {
  return revisions.find((each) => each.revision === revision);
}

// Published files whose `main` and branch heads move while the page is open.
// Every revision ever published stays readable, as commits do.
export type MovingFiles = {
  readonly requests: ObservedRequest[];
  // `main` names `at` from now on.
  moveTrunk(at: PublishedRevision): void;
  // `branch` is published at `at` from now on, or, given undefined, deleted.
  moveBranch(branch: string, at: PublishedRevision | undefined): void;
};

export function publishMovingFiles(
  page: Page,
  published: PublishedRevision & {
    readonly repository: string;
    readonly branches?: Readonly<Record<string, PublishedRevision>>;
  },
): MovingFiles {
  const requests: ObservedRequest[] = [];
  const { repository } = published;
  let trunk: PublishedRevision = published;
  const branches = new Map(Object.entries(published.branches ?? {}));
  const revisions = [published, ...branches.values()];
  githubFor(page).serve(repository, (call) => {
    const { request } = call;
    if (request.kind === "ref" && request.ref === "main") {
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
          main: trunk.revision,
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
    if (request.kind === "unknown" || request.kind === "ref") {
      return Promise.resolve(noConnection);
    }
    const at = publishedAt(revisions, request.revision);
    if (at === undefined) {
      return Promise.resolve(noConnection);
    }
    observe(requests, call);
    if (request.kind === "commit-list") {
      return Promise.resolve(
        commitListFor(at.committed, request.path) ?? noConnection,
      );
    }
    if (request.kind === "listing") {
      return Promise.resolve(
        directoryListingAnswer(request.path, Object.keys(at.files)),
      );
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
    moveTrunk(at) {
      trunk = at;
      revisions.push(at);
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
