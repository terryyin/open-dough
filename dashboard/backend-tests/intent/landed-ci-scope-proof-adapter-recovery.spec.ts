// A failed adapter proof command can recover for its exact contextual attempt.
import { expect, onTestFinished, test, vi } from "vitest";
import { answeredCommandAttempts } from "../../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs";
import type { readCommandProof } from "../../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-attempt.mjs";
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

test("a failed adapter proof command resumes after collector restart with the exact contextual identity", async () => {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  vi.stubEnv("HOME", checkout.fixture);
  onTestFinished(async () => {
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });
  const landing = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing(checkout.revisions)
    .please();
  const { revision, receivedAt } = landing;
  const runId = "recover-run";
  const attemptId = "retry+#attempt";
  const attempt = makeMe.aCiAdapterAttempt
    .passed({
      sha: revision,
      runId,
      attemptId,
      branch: source.ref,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:02:00Z",
    })
    .please();
  const key = `adapter/${JSON.stringify([runId, attemptId, revision])}`;
  const scope = "tests";
  const summary = proofSummaryForEntry(
    { repository: source.repository, attemptId, revision },
    makeMe.aCiProofEntry
      .at(scope)
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .brokenDown(
            { path: "tests/folder/a.spec.ts", passed: 1, durationMs: 1200 },
            { path: "tests/folder/zero.spec.ts", passed: 1, durationMs: 0 },
          )
          .please(),
      )
      .please(),
  );
  const requested = vi
    .fn<typeof readCommandProof>()
    .mockRejectedValueOnce(
      new Error("The proof service is temporarily unavailable"),
    )
    .mockResolvedValue({ summary });
  const artifact = vi.fn();
  const discover = vi.fn(({ branch }: { branch: string }) =>
    Promise.resolve({
      attempts: answeredCommandAttempts([attempt], branch) as unknown[],
      queue: undefined,
    }),
  );

  const collect = async (receipts: readonly (typeof landing)[]) => {
    const stopped = new AbortController();
    const adapter = ciAdapterProofReader(requested);
    try {
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
    } finally {
      stopped.abort();
    }
  };

  await collect([landing]);
  const initial = await keptLandedCiHistory(source.id);
  expect(initial.landings[landing.receipt]?.observed).toEqual({
    kind: "build",
    build: key,
    selection: "exact",
  });
  expect(initial.builds[key]).toMatchObject({
    proof: { kind: "unavailable", reason: "unreadable" },
    proofPending: true,
  });

  await collect([]);

  const recovered = await keptLandedCiHistory(source.id);
  expect(Object.keys(recovered.builds)).toEqual([key]);
  expect(recovered.landings[landing.receipt]?.observed).toEqual(
    initial.landings[landing.receipt]?.observed,
  );
  const discoverCount = discover.mock.calls.length;
  const path = "tests/folder/zero.spec.ts";
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope: path,
      revision,
      through: receivedAt,
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      path,
      entries: [
        {
          kind: "point",
          key,
          selected: true,
          build: { revision, adapterAttempt: { runId, attemptId } },
          readings: [{ kind: "point", unit: "case", ms: 0 }],
        },
      ],
    },
  });
  expect(requested).toHaveBeenCalledTimes(2);
  for (const call of [1, 2])
    expect(requested).toHaveBeenNthCalledWith(
      call,
      command,
      { repo: source.repository, branch: source.ref },
      { runId, attemptId, sha: revision },
      expect.objectContaining({ cwd: repository }),
    );
  expect(discover).toHaveBeenCalledTimes(discoverCount);
  expect(artifact).not.toHaveBeenCalled();
});
