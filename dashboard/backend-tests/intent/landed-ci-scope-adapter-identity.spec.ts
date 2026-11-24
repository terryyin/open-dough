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
  .withRevision("first")
  .withRevision("second")
  .please();

test("different adapter runs reusing an opaque attempt ID keep their own scoped file measurements", async () => {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  const { base, first, second } = checkout.revisions;
  const stopped = new AbortController();
  vi.stubEnv("HOME", checkout.fixture);
  onTestFinished(async () => {
    stopped.abort();
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });

  const firstLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base, revision: first })
    .deliveredAs({
      delivery: "40000000-0000-4000-8000-000000000001",
      receipt: "40000000-0000-4000-8000-000000000002",
    })
    .please();
  const secondLanding = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base: first, revision: second })
    .please();
  const attemptId = "opaque-attempt+#";
  const scope = "tests";
  const file = "tests/intent/a.spec.ts";
  const runs = [
    {
      runId: "run-a",
      sha: first,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:01:00Z",
      durationMs: 1200,
    },
    {
      runId: "run-b",
      sha: second,
      startedAt: "2026-11-06T10:00:00Z",
      completedAt: "2026-11-06T10:01:00Z",
      durationMs: 3400,
    },
  ] as const;
  const attempts = runs.map(({ runId, sha, startedAt, completedAt }) =>
    makeMe.aCiAdapterAttempt
      .passed({
        runId,
        attemptId,
        sha,
        branch: source.ref,
        startedAt,
        completedAt,
      })
      .please(),
  );
  const summaries = new Map(
    runs.map(({ sha, durationMs }) => [
      sha,
      proofSummaryForEntry(
        { repository: source.repository, attemptId, revision: sha },
        makeMe.aCiProofEntry
          .at(scope)
          .holding(
            makeMe.aCiProofEvidence
              .inUnit("case")
              .brokenDown({ path: file, passed: 1, durationMs })
              .please(),
          )
          .please(),
      ),
    ]),
  );
  let discovered = attempts.slice(0, 1);
  const discover = vi.fn(({ branch }: { branch: string }) =>
    Promise.resolve({
      attempts: answeredCommandAttempts(discovered, branch) as unknown[],
      queue: undefined,
    }),
  );
  const proof = vi.fn(
    (...[, , attempt]: [readonly string[], unknown, { sha: string }]) =>
      Promise.resolve({ summary: summaries.get(attempt.sha) }),
  );
  const adapter = ciAdapterProofReader(proof satisfies typeof readCommandProof);
  const artifact = vi.fn();
  const collect = async (landing: typeof firstLanding) =>
    collectLandedCiPass({
      source,
      receipts: [landing],
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

  await collect(firstLanding);
  expect(proof).toHaveBeenCalledTimes(1);
  discovered = [...attempts].reverse();
  await collect(secondLanding);

  const firstKey = `adapter/${JSON.stringify(["run-a", attemptId, first])}`;
  const secondKey = `adapter/${JSON.stringify(["run-b", attemptId, second])}`;
  const kept = await keptLandedCiHistory(source.id);
  expect(Object.keys(kept.builds).sort()).toEqual([firstKey, secondKey]);
  expect(kept.landings[firstLanding.receipt]?.observed).toEqual({
    kind: "build",
    build: firstKey,
    selection: "exact",
  });
  expect(kept.landings[secondLanding.receipt]?.observed).toEqual({
    kind: "build",
    build: secondKey,
    selection: "exact",
  });
  const discoveryCount = discover.mock.calls.length;
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope: file,
      revision: second,
      through: secondLanding.receivedAt,
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      path: file,
      selectedRevision: second,
      availability: "retained",
      entries: [
        {
          kind: "point",
          key: firstKey,
          selected: false,
          date: "2026-11-05T10:00:00Z",
          build: {
            revision: first,
            adapterAttempt: { runId: "run-a", attemptId },
            provenance: "exact",
          },
          readings: [{ kind: "point", unit: "case", ms: 1200 }],
        },
        {
          kind: "point",
          key: secondKey,
          selected: true,
          date: "2026-11-06T10:00:00Z",
          build: {
            revision: second,
            adapterAttempt: { runId: "run-b", attemptId },
            provenance: "exact",
          },
          readings: [{ kind: "point", unit: "case", ms: 3400 }],
        },
      ],
    },
  });
  expect(
    proof.mock.calls.map(([provider, check, subject]) => [
      provider,
      check,
      subject,
    ]),
  ).toEqual([
    [
      command,
      { repo: source.repository, branch: source.ref },
      { runId: "run-a", attemptId, sha: first },
    ],
    [
      command,
      { repo: source.repository, branch: source.ref },
      { runId: "run-b", attemptId, sha: second },
    ],
  ]);
  expect(discover).toHaveBeenCalledTimes(discoveryCount);
  expect(artifact).not.toHaveBeenCalled();
});
