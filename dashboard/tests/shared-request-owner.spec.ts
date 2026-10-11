// Two dashboard servers, through their local authenticated read boundary over
// real HTTP, and the installed CI diagnostic entry -- three processes of one
// user -- ask one fake GitHub through one request owner
// (github-request-owner.mjs, ./support/sharedRequestOwner.ts): eight requests
// at GitHub between them, one call for a read both dashboards wait on, one
// rate-limit wait holding back all three, one request first when it ends,
// and a leaving or closing dashboard ending only its own waits. One process's
// turns and wait: ./authenticated-read-turns.spec.ts,
// ./authenticated-read-cooldown.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import { untilReported } from "./support/directedWait.ts";
import { expectHeldBack, timedRead } from "./support/heldBackReads.ts";
import { answeringFirst, heldInTurn } from "./support/heldGitHubAnswer.ts";
import { inspect } from "./support/readDiagnostics.ts";
import { abandonedRequest } from "./support/rawHttp.ts";
import { askedSince, readAt } from "./support/sharedReads.ts";
import {
  dashboardsOnOneOwner,
  isWorkflowRead,
  withWorkflow,
} from "./support/sharedRequestOwner.ts";
import {
  asked,
  isSeed,
  publishedAt,
  revisionOf,
  seedPaths,
  seedRead,
  turns,
} from "./support/turnReads.ts";
import { httpErrorAnswer, rateLimitedAnswer } from "./originAnswers.ts";

type Machine = Awaited<ReturnType<typeof dashboardsOnOneOwner>>;
let machine: Machine;

test.beforeEach(async () => {
  machine = await dashboardsOnOneOwner();
});
test.afterEach(async () => {
  await machine.closeAll();
});

// Serves `revision` with both dashboards' backlog read, then holds every
// seed read until released; `before` counts the calls made until then.
async function seedsHeld(revision: string, firstSeedAnswer?: number) {
  const published = withWorkflow(publishedAt(revision));
  machine.serve(published);
  for (const server of [machine.first, machine.second])
    expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
  const held = heldInTurn(
    firstSeedAnswer === undefined
      ? published
      : answeringFirst(published, isSeed, httpErrorAnswer(firstSeedAnswer)),
    isSeed,
  );
  machine.serve(held.answer);
  return { ...held, before: machine.github.calls.length };
}

const seedAt = (revision: string, index: number) =>
  seedRead(revision, seedPaths[index] ?? "");
const arrived = (before: number, count: number) =>
  expect
    .poll(() => machine.github.calls.length - before, { timeout: 10_000 })
    .toBe(count);

test("two dashboards and the CI engine have eight requests at GitHub between them, a read both dashboards wait on is asked once, and one owner serves all three", async () => {
  const revision = revisionOf("9a");
  const held = await seedsHeld(revision);
  const most = machine.github.observeUnanswered();
  const { first, second } = machine;

  const reads = [
    ...[0, 1, 2, 3, 4].map((seed) => readAt(first, seedAt(revision, seed))),
    ...[4, 5, 6, 7, 8, 9].map((seed) => readAt(second, seedAt(revision, seed))),
  ];
  await machine.reached();
  await arrived(held.before, turns);
  const ci = machine.ciWorkflowRead();
  // Ten different reads and the CI engine's: eight are at GitHub, each once.
  const atGitHub = askedSince(first, held.before);
  expect(atGitHub).toHaveLength(turns);
  expect(new Set(atGitHub).size).toBe(turns);

  held.releaseAll();
  expect((await Promise.all(reads)).map(({ status }) => status)).toEqual(
    reads.map(() => 200),
  );
  expect(await ci).toMatchObject({ exitCode: 0 });
  expect(most()).toBe(turns);
  // The seed both dashboards read while it was outstanding was asked once.
  const since = machine.github.calls.slice(held.before);
  expect(since.filter(isWorkflowRead)).toHaveLength(1);
  expect(
    askedSince(first, held.before)
      .filter((read) => read.startsWith("content "))
      .toSorted(),
  ).toEqual(asked(revision, seedPaths.slice(0, 10)).toSorted());
  expect(machine.owners()).toHaveLength(1);
});

