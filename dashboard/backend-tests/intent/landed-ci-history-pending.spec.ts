// Landed CI collection passes (../../server/landedCiPass.ts) and the history
// read (../../server/intentCiHistoryRead.ts), with no page: a pending landing
// waits for CI that cannot be read until it can, and for a run that never
// comes until an hour after its receipt, then is a final No build gap kept
// after its launch record is gone (SEED-285#see-landed-ci-wall-time-history).
// History and comparison agreement: ./landed-ci-history-comparison-run.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { capturedComparisonLanding } from "../../test-support/support/capturedComparisonLanding.ts";
import {
  historyEntries,
  landedCiPassInputs,
  passProject,
} from "../support/landedCiPassInputs.ts";

const revision = "1".repeat(40);
const identity = "SEED-9#landed";
const receivedAt = "2026-11-05T09:55:00.000Z";
const landing = capturedComparisonLanding(
  { identity, baseline: "0".repeat(40), landingMerge: revision },
  receivedAt,
);
const record = makeMe.aLaunchRecord
  .executing({ identity, title: "landed" })
  .withCapturedLanding(landing)
  .please();

test("a landing whose CI cannot be read is a pending read gap until it can be, then its exact point", async () => {
  let readable = false;
  const pass = landedCiPassInputs([revision], {
    runs: () => [
      makeMe.aRevisionCiRun
        .with({
          headSha: revision,
          databaseId: 61,
          startedAt: "2026-11-05T10:00:00Z",
          completedAt: "2026-11-05T10:06:05Z",
        })
        .please(),
    ],
    records: () => [record],
    readable: () => readable,
  });

  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    { kind: "gap", reason: "pending", waitsFor: "read", revision },
  ]);

  readable = true;
  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    {
      kind: "point",
      revision,
      runId: 61,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:06:05Z",
    },
  ]);
});

test("a landing that never gets a run waits until an hour after its receipt, then is a final No build gap kept with its receipt and target after its launch record is gone", async () => {
  const hour = 3_600_000;
  let now = Date.parse(receivedAt) + hour - 1;
  let records = [record];
  const pass = landedCiPassInputs([revision], {
    runs: () => [],
    records: () => records,
    now: () => now,
  });

  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    { kind: "gap", reason: "pending", waitsFor: "run", revision },
  ]);

  records = [];
  now += 1;
  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    { kind: "gap", reason: "no-build", revision, receivedAt },
  ]);
  const kept = await keptLandedCiHistory(passProject.id, pass.home);
  expect(kept.landings[landing.receipt]).toMatchObject({
    revision,
    receivedAt,
    target: "refs/heads/main",
    observed: { kind: "gap" },
  });
});
