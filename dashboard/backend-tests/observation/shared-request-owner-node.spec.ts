// Two live Dashboard processes and the installed CI diagnostic share one
// GitHub request owner on one private machine home and one fake GitHub
// route. The owner process is the one `dashboardsOnOneOwner` starts; the
// in-process transport does not create it.

import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { rateLimitedAnswer } from "../../test-support/originAnswers.ts";
import { untilReported } from "../../test-support/support/directedWait.ts";
import {
  expectHeldBack,
  timedRead,
} from "../../test-support/support/heldBackReads.ts";
import {
  answeringFirst,
  heldInTurn,
} from "../../test-support/support/heldGitHubAnswer.ts";
import {
  askedSince,
  readAt,
  revisionCheck,
} from "../../test-support/support/sharedReads.ts";
import {
  dashboardsOnOneOwner,
  isWorkflowRead,
  withWorkflow,
} from "../../test-support/support/sharedRequestOwner.ts";
import {
  asked,
  isSeed,
  publishedAt,
  revisionOf,
  seedPaths,
  seedRead,
  turns,
} from "../../test-support/support/turnReads.ts";

const source = makeMe.aPublishedSource.openDough.please();
// Two live boundary processes plus a real owner can outlast Vitest's 5s default.
const realProcessMs = 30_000;

type Machine = Awaited<ReturnType<typeof dashboardsOnOneOwner>>;

const readOf = (query: string) => ({ source: source.id, query });
const seedAt = (revision: string, index: number) =>
  seedRead(revision, seedPaths[index] ?? "");

async function withMachine(run: (machine: Machine) => Promise<void>) {
  const machine = await dashboardsOnOneOwner("separate process");
  try {
    await run(machine);
  } finally {
    await machine.closeAll();
  }
}

// Serves `revision` to both dashboards, then holds every seed read.
async function seedsHeld(machine: Machine, revision: string) {
  const published = withWorkflow(publishedAt(revision));
  machine.serve(published);
  for (const server of [machine.first, machine.second])
    expect((await readAt(server, readOf(`&revision=${revision}`))).status).toBe(
      200,
    );
  const held = heldInTurn(published, isSeed);
  machine.serve(held.answer);
  return { ...held, before: machine.github.calls.length };
}

const arrived = (machine: Machine, before: number, count: number) =>
  expect
    .poll(() => machine.github.calls.length - before, { timeout: 10_000 })
    .toBe(count);

test(
  "two dashboards and the CI engine have eight requests at GitHub between them, a read both dashboards wait on is asked once, and one owner serves all three",
  async () => {
    await withMachine(async (machine) => {
      const revision = revisionOf("9a");
      const held = await seedsHeld(machine, revision);
      const most = machine.github.observeUnanswered();
      const { first, second } = machine;
      const reads = [
        ...[0, 1, 2, 3, 4].map((seed) =>
          readAt(first, readOf(seedAt(revision, seed))),
        ),
        ...[4, 5, 6, 7, 8, 9].map((seed) =>
          readAt(second, readOf(seedAt(revision, seed))),
        ),
      ];
      await machine.reached();
      await arrived(machine, held.before, turns);
      const ci = machine.ciWorkflowRead();
      const atGitHub = askedSince(first, held.before);
      expect(atGitHub).toHaveLength(turns);
      expect(new Set(atGitHub).size).toBe(turns);
      held.releaseAll();
      expect((await Promise.all(reads)).map(({ status }) => status)).toEqual(
        reads.map(() => 200),
      );
      expect(await ci).toMatchObject({ exitCode: 0 });
      expect(most()).toBe(turns);
      const since = machine.github.calls.slice(held.before);
      expect(since.filter(isWorkflowRead)).toHaveLength(1);
      expect(
        askedSince(first, held.before)
          .filter((read) => read.startsWith("content "))
          .toSorted(),
      ).toEqual(asked(revision, seedPaths.slice(0, 10)).toSorted());
      expect(machine.owners()).toHaveLength(1);
    });
  },
  realProcessMs,
);

test(
  "a rate limit one dashboard meets holds back the other dashboard and the CI engine with nothing asked",
  async () => {
    await withMachine(async (machine) => {
      const revision = revisionOf("9b");
      machine.serve(
        answeringFirst(
          withWorkflow(publishedAt(revision)),
          (request) => request.kind === "matching-refs",
          rateLimitedAnswer(429, { "Retry-After": "600" }),
        ),
      );
      const refused = await timedRead(machine.first, readOf(revisionCheck));
      expect(refused.body).toMatchObject({ retryAfterSeconds: 600 });
      const before = machine.github.calls.length;
      expectHeldBack(
        await timedRead(machine.second, readOf(`&revision=${revision}`)),
        refused,
        "the other dashboard",
      );
      const ci = await machine.ciWorkflowRead();
      expect(ci.exitCode).toBe(75);
      expect(ci.stderr).toMatch(/GitHub directed a wait of \d+ s/);
      expect(machine.github.calls).toHaveLength(before);
      expect(machine.owners()).toHaveLength(1);
    });
  },
  realProcessMs,
);

test(
  "when a wait ends one request goes first for both dashboards, and the others follow once it is answered",
  async () => {
    await withMachine(async (machine) => {
      const revision = revisionOf("9c");
      const published = withWorkflow(publishedAt(revision));
      machine.serve(published);
      for (const server of [machine.first, machine.second])
        expect(
          (await readAt(server, readOf(`&revision=${revision}`))).status,
        ).toBe(200);
      machine.serve(
        answeringFirst(
          published,
          isSeed,
          rateLimitedAnswer(429, { "Retry-After": "1" }),
        ),
      );
      const refused = await timedRead(
        machine.second,
        readOf(seedAt(revision, 0)),
      );
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
        readAt(
          index % 2 ? machine.first : machine.second,
          readOf(seedAt(revision, seed)),
        ),
      );
      await machine.reached();
      await arrived(machine, before, 1);
      held.releaseOldest();
      await arrived(machine, before, 4);
      expect(most()).toBe(3);
      held.releaseAll();
      expect((await Promise.all(reads)).map(({ status }) => status)).toEqual([
        200, 200, 200, 200,
      ]);
    });
  },
  realProcessMs,
);
