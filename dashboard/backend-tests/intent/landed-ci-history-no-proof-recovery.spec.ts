// A retained final no-proof gap for a confirmed skip recovers under timed
// wall-time reuse without proof (../../server/landedCiPass.ts,
// ../../server/landedCiHistoryStore.ts): the next collection pass joins the
// landing to the timed equivalent point; other final gap reasons stay final;
// reading the history without collection leaves the kept gap and the saved
// document untouched (SEED-288#reuse-adapter-equivalent-timing example 5).
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  historyEntries,
  keepHistory,
  landedCiPassInputs,
  machineHome,
} from "../support/landedCiPassInputs.ts";

test("a retained final no-proof equivalent skip recovers on the next collection pass; other finals stay; reading alone leaves the saved gap", async () => {
  const [equivalent, skip, expiredEquivalent, expiredSkip] = [
    "1".repeat(40),
    "2".repeat(40),
    "3".repeat(40),
    "4".repeat(40),
  ] as const;
  const skipAt = "2026-11-05T09:56:00.000Z";
  const expiredAt = "2026-11-05T09:58:00.000Z";
  // The story each landing names and the receipt it landed under, shared by
  // its launch record and the gap the history retained for it.
  const story = (revision: string) => ({
    identity: `SEED-9#${revision.slice(0, 1)}`,
    receipt: `receipt-${revision.slice(0, 1)}`,
  });
  const retained = (
    revision: string,
    receivedAt: string,
    reason: "no-proof" | "expired",
    build: { revision: string; runId: number },
  ) => ({
    ...story(revision),
    revision,
    receivedAt,
    reason,
    build: { ...build, provenance: "equivalent" as const },
  });
  const home = machineHome();
  const file = await keepHistory(
    home,
    makeMe.aLandedCiHistory
      .inTrunkOrder([equivalent, skip, expiredEquivalent, expiredSkip])
      .unmeasuredLanding(
        retained(skip, skipAt, "no-proof", { revision: equivalent, runId: 81 }),
      )
      .unmeasuredLanding(
        retained(expiredSkip, expiredAt, "expired", {
          revision: expiredEquivalent,
          runId: 82,
        }),
      )
      .please(),
  );
  const saved = readFileSync(file, "utf8");
  const run = (headSha: string, databaseId: number) =>
    makeMe.aRevisionCiRun
      .with({
        headSha,
        databaseId,
        startedAt: "2026-11-05T09:00:00Z",
        completedAt: "2026-11-05T09:05:00Z",
      })
      .please();
  const landed = (revision: string, at: string) => {
    const { identity, receipt } = story(revision);
    return makeMe.aLaunchRecord
      .executing({ identity, title: "t" })
      .launchedAt(at)
      .landedAt(revision, { receipt })
      .please();
  };
  const pass = landedCiPassInputs(
    [equivalent, skip, expiredEquivalent, expiredSkip],
    {
      runs: () => [run(equivalent, 81), run(expiredEquivalent, 82)],
      records: () => [landed(skip, skipAt), landed(expiredSkip, expiredAt)],
      skips: [skip, expiredSkip],
      proofOf: (proven) =>
        makeMe.aCiProof
          .unavailable(proven.runId === 82 ? "expired" : "none")
          .please(),
    },
    home,
  );
  const expiredGap = {
    kind: "gap",
    reason: "expired",
    revision: expiredSkip,
    build: { revision: expiredEquivalent, provenance: "equivalent", runId: 82 },
  };

  expect(await historyEntries(home)).toMatchObject([
    {
      kind: "gap",
      reason: "no-proof",
      revision: skip,
      build: { revision: equivalent, provenance: "equivalent", runId: 81 },
    },
    expiredGap,
  ]);
  expect(readFileSync(file, "utf8")).toBe(saved);

  await pass.collect();
  expect(await historyEntries(home)).toMatchObject([
    {
      kind: "point",
      revision: equivalent,
      runId: 81,
      completedAt: "2026-11-05T09:05:00Z",
      landings: [
        { revision: skip, receivedAt: skipAt, provenance: "equivalent" },
      ],
    },
    expiredGap,
  ]);
});
