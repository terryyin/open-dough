import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readCiAdapterProof } from "../../server/ciAdapterProof.ts";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { readIntentCiProof } from "../../server/intentCiProofRead.ts";
import {
  keptLandedCiHistory,
  updateProjectHistory,
} from "../../server/landedCiHistoryStore.ts";
import { collectLandedCiPass } from "../../server/landedCiPass.ts";
import { passRead } from "../../server/landedCiPassRead.ts";
import { proofSummaryForEntry } from "../../test-support/support/ciProofArtifacts.ts";
import { archiveOf, listedArtifact } from "../support/ciProofMemory.ts";

const source = makeMe.aPublishedSource.openDough.please();

test.each([
  { stored: "without proof", proof: undefined },
  {
    stored: "with legacy unreadable proof",
    proof: makeMe.aCiProof
      .unavailableBecause(
        "unreadable",
        "Stored before proof pending was recorded",
      )
      .please(),
  },
])(
  "a retained build $stored backfills without its live launch",
  async ({ proof }) => {
    const home = mkdtempSync(path.join(tmpdir(), "landed-ci-backfill-"));
    const repository = path.join(home, "retired-checkout");
    vi.stubEnv("HOME", home);
    const stopped = new AbortController();
    onTestFinished(() => {
      stopped.abort();
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    });

    const landing = makeMe.aLaunchLanding
      .capturedFrom({ repository })
      .comparing({ base: "a".repeat(40), revision: "b".repeat(40) })
      .please();
    const { revision, receivedAt } = landing;
    const subject = makeMe.aCiProofRun
      .with({ runId: 61, runAttempt: 1, revision })
      .please();
    const key = "run/61/1";
    const history = makeMe.aLandedCiHistory
      .measuredLanding({
        ...landing,
        runId: subject.runId,
        startedAt: "2026-11-09T10:00:00Z",
        completedAt: "2026-11-09T10:00:30Z",
      })
      .inTrunkOrder([revision]);
    if (proof !== undefined) history.proofFor(key, proof);
    const before = history.please();
    await updateProjectHistory(source.id, () => before);

    const scope = "dashboard/tests";
    const file = `${scope}/folder/zero.spec.ts`;
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
            .brokenDown({ path: file, passed: 1, durationMs: 0 })
            .please(),
          makeMe.aCiProofEvidence
            .inUnit("file")
            .brokenDown({ path: file, passed: 1, durationMs: 0 })
            .please(),
        )
        .please(),
    );
    const listing = vi
      .fn<(args: readonly string[]) => Promise<unknown>>()
      .mockResolvedValue({ artifacts: [listedArtifact(subject, 610)] });
    const archive = vi.fn().mockResolvedValue(archiveOf(summary));
    const artifact = ciProofArtifactReader({ listing, archive });
    const github = vi
      .fn<() => Promise<never>>()
      .mockRejectedValue(new Error("unexpected discovery"));

    await collectLandedCiPass({
      source,
      receipts: [],
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
    stopped.abort();

    const kept = await keptLandedCiHistory(source.id);
    expect(kept.landings).toEqual(before.landings);
    expect(Object.keys(kept.builds)).toEqual([key]);
    expect(kept.builds[key]?.proof).toEqual({ kind: "summary", summary });
    expect(
      await performIntentCiHistoryRead(source, {
        kind: "intent-ci-history",
        scope: file,
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
            selected: true,
            readings: [
              { kind: "point", unit: "case", ms: 0 },
              { kind: "point", unit: "file", ms: 0 },
            ],
          },
        ],
      },
    });
    expect(listing.mock.calls.map(([args]) => args[1])).toEqual([
      expect.stringContaining("/61/artifacts?name=ci-proof-summary-attempt-1"),
    ]);
    expect(archive).toHaveBeenCalledTimes(1);
    expect(github).not.toHaveBeenCalled();
  },
);
