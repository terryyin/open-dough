// A shared read that GitHub refuses or that stalls, at the local
// authenticated read boundary (../server/ghRead.ts): every request waiting
// on it is answered as it would be alone, with any wait GitHub directed;
// nothing is kept, so the next request asks again, once any wait GitHub
// directed has passed; and no request, however
// late it joins, waits past its own bound or keeps the `gh` call running
// past the call's. Tested directly against real HTTP and the synthetic
// `gh`, with the requests made to coincide on a held answer as
// ./authenticated-read-shared.spec.ts makes them (./support/sharedReads.ts).
// One request's refusals: ./authenticated-read-revision-check-failures.spec.ts;
// its bound: ./authenticated-read-subprocess-lifecycle.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import {
  startDashboardServer,
  waitUntil,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { processAlive } from "./support/processGroup.ts";
import { rateLimitedAnswer } from "./originAnswers.ts";
import { untilReported } from "./support/directedWait.ts";
import {
  answeredTogether,
  askedSince,
  readAt,
  refusedMarker,
  servedHolding,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "./support/sharedReads.ts";

test.describe.configure({ mode: "serial" });

const revisionOf = (pair: string) => pair.repeat(20);
const isSeed = (request: GhRequest) =>
  request.kind === "content" && request.path === sharedSeedPath;
const isListing = (request: GhRequest) => request.kind === "matching-refs";

const failed = (body: string) => JSON.parse(body) as unknown;

// A read's answer and when it arrived.
const answeredAt = (server: DashboardServer, query: string) =>
  readAt(server, query).then((answer) => ({ answer, at: Date.now() }));

test.describe("authenticated read boundary: a refused shared read fails every waiter alike (dev launch mode)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "dev" });
  });

  test.afterAll(async () => {
    await server.close();
  });

  test("two requests waiting on a refused read both report the refusal, and the next request asks again and is answered", async () => {
    const revision = revisionOf("7a");
    const holding = await servedHolding(
      server,
      revision,
      isSeed,
      [`&revision=${revision}`],
      {
        status: 500,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify({ message: "Server Error" }),
      },
    );
    const { answers, whileHeld } = await answeredTogether(
      server,
      holding,
      [sharedSeedRead(revision), sharedSeedRead(revision)],
      1,
    );
    expect(whileHeld).toEqual([`content ${sharedSeedPath}@${revision}`]);
    expect(answers.map(({ status }) => status)).toEqual([502, 502]);
    expect(failed(answers[0]?.body ?? "")).toEqual({
      error: `GitHub answered HTTP 500 to the local GitHub CLI while reading ${sharedSeedPath} at ${revision}.`,
      recovery: "transient",
    });
    expect(answers[1]?.body).toBe(answers[0]?.body);

    const next = await readAt(server, sharedSeedRead(revision));
    expect(next.status).toBe(200);
    expect(JSON.parse(next.body)).toMatchObject({ text: sharedSeedText });
    expect(askedSince(server, holding.before)).toEqual([
      `content ${sharedSeedPath}@${revision}`,
      `content ${sharedSeedPath}@${revision}`,
    ]);
  });

  test("two checks waiting on a listing GitHub rate-limits both report the wait it directed, and the next check after it asks again", async () => {
    const revision = revisionOf("7b");
    const since = (checked: string) => `&since=${checked}`;
    const holding = await servedHolding(
      server,
      revision,
      isListing,
      [since(revision)],
      rateLimitedAnswer(429, { "Retry-After": "2" }),
    );
    const { answers, whileHeld } = await answeredTogether(
      server,
      holding,
      [since(revision), since(revisionOf("7c"))],
      1,
    );
    const answeredAt = Date.now();
    expect(whileHeld).toEqual(["matching-refs"]);
    const waited = {
      error:
        "GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of terryyin/open-dough. GitHub asked to wait 2 seconds before asking again.",
      retryAfterSeconds: 2,
    };
    expect(answers.map(({ status }) => status)).toEqual([502, 502]);
    expect(answers.map(({ body }) => failed(body))).toEqual([waited, waited]);

    // GitHub's wait holds back every read of this server until it has passed
    // (./authenticated-read-cooldown.spec.ts).
    await untilReported(answeredAt, waited.retryAfterSeconds);
    const next = await readAt(server, since(revision));
    expect(next.status).toBe(200);
    expect(JSON.parse(next.body)).toMatchObject({ revision, changed: false });
    expect(askedSince(server, holding.before)).toEqual([
      "matching-refs",
      "matching-refs",
    ]);
  });
});