test("a rate limit one dashboard meets holds back the other dashboard and the CI engine with nothing asked", async () => {
  const revision = revisionOf("9b");
  machine.serve(
    answeringFirst(
      withWorkflow(publishedAt(revision)),
      (request) => request.kind === "ref",
      rateLimitedAnswer(429, { "Retry-After": "600" }),
    ),
  );
  const refused = await timedRead(machine.first, "");
  expect(refused.body).toMatchObject({ retryAfterSeconds: 600 });
  const before = machine.github.calls.length;

  expectHeldBack(
    await timedRead(machine.second, `&revision=${revision}`),
    refused,
    "the other dashboard",
  );
  const ci = await machine.ciWorkflowRead();
  expect(ci.exitCode).toBe(75);
  expect(ci.stderr).toMatch(/GitHub directed a wait of \d+ s/);
  expect(machine.github.calls).toHaveLength(before);
  expect(machine.owners()).toHaveLength(1);
});

test("when a wait ends one request goes first for both dashboards, and the others follow once it is answered", async () => {
  const revision = revisionOf("9c");
  const published = withWorkflow(publishedAt(revision));
  machine.serve(published);
  for (const server of [machine.first, machine.second])
    expect((await readAt(server, `&revision=${revision}`)).status).toBe(200);
  machine.serve(
    answeringFirst(
      published,
      isSeed,
      rateLimitedAnswer(429, { "Retry-After": "1" }),
    ),
  );
  const refused = await timedRead(machine.second, seedAt(revision, 0));
  expect(refused).toMatchObject({
    status: 502,
    body: { retryAfterSeconds: 1 },
  });
  await untilReported(refused.arrivedAt, 1);

  const held = heldInTurn(published, isSeed);
  machine.serve(held.answer);
  const before = machine.github.calls.length;
  const most = machine.github.observeUnanswered();
  const reads = [1, 2, 3, 4].map((seed, index) =>
    readAt(index % 2 ? machine.first : machine.second, seedAt(revision, seed)),
  );
  await machine.reached();
  await arrived(before, 1);

  held.releaseOldest();
  await arrived(before, 4);
  expect(most()).toBe(3);
  held.releaseAll();
  expect((await Promise.all(reads)).map(({ status }) => status)).toEqual([
    200, 200, 200, 200,
  ]);
});

test("a failed read is recorded by each dashboard that waited on it, and a dashboard that stops waiting or closes leaves the other's call running", async () => {
  const revision = revisionOf("9d");
  const { first, second } = machine;
  const failing = await seedsHeld(revision, 403);
  const failed = [first, second].map((server) =>
    readAt(server, seedAt(revision, 0)),
  );
  await machine.reached();
  await arrived(failing.before, 1);
  failing.releaseAll();
  expect((await Promise.all(failed)).map(({ status }) => status)).toEqual([
    502, 502,
  ]);
  expect(machine.github.calls).toHaveLength(failing.before + 1);
  for (const server of [first, second])
    expect((await inspect(server)).failures).toMatchObject([
      { cause: "http", status: 403, category: "content", pin: revision },
    ]);

  const held = await seedsHeld(revision);
  const left = abandonedRequest({
    url: `${first.baseURL}/__authenticated-read?source=open-dough${seedAt(revision, 1)}`,
    headers: { Origin: first.origin },
  });
  const stays = readAt(second, seedAt(revision, 1));
  const closing = abandonedRequest({
    url: `${first.baseURL}/__authenticated-read?source=open-dough${seedAt(revision, 2)}`,
    headers: { Origin: first.origin },
  });
  const outlives = readAt(second, seedAt(revision, 2));
  await machine.reached();
  await arrived(held.before, 2);
  left.cutAfter(0);
  await machine.reached();
  await machine.close(first);
  closing.cutAfter(0);
  await machine.reached();

  held.releaseAll();
  expect((await stays).status).toBe(200);
  expect((await outlives).status).toBe(200);
  expect(askedSince(second, held.before).toSorted()).toEqual(
    asked(revision, seedPaths.slice(1, 3)).toSorted(),
  );
  expect(machine.owners()).toHaveLength(1);
});
