// Collects one landed GitHub attempt's retained proof under a closed Intent
// reader, for the summary / mismatched / expired distinctions the collection
// specs observe.
import { onTestFinished, vi } from "vitest";
import { githubApi } from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { readCiAdapterProof } from "../../server/ciAdapterProof.ts";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import { readIntentCiProof } from "../../server/intentCiProofRead.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { collectLandedCiPass } from "../../server/landedCiPass.ts";
import { passRead } from "../../server/landedCiPassRead.ts";
import { buildKeyOf } from "../../src/landedCiBuildKey.ts";
import { proofSummaryForEntry } from "../../test-support/support/ciProofArtifacts.ts";
import { archiveOf, listedArtifact } from "./ciProofMemory.ts";

export const retainedProofSource = makeMe.aPublishedSource.openDough.please();
export const retainedProofScope = "dashboard/tests";

const measuredFile = `${retainedProofScope}/intent/a.spec.ts`;
const zeroFile = `${retainedProofScope}/intent/zero.spec.ts`;
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withRevision("revision")
  .please();

export type RetainedProofState = "summary" | "mismatched" | "expired";

export async function collectRetainedLandedCiProof(
  proofState: RetainedProofState,
) {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  const stopped = new AbortController();
  vi.stubEnv("HOME", checkout.fixture);
  onTestFinished(async () => {
    stopped.abort();
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });

  const landing = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing(checkout.revisions)
    .please();
  const { revision, receivedAt } = landing;
  const subject = makeMe.aCiProofRun
    .with({ runId: 41, runAttempt: 1, revision })
    .please();
  const key = buildKeyOf(subject);
  const run = makeMe.aCiRun
    .with({
      headSha: revision,
      id: subject.runId,
      attempt: subject.runAttempt,
      conclusion: "success",
      createdAt: "2026-11-05T10:00:00Z",
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:06:05Z",
    })
    .please();
  const entry = makeMe.aCiProofEntry
    .at(retainedProofScope)
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown(
          { path: measuredFile, passed: 1, durationMs: 1200 },
          { path: zeroFile, passed: 1, durationMs: 0 },
        )
        .please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown(
          { path: measuredFile, passed: 1, durationMs: 0 },
          { path: zeroFile, passed: 1, durationMs: 0 },
        )
        .please(),
    )
    .please();
  const summary = proofSummaryForEntry(
    {
      repository: retainedProofSource.repository,
      runId: subject.runId,
      attempt: subject.runAttempt,
      revision: proofState === "mismatched" ? "f".repeat(40) : subject.revision,
    },
    entry,
  );
  const github = vi.fn(
    githubApi(({ commit }: { commit?: string }) =>
      commit === revision ? [run] : [],
    ),
  );
  const listing = vi
    .fn<(args: readonly string[]) => Promise<unknown>>()
    .mockResolvedValue({
      artifacts: [
        proofState === "expired"
          ? makeMe.aCiProofArtifact
              .with({
                id: 901,
                runId: subject.runId,
                runAttempt: subject.runAttempt,
                revision,
                expired: true,
              })
              .please()
          : listedArtifact(subject, 901),
      ],
    });
  const archive = vi.fn().mockResolvedValue(archiveOf(summary));
  const artifact = ciProofArtifactReader({ listing, archive });
  const readers = { artifact, adapter: readCiAdapterProof };

  await collectLandedCiPass({
    source: retainedProofSource,
    receipts: [landing],
    history: await keptLandedCiHistory(retainedProofSource.id),
    repository,
    stopped: stopped.signal,
    read: passRead(retainedProofSource, repository, stopped.signal, {
      providers: { github },
      readArtifact: artifact,
    }),
    readProof: (project, attempt, signal) =>
      readIntentCiProof(project, attempt, signal, () => repository, readers),
  });

  return {
    repository,
    stopped,
    revision,
    receivedAt,
    subject,
    key,
    summary,
    github,
    listing,
    archive,
    readers,
    kept: await keptLandedCiHistory(retainedProofSource.id),
  };
}
