// The local authenticated read boundary's revision check as its specs
// (./authenticated-read-revision-check.spec.ts,
// ./authenticated-read-revision-check-failures.spec.ts) drive it: a
// dev-mode dashboard server over real HTTP, whose synthetic `gh` answers each
// repository's listing of branch heads, and its `main`, as the case sets
// them, and records every invocation.

import { test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  asHeadsListing,
  commitAnswer,
  headsEtag,
  type OriginAnswer,
} from "./originAnswers.ts";
import { rawRequest } from "./support/rawHttp.ts";

export const revisionA = "a1".repeat(20);
export const revisionB = "b2".repeat(20);

// The argv of the listing of every branch head, conditional on `etag`.
export function checkArgv(repository: string, etag?: string): string[] {
  return [
    "api",
    "--include",
    ...(etag === undefined ? [] : ["-H", `If-None-Match: ${etag}`]),
    `repos/${repository}/git/matching-refs/heads/`,
  ];
}

// The entity tag of the listing that names `main` at `sha` and no other head.
export const listingEtag = (sha: string) => headsEtag({ main: sha });

// A started boundary: `main` sets what GitHub answers for a repository's
// `main`, listed as its only head unless `listing` sets that repository's
// listing instead.
type RevisionCheckAnswers = {
  readonly main: Map<string, OriginAnswer>;
  readonly listing: Map<string, OriginAnswer>;
};

function servedAnswers(
  server: DashboardServer,
  { main, listing }: RevisionCheckAnswers,
): void {
  for (const repository of ["terryyin/open-dough", "nerds-odd-e/doughnut"]) {
    server.github.serve(repository, ({ request }) =>
      Promise.resolve(
        request.kind === "matching-refs"
          ? (listing.get(repository) ??
              asHeadsListing(main.get(repository) ?? commitAnswer(revisionA)))
          : (main.get(repository) ?? commitAnswer(revisionA)),
      ),
    );
  }
}

// Asks `server` whether `source` still names `since`; answers the response
// and the `gh` invocations it made.
async function checked(server: DashboardServer, source: string, since: string) {
  const callsBefore = server.ghCalls().length;
  const response = await rawRequest({
    url: `${server.baseURL}/__authenticated-read?source=${source}&since=${since}`,
    headers: { Origin: server.origin },
  });
  return {
    status: response.status,
    cacheControl: response.headers["cache-control"],
    body: JSON.parse(response.body) as unknown,
    calls: server.ghCalls().slice(callsBefore),
  };
}

// A boundary of its own for one case, closed by the case: a rate limit
// GitHub directs holds back every later read of its server, so a case that
// meets one keeps it from the cases that follow.
export async function ownRevisionCheckBoundary() {
  const answers: RevisionCheckAnswers = { main: new Map(), listing: new Map() };
  const server = await startDashboardServer({ mode: "dev" });
  servedAnswers(server, answers);
  return {
    ...answers,
    check: (source: string, since: string) => checked(server, source, since),
    close: () => server.close(),
  };
}

// Starts the server for the enclosing `test.describe` and stops it after.
export function revisionCheckBoundary() {
  let server: DashboardServer | undefined;
  const answers: RevisionCheckAnswers = { main: new Map(), listing: new Map() };
  const started = () => {
    if (server === undefined) {
      throw new Error("The revision check boundary has not started.");
    }
    return server;
  };

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
    servedAnswers(server, answers);
  });

  test.afterAll(async () => {
    await server?.close();
  });

  const check = (source: string, since: string) =>
    checked(started(), source, since);

  return { ...answers, check, server: started };
}
