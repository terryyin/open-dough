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
// `publishCommittedFiles` (./committedFiles.ts) as one real commit (and
// `serveCommitted` a real commit through a journey's own answers),
// ./committedOrigin.ts whole committed revisions; ./originObservation.ts holds
// what every origin observes of the calls it answers, leaving out revision
// checks.

import type { Page } from "@playwright/test";
import { githubFor } from "./dashboardTest.ts";
import {
  asHeadsListing,
  commitAnswer,
  noConnection,
  notFoundAnswer,
  rawFileAnswer,
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
import type { GhCall, RepositoryAnswerer } from "./support/fakeGitHub.ts";
import {
  disconnectOriginThroughServedHomes,
  expectServedHomesReach,
  refuseOriginThroughServedHomes,
  routeServedHomesToPublication,
} from "./support/fixtureOriginRoute.ts";
import {
  commitPublishedOrigin,
  type PublishedOrigin,
} from "./support/publishedOrigin.ts";

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
export { publishCommittedFiles, serveCommitted } from "./committedFiles.ts";
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
};

export function publishOrigin(
  page: Page,
  origin: Origin,
  repository: string = defaultRepository,
): Promise<ObservedRequest[]> {
  return Promise.resolve(serveOrigin(page, origin, repository));
}

// Serve the same backlog bytes from a real main commit, or a 404 when the
// backlog is absent from that commit.
export function publishCommittedBacklog(page: Page, backlog: string | null) {
  const { published, github, requests } = commitServedOrigin(
    page,
    "main",
    backlog,
  );
  const { revision } = published;
  expectServedHomesReach(github, defaultRepository, revision);
  return { revision, requests };
}

// How Git fails to verify the published trunk while GitHub REST would still
// answer `main` and its backlog: origin cannot be reached, its trunk branch
// is missing, or it refuses the credential with HTTP 401 or 403.
export type GitOriginFailure =
  "unreachable origin" | "missing trunk" | "refused 401" | "refused 403";

export function publishGitOriginFailure(
  page: Page,
  failure: GitOriginFailure,
): void {
  const branch = failure === "missing trunk" ? "other" : "main";
  const { published, github } = commitServedOrigin(page, branch, "");
  if (failure === "unreachable origin")
    disconnectOriginThroughServedHomes(
      github,
      published.origin,
      defaultRepository,
    );
  if (failure === "refused 401")
    refuseOriginThroughServedHomes(github, defaultRepository, 401);
  if (failure === "refused 403")
    refuseOriginThroughServedHomes(github, defaultRepository, 403);
}

// A real commit on `branch` holding `backlog` (absent when null), served by
// REST as `main` and reached by Git under every served HOME.
function commitServedOrigin(
  page: Page,
  branch: string,
  backlog: string | null,
) {
  const published = commitPublishedOrigin({ branch, backlog });
  const { revision } = published;
  const requests = serveOrigin(
    page,
    {
      ref: commitAnswer(revision),
      backlog: {
        revision,
        answer: backlog === null ? notFoundAnswer() : rawFileAnswer(backlog),
      },
    },
    defaultRepository,
    published,
  );
  const github = githubFor(page);
  routeServedHomesToPublication(github, defaultRepository);
  return { published, github, requests };
}

function serveOrigin(
  page: Page,
  origin: Origin,
  repository: string,
  published?: PublishedOrigin,
): ObservedRequest[] {
  const observed: ObservedRequest[] = [];
  const { ref, backlog } = origin;
  const answerFor = (call: GhCall): OriginAnswer => {
    const target = publishedTarget(call);
    if (target === "main") {
      observe(observed, call);
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
      const files =
        published !== undefined && "status" in answer && answer.status === 404
          ? {}
          : { [backlogPath]: "body" in answer ? answer.body : "" };
      return directoryListingAnswer(request.path, listedFiles(files));
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
  };
  const respond: RepositoryAnswerer = (call) =>
    Promise.resolve(answerFor(call));
  githubFor(page).serve(
    repository,
    published === undefined ? respond : Object.assign(respond, published),
  );
  return observed;
}
