import assert from "node:assert/strict";
import { renameSync } from "node:fs";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { githubApi } from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { readCiAdapterProof } from "../../server/ciAdapterProof.ts";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { readIntentCiProof } from "../../server/intentCiProofRead.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { updateProjectHistory } from "../../server/landedCiKeepEvidence.ts";
import { collectLandedCiPass } from "../../server/landedCiPass.ts";
import { passRead } from "../../server/landedCiPassRead.ts";
import { ciScopeHistorySchema } from "../../src/ciScopeHistory.ts";
import { landedCiHistorySchema } from "../../src/landedCiHistory.ts";
import { commitTrunkChanges } from "../../test-support/support/trunkCommitBatch.ts";
import { archiveOf, listedArtifact } from "../support/ciProofMemory.ts";

const source = makeMe.aPublishedSource.openDough.please();
const scope = "dashboard/tests";
const file = `${scope}/cohort.spec.ts`;
const timing = {
  startedAt: "2026-11-05T10:00:00Z",
  completedAt: "2026-11-05T10:00:30Z",
};
const description = makeMe.aRepository.withBaseBeforeEveryLaunch().please();

test("an unordered twenty-first landing keeps the window until Git order shows which measurement to evict", async () => {
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

  const commits = commitTrunkChanges(
    repository,
    Array.from({ length: 21 }, (...[, index]) => ({
      message: `Trunk landing ${String(index + 1)}`,
      file: "landing.txt",
      content: `Landing ${String(index + 1)}\n`,
    })),
  );
  const receipts = commits.map(({ parent, revision }, index) => {
    const receipt = `51000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
    // The oldest trunk measurement has the most recent receipt.
    const receivedAt = new Date(
      Date.parse("2026-11-05T12:00:00Z") - index * 60_000,
    ).toISOString();
    return makeMe.aLaunchLanding
      .capturedFrom({ repository })
      .deliveredAs({ delivery: receipt, receipt })
      .comparing({ base: parent, revision })
      .receivedAt(receivedAt)
      .please();
  });
  const known = receipts.slice(0, 20);
  const [oldest] = known;
  const lastKnown = known.at(-1);
  const newest = receipts[20];
  assert(oldest && lastKnown && newest, "Expected 21 landings");
  const knownOrder = known.map(({ revision }) => revision);
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(knownOrder);
  const evidence = (unit: "case" | "file", durationMs: number) =>
    makeMe.aCiProofEvidence
      .inUnit(unit)
      .brokenDown({ path: file, passed: 1, durationMs })
      .please();
  const proofEntry = (caseMs: number, fileMs: number) =>
    makeMe.aCiProofEntry
      .at(scope)
      .holding(evidence("case", caseMs), evidence("file", fileMs))
      .please();
  for (const [index, landing] of known.entries()) {
    const runId = 100 + index;
    builder.measuredLanding({ ...landing, runId, ...timing }).proofFor(
      `run/${String(runId)}/1`,
      makeMe.aCiProof
        .forRun({ revision: landing.revision, runId })
        .entries([proofEntry(1000 + index, 100 + index)])
        .please(),
    );
  }
  const sharedId = "51000000-0000-4000-8000-000000000022";
  const shared = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .deliveredAs({ delivery: sharedId, receipt: sharedId })
    .comparing(lastKnown)
    .receivedAt(lastKnown.receivedAt)
    .please();
  const sharedBuild = builder.please().builds["run/119/1"];
  assert(sharedBuild, "Expected the shared measurement");
  const before = builder
    .recording(shared, "run/119/1", sharedBuild, "equivalent")
    .please();
  await updateProjectHistory(source.id, () => before);

  const runId = 120;
  const key = "run/120/1";
  const revision = newest.revision;
  const attempt = { runId, runAttempt: 1, revision };
  const subject = makeMe.aCiProofRun.with(attempt).please();
  const run = makeMe.aCiRun
    .with({
      id: runId,
      headSha: revision,
      ...timing,
    })
    .please();
  const proof = makeMe.aCiProof
    .summaryFor(subject, [proofEntry(2100, 210)], source.repository)
    .please();
  const github = vi.fn(
    githubApi(({ commit }: { commit?: string }) =>
      commit === revision ? [run] : [],
    ),
  );
  const listing = vi
    .fn<(args: readonly string[]) => Promise<unknown>>()
    .mockResolvedValue({ artifacts: [listedArtifact(subject, 1120)] });
  const archive = vi.fn().mockResolvedValue(archiveOf(proof.summary));
  const artifact = ciProofArtifactReader({ listing, archive });
  const collect = async () =>
    collectLandedCiPass({
      source,
      receipts: [newest],
      history: await keptLandedCiHistory(source.id),
      repository,
      stopped: stopped.signal,
      read: passRead(source, repository, stopped.signal, {
        providers: { github },
      }),
      readProof: (project, attempt, signal) =>
        readIntentCiProof(project, attempt, signal, () => repository, {
          artifact,
          adapter: readCiAdapterProof,
        }),
    });
  const readScope = async (landing: typeof newest) =>
    performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope,
      revision: landing.revision,
      through: landing.receivedAt,
    });

  // Remove only this disposable checkout's Git objects from view.
  const git = path.join(repository, ".git");
  const hidden = path.join(checkout.fixture, "git-while-unavailable");
  renameSync(git, hidden);
  try {
    await collect();
    const waiting = await keptLandedCiHistory(source.id);
    expect(waiting).toMatchObject(before);
    expect(waiting.builds).toEqual(before.builds);
    expect(waiting.landings[newest.receipt]?.observed).toEqual({
      kind: "pending",
      waitsFor: "order",
    });
    expect(github).not.toHaveBeenCalled();
    expect(listing).not.toHaveBeenCalled();
  } finally {
    renameSync(hidden, git);
  }

  await collect();
  const kept = await keptLandedCiHistory(source.id);
  const retainedOrder = [...knownOrder.slice(1), newest.revision];
  const representedOrder = [
    ...knownOrder.slice(1),
    shared.revision,
    newest.revision,
  ];
  expect(kept.trunkOrder).toEqual(retainedOrder);
  expect(kept.builds[key]?.proof).toEqual(proof);
  expect(except(kept.builds, key)).toEqual(except(before.builds, "run/100/1"));
  expect(except(kept.landings, newest.receipt)).toEqual(
    except(before.landings, oldest.receipt),
  );
  expect(archive).toHaveBeenCalledTimes(1);

  const selected = await readScope(newest);
  assert(selected.kind === "answered", "Expected collected scope");
  const scoped = ciScopeHistorySchema.parse(selected.answer);
  expect(scoped.selectedRevision).toBe(revision);
  expect(scoped.availability).toBe("retained");
  expect(
    scoped.entries.map(({ kind, readings }) => {
      const reading = readings.find(({ unit }) => unit === "case");
      return [kind, reading?.kind === "point" ? reading.ms : undefined];
    }),
  ).toEqual([
    ...known.slice(1).map((...[, index]) => ["point", 1001 + index]),
    ["point", 2100],
  ]);
  expect(scoped.entries.filter(({ selected }) => selected)).toMatchObject([
    {
      key,
      readings: [
        { kind: "point", unit: "case", ms: 2100 },
        { kind: "point", unit: "file", ms: 210 },
      ],
    },
  ]);

  const project = await performIntentCiHistoryRead(source);
  assert(project.kind === "answered", "Expected project history");
  const { entries } = landedCiHistorySchema.parse(project.answer);
  expect(entries.map(({ kind, revision }) => [kind, revision])).toEqual(
    retainedOrder.map((revision) => ["point", revision]),
  );
  for (const cohort of [scoped.entries, entries]) {
    expect(
      cohort.flatMap((entry) =>
        entry.kind === "point"
          ? entry.landings.map(({ revision }) => revision)
          : [],
      ),
    ).toEqual(representedOrder);
  }

  expect(await readScope(oldest)).toMatchObject({
    kind: "answered",
    answer: {
      selectedRevision: oldest.revision,
      availability: "outside-retention",
      entries: [
        {
          kind: "gap",
          selected: true,
          reason: "Selected landing is outside the retained history",
        },
      ],
    },
  });
});

function except<T>(entries: Record<string, T>, key: string) {
  const rest = Object.entries(entries).filter(([entry]) => entry !== key);
  return Object.fromEntries(rest);
}
