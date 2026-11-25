// Retained adapter bounds are refreshed only from that discovered attempt.
import { expect, onTestFinished, test, vi } from "vitest";
import { answeredCommandAttempts } from "../../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-attempts.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { ciAdapterProofReader } from "../../server/ciAdapterProof.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { readIntentCiProof } from "../../server/intentCiProofRead.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { updateProjectHistory } from "../../server/landedCiKeepEvidence.ts";
import { collectLandedCiPass } from "../../server/landedCiPass.ts";
import { passRead } from "../../server/landedCiPassRead.ts";
import { buildKeyOf } from "../../src/landedCiBuildKey.ts";

const source = makeMe.aPublishedSource.openDough.please();
const command = ["adapter"];
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch({
    ".planning/open-dough.json": JSON.stringify(
      makeMe.projectCiSettings.with({ ciAdapter: command }).please(),
    ),
  })
  .withRevision("adapter")
  .please();

test("legacy adapter timing refreshes the original opaque attempt, never the newer discovered attempt; restart reads locally", async () => {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  const { base, adapter: revision } = checkout.revisions;
  const stopped = new AbortController();
  vi.stubEnv("HOME", checkout.fixture);
  onTestFinished(async () => {
    stopped.abort();
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });

  const landing = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base, revision })
    .deliveredAs({
      delivery: "adapter",
      receipt: "ffffffff-0000-4000-8000-000000000001",
    })
    .receivedAt("2026-11-05T09:00:00.000Z")
    .please();
  const original = makeMe.aCiAdapterAttempt
    .passed({
      sha: revision,
      runId: "original/run",
      attemptId: "first:1",
      branch: source.ref,
      startedAt: "2026-11-05T10:01:00Z",
      completedAt: "2026-11-05T10:03:00Z",
    })
    .please();
  const newer = makeMe.aCiAdapterAttempt
    .passed({
      ...original,
      attemptId: "repeat:2",
      startedAt: "2026-11-05T11:00:00Z",
      completedAt: "2026-11-05T11:00:10Z",
    })
    .please();
  const adapterAttempt = {
    runId: original.runId,
    attemptId: original.attemptId,
  };
  const build = makeMe.aKeptBuild
    .with({
      revision,
      state: "pass" as const,
      adapterAttempt,
      runUrl: "https://ci.invalid/builds/original",
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: original.completedAt,
      timingBasis: undefined,
      proof: makeMe.aCiProof
        .unavailableBecause("unreadable", "Legacy retained attempt")
        .please(),
    })
    .please();
  const key = buildKeyOf(build);
  await updateProjectHistory(source.id, () =>
    makeMe.aLandedCiHistory
      .inTrunkOrder([revision])
      .recording(landing, key, build)
      .please(),
  );

  const discover = vi.fn(({ branch }: { branch: string }) =>
    Promise.resolve({
      attempts: answeredCommandAttempts([newer, original], branch) as unknown[],
      queue: undefined,
    }),
  );
  const proof = vi.fn().mockResolvedValue({
    unavailable: "No declared proof",
  });
  const artifact = vi.fn();
  const adapter = ciAdapterProofReader(proof);
  const github = vi.fn().mockRejectedValue(new Error("unexpected GitHub"));

  await collectLandedCiPass({
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
        github,
      },
      readArtifact: artifact,
    }),
    readProof: (project, subject, signal) =>
      readIntentCiProof(project, subject, signal, () => repository, {
        adapter,
        artifact,
      }),
  });

  const kept = await keptLandedCiHistory(source.id);
  expect(kept.builds[key]).toMatchObject({
    adapterAttempt,
    startedAt: original.startedAt,
    completedAt: original.completedAt,
    timingBasis: "attempt-start",
  });
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      entries: [
        {
          kind: "point",
          adapterAttempt,
          startedAt: original.startedAt,
          completedAt: original.completedAt,
        },
      ],
    },
  });

  // One representative restart: reopening the retained document asks CI nothing.
  const discoveries = discover.mock.calls.length;
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      entries: [
        { kind: "point", adapterAttempt, startedAt: original.startedAt },
      ],
    },
  });
  expect(discover).toHaveBeenCalledTimes(discoveries);
  expect(github).not.toHaveBeenCalled();
  expect(artifact).not.toHaveBeenCalled();
});
