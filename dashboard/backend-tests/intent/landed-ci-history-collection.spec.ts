// Landed CI wall-time history collection (../../server/landedCiCollection.ts,
// ../../server/landedCiPass.ts) and its read (`intent=ci-history`,
// ../../server/intentCiHistoryRead.ts), with no page: an accepted landing a
// collecting server finds in its records becomes a point of its CI wall time
// naming that landing, and the read answers it from the kept history alone
// (SEED-285#see-landed-ci-wall-time-history example 1). A server that does
// not collect leaves the history unread by CI and unwritten.
import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { LandedCiCollection } from "../../server/landedCiCollection.ts";
import { collectLandedCiPass } from "../../server/landedCiPass.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import {
  landedCiPassInputs,
  passProject,
} from "../support/landedCiPassInputs.ts";

const revision = "1".repeat(40);
const record = makeMe.aLaunchRecord
  .executing({ identity: "SEED-9#landed", title: "landed" })
  .launchedAt("2026-11-05T09:55:00.000Z")
  .landedAt(revision, { receipt: "aaaaaaaa-0000-4000-8000-000000000001" })
  .please();
const build = makeMe.aRevisionCiRun
  .with({
    headSha: revision,
    databaseId: 41,
    attempt: 1,
    url: "https://ci.invalid/runs/41",
    createdAt: "2026-11-05T10:00:00Z",
    startedAt: "2026-11-05T10:00:00Z",
    completedAt: "2026-11-05T10:06:05Z",
  })
  .please();

const historyAt = (home: string) =>
  performIntentCiHistoryRead(passProject, undefined, { home });

test("a recorded landing becomes one exact point of its CI wall time after a pass, which a later read answers from the kept history", async () => {
  const pass = landedCiPassInputs([revision], {
    runs: () => [build],
    records: () => [record],
  });

  await collectLandedCiPass(await pass.inputs(new AbortController().signal));

  expect(await historyAt(pass.home)).toMatchObject({
    kind: "answered",
    answer: {
      entries: [
        {
          kind: "point",
          revision,
          runUrl: "https://ci.invalid/runs/41",
          runId: 41,
          runAttempt: 1,
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:06:05Z",
          landings: [
            {
              revision,
              receivedAt: record.landing?.receivedAt,
              provenance: "exact",
            },
          ],
        },
      ],
    },
  });
  // Runs listed once; the first proof ask is kept with the point.
  expect(pass.asked).toEqual({ runsAt: [revision], proofs: 1 });
});

test("a server that does not collect runs no pass, even when nudged, and leaves the history unwritten", async () => {
  const pass = landedCiPassInputs([revision], {
    runs: () => [build],
    records: () => [record],
  });
  let passes = 0;
  const collection = new LandedCiCollection({
    collects: () => false,
    recheckMs: () => 60_000,
    pass: async (stopped) => {
      passes += 1;
      await collectLandedCiPass(await pass.inputs(stopped));
    },
  });

  void collection.nudge();
  // Long enough for an asked pass to start and read.
  await new Promise((resolve) => setImmediate(resolve));
  collection.close();

  expect(passes).toBe(0);
  expect(pass.asked).toEqual({ runsAt: [], proofs: 0 });
  expect(
    existsSync(
      path.join(pass.home, ".open-dough/dashboard/landed-ci-history.json"),
    ),
  ).toBe(false);
  expect(await historyAt(pass.home)).toMatchObject({
    kind: "answered",
    answer: { entries: [] },
  });
});
