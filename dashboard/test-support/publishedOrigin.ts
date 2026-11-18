// Stands in for what GitHub publishes, as the local `gh` CLI behind the page's
// dashboard server asks for it (./support/fakeGitHub.ts): a test supplies the
// raw answers GitHub would give for the ref and for the backlog file, and the
// real local read boundary, `gh` invocation, browser reader, shared backlog
// interpretation, and UI do everything after that. Raw-answer construction
// (successful, rate-limited, not-found, connection failure, no login) lives
// in ./originAnswers; this module serves those answers for one or more
// concurrently observed repositories.
//
// `publishOrigin` publishes only the ref and the backlog file, and
// `publishMovingOrigin` (./publishedMovingOrigin.ts) also any record files a
// push names; any other content path at a published revision is answered as
// not found (missing), not as a lost connection.
// Both list a published revision's directories from those files alone, so a
// project without agent profiles lists none; listings are not observed.
// `publishFiles` (./publishedFiles.ts) publishes fixed files at one revision,
// ./committedOrigin.ts whole committed revisions; ./originObservation.ts holds
// what every origin observes of the calls it answers, leaving out revision
// checks.

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest.ts";
import {
  asHeadsListing,
  noConnection,
  notFoundAnswer,
  type OriginAnswer,
} from "./originAnswers.ts";
import { directoryListingAnswer, listedFiles } from "./listingAnswers.ts";
import { observe, type ObservedRequest } from "./originObservation.ts";
import {
  backlogPath,
  defaultRepository,
  publishedTarget,
} from "./publishedOriginBasics.ts";
import { defaultPassingBaseCi } from "./support/baseCiActions.ts";

export {
  commitAnswer,
  httpErrorAnswer,
  noConnection,
  notFoundAnswer,
  notLoggedIn,
  rateLimitedAnswer,
  rawFileAnswer,
  type OriginAnswer,
  type RawAnswer,
} from "./originAnswers.ts";
export {
  detailContentPaths,
  pathsRead,
  type ObservedRequest,
} from "./originObservation.ts";
export { publishFiles } from "./publishedFiles.ts";
export {
  backlogPath,
  defaultRepository,
  publishedTarget,
} from "./publishedOriginBasics.ts";
export {
  publishMovingOrigin,
  type MovingOrigin,
} from "./publishedMovingOrigin.ts";

export type Origin = {
  // What GitHub answers for `commits/main`, and, listed as `main`'s head, for
  // a check of every branch head.
  readonly ref: OriginAnswer;
  // What GitHub answers for the backlog file, and at which revision it is
  // published. A read at any other revision gets no answer and fails.
  readonly backlog?: {
    readonly revision: string;
    readonly answer: OriginAnswer;
  };
  // Holds the ref answer back until the test lets it go.
  readonly refHeldUntil?: Promise<void>;
};

export function publishOrigin(
  page: Page,
  origin: Origin,
  repository: string = defaultRepository,
): Promise<ObservedRequest[]> {
  const observed: ObservedRequest[] = [];
  const { ref, refHeldUntil, backlog } = origin;
  githubFor(page).serve(repository, async (call) => {
    const target = publishedTarget(call);
    if (target === "main") {
      observe(observed, call);
      await refHeldUntil;
      return call.request.kind === "matching-refs" ? asHeadsListing(ref) : ref;
    }
    if (target !== undefined && target === backlog?.revision) {
      observe(observed, call);
      return backlog.answer;
    }
    const { request } = call;
    if (
      request.kind === "listing" &&
      backlog !== undefined &&
      request.revision === backlog.revision
    ) {
      const { answer } = backlog;
      return directoryListingAnswer(
        request.path,
        listedFiles({ [backlogPath]: "body" in answer ? answer.body : "" }),
      );
    }
    // Published at this revision with no such file: a missing record, not a
    // temporary connection loss. Leave it unobserved so membership journeys
    // that only publish ref+backlog still account only those two reads.
    if (
      request.kind === "content" &&
      backlog !== undefined &&
      request.revision === backlog.revision
    ) {
      return notFoundAnswer();
    }
    // Default passing Actions / head history for base CI (SEED-210).
    const headSha =
      backlog?.revision ??
      ("body" in ref && typeof ref.body === "string"
        ? (JSON.parse(ref.body) as { sha?: string }).sha
        : undefined);
    return defaultPassingBaseCi(request, headSha) ?? noConnection;
  });
  return Promise.resolve(observed);
}
