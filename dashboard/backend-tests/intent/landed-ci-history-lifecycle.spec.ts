// Landed CI history across collectors (../../server/landedCiCollection.ts):
// a landing still building when one collector closes stays a pending gap in
// the kept history, and the next collector measures it once from the
// history's own reference after its launch record is gone. Closing a
// collector during a CI read it waits on writes nothing late. Separate
// processes sharing one history are proved in
// ./landed-ci-collector-lifetime.spec.ts.
import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { ListedRun } from "../../server/baseCiNearest.ts";
import { LandedCiCollection } from "../../server/landedCiCollection.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import {
  collectLandedCiPass,
  type LandedCiPassInputs,
} from "../../server/landedCiPass.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  landedCiPassInputs,
  passProject,
} from "../support/landedCiPassInputs.ts";

const revision = "4".repeat(40);
const receipt = "aaaaaaaa-0000-4000-8000-000000000004";
const record = makeMe.aLaunchRecord
  .executing({ identity: "SEED-9#running", title: "running" })
  .launchedAt("2026-11-05T09:55:00.000Z")
  .landedAt(revision, { receipt })
  .please();
const run = (facts: Partial<ListedRun>) =>
  makeMe.aRevisionCiRun
    .with({
      headSha: revision,
      databaseId: 43,
      attempt: 1,
      createdAt: "2026-11-05T10:00:00Z",
      startedAt: "2026-11-05T10:00:00Z",
      ...facts,
    })
    .please();

// A collecting server's lifecycle over these inputs, settled after its first
// pass and then closed.
async function collectOnce(
  inputs: (stopped: AbortSignal) => LandedCiPassInputs,
): Promise<void> {
  let settled!: () => void;
  const first = new Promise<void>((resolve) => {
    settled = resolve;
  });
  const collection = new LandedCiCollection({
    collects: () => true,
    recheckMs: () => 60_000,
    pass: async (stopped) => {
      await collectLandedCiPass(inputs(stopped));
      settled();
    },
  });
  await first;
  collection.close();
}

test("a landing still building stays pending through closing and reopening, then becomes one point from the kept reference after its launch record is gone", async () => {
  let runs: readonly ListedRun[] = [
    run({ status: "in_progress", conclusion: null }),
  ];
  let records: readonly LaunchRecord[] = [record];
  const pass = landedCiPassInputs([revision], {
    runs: () => runs,
    records: () => records,
  });

  await collectOnce(pass.inputs);
  expect(
    (await keptLandedCiHistory(passProject.id, pass.home)).landings,
  ).toMatchObject({ [receipt]: { observed: { kind: "pending" } } });

  runs = [run({ completedAt: "2026-11-05T10:07:10Z" })];
  records = [];
  await collectOnce(pass.inputs);

  const kept = await keptLandedCiHistory(passProject.id, pass.home);
  expect(kept.landings[receipt]?.observed).toMatchObject({
    kind: "build",
    build: "run/43/1",
  });
  expect(Object.keys(kept.builds)).toEqual(["run/43/1"]);
});

test("closing a collector while its CI read is held writes nothing once the read answers", async () => {
  const pass = landedCiPassInputs([revision], {
    runs: () => [run({ completedAt: "2026-11-05T10:07:10Z" })],
    records: () => [record],
  });
  let answer!: () => void;
  const held = new Promise<void>((resolve) => {
    answer = resolve;
  });
  let reading!: () => void;
  const asked = new Promise<void>((resolve) => {
    reading = resolve;
  });
  let passed!: Promise<void>;
  const collection = new LandedCiCollection({
    collects: () => true,
    recheckMs: () => 60_000,
    pass: (stopped) => {
      const inputs = pass.inputs(stopped);
      passed = collectLandedCiPass({
        ...inputs,
        read: (source, signal) => {
          const read = inputs.read(source, signal);
          return async () => {
            reading();
            await held;
            return read();
          };
        },
      });
      return passed;
    },
  });

  await asked;
  collection.close();
  answer();
  await passed;

  expect(
    existsSync(
      path.join(pass.home, ".open-dough/dashboard/landed-ci-history.json"),
    ),
  ).toBe(false);
});
