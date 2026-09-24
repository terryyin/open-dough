// The local authenticated read boundary's revision check as its specs
// (./authenticated-read-revision-check.spec.ts,
// ./authenticated-read-revision-check-failures.spec.ts) drive it: a
// dev-mode dashboard server over real HTTP, whose synthetic `gh` answers each
// repository's listing of branch heads, and its `main`, as the case sets
// them, and records every invocation.

import { test } from "@playwright/test";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer";
import {
  asHeadsListing,
  commitAnswer,
  headsEtag,
  type OriginAnswer,
} from "./originAnswers";
import { rawRequest } from "./support/rawHttp";

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

// Starts the server for the enclosing `test.describe` and stops it after.
// `main` sets what GitHub answers for a repository's `main`, listed as its
// only head unless `listing` sets that repository's listing instead.
export function revisionCheckBoundary() {
  let server: DashboardServer | undefined;
  const main = new Map<string, OriginAnswer>();
  const listing = new Map<string, OriginAnswer>();
  const started = () => {
    if (server === undefined) {
      throw new Error("The revision check boundary has not started.");
    }
    return server;
  };

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
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
  });

  test.afterAll(async () => {
    await server?.close();
  });

  // Asks whether `source` still names `since`; answers the response and the
  // `gh` invocations it made.
  async function check(source: string, since: string) {
    const running = started();
    const callsBefore = running.ghCalls().length;
    const response = await rawRequest({
      url: `${running.baseURL}/__authenticated-read?source=${source}&since=${since}`,
      headers: { Origin: running.origin },
    });
    return {
      status: response.status,
      cacheControl: response.headers["cache-control"],
      body: JSON.parse(response.body) as unknown,
      calls: running.ghCalls().slice(callsBefore),
    };
  }

  return { main, listing, check, server: started };
}
