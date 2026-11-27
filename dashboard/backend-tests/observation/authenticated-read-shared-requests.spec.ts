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
import {
  answeredTogether,
  askedSince,
  heads,
  otherSeedPath,
  otherSeedText,
  readAt,
  servedHolding,
  sharedSeedPath,
  sharedSeedRead,
  sharedSeedText,
} from "../../test-support/support/sharedReads.ts";

const revisionOf = (pair: string) => pair.repeat(20);

let boundary: Awaited<ReturnType<typeof startInProcessAuthenticatedRead>>;
let server: Parameters<typeof servedHolding>[0];

beforeAll(async () => {
  // A zero reuse window: a later check is already past it.
  boundary = await startInProcessAuthenticatedRead({
    ghTransport: "cli",
    extraEnv: () => ({ DOUGH_REVISION_CHECK_REUSE_MS: "0" }),
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

test("checks of different revisions and watched branches share one head listing, each learning its own answer, and a later check past the window asks again", async () => {
  const revision = revisionOf("5c");
  const watching = (branch: string) =>
    `&since=${revision}&watch=${encodeURIComponent(branch)}`;
  const holding = await servedHolding(
    server,
    revision,
    ({ kind }) => kind === "matching-refs",
    [watching("story/one"), watching("story/two")],
  );
  const { answers, whileHeld } = await answeredTogether(
    server,
    holding,
    [
      `&since=${revision}`,
      `&since=${revisionOf("5d")}`,
      watching("story/one"),
      watching("story/two"),
    ],
    1,
  );
  const learned = (changed: boolean, branch?: string) => ({
    revision,
    changed,
    branches: branch === undefined ? [] : [{ branch, head: heads[branch] }],
  });
  expect(answers.map(bodyOf)).toEqual([
    learned(false),
    learned(true),
    learned(false, "story/one"),
    learned(false, "story/two"),
  ]);
  expect(whileHeld).toEqual(["matching-refs"]);
  expect(askedSince(server, holding.before)).toEqual(["matching-refs"]);

  const later = server.github.calls.length;
  expect((await readAt(server, `&since=${revision}`)).status).toBe(200);
  expect(askedSince(server, later)).toEqual(["matching-refs"]);
});

test("reads differing in repository, revision, path or kind are asked separately and answered for their own question", async () => {
  const revision = revisionOf("5e");
  const otherRevision = revisionOf("5f");
  const check = `&since=${revision}`;
  const other = makeMe.aPublishedSource.pygardon.please();
  const holding = await servedHolding(server, revision, () => true, [
    `&revision=${revision}`,
  ]);
  const { answers } = await answeredTogether(
    server,
    holding,
    [
      check,
      { source: other.id, query: check },
      `&revision=${otherRevision}`,
      sharedSeedRead(revision),
      `&revision=${revision}&path=${encodeURIComponent(otherSeedPath)}`,
      `${sharedSeedRead(revision)}&committed=last`,
    ],
    6,
  );
  expect(statuses(answers)).toEqual([200, 200, 200, 200, 200, 200]);
  const bodies = answers.map(bodyOf);
  for (const checked of bodies.slice(0, 2)) {
    expect(checked).toEqual({ revision, changed: false, branches: [] });
  }
  expect(bodies[2]).toMatchObject({ revision: otherRevision });
  expect(bodies[3]).toMatchObject({ text: sharedSeedText });
  expect(bodies[4]).toMatchObject({ text: otherSeedText });
  expect(bodies[5]).toMatchObject({ committedAt: "2026-10-01T08:00:00.000Z" });
  const ours = (asked: string) => `terryyin/open-dough ${asked}`;
  expect(askedSince(server, holding.before, true).sort()).toEqual(
    [
      ours("matching-refs"),
      `${other.repository} matching-refs`,
      ours(`content .planning/PRODUCT-BACKLOG.md@${otherRevision}`),
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

test("two checks waiting on a listing GitHub rate-limits both report the wait it directed, and the next check after it asks again", async () => {
  const revision = revisionOf("7b");
  const since = (checked: string) => `&since=${checked}`;
  const holding = await servedHolding(
    server,
    revision,
    (request) => request.kind === "matching-refs",
    [since(revision)],
    rateLimitedAnswer(429, { "Retry-After": "2" }),
  );
  const { answers, whileHeld } = await answeredTogether(
    server,
    holding,
    [since(revision), since(revisionOf("7c"))],
    1,
  );
  expect(whileHeld).toEqual(["matching-refs"]);
  const waited = {
    error:
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of terryyin/open-dough. GitHub asked to wait 2 seconds before asking again.",
    retryAfterSeconds: 2,
  };
  expect(statuses(answers)).toEqual([502, 502]);
  expect(answers.map(bodyOf)).toEqual([waited, waited]);

  // GitHub's wait holds back every read of this process until it has passed.
  await new Promise((resolve) => setTimeout(resolve, 2_100));
  const next = await readAt(server, since(revision));
  expect(bodyOf(next)).toMatchObject({ revision, changed: false });
  expect(askedSince(server, holding.before)).toEqual([
    "matching-refs",
    "matching-refs",
  ]);
});
