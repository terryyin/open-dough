// The wait GitHub directs when it rate-limits a read, at the local
// authenticated read boundary (../server/ghRead.ts): whichever read GitHub
// refuses -- a content read, a directory listing, a history read, a ref
// resolution, or a branch-head resolution -- the answer says GitHub asked to
// wait and carries that wait, whether GitHub directed it with `Retry-After` or
// with a reset time once nothing remains. An unmarked `403` and a `404` carry
// no wait. A rate limit that directs nothing waits as the process backs off:
// ./authenticated-read-backoff.spec.ts. Tested directly against real
// HTTP and the synthetic `gh` (./support/sharedReads.ts publishes the
// revision). The direction's validation and bound, and the check's and
// comparison's own refusals:
// ./authenticated-read-revision-check-failures.spec.ts and
// ./authenticated-read-containment.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { onServerOfItsOwn } from "./support/directedWait.ts";
import { everyRepository } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import {
  notFoundAnswer,
  rateLimitedAnswer,
  type OriginAnswer,
} from "./originAnswers.ts";
import {
  readAt,
  sharedReadsPublished,
  sharedSeedPath,
  sharedSeedRead,
} from "./support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

// Each case publishes its own revision: the boundary remembers what it read
// at a revision for as long as the server runs.
const revisionOf = (pair: string) => pair.repeat(20);
const repository = "terryyin/open-dough";

// One read of each kind the boundary asks GitHub, the request that asks it
// at `revision`, the GitHub question it reaches, and how its failure names
// what was being read.
type ReadKind = {
  readonly name: string;
  readonly query: (revision: string) => string;
  readonly refused: (request: GhRequest) => boolean;
  readonly reading: (revision: string) => string;
};

const readKinds: readonly ReadKind[] = [
  {
    name: "a content read",
    query: sharedSeedRead,
    refused: (request) =>
      request.kind === "content" && request.path === sharedSeedPath,
    reading: (revision) => `${sharedSeedPath} at ${revision}`,
  },
  {
    name: "a directory listing",
    query: (revision) => `&revision=${revision}&agents=profiles`,
    refused: (request) => request.kind === "listing",
    reading: (revision) => `.planning/agents at ${revision}`,
  },
  {
    name: "a history read",
    query: (revision) => `${sharedSeedRead(revision)}&committed=last`,
    refused: (request) => request.kind === "commit-list",
    reading: (revision) =>
      `the last commit of ${sharedSeedPath} at ${revision}`,
  },
  {
    name: "a ref resolution",
    query: () => "",
    refused: (request) => request.kind === "ref",
    reading: () => `main of ${repository}`,
  },
  {
    name: "a branch-head resolution",
    query: (revision) => `&revision=${revision}&branch=story/one`,
    refused: (request) => request.kind === "branch",
    reading: () => `branch story/one of ${repository}`,
  },
];

const limited = (status: number, reading: string, wait: string) =>
  `GitHub limited the rate of the local GitHub CLI's requests (HTTP ${String(status)}) while reading ${reading}. ${wait}`;
const checkAccess = `Check that \`gh auth status\` succeeds and that this login can read ${repository}, then reload the page.`;

test.describe("authenticated read boundary: every refused read reports the wait GitHub directed (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  // Answers `kind`'s read at `revision` with `refusal` and everything else
  // as published, and returns the boundary's answer: on this describe's
  // server unless `on` names another.
  async function refusedRead(
    kind: ReadKind,
    revision: string,
    refusal: OriginAnswer,
    on: DashboardServer = server,
  ) {
    const published = sharedReadsPublished(revision);
    on.github.serve(everyRepository, (call) =>
      kind.refused(call.request) ? Promise.resolve(refusal) : published(call),
    );
    const before = on.github.calls.length;
    const answer = await readAt(on, kind.query(revision));
    expect(
      on.github.calls
        .slice(before)
        .some(({ request }) => kind.refused(request)),
    ).toBe(true);
    return { status: answer.status, body: JSON.parse(answer.body) as unknown };
  }

  // `refusal` is made once that server has started.
  const refusedOnItsOwnServer = (
    kind: ReadKind,
    revision: string,
    refusal: () => OriginAnswer,
  ) => onServerOfItsOwn((own) => refusedRead(kind, revision, refusal(), own));

  test("each kind of read refused with Retry-After reports that GitHub asked to wait, and the wait", async () => {
    for (const [index, kind] of readKinds.entries()) {
      const revision = revisionOf(`${String(index + 1)}a`);
      const answer = await refusedOnItsOwnServer(kind, revision, () =>
        rateLimitedAnswer(index % 2 === 0 ? 403 : 429, {
          "Retry-After": "120",
        }),
      );
      expect(answer, kind.name).toEqual({
        status: 502,
        body: {
          error: limited(
            index % 2 === 0 ? 403 : 429,
            kind.reading(revision),
            "GitHub asked to wait 120 seconds before asking again.",
          ),
          retryAfterSeconds: 120,
        },
      });
    }
  });

  test("a read refused with nothing remaining reports the wait until GitHub's reset time", async () => {
    const [content] = readKinds;
    if (content === undefined) throw new Error("no content read");
    const revision = revisionOf("6b");
    const answer = await refusedOnItsOwnServer(content, revision, () =>
      rateLimitedAnswer(403, {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 90),
      }),
    );
    expect(answer.status).toBe(502);
    const { error, retryAfterSeconds } = answer.body as {
      error: string;
      retryAfterSeconds: number;
    };
    expect(retryAfterSeconds).toBeGreaterThanOrEqual(85);
    expect(retryAfterSeconds).toBeLessThanOrEqual(90);
    expect(error).toBe(
      limited(
        403,
        content.reading(revision),
        `GitHub asked to wait ${String(retryAfterSeconds)} seconds before asking again.`,
      ),
    );
  });

  test("an unmarked 403 and a 404 carry no wait, and the refusals keep their access advice", async () => {
    const [content] = readKinds;
    if (content === undefined) throw new Error("no content read");
    const forbiddenAt = revisionOf("8d");
    expect(
      await refusedRead(content, forbiddenAt, {
        status: 403,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify({
          message: "Resource not accessible by integration",
        }),
      }),
    ).toEqual({
      status: 502,
      body: {
        error: `GitHub answered HTTP 403 to the local GitHub CLI while reading ${content.reading(forbiddenAt)}. ${checkAccess}`,
      },
    });

    const missingAt = revisionOf("9e");
    expect(await refusedRead(content, missingAt, notFoundAnswer())).toEqual({
      status: 502,
      body: {
        error: `GitHub answered HTTP 404 to the local GitHub CLI while reading ${content.reading(missingAt)}. ${checkAccess}`,
      },
    });
  });
});