test.describe("authenticated read boundary: a stalled shared read ends at its own bound for every waiter", () => {
  let server: DashboardServer;
  // A short bound for this isolated server only, through the environment
  // seam `../server/ghRead.ts`'s `readTimeoutMs` reads, long enough for a
  // second request to join halfway through it with a comfortable margin on
  // either side.
  const boundMs = 3_000;

  test.beforeAll(async () => {
    server = await startDashboardServer({
      mode: "dev",
      readTimeoutMs: boundMs,
    });
  });

  test.afterAll(async () => {
    await server.close();
  });

  const stalls = [
    {
      label: "pinned read",
      revision: revisionOf("7d"),
      held: isSeed,
      warm: (revision: string) => `&revision=${revision}`,
      read: sharedSeedRead,
      reading: (revision: string) => `${sharedSeedPath} at ${revision}`,
      asked: (revision: string) => `content ${sharedSeedPath}@${revision}`,
    },
    {
      label: "revision check",
      revision: revisionOf("7e"),
      held: isListing,
      warm: (revision: string) => `&since=${revision}`,
      read: (revision: string) => `&since=${revision}`,
      reading: () => "main of terryyin/open-dough",
      asked: () => "matching-refs",
    },
  ];

  for (const stall of stalls) {
    test(`a ${stall.label} joined late is answered as timed out within each request's bound, its \`gh\` ends at the read's bound, and a later request asks again`, async () => {
      const { revision } = stall;
      const held = await servedHolding(server, revision, stall.held, [
        stall.warm(revision),
      ]);
      const { before } = held;

      const firstAsked = Date.now();
      const first = answeredAt(server, stall.read(revision));
      await refusedMarker(server);
      await expect
        .poll(() => server.github.calls.length - before, { timeout: 5_000 })
        .toBe(1);
      expect(processAlive(server.ghPid())).toBe(true);
      // Join halfway through the read's bound: the read's bound then ends
      // half a bound before the joiner's own would, so a wait of the
      // joiner's own, or a read it kept outstanding, would end at or past
      // the joiner's deadline.
      await new Promise((resolve) =>
        setTimeout(resolve, firstAsked + boundMs / 2 - Date.now()),
      );
      const joinerDeadline = Date.now() + boundMs;
      const late = answeredAt(server, stall.read(revision));
      await refusedMarker(server);
      const { answer: firstAnswer, at: firstAnsweredAt } = await first;
      const { answer: lateAnswer, at: lateAnsweredAt } = await late;
      const ghEndedAt = (await waitUntil(() => !processAlive(server.ghPid()), {
        timeoutMs: 5_000,
      }))
        ? Date.now()
        : Infinity;

      const timedOut = {
        error: `The local GitHub CLI did not answer within ${String(boundMs / 1000)} seconds while reading ${stall.reading(revision)}.`,
        recovery: "transient",
      };
      expect([firstAnswer.status, lateAnswer.status]).toEqual([502, 502]);
      expect(failed(firstAnswer.body)).toEqual(timedOut);
      expect(failed(lateAnswer.body)).toEqual(timedOut);
      expect(firstAnsweredAt).toBeLessThan(joinerDeadline);
      expect(lateAnsweredAt).toBeLessThan(joinerDeadline);
      expect(ghEndedAt).toBeLessThan(joinerDeadline);
      expect(askedSince(server, before)).toEqual([stall.asked(revision)]);

      held.release();
      expect((await readAt(server, stall.read(revision))).status).toBe(200);
      expect(askedSince(server, before)).toEqual([
        stall.asked(revision),
        stall.asked(revision),
      ]);
    });
  }
});
