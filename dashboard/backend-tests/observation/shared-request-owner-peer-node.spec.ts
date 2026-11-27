// Each Dashboard records a shared GitHub refusal itself, and one client
// leaving or one Dashboard stopping leaves the other Dashboard's read running
// on the same request owner.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { httpErrorAnswer } from "../../test-support/originAnswers.ts";
import {
  answeringFirst,
  heldInTurn,
} from "../../test-support/support/heldGitHubAnswer.ts";
import { inspect } from "../../test-support/support/readDiagnostics.ts";
import { abandonedRequest } from "../../test-support/support/rawHttp.ts";
import {
  askedSince,
  readAt,
  readUrl,
} from "../../test-support/support/sharedReads.ts";
import {
  dashboardsOnOneOwner,
  withWorkflow,
} from "../../test-support/support/sharedRequestOwner.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";
import {
  asked,
  isSeed,
  publishedAt,
  revisionOf,
  seedPaths,
  seedRead,
} from "../../test-support/support/turnReads.ts";
import {
  ownerAdmissionEnvironment,
  ownerAdmissions,
} from "./shared-request-owner-admission-probe.mjs";

const source = makeMe.aPublishedSource.openDough.please();
const realProcessMs = 30_000;

type Machine = Awaited<ReturnType<typeof dashboardsOnOneOwner>>;

const readOf = (query: string) => ({ source: source.id, query });
const seedAt = (revision: string, index: number) =>
  seedRead(revision, seedPaths[index] ?? "");

async function withMachine(
  run: (
    machine: Machine,
    admissionsForSeed: (index: number) => number,
  ) => Promise<void>,
) {
  const directory = mkdtempSync(path.join(tmpdir(), "dough-owner-admissions-"));
  const log = path.join(directory, "admissions.txt");
  const restore = withRestoredEnv(ownerAdmissionEnvironment(log, seedPaths));
  const machine =
    await dashboardsOnOneOwner("separate process").finally(restore);
  try {
    await run(machine, (index) => ownerAdmissions(log, seedPaths[index] ?? ""));
  } finally {
    await machine.closeAll();
    rmSync(directory, { recursive: true, force: true });
  }
}

async function seedsHeld(
  machine: Machine,
  revision: string,
  firstSeedAnswer?: number,
) {
  const published = withWorkflow(publishedAt(revision));
  machine.serve(published);
  for (const server of [machine.first, machine.second])
    expect((await readAt(server, readOf(`&revision=${revision}`))).status).toBe(
      200,
    );
  const held = heldInTurn(
    firstSeedAnswer === undefined
      ? published
      : answeringFirst(published, isSeed, httpErrorAnswer(firstSeedAnswer)),
    isSeed,
  );
  machine.serve(held.answer);
  return { ...held, before: machine.github.calls.length };
}

const arrived = (machine: Machine, before: number, count: number) =>
  expect
    .poll(() => machine.github.calls.length - before, { timeout: 10_000 })
    .toBe(count);

test(
  "each dashboard records the shared refusal of a read both waited on",
  async () => {
    await withMachine(async (machine, admissionsForSeed) => {
      const revision = revisionOf("9d");
      const { first, second } = machine;
      const failing = await seedsHeld(machine, revision, 403);
      const failed = [first, second].map((server) =>
        readAt(server, readOf(seedAt(revision, 0))),
      );
      await arrived(machine, failing.before, 1);
      await expect
        .poll(() => admissionsForSeed(0), { timeout: 10_000 })
        .toBe(2);
      failing.releaseAll();
      expect((await Promise.all(failed)).map(({ status }) => status)).toEqual([
        502, 502,
      ]);
      expect(machine.github.calls).toHaveLength(failing.before + 1);
      for (const server of [first, second])
        expect((await inspect(server, source.id)).failures).toMatchObject([
          { cause: "http", status: 403, category: "content", pin: revision },
        ]);
    });
  },
  realProcessMs,
);

test(
  "abandoning a client or stopping one dashboard leaves the other dashboard's read running",
  async () => {
    await withMachine(async (machine, admissionsForSeed) => {
      const revision = revisionOf("9e");
      const { first, second } = machine;
      const held = await seedsHeld(machine, revision);
      const left = abandonedRequest({
        url: readUrl(first.baseURL, readOf(seedAt(revision, 1))),
        headers: { Origin: first.origin },
      });
      const stays = readAt(second, readOf(seedAt(revision, 1)));
      const closing = abandonedRequest({
        url: readUrl(first.baseURL, readOf(seedAt(revision, 2))),
        headers: { Origin: first.origin },
      });
      const outlives = readAt(second, readOf(seedAt(revision, 2)));
      await arrived(machine, held.before, 2);
      await expect
        .poll(() => [admissionsForSeed(1), admissionsForSeed(2)], {
          timeout: 10_000,
        })
        .toEqual([2, 2]);
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
  },
  realProcessMs,
);
