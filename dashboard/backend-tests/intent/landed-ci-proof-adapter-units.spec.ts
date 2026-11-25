// The adapter's two declared units stay separate on one collected attempt.
import { expect, onTestFinished, test, vi } from "vitest";
import { answeredCommandAttempts } from "../../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs";
import type { readCommandProof } from "../../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-attempt.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { ciAdapterProofReader } from "../../server/ciAdapterProof.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { collectProjectLandedCi } from "../../server/landedCiCollection.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { buildKeyOf } from "../../src/landedCiBuildKey.ts";
import { proofSummaryForEntry } from "../../test-support/support/ciProofArtifacts.ts";

const source = makeMe.aPublishedSource.openDough.please();
const command = ["adapter"];
const scope = "tests";
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch({
    ".planning/open-dough.json": JSON.stringify(
      makeMe.projectCiSettings.with({ ciAdapter: command }).please(),
    ),
  })
  .withRevision("revision")
  .please();

test("retains and reads independent case and file timings from one validated adapter attempt with Intent closed", async () => {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  const home = checkout.fixture;
  const stopped = new AbortController();
  onTestFinished(async () => {
    stopped.abort();
    await checkout.cleanup();
  });

  const landing = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing(checkout.revisions)
    .please();
  const { revision, receivedAt } = landing;
  const attempt = makeMe.aCiAdapterAttempt
    .passed({
      runId: "run-a",
      attemptId: "attempt-a",
      sha: revision,
      branch: source.ref,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:02:00Z",
    })
    .please();
  const adapterAttempt = {
    runId: String(attempt.runId),
    attemptId: String(attempt.attemptId),
  };
  const key = buildKeyOf({ revision, adapterAttempt });
  const entry = makeMe.aCiProofEntry
    .at(scope)
    .holding(
      makeMe.aCiProofEvidence.inUnit("case").counting(3).timed(1200).please(),
      makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(80).please(),
    )
    .please();
  const summary = proofSummaryForEntry(
    {
      repository: source.repository,
      attemptId: adapterAttempt.attemptId,
      revision,
    },
    entry,
  );
  const discover = vi.fn(({ branch }: { branch: string }) =>
    Promise.resolve({
      attempts: answeredCommandAttempts([attempt], branch) as unknown[],
      queue: undefined,
    }),
  );
  const proof = vi.fn<typeof readCommandProof>().mockResolvedValue({ summary });
  const adapter = ciAdapterProofReader(proof);
  const artifact = vi.fn();
  await collectProjectLandedCi(
    { source, receipts: [landing], repository, stopped: stopped.signal, home },
    {
      runs: {
        adapter: {
          discover,
          jobs: () => Promise.resolve({ unavailable: "No job graph" }),
        },
        github: vi.fn().mockRejectedValue(new Error("unexpected GitHub")),
      },
      proofs: { adapter, artifact },
    },
  );

  const kept = await keptLandedCiHistory(source.id, home);
  expect(kept.builds[key]?.proof).toEqual({ kind: "summary", summary });
  expect(proof).toHaveBeenCalledTimes(1);
  expect(proof.mock.calls[0]?.slice(1, 3)).toEqual([
    { repo: source.repository, branch: source.ref },
    {
      runId: adapterAttempt.runId,
      attemptId: adapterAttempt.attemptId,
      sha: revision,
    },
  ]);

  expect(
    await performIntentCiHistoryRead(
      source,
      { kind: "intent-ci-history", scope, revision, through: receivedAt },
      { home },
    ),
  ).toMatchObject({
    kind: "answered",
    answer: {
      selectedRevision: revision,
      entries: [
        {
          kind: "point",
          key,
          selected: true,
          build: {
            revision,
            adapterAttempt,
          },
          readings: [
            { kind: "point", unit: "case", ms: 1200 },
            { kind: "point", unit: "file", ms: 80 },
          ],
        },
      ],
    },
  });
  expect(artifact).not.toHaveBeenCalled();
});
