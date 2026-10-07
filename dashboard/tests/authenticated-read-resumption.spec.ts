// Reading resumes with one read first (../server/readAdmission.ts), at the
// local authenticated read boundary over real HTTP with the synthetic `gh`:
// once a wait has passed, directed or backed off, one read reaches GitHub
// while the others wait; refused with a new wait, it answers every waiting
// request as limited with nothing else asked; answered, the others are asked.
// A wait that starts while reads wait their turn answers them all as limited,
// unasked. Each case starts a server of its own, because the wait outlives
// the request that met it. How a wait holds back reads:
// ./authenticated-read-cooldown.spec.ts; the turns themselves:
// ./authenticated-read-turns.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  everyRepository,
  publishes,
  type RepositoryAnswerer,
} from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import {
  answeringFirst,
  heldInTurn,
  holdingAnswer,
} from "./support/heldGitHubAnswer.ts";
import { onServerOfItsOwn, untilReported } from "./support/directedWait.ts";
import {
  expectHeldBack,
  heldBackPattern,
  timedRead,
  type Timed,
} from "./support/heldBackReads.ts";
import { rateLimitedAnswer, type OriginAnswer } from "./originAnswers.ts";
import { askedSince, readAt, refusedMarker } from "./support/sharedReads.ts";

const revision = "5e".repeat(20);
const turns = 8;

// Ten seeds the backlog names, so each is a different read.
const seedPaths = Array.from(
  Array(10).keys(),
  (index) => `.planning/seeds/SEED-resume-${String(index + 1)}.md`,
);
const backlog = `# Product backlog

## Taken

## Backlog list

${seedPaths
  .map((path, index) => {
    const identity = `SEED-resume-${String(index + 1)}#resume`;
    return `- [Resume ${String(index + 1)}](${path.replace(".planning/", "")}#resume) — ${identity}`;
  })
  .join("\n")}
`;
const published = publishes({
  revision,
  backlog,
  files: Object.fromEntries(seedPaths.map((path) => [path, `# ${path}\n`])),
});
const seedRead = (path: string) =>
  `&revision=${revision}&path=${encodeURIComponent(path)}`;
const asked = (paths: readonly string[]) =>
  paths.map((path) => `content ${path}@${revision}`);
const isSeed = (request: GhRequest) =>
  request.kind === "content" && seedPaths.includes(request.path);

// Answers the first seed read with `refusal`, and every other read as
// `answerer` does.
const refusingFirst = (answerer: RepositoryAnswerer, refusal: OriginAnswer) =>
  answeringFirst(answerer, isSeed, refusal);

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
