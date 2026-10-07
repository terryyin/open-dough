// Reading resumes with one read first (../server/readAdmission.ts), at the
// local authenticated read boundary over real HTTP with the synthetic `gh`:
// once a wait has passed, directed or backed off, one read reaches GitHub
// while the others wait; refused with a new wait, it answers every waiting
// request as limited with nothing else asked; answered, unreachable, left, or
// timed out, the others are asked. Each case starts a server of its own,
// because the wait outlives the request that met it. How a wait holds back
// reads: ./authenticated-read-cooldown.spec.ts; a wait that starts while
// reads wait their turn: ./authenticated-read-wait-in-turn.spec.ts; the turns
// themselves: ./authenticated-read-turns.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { everyRepository } from "./support/fakeGitHub.ts";
import { answeringFirst, holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { onServerOfItsOwn, untilReported } from "./support/directedWait.ts";
import {
  expectHeldBack,
  heldBackPattern,
  timedRead,
  type Timed,
} from "./support/heldBackReads.ts";
import {
  noConnection,
  rateLimitedAnswer,
  type OriginAnswer,
} from "./originAnswers.ts";
import { abandonedRequest } from "./support/rawHttp.ts";
import {
  asked,
  isSeed,
  published,
  refusingFirst,
  revision,
  seedPaths,
  seedRead,
} from "./support/resumingReads.ts";
import { askedSince, readAt, refusedMarker } from "./support/sharedReads.ts";

// Serves the revision with its backlog read, then meets a wait on the last
// seed read and lets it pass, as reported.
async function afterWait(
  server: DashboardServer,
  refusal: OriginAnswer,
): Promise<void> {
  server.github.serve(everyRepository, published);
  expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
  server.github.serve(everyRepository, refusingFirst(published, refusal));
  const limited = await timedRead(server, seedRead(seedPaths[9] ?? ""));
  const seconds = limited.body.retryAfterSeconds ?? Number.NaN;
  expect(seconds).toBeLessThanOrEqual(1);
  await untilReported(limited.arrivedAt, seconds);
}

const waits = [
  {
    name: "a directed wait",
    refusal: rateLimitedAnswer(429, { "Retry-After": "1" }),
  },
  { name: "a backed-off wait", refusal: rateLimitedAnswer() },
];

const threeReads = seedPaths.slice(0, 3);

for (const { name, refusal } of waits) {
  test(`after ${name}, three requests send one read first; refused with a new wait, all three are answered as limited and nothing else reached GitHub`, async () => {
    await onServerOfItsOwn(
      async (server) => {
        await afterWait(server, refusal);
        server.github.serve(
          everyRepository,
          refusingFirst(
            published,
            rateLimitedAnswer(429, { "Retry-After": "600" }),
          ),
        );
        const before = server.github.calls.length;

        const answers = await Promise.all(
          threeReads.map((path) => timedRead(server, seedRead(path))),
        );

        expect(askedSince(server, before)).toHaveLength(1);
        const refused = answers.filter(
          ({ body }) => !heldBackPattern.test(body.error ?? ""),
        );
        expect(refused).toHaveLength(1);
        const [first] = refused as [Timed];
        expect(first.body).toMatchObject({ retryAfterSeconds: 600 });
        expect(first.body.error).toContain(
          "GitHub asked to wait 600 seconds before asking again.",
        );
        for (const answer of answers.filter((each) => each !== first)) {
          expectHeldBack(answer, first, "a request behind the first read");
        }
      },
      { mode: "dev", limitBackoffMs: 1_000 },
    );
  });

  test(`after ${name}, three requests send one read first; answered, the other two are asked and all three are answered`, async () => {
    await onServerOfItsOwn(
      async (server) => {
        await afterWait(server, refusal);
        const held = holdingAnswer(published, isSeed);
        server.github.serve(everyRepository, held.answer);
        const before = server.github.calls.length;

        const answers = threeReads.map((path) =>
          readAt(server, seedRead(path)),
        );
        await expect
          .poll(() => askedSince(server, before).length, { timeout: 5_000 })
          .toBe(1);
        // Answered once every request sent before it waits on its `gh` call.
        await refusedMarker(server);
        expect(askedSince(server, before)).toHaveLength(1);

        held.release();
        const answered = await Promise.all(answers);
        expect(answered.map(({ status }) => status)).toEqual([200, 200, 200]);
        expect(
          answered.map(
            ({ body }) => (JSON.parse(body) as { text: string }).text,
          ),
        ).toEqual(threeReads.map((path) => `# ${path}\n`));
        expect([...askedSince(server, before)].sort()).toEqual(
          asked(threeReads).sort(),
        );
      },
      { mode: "dev", limitBackoffMs: 1_000 },
    );
  });
}

// The read that goes first after a wait, ended without a rate limit.
const firstRead = seedRead(seedPaths[3] ?? "");

// How the first read after a wait ends without a rate limit and without an
// answer from GitHub, and the server's bound on one read's wait that ending
// needs.
const endingsWithoutLimit: readonly {
  readonly name: string;
  readonly readTimeoutMs?: number;
  readonly end: (server: DashboardServer) => Promise<() => void>;
}[] = [
  {
    name: "GitHub is unreachable",
    end: async (server) => {
      server.github.serve(
        everyRepository,
        answeringFirst(published, isSeed, noConnection),
      );
      const unreachable = await readAt(server, firstRead);
      expect(unreachable.status).toBe(502);
      return () => undefined;
    },
  },
  {
    name: "the request leaves",
    end: async (server) => {
      const held = holdingAnswer(published, isSeed);
      server.github.serve(everyRepository, held.answer);
      const before = server.github.calls.length;
      const leaving = abandonedRequest({
        url: `${server.baseURL}/__authenticated-read?source=open-dough${firstRead}`,
        headers: { Origin: server.origin },
      });
      await expect
        .poll(() => askedSince(server, before).length, { timeout: 5_000 })
        .toBe(1);
      leaving.cutAfter(0);
      return held.release;
    },
  },
  {
    name: "the read reaches its bound",
    readTimeoutMs: 5_000,
    end: async (server) => {
      const held = holdingAnswer(published, isSeed);
      server.github.serve(everyRepository, held.answer);
      const timedOut = await readAt(server, firstRead);
      expect(timedOut.status).toBe(502);
      expect(timedOut.body).toContain(
        "The local GitHub CLI did not answer within 5 seconds",
      );
      return held.release;
    },
  },
];

for (const { name, readTimeoutMs, end } of endingsWithoutLimit) {
  test(`after a wait, when the first read ends because ${name}, three requests are asked together and all three are answered`, async () => {
    await onServerOfItsOwn(
      async (server) => {
        await afterWait(server, rateLimitedAnswer(429, { "Retry-After": "1" }));
        const releaseFirst = await end(server);
        const held = holdingAnswer(published, isSeed);
        server.github.serve(everyRepository, held.answer);
        const before = server.github.calls.length;

        const answers = threeReads.map((path) =>
          readAt(server, seedRead(path)),
        );
        // Closing the server ends any request still waiting, which then
        // reports its hang-up in place of the expectation that failed.
        void Promise.allSettled(answers);
        await expect
          .poll(() => askedSince(server, before).length, { timeout: 3_000 })
          .toBe(3);

        held.release();
        releaseFirst();
        const answered = await Promise.all(answers);
        expect(answered.map(({ status }) => status)).toEqual([200, 200, 200]);
        expect([...askedSince(server, before)].sort()).toEqual(
          asked(threeReads).sort(),
        );
      },
      { mode: "dev", limitBackoffMs: 1_000, readTimeoutMs },
    );
  });
}
