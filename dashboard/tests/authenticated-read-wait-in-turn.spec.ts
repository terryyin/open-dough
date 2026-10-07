// A wait that starts while reads wait their turn (../server/readAdmission.ts),
// at the local authenticated read boundary over real HTTP with the synthetic
// `gh`: every waiting read is answered as limited at once and none of them
// reaches GitHub, while the reads already under way are still answered. The
// wait outlives the request that met it, so the case starts a server of its
// own. Reading after a wait ends: ./authenticated-read-resumption.spec.ts; the
// turns themselves: ./authenticated-read-turns.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import { everyRepository } from "./support/fakeGitHub.ts";
import { heldInTurn } from "./support/heldGitHubAnswer.ts";
import { onServerOfItsOwn } from "./support/directedWait.ts";
import { expectHeldBack, timedRead } from "./support/heldBackReads.ts";
import { rateLimitedAnswer } from "./originAnswers.ts";
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

const turns = 8;

test("a wait that starts while reads wait their turn answers each waiting read as limited, and none of them reaches GitHub", async () => {
  await onServerOfItsOwn(async (server) => {
    server.github.serve(everyRepository, published);
    expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
    const held = heldInTurn(
      refusingFirst(
        published,
        rateLimitedAnswer(429, { "Retry-After": "600" }),
      ),
      isSeed,
    );
    server.github.serve(everyRepository, held.answer);
    const before = server.github.calls.length;

    const underWay = [];
    for (const path of seedPaths.slice(0, turns)) {
      underWay.push(timedRead(server, seedRead(path)));
      const arrived = askedSince(server, before).length + 1;
      await expect
        .poll(() => askedSince(server, before).length, { timeout: 10_000 })
        .toBe(arrived);
    }
    const queuedPaths = seedPaths.slice(turns);
    const queued = queuedPaths.map((path) => timedRead(server, seedRead(path)));
    // Answered once both queued requests wait their turn.
    await refusedMarker(server);

    held.releaseOldest();
    const refused = await underWay[0];
    if (refused === undefined) throw new Error("no read under way");
    expect(refused.body).toMatchObject({ retryAfterSeconds: 600 });
    // Answered while the seven other reads are still held at GitHub.
    for (const answer of await Promise.all(queued)) {
      expectHeldBack(answer, refused, "a read waiting its turn");
    }
    expect(held.held()).toBe(turns - 1);

    held.releaseAll();
    const rest = await Promise.all(underWay.slice(1));
    expect(rest.map(({ status }) => status)).toEqual(
      seedPaths.slice(1, turns).map(() => 200),
    );
    expect(askedSince(server, before)).toEqual(
      asked(seedPaths.slice(0, turns)),
    );
  });
});
