import { expect, onTestFinished, test, vi } from "vitest";
import { githubApi } from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { readCiAdapterProof } from "../../server/ciAdapterProof.ts";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { readIntentCiProof } from "../../server/intentCiProofRead.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { collectLandedCiPass } from "../../server/landedCiPass.ts";
import { passRead } from "../../server/landedCiPassRead.ts";
import { proofSummaryForEntry } from "../../test-support/support/ciProofArtifacts.ts";
import { archiveOf, listedArtifact } from "../support/ciProofMemory.ts";

const source = makeMe.aPublishedSource.openDough.please();
const history = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withRevision("landed", { files: { "landed.txt": "Earlier landing\n" } })
  .withRevision("later", { files: { "later.txt": "Later trunk build\n" } })
  .withRevision("unrelated", {
    files: { "unrelated.txt": "Unrelated landing\n" },
  })
  .please();

test("a cancelled landing uses its labeled later attempt and excludes unrelated landing points", async () => {
  const checkout = await materializeRepository(history);
  const repository = checkout.integration;
  const { base, landed, later, unrelated } = checkout.revisions;
  vi.stubEnv("HOME", checkout.fixture);
  const stopped = new AbortController();
  onTestFinished(async () => {
    stopped.abort();
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });

  const cancelled = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base, revision: landed })
    .receivedAt("2026-11-05T14:00:00.000Z")
    .please();
  const other = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base: later, revision: unrelated })
    .deliveredAs({
      delivery: "30000000-0000-4000-8000-000000000001",
      receipt: "30000000-0000-4000-8000-000000000002",
    })
    .receivedAt("2026-11-05T15:00:00.000Z")
    .please();
  const scope = "dashboard/tests";
  const file = `${scope}/a.spec.ts`;
  const laterUrl = "https://ci.invalid/runs/304";
  const laterStartedAt = "2026-11-06T10:00:00Z";

  const builds = [
    {
      runId: 304,
      revision: later,
      url: laterUrl,
      startedAt: laterStartedAt,
      ms: 3400,
    },
    {
      runId: 399,
      revision: unrelated,
      url: "https://ci.invalid/runs/399",
      startedAt: "2026-11-07T10:00:00Z",
      ms: 9900,
    },
  ].map(({ runId, revision, url, startedAt, ms }) => {
    const attempt = makeMe.aCiProofRun
      .with({ runId, runAttempt: 1, revision })
      .please();
    const run = makeMe.aCiRun
      .with({
        id: runId,
        attempt: attempt.runAttempt,
        headSha: revision,
        url,
        startedAt,
        completedAt: new Date(Date.parse(startedAt) + 60_000).toISOString(),
      })
      .please();
    const summary = proofSummaryForEntry(
      { repository: source.repository, runId, attempt: 1, revision },
      makeMe.aCiProofEntry
        .at(scope)
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .brokenDown({ path: file, passed: 1, durationMs: ms })
            .please(),
        )
        .please(),
    );
    return { revision, run, runId, attempt, archive: archiveOf(summary) };
  });
  const cancelledRun = makeMe.aCiRun
    .with({
      id: 303,
      headSha: landed,
      conclusion: "cancelled",
      startedAt: cancelled.receivedAt,
      completedAt: cancelled.receivedAt,
    })
    .please();
  const github = githubApi(({ commit }: { commit?: string }) =>
    commit === landed
      ? [cancelledRun]
      : builds
          .filter((build) => build.revision === commit)
          .map(({ run }) => run),
  );
  const artifact = ciProofArtifactReader({
    listing: (args: readonly string[]) =>
      Promise.resolve({
        artifacts: builds
          .filter(({ runId }) =>
            args[1]?.includes(`/runs/${String(runId)}/artifacts?`),
          )
          .map(({ attempt, runId }) => listedArtifact(attempt, 1000 + runId)),
      }),
    archive: (args) => {
      const build = builds.find(({ runId }) =>
        args[1]?.endsWith(`/artifacts/${String(1000 + runId)}/zip`),
      );
      if (build === undefined)
        throw new Error("Unexpected proof archive request");
      return Promise.resolve(build.archive);
    },
  });

  await collectLandedCiPass({
    source,
    receipts: [cancelled, other],
    history: await keptLandedCiHistory(source.id),
    repository,
    stopped: stopped.signal,
    read: passRead(source, repository, stopped.signal, {
      providers: { github },
      readArtifact: artifact,
    }),
    readProof: (project, subject, signal) =>
      readIntentCiProof(project, subject, signal, () => repository, {
        artifact,
        adapter: readCiAdapterProof,
      }),
  });

  const kept = await keptLandedCiHistory(source.id);
  expect(kept.landings[other.receipt]?.observed).toMatchObject({
    kind: "build",
    build: "run/399/1",
    selection: "exact",
  });
  expect(kept.builds["run/399/1"]?.proof?.kind).toBe("summary");
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope: file,
      revision: landed,
      through: cancelled.receivedAt,
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      selectedRevision: landed,
      availability: "retained",
      entries: [
        {
          key: "run/304/1",
          kind: "point",
          readings: [{ kind: "point", unit: "case", ms: 3400 }],
          selected: true,
          date: laterStartedAt,
          build: {
            revision: later,
            runId: 304,
            runAttempt: 1,
            runUrl: laterUrl,
            provenance: "later",
          },
          landings: [{ revision: landed, selected: true, provenance: "later" }],
        },
      ],
    },
  });
});
