// Landed CI collection passes (../../server/landedCiPass.ts) and the history
// read (../../server/intentCiHistoryRead.ts), with no page, of landings no
// build measures: a final gap names the build the Landed rule named for its
// landing, with that build's run -- a confirmed skip's equivalent build whose
// CI proof expired or cannot be opened, a landing's own build that timed out,
// and the later trunk build that failed after a cancelled landing; a timed
// successful equivalent with no proof summary becomes that build's
// reused-equivalent point instead; a build whose attempt completed before it
// started names no CI wall time, so it is a gap and never a zero; and a run
// link that is not a web address is left out of a point and a pending gap
// alike, keeping their run words (SEED-285#see-landed-ci-wall-time-history;
// SEED-288#reuse-adapter-equivalent-timing). The comparison's answer for the
// same gap is in ./landed-ci-history-comparison-gap.spec.ts; scoped history
// is in the landed-ci-scope specs.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  historyEntries,
  landedCiPassInputs,
} from "../support/landedCiPassInputs.ts";

const landing = (revision: string, title: string, at: string) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-9#${title}`, title })
    .launchedAt(at)
    .landedAt(revision, { receipt: `receipt-${title}` })
    .please();

const run = (headSha: string, databaseId: number, more = {}) =>
  makeMe.aRevisionCiRun
    .with({
      headSha,
      databaseId,
      startedAt: "2026-11-05T09:00:00Z",
      completedAt: "2026-11-05T09:05:00Z",
      ...more,
    })
    .please();

test("a final gap names the Landed rule's build and run for an expired or unopenable equivalent proof, a timed-out own build and a failed later build; a timed equivalent with no proof summary is that build's point", async () => {
  const commit = (digit: string) => digit.repeat(40);
  const expiredProofBuild = commit("1");
  const expired = commit("2");
  const unopenableProofBuild = commit("3");
  const unopenable = commit("4");
  const prooflessBuild = commit("5");
  const proofless = commit("6");
  const timedOut = commit("7");
  const cancelled = commit("8");
  const laterFailed = commit("9");
  // The equivalent builds' CI proofs that cannot be used, by run.
  const unusableProofs: Partial<Record<number, "expired" | "unreadable">> = {
    61: "expired",
    62: "unreadable",
  };
  const pass = landedCiPassInputs(
    [
      expiredProofBuild,
      expired,
      unopenableProofBuild,
      unopenable,
      prooflessBuild,
      proofless,
      timedOut,
      cancelled,
      laterFailed,
    ],
    {
      runs: () => [
        run(expiredProofBuild, 61),
        run(unopenableProofBuild, 62),
        run(prooflessBuild, 63),
        run(timedOut, 64, { conclusion: "timed_out" }),
        run(cancelled, 65, { conclusion: "cancelled" }),
        run(laterFailed, 66, { conclusion: "failure" }),
      ],
      records: () => [
        landing(expired, "expired", "2026-11-05T09:54:00.000Z"),
        landing(unopenable, "unopenable", "2026-11-05T09:55:00.000Z"),
        landing(proofless, "proofless", "2026-11-05T09:56:00.000Z"),
        landing(timedOut, "timed-out", "2026-11-05T09:57:00.000Z"),
        landing(cancelled, "cancelled", "2026-11-05T09:58:00.000Z"),
      ],
      skips: [expired, unopenable, proofless],
      proofOf: (proven) =>
        proven.runId === 66
          ? makeMe.aCiProof.summaryFor(proven).please()
          : makeMe.aCiProof
              .unavailable(unusableProofs[proven.runId] ?? "none")
              .please(),
    },
  );
  const named = (revision: string, provenance: string, runId: number) => ({
    build: { revision, provenance, runId, runAttempt: 1 },
  });

  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    {
      kind: "gap",
      reason: "expired",
      revision: expired,
      ...named(expiredProofBuild, "equivalent", 61),
    },
    {
      kind: "gap",
      reason: "unreadable",
      revision: unopenable,
      ...named(unopenableProofBuild, "equivalent", 62),
    },
    {
      kind: "point",
      revision: prooflessBuild,
      runId: 63,
      completedAt: "2026-11-05T09:05:00Z",
      landings: [{ revision: proofless, provenance: "equivalent" }],
    },
    {
      kind: "gap",
      reason: "cancelled",
      revision: timedOut,
      ...named(timedOut, "exact", 64),
    },
    {
      kind: "gap",
      reason: "failed",
      revision: cancelled,
      ...named(laterFailed, "later", 66),
    },
  ]);
});

test("a build that completed before it started is a gap naming no wall time, never a zero point, and a run link that is not a web address is left out of a point and a pending gap", async () => {
  const [backwards, zero, linked, running] = [
    "a".repeat(40),
    "b".repeat(40),
    "c".repeat(40),
    "d".repeat(40),
  ] as const;
  const pass = landedCiPassInputs([backwards, zero, linked, running], {
    runs: () => [
      run(backwards, 64, {
        startedAt: "2026-11-05T09:05:00Z",
        completedAt: "2026-11-05T09:00:00Z",
      }),
      run(zero, 67, { completedAt: "2026-11-05T09:00:00Z" }),
      run(linked, 65, { url: "javascript:alert(65)" }),
      run(running, 66, {
        status: "in_progress",
        conclusion: null,
        url: "javascript:alert(66)",
      }),
    ],
    records: () => [
      landing(backwards, "backwards", "2026-11-05T09:50:00.000Z"),
      landing(zero, "zero", "2026-11-05T09:51:00.000Z"),
      landing(linked, "linked", "2026-11-05T09:52:00.000Z"),
      landing(running, "running", "2026-11-05T09:53:00.000Z"),
    ],
  });

  await pass.collect();
  const entries = await historyEntries(pass.home);
  expect(entries).toMatchObject([
    {
      kind: "gap",
      reason: "not-recorded",
      revision: backwards,
      build: { revision: backwards, provenance: "exact", runId: 64 },
    },
    {
      kind: "point",
      revision: zero,
      startedAt: "2026-11-05T09:00:00Z",
      completedAt: "2026-11-05T09:00:00Z",
    },
    { kind: "point", revision: linked, runId: 65, runAttempt: 1 },
    { kind: "gap", reason: "pending", waitsFor: "build", runId: 66 },
  ]);
  expect(entries[2]).not.toHaveProperty("runUrl");
  expect(entries[3]).not.toHaveProperty("runUrl");
});
