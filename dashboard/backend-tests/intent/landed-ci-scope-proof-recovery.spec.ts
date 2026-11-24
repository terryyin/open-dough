import { expect, onTestFinished, test, vi } from "vitest";
import { githubApi } from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
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
const scope = "dashboard/tests";
const folder = `${scope}/intent`;
const measuredFile = `${folder}/a.spec.ts`;
const zeroFile = `${folder}/zero.spec.ts`;
const otherFile = `${scope}/other/b.spec.ts`;
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withRevision("revision")
  .please();

async function anExactAttempt(firstListing: unknown) {
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
  const { revision } = landing;
  const run = makeMe.aCiRun
    .with({
      headSha: revision,
      id: 91,
      attempt: 2,
      startedAt: "2026-11-09T00:00:00Z",
      completedAt: "2026-11-09T00:00:01Z",
    })
    .please();
  const subject = makeMe.aCiProofRun
    .with({ runId: 91, runAttempt: 2, revision })
    .please();
  const key = "run/91/2";
  const summary = proofSummaryForEntry(
    {
      repository: source.repository,
      runId: subject.runId,
      attempt: subject.runAttempt,
      revision,
    },
    makeMe.aCiProofEntry
      .at(scope)
      .holding(
        makeMe.aCiProofEvidence
          .inUnit("case")
          .brokenDown(
            { path: measuredFile, passed: 1, durationMs: 1200 },
            { path: zeroFile, passed: 1, durationMs: 0 },
            { path: otherFile, passed: 1, durationMs: 600 },
          )
          .please(),
        makeMe.aCiProofEvidence
          .inUnit("file")
          .brokenDown(
            { path: measuredFile, passed: 1, durationMs: 80 },
            { path: zeroFile, passed: 1, durationMs: 0 },
            { path: otherFile, passed: 1, durationMs: 50 },
          )
          .please(),
      )
      .please(),
  );
  const gh = vi.fn(
    githubApi(({ commit }: { commit?: string }) =>
      commit === revision ? [run] : [],
    ),
  );
  const list = vi
    .fn<(args: readonly string[]) => Promise<unknown>>()
    .mockResolvedValueOnce(firstListing)
    .mockResolvedValue({ artifacts: [listedArtifact(subject, 910)] });
  const archive = vi.fn().mockResolvedValue(archiveOf(summary));
  const openCollector = () => {
    const stopped = new AbortController();
    const artifact = ciProofArtifactReader({ listing: list, archive });
    onTestFinished(() => {
      stopped.abort();
    });
    return {
      close: () => {
        stopped.abort();
      },
      pass: async (receipts: readonly (typeof landing)[]) => {
        await collectLandedCiPass({
          source,
          receipts,
          history: await keptLandedCiHistory(source.id),
          repository,
          stopped: stopped.signal,
          read: passRead(source, repository, stopped.signal, {
            providers: { github: gh },
            readArtifact: artifact,
          }),
          readProof: (project, attempt, signal) =>
            readIntentCiProof(project, attempt, signal, () => repository, {
              artifact,
              adapter: readCiAdapterProof,
            }),
        });
      },
    };
  };
  return { landing, key, gh, list, archive, openCollector };
}

test("the same collector retries a missing artifact for its exact attempt", async () => {
  const { landing, key, list, openCollector } = await anExactAttempt({
    artifacts: [],
  });
  const { revision, receivedAt } = landing;
  const collector = openCollector();

  await collector.pass([landing]);
  expect((await keptLandedCiHistory(source.id)).builds[key]).toMatchObject({
    proof: { kind: "unavailable", reason: "none" },
    proofPending: true,
  });

  await collector.pass([landing]);
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope,
      revision,
      through: receivedAt,
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      entries: [
        {
          kind: "point",
          key,
          readings: [
            { kind: "point", unit: "case", ms: 1800 },
            { kind: "point", unit: "file", ms: 130 },
          ],
        },
      ],
    },
  });
  expect(list).toHaveBeenCalledTimes(2);
});

test("an unanswered artifact listing recovers the exact attempt after collector restart", async () => {
  const { landing, key, gh, list, archive, openCollector } =
    await anExactAttempt({ artifacts: "unavailable" });
  const { revision, receivedAt } = landing;
  const original = openCollector();
  await original.pass([landing]);

  const gapRead = await performIntentCiHistoryRead(source, {
    kind: "intent-ci-history",
    scope,
    revision,
    through: receivedAt,
  });
  expect(gapRead).toMatchObject({
    kind: "answered",
    answer: {
      entries: [
        {
          kind: "gap",
          key,
          reason: "Unreadable CI proof summary",
          build: { revision, runId: 91, runAttempt: 2 },
        },
      ],
    },
  });
  const initial = await keptLandedCiHistory(source.id);
  expect(initial.builds[key]).toMatchObject({
    proof: { kind: "unavailable", reason: "unreadable" },
    proofPending: true,
  });

  // A new pass and proof reader resume from the same store with no live receipt.
  original.close();
  const reopened = openCollector();
  await reopened.pass([]);

  const recovered = await keptLandedCiHistory(source.id);
  expect(Object.keys(recovered.builds)).toEqual([key]);
  expect(recovered.landings[landing.receipt]?.observed).toEqual({
    kind: "build",
    build: key,
    selection: "exact",
  });
  expect(recovered.builds[key]).toMatchObject({ proof: { kind: "summary" } });
  const discoveryCount = gh.mock.calls.length;
  for (const [path, caseMs, fileMs] of [
    [scope, 1800, 130],
    [folder, 1200, 80],
    [measuredFile, 1200, 80],
    [zeroFile, 0, 0],
  ] as const) {
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
            readings: [
              { kind: "point", unit: "case", ms: caseMs },
              { kind: "point", unit: "file", ms: fileMs },
            ],
          },
        ],
      },
    });
  }
  expect(gh).toHaveBeenCalledTimes(discoveryCount);
  expect(list).toHaveBeenCalledTimes(2);
  expect(list.mock.calls.map(([args]) => args[1])).toEqual([
    expect.stringContaining("/91/artifacts?name=ci-proof-summary-attempt-2"),
    expect.stringContaining("/91/artifacts?name=ci-proof-summary-attempt-2"),
  ]);
  expect(archive).toHaveBeenCalledTimes(1);
});
