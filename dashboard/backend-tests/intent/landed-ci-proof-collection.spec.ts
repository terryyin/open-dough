import { expect, onTestFinished, test, vi } from "vitest";
import { githubApi } from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { collectProjectLandedCi } from "../../server/landedCiCollection.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { ciScopeHistorySchema } from "../../src/ciScopeHistory.ts";
import { buildKeyOf } from "../../src/landedCiBuildKey.ts";
import { archiveOf } from "../support/ciProofMemory.ts";

const source = makeMe.aPublishedSource.openDough.please();
const scope = "dashboard/tests";
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withRevision("revision")
  .please();

test("background collection keeps a validated GitHub summary for the landed attempt", async () => {
  const { project, providers, subject, proof, listing, archive } =
    await githubLanding();

  await collectProjectLandedCi(project, providers);

  const history = await keptLandedCiHistory(source.id, project.home);
  expect(history.builds[buildKeyOf(subject)]?.proof).toEqual(proof);
  expect(listing).toHaveBeenCalledTimes(1);
  expect(archive).toHaveBeenCalledTimes(1);
});

test.each([
  { reason: "mismatched", proofRevision: "f".repeat(40), downloads: 1 },
  { reason: "expired", expired: true, downloads: 0 },
] as const)(
  "background collection records $reason GitHub proof for the landed attempt",
  async ({ reason, downloads, ...artifact }) => {
    const { project, providers, subject, listing, archive } =
      await githubLanding(artifact);

    await collectProjectLandedCi(project, providers);

    const history = await keptLandedCiHistory(source.id, project.home);
    expect(history.builds[buildKeyOf(subject)]?.proof).toMatchObject({
      kind: "unavailable",
      reason,
    });
    expect(listing).toHaveBeenCalledTimes(1);
    expect(archive).toHaveBeenCalledTimes(downloads);
  },
);

test("scoped history reads separate case and file timings from retained GitHub proof", async () => {
  const caseMs = 1200;
  const fileMs = 0;
  const { project, providers, subject } = await githubLanding({
    caseMs,
    fileMs,
  });
  await collectProjectLandedCi(project, providers);

  const read = await performIntentCiHistoryRead(
    source,
    {
      kind: "intent-ci-history",
      scope,
      revision: subject.revision,
      through: project.receipts[0].receivedAt,
    },
    { home: project.home },
  );
  if (read.kind !== "answered")
    throw new Error("Expected a scoped history answer", { cause: read });

  const { entries } = ciScopeHistorySchema.parse(read.answer);
  expect(entries.find(({ key }) => key === buildKeyOf(subject))).toMatchObject({
    kind: "point",
    selected: true,
    readings: [
      { kind: "point", unit: "case", ms: caseMs },
      { kind: "point", unit: "file", ms: fileMs },
    ],
  });
});

async function githubLanding({
  proofRevision,
  expired = false,
  caseMs = 100,
  fileMs = 50,
}: {
  proofRevision?: string;
  expired?: boolean;
  caseMs?: number;
  fileMs?: number;
} = {}) {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const stopped = new AbortController();
  onTestFinished(async () => {
    stopped.abort();
    await checkout.cleanup();
  });

  const repository = checkout.integration;
  const landing = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing(checkout.revisions)
    .please();
  const { revision } = landing;
  const subject = makeMe.aCiProofRun
    .with({ runId: 41, runAttempt: 1, revision })
    .please();
  const run = makeMe.aCiRun
    .with({
      headSha: revision,
      id: subject.runId,
      attempt: subject.runAttempt,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:06:05Z",
    })
    .please();
  const measuredFile = `${scope}/intent/a.spec.ts`;
  const zeroFile = `${scope}/intent/zero.spec.ts`;
  const entry = makeMe.aCiProofEntry
    .at(scope)
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown(
          { path: measuredFile, passed: 1, durationMs: caseMs },
          { path: zeroFile, passed: 1, durationMs: 0 },
        )
        .please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown(
          { path: measuredFile, passed: 1, durationMs: fileMs },
          { path: zeroFile, passed: 1, durationMs: 0 },
        )
        .please(),
    )
    .please();
  const proof = makeMe.aCiProof
    .summaryFor(
      { ...subject, revision: proofRevision ?? revision },
      [entry],
      source.repository,
    )
    .please();
  const github = githubApi(({ commit }: { commit?: string }) =>
    commit === revision ? [run] : [],
  );
  const listing = vi.fn().mockResolvedValue({
    artifacts: [
      makeMe.aCiProofArtifact.with({ id: 901, ...subject, expired }).please(),
    ],
  });
  const archive = vi.fn().mockResolvedValue(archiveOf(proof.summary));

  return {
    project: {
      source,
      repository,
      receipts: [landing] as const,
      stopped: stopped.signal,
      home: checkout.fixture,
    },
    providers: {
      runs: { github },
      proofs: { artifact: ciProofArtifactReader({ listing, archive }) },
    },
    subject,
    proof,
    listing,
    archive,
  };
}
