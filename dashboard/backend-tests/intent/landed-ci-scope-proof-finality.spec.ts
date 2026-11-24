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
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withRevision("running")
  .withRevision("corrupt")
  .please();

test("a reopened collector keeps an answered corrupt proof while a pending run finishes", async () => {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  const { base, running, corrupt } = checkout.revisions;
  vi.stubEnv("HOME", checkout.fixture);
  onTestFinished(async () => {
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });
  const pending = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base, revision: running })
    .deliveredAs({
      delivery: "92000000-0000-4000-8000-000000000001",
      receipt: "92000000-0000-4000-8000-000000000002",
    })
    .please();
  const final = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base: running, revision: corrupt })
    .please();

  const startedAt = "2026-11-09T10:00:00Z";
  const completedAt = "2026-11-09T10:00:01Z";
  const pendingSubject = makeMe.aCiProofRun
    .with({ runId: 92, runAttempt: 1, revision: running })
    .please();
  const finalSubject = makeMe.aCiProofRun
    .with({ runId: 93, runAttempt: 1, revision: corrupt })
    .please();
  let runningRun = makeMe.aCiRun
    .with({
      id: pendingSubject.runId,
      headSha: running,
      status: "in_progress",
      startedAt,
    })
    .please();
  const corruptRun = makeMe.aCiRun
    .with({ id: finalSubject.runId, headSha: corrupt, startedAt, completedAt })
    .please();
  const github = githubApi(({ commit }: { commit?: string }) =>
    commit === running ? [runningRun] : commit === corrupt ? [corruptRun] : [],
  );
  const listing = vi.fn((args: readonly string[]) =>
    Promise.resolve({
      artifacts: args[1]?.includes("/92/artifacts?")
        ? [listedArtifact(pendingSubject, 920)]
        : [listedArtifact(finalSubject, 930)],
    }),
  );
  const scope = "dashboard/tests";
  const file = `${scope}/finished.spec.ts`;
  const proofArchive = (subject: typeof pendingSubject, ms: number) =>
    archiveOf(
      proofSummaryForEntry(
        {
          repository: source.repository,
          runId: subject.runId,
          attempt: subject.runAttempt,
          revision: subject.revision,
        },
        makeMe.aCiProofEntry
          .at(scope)
          .holding(
            makeMe.aCiProofEvidence
              .inUnit("case")
              .brokenDown({ path: file, passed: 1, durationMs: ms })
              .please(),
          )
          .please(),
      ),
    );
  let corruptArchive: Buffer = Buffer.from("this archive has no zip directory");
  const archive = vi.fn((args: readonly string[]) =>
    Promise.resolve(
      args[1]?.endsWith("/920/zip")
        ? proofArchive(pendingSubject, 200)
        : corruptArchive,
    ),
  );

  const collect = async (receipts: readonly (typeof final)[]) => {
    const stopped = new AbortController();
    const artifact = ciProofArtifactReader({ listing, archive });
    try {
      await collectLandedCiPass({
        source,
        receipts,
        history: await keptLandedCiHistory(source.id),
        repository,
        stopped: stopped.signal,
        read: passRead(source, repository, stopped.signal, {
          providers: { github },
          readArtifact: artifact,
        }),
        readProof: (project, attempt, signal) =>
          readIntentCiProof(project, attempt, signal, () => repository, {
            artifact,
            adapter: readCiAdapterProof,
          }),
      });
    } finally {
      stopped.abort();
    }
  };

  await collect([pending, final]);

  const before = await keptLandedCiHistory(source.id);
  const held = before.builds["run/93/1"];
  expect(held).toMatchObject({
    proof: { kind: "unavailable", reason: "unreadable" },
    proofPending: false,
  });
  expect(before.landings[pending.receipt]?.observed).toMatchObject({
    kind: "pending",
    waitsFor: "build",
    run: { runId: 92, runAttempt: 1 },
  });

  runningRun = makeMe.aCiRun
    .with({
      id: pendingSubject.runId,
      headSha: running,
      startedAt,
      completedAt,
    })
    .please();
  corruptArchive = proofArchive(finalSubject, 9900);

  await collect([]);

  const kept = await keptLandedCiHistory(source.id);
  expect(kept.builds["run/93/1"]).toEqual(held);
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope: file,
      revision: corrupt,
      through: final.receivedAt,
    }),
  ).toMatchObject({
    kind: "answered",
    answer: {
      entries: [
        {
          key: "run/92/1",
          kind: "point",
          readings: [{ unit: "case", kind: "point", ms: 200 }],
        },
        {
          key: "run/93/1",
          kind: "gap",
          reason: "Unreadable CI proof summary",
        },
      ],
    },
  });
  expect(listing.mock.calls.map(([args]) => args[1])).toEqual([
    expect.stringContaining("/93/artifacts?name=ci-proof-summary-attempt-1"),
    expect.stringContaining("/92/artifacts?name=ci-proof-summary-attempt-1"),
  ]);
});
