// Simultaneous reads at the local authenticated read boundary
// (../../server/authenticatedRead.ts), in process over real HTTP with a real
// CLI `gh` answering from a fake GitHub: requests needing the same answer
// while it is outstanding share one call, each learning its own answer;
// distinct questions are asked apart; a refused shared call fails every
// waiter alike and the next request asks again. Coincidence is made by an
// event: GitHub's answer is held, the reads are sent, then a marker the
// boundary refuses without `gh`. Turns and arrival order of one process's
// calls: ./authenticated-read-request-turns.spec.ts; each answer's
// `Server-Timing`: ./authenticated-read-server-timing.spec.ts.

import { afterAll, beforeAll, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { startInProcessAuthenticatedRead } from "../../test-support/support/inProcessAuthenticatedRead.ts";
import type { RawResponse } from "../../test-support/support/rawHttp.ts";
import { rateLimitedAnswer } from "../../test-support/originAnswers.ts";
import { untilReported } from "../../test-support/support/directedWait.ts";
import { everyRepository } from "../../test-support/support/fakeGitHub.ts";
import {
  answeredTogether,
  askedSince,
  otherSeedPath,
  otherSeedText,
  readAt,
  servedHolding,
  sharedSeedPath,
  sharedReadsPublished,
  sharedSeedRead,
  sharedSeedText,
} from "../../test-support/support/sharedReads.ts";

const revisionOf = (pair: string) => pair.repeat(20);

let boundary: Awaited<ReturnType<typeof startInProcessAuthenticatedRead>>;
let server: Parameters<typeof servedHolding>[0];

beforeAll(async () => {
  boundary = await startInProcessAuthenticatedRead({
    ghTransport: "cli",
  });
  server = {
    baseURL: boundary.origin,
    origin: boundary.origin,
    github: boundary.github,
  };
});

afterAll(async () => {
  await boundary.close();
});

const statuses = (answers: readonly RawResponse[]) =>
  answers.map(({ status }) => status);
const bodyOf = ({ body }: RawResponse) => JSON.parse(body) as unknown;

test("a pinned file, a directory listing and a history read are each asked once for two requests, and a kept file is not asked again", async () => {
  const revision = revisionOf("5a");
  const holding = await servedHolding(server, revision, () => true, [
    `&revision=${revision}`,
  ]);
  const profiles = `&revision=${revision}&agents=profiles`;
  const history = `${sharedSeedRead(revision)}&committed=last`;
  const { answers, whileHeld } = await answeredTogether(
    server,
    holding,
    [
      sharedSeedRead(revision),
      sharedSeedRead(revision),
      profiles,
      profiles,
      history,
      history,
    ],
    3,
  );
  expect(statuses(answers)).toEqual([200, 200, 200, 200, 200, 200]);
  expect(bodyOf(answers[0] as RawResponse)).toMatchObject({
    text: sharedSeedText,
  });
  for (const pair of [0, 2, 4]) {
    expect(answers[pair + 1]?.body).toBe(answers[pair]?.body);
  }
  expect([...whileHeld].sort()).toEqual([
    `commit-list ${sharedSeedPath}@${revision}`,
    `content ${sharedSeedPath}@${revision}`,
    `listing .planning/agents@${revision}`,
  ]);

  const later = server.github.calls.length;
  expect((await readAt(server, sharedSeedRead(revision))).status).toBe(200);
  expect(askedSince(server, later)).toEqual([]);
});

test("reads differing in repository, revision, path, or kind are asked separately and answered for their own question", async () => {
  const revision = revisionOf("5e");
  const otherRevision = revisionOf("5f");
  const other = makeMe.aPublishedSource.pygardon.please();
  const backlog = `&revision=${revision}`;
  server.github.serve(everyRepository, sharedReadsPublished(revision));
  const otherBacklog = await readAt(server, {
    source: other.id,
    query: backlog,
  });
  expect(otherBacklog.status).toBe(200);
  const holding = await servedHolding(server, revision, () => true, [
    backlog,
    `&revision=${otherRevision}`,
  ]);
  const { answers } = await answeredTogether(
    server,
    holding,
    [
      { source: other.id, query: sharedSeedRead(revision) },
      sharedSeedRead(otherRevision),
      sharedSeedRead(revision),
      `&revision=${revision}&path=${encodeURIComponent(otherSeedPath)}`,
      `${sharedSeedRead(revision)}&committed=last`,
    ],
    5,
  );
  expect(statuses(answers)).toEqual([200, 200, 200, 200, 200]);
  const bodies = answers.map(({ body }) => JSON.parse(body) as unknown);
  expect(bodies[0]).toMatchObject({ revision, text: sharedSeedText });
  expect(bodies[1]).toMatchObject({
    revision: otherRevision,
    text: sharedSeedText,
  });
  expect(bodies[2]).toMatchObject({ revision, text: sharedSeedText });
  expect(bodies[3]).toMatchObject({ revision, text: otherSeedText });
  expect(bodies[4]).toMatchObject({
    committedAt: "2026-10-01T08:00:00.000Z",
  });
  const ours = (asked: string) => `terryyin/open-dough ${asked}`;
  const asked = askedSince(server, holding.before, true);
  expect(asked.sort()).toEqual(
    [
      `${other.repository} content ${sharedSeedPath}@${revision}`,
      ours(`content ${sharedSeedPath}@${otherRevision}`),
      ours(`content ${sharedSeedPath}@${revision}`),
      ours(`content ${otherSeedPath}@${revision}`),
      ours(`commit-list ${sharedSeedPath}@${revision}`),
    ].sort(),
  );
});

test("two requests waiting on a refused read both report the refusal, and the next request asks again and is answered", async () => {
  const revision = revisionOf("7a");
  const holding = await servedHolding(
    server,
    revision,
    (request) => request.kind === "content" && request.path === sharedSeedPath,
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
  expect(statuses(answers)).toEqual([502, 502]);
  expect(bodyOf(answers[0] as RawResponse)).toEqual({
    error: `GitHub answered HTTP 500 to the local GitHub CLI while reading ${sharedSeedPath} at ${revision}.`,
    recovery: "transient",
  });
  expect(answers[1]?.body).toBe(answers[0]?.body);

  const next = await readAt(server, sharedSeedRead(revision));
  expect(bodyOf(next)).toMatchObject({ text: sharedSeedText });
  expect(askedSince(server, holding.before)).toEqual([
    `content ${sharedSeedPath}@${revision}`,
    `content ${sharedSeedPath}@${revision}`,
  ]);
});

test("two readers of the same history both get the wait GitHub directed, and the next reader after it asks again", async () => {
  const revision = revisionOf("7b");
  const history = `${sharedSeedRead(revision)}&committed=last`;
  const askedHistory = `commit-list ${sharedSeedPath}@${revision}`;
  const holding = await servedHolding(
    server,
    revision,
    (request) => request.kind === "commit-list",
    [`&revision=${revision}`],
    rateLimitedAnswer(429, { "Retry-After": "2" }),
  );
  const { answers, whileHeld } = await answeredTogether(
    server,
    holding,
    [history, history],
    1,
  );
  const answeredAt = Date.now();
  expect(whileHeld).toEqual([askedHistory]);
  const waited = {
    error: `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading the last commit of ${sharedSeedPath} at ${revision}. GitHub asked to wait 2 seconds before asking again.`,
    retryAfterSeconds: 2,
  };
  expect(answers.map(({ status }) => status)).toEqual([502, 502]);
  expect(answers.map(bodyOf)).toEqual([waited, waited]);

  // The next client read waits for the time GitHub reported.
  await untilReported(answeredAt, waited.retryAfterSeconds);
  const next = await readAt(server, history);
  expect(next.status).toBe(200);
  expect(JSON.parse(next.body)).toMatchObject({
    revision,
    committedAt: "2026-10-01T08:00:00.000Z",
  });
  expect(askedSince(server, holding.before)).toEqual([
    askedHistory,
    askedHistory,
  ]);
});
