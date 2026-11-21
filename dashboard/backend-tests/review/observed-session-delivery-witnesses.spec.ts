import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { inspectManualLanding } from "../../server/manualSessionLanding.ts";
import { observedSessionDeliveries } from "../../server/observedSessionDeliveries.ts";
import type { readBranchTrunkRevision } from "../../server/sessionBranchAttribution.ts";
import { source } from "../support/doneCaptureCase.ts";

const observedTrunk = { id: source, ref: "main" };
const base = "a".repeat(40);
const revision = "b".repeat(40);
const observed = "c".repeat(40);
const target = "refs/heads/main";
const repository = "repository";

function aWitnessedBranch(branch: string, remote = "origin") {
  return makeMe.aLaunchRecord
    .adHoc({ title: branch })
    .inClaudeSession({ sessionId: branch })
    .awaitingManualDelivery({ repository, base, revision, branch, remote })
    .please();
}

test("a failed head read or inspection is retried on the next check while other deliveries settle", async () => {
  const unavailable = aWitnessedBranch("unavailable", "unavailable");
  const rejected = aWitnessedBranch("rejected", "rejected");
  const uninspected = aWitnessedBranch("uninspected", "uninspected");
  const settled = aWitnessedBranch("settled", "settled");
  const readTrunkHead = vi
    .fn<typeof readBranchTrunkRevision>(() => Promise.resolve(observed))
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error("Could not read the target"));
  const inspect = vi
    .fn<typeof inspectManualLanding>(() =>
      Promise.resolve({ repository, remote: "origin", target, base, revision }),
    )
    .mockRejectedValueOnce(new Error("Could not inspect the target"));
  const observations = observedSessionDeliveries({ readTrunkHead, inspect });
  const delivered = async (records: ReturnType<typeof aWitnessedBranch>[]) =>
    (await observations.observe(observedTrunk, observed, records)).map(
      ({ record }) => record,
    );

  expect(
    await delivered([unavailable, rejected, uninspected, settled]),
  ).toEqual([settled]);
  expect(await delivered([unavailable, rejected, uninspected])).toEqual([
    unavailable,
    rejected,
    uninspected,
  ]);
});

test("each project keeps its own revision and checked witnesses", async () => {
  const records = [aWitnessedBranch("same-session")];
  const otherProject = { ...observedTrunk, id: "another-project" };
  const readTrunkHead = vi.fn(() => Promise.resolve(observed));
  const inspect = vi.fn(() => Promise.resolve(undefined));
  const observations = observedSessionDeliveries({ readTrunkHead, inspect });

  await observations.observe(observedTrunk, observed, records);
  await observations.observe(otherProject, observed, records);
  expect(inspect).toHaveBeenCalledTimes(2);

  await observations.observe(otherProject, revision, records);
  await observations.observe(observedTrunk, observed, records);
  expect(inspect).toHaveBeenCalledTimes(3);
});

test("a repeat check joins the pass through application of its delivery", async () => {
  const record = aWitnessedBranch("merged");
  const pair = { repository, remote: "origin", target, base, revision };
  const readRecords = vi.fn(() => [record]);
  const readTrunkHead = vi.fn(() => Promise.resolve(observed));
  const inspect = vi.fn(() => Promise.resolve(pair));
  const observations = observedSessionDeliveries({ readTrunkHead, inspect });

  let applyEntered!: () => void;
  const applying = new Promise<void>((resolve) => {
    applyEntered = resolve;
  });
  let release!: () => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  const apply = vi.fn(() => {
    applyEntered();
    return released;
  });

  const first = observations.run(observedTrunk, observed, readRecords, apply);
  await applying;
  const repeat = observations.run(observedTrunk, observed, readRecords, apply);
  release();
  const [deliveries, repeatedDeliveries] = await Promise.all([first, repeat]);

  expect(readRecords).toHaveBeenCalledTimes(1);
  expect(inspect).toHaveBeenCalledTimes(1);
  expect(apply).toHaveBeenCalledTimes(1);
  expect(deliveries.map((delivery) => delivery.pair)).toEqual([pair]);
  expect(repeatedDeliveries).toEqual(deliveries);
});
