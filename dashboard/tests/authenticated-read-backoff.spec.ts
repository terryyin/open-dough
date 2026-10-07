// A rate limit that directs no wait holds back every read of the server
// process (../server/readAdmission.ts) as a directed one does, for a wait of
// the process's own, at the local authenticated read boundary over real HTTP
// with the synthetic `gh` (./support/sharedReads.ts publishes the revision):
// one minute, doubling while the limit continues, up to an hour, and the base
// again once a read succeeds. Each case starts a server of its own, because
// the wait outlives the request that met it. How a directed wait holds back
// reads: ./authenticated-read-cooldown.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import { onServerOfItsOwn, untilReported } from "./support/directedWait.ts";
import {
  expectHeldBack,
  servedRefusing,
  timedRead,
} from "./support/heldBackReads.ts";
import { rateLimitedAnswer } from "./originAnswers.ts";
import {
  askedSince,
  otherSeedPath,
  readAt,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "./support/sharedReads.ts";

const revision = "c3".repeat(20);
const otherSeedRead = `&revision=${revision}&path=${encodeURIComponent(otherSeedPath)}`;
const isContent = (request: GhRequest, path: string) =>
  request.kind === "content" && request.path === path;

test.describe("authenticated read boundary: a rate limit that directs no wait backs off (dev launch mode)", () => {
  const undirectedAs = (path: string, seconds: number) =>
    `GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading ${path} at ${revision}. GitHub named no wait, so reading resumes in ${String(seconds)} seconds.`;

  test("each refusal right after the wait waits twice as long, and after a read succeeds the next waits the base again", async () => {
    await onServerOfItsOwn(
      async (server) => {
        let limiting = true;
        servedRefusing(server, revision, (request) =>
          limiting && request.kind === "content"
            ? rateLimitedAnswer()
            : undefined,
        );
        const first = await timedRead(server, sharedSeedRead(revision));
        expect(first.body).toEqual({
          error: undirectedAs(sharedSeedPath, 1),
          retryAfterSeconds: 1,
        });

        await untilReported(first.arrivedAt, 1);
        const second = await timedRead(server, sharedSeedRead(revision));
        expect(second.body).toEqual({
          error: undirectedAs(sharedSeedPath, 2),
          retryAfterSeconds: 2,
        });

        await untilReported(second.arrivedAt, 2);
        limiting = false;
        const read = await readAt(server, sharedSeedRead(revision));
        expect(read.status).toBe(200);
        expect(JSON.parse(read.body)).toMatchObject({ text: sharedSeedText });

        limiting = true;
        const again = await timedRead(server, otherSeedRead);
        expect(again.body).toEqual({
          error: undirectedAs(otherSeedPath, 1),
          retryAfterSeconds: 1,
        });
      },
      { mode: "dev", limitBackoffMs: 1_000 },
    );
  });

  test("the first refusal waits one minute, held back as a directed wait is", async () => {
    await onServerOfItsOwn(async (server) => {
      servedRefusing(server, revision, (request) =>
        isContent(request, sharedSeedPath) ? rateLimitedAnswer() : undefined,
      );
      const refused = await timedRead(server, sharedSeedRead(revision));
      expect(refused.body).toEqual({
        error: undirectedAs(sharedSeedPath, 60),
        retryAfterSeconds: 60,
      });
      const before = server.github.calls.length;
      expectHeldBack(
        await timedRead(server, otherSeedRead),
        refused,
        "the other seed",
      );
      expect(askedSince(server, before)).toEqual([]);
    });
  });

  test("a base beyond an hour waits one hour", async () => {
    await onServerOfItsOwn(
      async (server) => {
        servedRefusing(server, revision, (request) =>
          isContent(request, sharedSeedPath) ? rateLimitedAnswer() : undefined,
        );
        const refused = await timedRead(server, sharedSeedRead(revision));
        expect(refused.body).toEqual({
          error: undirectedAs(sharedSeedPath, 3600),
          retryAfterSeconds: 3600,
        });
      },
      { mode: "dev", limitBackoffMs: 2 * 60 * 60 * 1000 },
    );
  });
});
