// Serves fixed files published at one revision of a repository, as GitHub
// would answer the local `gh` behind the page's dashboard
// (./support/fakeGitHub.ts), observing each read it answers.

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest";
import {
  commitAnswer,
  commitListFor,
  directoryListingAnswer,
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
export function publishFiles(
  page: Page,
  published: {
    readonly repository: string;
    readonly revision: string;
    readonly files: Readonly<Record<string, string>>;
    readonly committed?: Readonly<Record<string, Date>>;
  },
): Promise<ObservedRequest[]> {
  const observed: ObservedRequest[] = [];
  const { repository, revision, files, committed } = published;
  githubFor(page).serve(repository, (call) => {
    const { request } = call;
    if (request.kind === "ref" && request.ref === "main") {
      observe(observed, call);
      return Promise.resolve(commitAnswer(revision));
    }
    if (request.kind === "commit-list" && request.revision === revision) {
      observe(observed, call);
      return Promise.resolve(
        commitListFor(committed, request.path) ?? noConnection,
      );
    }
    if (request.kind === "listing" && request.revision === revision) {
      observe(observed, call);
      return Promise.resolve(
        directoryListingAnswer(request.path, Object.keys(files)),
      );
    }
    if (request.kind !== "content" || request.revision !== revision) {
      return Promise.resolve(noConnection);
    }
    observe(observed, call);
    const body = Object.hasOwn(files, request.path)
      ? files[request.path]
      : undefined;
    return Promise.resolve(
      body === undefined ? notFoundAnswer() : rawFileAnswer(body),
    );
  });
  return Promise.resolve(observed);
}
