import { expect, onTestFinished, test, vi } from "vitest";
import { answeredCommandAttempts } from "../../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { ciAdapterProofReader } from "../../server/ciAdapterProof.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { readIntentCiProof } from "../../server/intentCiProofRead.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { collectLandedCiPass } from "../../server/landedCiPass.ts";
import { passRead } from "../../server/landedCiPassRead.ts";
import { proofSummaryForEntry } from "../../test-support/support/ciProofArtifacts.ts";

const source = makeMe.aPublishedSource.openDough.please();
const command = ["adapter"];
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch({
    ".planning/open-dough.json": JSON.stringify(
      makeMe.projectCiSettings.with({ ciAdapter: command }).please(),
    ),
  })
  .withRevision("revision")
  .please();

test("two exact landing receipts for the same adapter attempt contribute one collected scope point", async () => {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  const { revision } = checkout.revisions;
  const stopped = new AbortController();
  vi.stubEnv("HOME", checkout.fixture);
  onTestFinished(async () => {
    stopped.abort();
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });

  const accepted = [
    {
      receipt: "40000000-0000-4000-8000-000000000001",
      at: "2026-11-05T13:35:00.000Z",
    },
    {
      receipt: "40000000-0000-4000-8000-000000000002",
      at: "2026-11-05T14:00:00.000Z",
    },
  ];
  const receipts = accepted.map(({ receipt, at }) =>
    makeMe.aLaunchLanding
      .capturedFrom({ repository })
      .comparing(checkout.revisions)
      .deliveredAs({ delivery: receipt, receipt })
      .receivedAt(at)
      .please(),
  );
  const runId = "shared-run";
  const attemptId = "shared-attempt+#";
  const attempt = makeMe.aCiAdapterAttempt
    .passed({
      runId,
      attemptId,
      sha: revision,
      branch: source.ref,
      startedAt: "2026-11-05T13:30:00Z",
      completedAt: "2026-11-05T13:35:00Z",
    })
    .please();
  const scope = "tests";
  const file = "tests/intent/a.spec.ts";
  const summary = proofSummaryForEntry(
    { repository: source.repository, attemptId, revision },
    makeMe.aCiProofEntry
      .at(scope)
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .brokenDown({ path: file, passed: 1, durationMs: 1200 })
          .please(),
      )
      .please(),
  );
  const proof = vi.fn().mockResolvedValue({ summary });
  const artifact = vi.fn();
  const adapter = ciAdapterProofReader(proof);
  const discover = vi.fn(({ branch }: { branch: string }) =>
    Promise.resolve({
      attempts: answeredCommandAttempts([attempt], branch) as unknown[],
      queue: undefined,
    }),
  );

  await collectLandedCiPass({
    source,
    receipts,
    history: await keptLandedCiHistory(source.id),
    repository,
    stopped: stopped.signal,
    read: passRead(source, repository, stopped.signal, {
      providers: {
        adapter: {
          discover,
          jobs: () => Promise.resolve({ unavailable: "No job graph" }),
        },
      },
      readArtifact: artifact,
    }),
    readProof: (project, subject, signal) =>
      readIntentCiProof(project, subject, signal, () => repository, {
        adapter,
        artifact,
      }),
  });

  const key = `adapter/${JSON.stringify([runId, attemptId, revision])}`;
  const kept = await keptLandedCiHistory(source.id);
  expect(Object.keys(kept.builds)).toEqual([key]);
  expect(
    accepted.map(({ receipt }) => kept.landings[receipt]?.observed),
  ).toEqual([
    { kind: "build", build: key, selection: "exact" },
    { kind: "build", build: key, selection: "exact" },
  ]);
  const discoveryCount = discover.mock.calls.length;
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope: file,
      revision,
      through: "2026-11-05T14:00:00.000Z",
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      path: file,
      selectedRevision: revision,
      availability: "retained",
      entries: [
        {
          kind: "point",
          key,
          selected: true,
          build: {
            revision,
            adapterAttempt: { runId, attemptId },
            provenance: "exact",
          },
          landings: accepted.map(({ at }) => ({
            revision,
            receivedAt: at,
            selected: true,
            provenance: "exact",
          })),
          readings: [{ kind: "point", unit: "case", ms: 1200 }],
        },
      ],
    },
  });
  expect(proof).toHaveBeenCalledExactlyOnceWith(
    command,
    { repo: source.repository, branch: source.ref },
    { runId, attemptId, sha: revision },
    expect.objectContaining({ cwd: repository }),
  );
  expect(discover).toHaveBeenCalledTimes(discoveryCount);
  expect(artifact).not.toHaveBeenCalled();
});
