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
import { comparisonCiWorkflow } from "../../test-support/support/storyCiComparisonWorkflows.ts";
import { archiveOf, listedArtifact } from "../support/ciProofMemory.ts";

const source = makeMe.aPublishedSource.openDough.please();
const planning = { ".planning/landing-note.md": "Planning-only change\n" };
const history = makeMe.aRepository
  .withBaseBeforeEveryLaunch({
    ".github/workflows/ci.yml": comparisonCiWorkflow,
  })
  .withRevision("trunk", {
    files: { "src/built.ts": "export const built = true;\n" },
  })
  .withRevision("planning", { parents: ["base"], files: planning })
  .withRevision("merge", { parents: ["trunk", "planning"], files: planning })
  .please();

test("a skipped Planning landing and its exact predecessor share a scoped build with both roles", async () => {
  const checkout = await materializeLocalCheckout(undefined, history, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  const { base, trunk, merge } = checkout.revisions;
  vi.stubEnv("HOME", checkout.fixture);
  const stopped = new AbortController();
  onTestFinished(async () => {
    stopped.abort();
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });

  const exact = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base, revision: trunk })
    .deliveredAs({
      delivery: "20000000-0000-4000-8000-000000000001",
      receipt: "20000000-0000-4000-8000-000000000002",
    })
    .receivedAt("2026-11-05T13:35:00.000Z")
    .please();
  const skipped = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base: trunk, revision: merge })
    .receivedAt("2026-11-05T14:00:00.000Z")
    .please();
  const startedAt = "2026-11-05T13:30:00Z";
  const attempt = makeMe.aCiProofRun
    .with({ runId: 201, runAttempt: 1, revision: trunk })
    .please();
  const run = makeMe.aCiRun
    .with({
      id: attempt.runId,
      attempt: attempt.runAttempt,
      headSha: trunk,
      startedAt,
      completedAt: exact.receivedAt,
    })
    .please();
  const github = githubApi(({ commit }: { commit?: string }) =>
    commit === trunk ? [run] : [],
  );
  const scope = "dashboard/tests";
  const file = `${scope}/a.spec.ts`;
  const summary = proofSummaryForEntry(
    { repository: source.repository, runId: 201, attempt: 1, revision: trunk },
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
  const archive = vi.fn().mockResolvedValue(archiveOf(summary));
  const artifact = ciProofArtifactReader({
    listing: () =>
      Promise.resolve({ artifacts: [listedArtifact(attempt, 1201)] }),
    archive,
  });

  await collectLandedCiPass({
    source,
    receipts: [exact, skipped],
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

  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope: file,
      revision: merge,
      through: skipped.receivedAt,
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      selectedRevision: merge,
      availability: "retained",
      entries: [
        {
          key: "run/201/1",
          kind: "point",
          readings: [{ kind: "point", unit: "case", ms: 1200 }],
          selected: true,
          date: startedAt,
          build: { ...attempt, provenance: "equivalent" },
          landings: [
            { revision: trunk, provenance: "exact", selected: false },
            { revision: merge, provenance: "equivalent", selected: true },
          ],
        },
      ],
    },
  });
  expect(archive).toHaveBeenCalledTimes(1);
});
