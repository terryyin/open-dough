// Landed CI collection passes (../../server/landedCiPass.ts) and the history
// read (../../server/intentCiHistoryRead.ts), with no page: a confirmed skip
// whose equivalent build's CI proof read GitHub does not answer waits as CI
// proof not read yet, however long ago it was recorded, while collection
// goes on to the older landings past it, and is that build's reused
// equivalent point once GitHub answers, never a final unreadable gap: only
// GitHub's answer settles a CI proof (SEED-285#see-landed-ci-wall-time-history).
// Final gaps are in ./landed-ci-history-gaps.spec.ts; the other pending
// states in ./landed-ci-history-pending.spec.ts and
// ./landed-ci-history-pending-sources.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { GitHubAcquisitionFailed } from "../../../Distribution/src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import { unreadableBy } from "../../server/ciProofArtifact.ts";
import type { CiProof } from "../../src/ciProof.ts";
import {
  historyEntries,
  landedCiPassInputs,
} from "../support/landedCiPassInputs.ts";

const hour = 3_600_000;
const older = "1".repeat(40);
const b = "2".repeat(40);
const skip = "3".repeat(40);
const olderAt = "2026-11-05T09:50:00.000Z";
const skipAt = "2026-11-05T09:59:00.000Z";

test("a skip whose equivalent build's CI proof read GitHub does not answer waits for it for hours while the older landing past it is measured, then is that build's equivalent point once GitHub answers", async () => {
  let now = Date.parse(skipAt) + 60_000;
  let olderRun = makeMe.aRevisionCiRun
    .with({
      headSha: older,
      databaseId: 70,
      status: "in_progress",
      conclusion: null,
      createdAt: "2026-11-05T09:50:00Z",
    })
    .please();
  const bRun = makeMe.aRevisionCiRun
    .with({
      headSha: b,
      databaseId: 71,
      startedAt: "2026-11-05T09:51:00Z",
      completedAt: "2026-11-05T09:52:00Z",
    })
    .please();
  let proof = (): CiProof =>
    unreadableBy(
      new GitHubAcquisitionFailed("artifacts", { kind: "unreachable" }),
    );
  const pass = landedCiPassInputs([older, b, skip], {
    runs: () => [olderRun, bRun],
    records: () => [
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-9#older", title: "older" })
        .launchedAt(olderAt)
        .landedAt(older, { receipt: "eeeeeeee-0000-4000-8000-000000000001" })
        .please(),
      makeMe.aLaunchRecord
        .executing({ identity: "SEED-9#skip", title: "skip" })
        .launchedAt(skipAt)
        .landedAt(skip, { receipt: "eeeeeeee-0000-4000-8000-000000000002" })
        .please(),
    ],
    skips: [skip],
    proofOf: () => proof(),
    now: () => now,
  });
  const skipWaits = {
    kind: "gap",
    reason: "pending",
    waitsFor: "proof",
    revision: skip,
    runId: 71,
    runAttempt: 1,
  };

  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    {
      kind: "gap",
      reason: "pending",
      waitsFor: "build",
      revision: older,
      runId: 70,
    },
    skipWaits,
  ]);

  // Hours later GitHub still does not answer, and the older build passed.
  now += 3 * hour;
  olderRun = makeMe.aRevisionCiRun
    .with({
      headSha: older,
      databaseId: 70,
      startedAt: "2026-11-05T09:50:00Z",
      completedAt: "2026-11-05T09:56:05Z",
    })
    .please();
  await pass.collect();
  expect(await historyEntries(pass.home)).toMatchObject([
    {
      kind: "point",
      revision: older,
      runId: 70,
      landings: [{ revision: older, provenance: "exact" }],
    },
    skipWaits,
  ]);

  proof = () =>
    makeMe.aCiProof
      .summaryFor({ runId: 71, runAttempt: 1, revision: b })
      .please();
  await pass.collect();
  expect((await historyEntries(pass.home))[1]).toMatchObject({
    kind: "point",
    revision: b,
    runId: 71,
    startedAt: "2026-11-05T09:51:00Z",
    completedAt: "2026-11-05T09:52:00Z",
    landings: [
      { revision: skip, receivedAt: skipAt, provenance: "equivalent" },
    ],
  });
});
