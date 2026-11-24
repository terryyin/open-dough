// The actual collector repairs legacy bounds at their retained attempt while
// a newer rerun is listed; local history reads never acquire that evidence.
import { expect, onTestFinished, test, vi } from "vitest";
import {
  apiRun,
  githubApi,
} from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { readCiAdapterProof } from "../../server/ciAdapterProof.ts";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { readIntentCiProof } from "../../server/intentCiProofRead.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { updateProjectHistory } from "../../server/landedCiKeepEvidence.ts";
import { collectLandedCiPass } from "../../server/landedCiPass.ts";
import { passRead } from "../../server/landedCiPassRead.ts";
import { unverifiedAttemptTiming } from "../../src/ciAttemptTiming.ts";

const source = makeMe.aPublishedSource.openDough.please();
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withRevision("original")
  .withRevision("newer")
  .please();

for (const bounds of ["available", "unavailable"] as const) {
  test(`collection uses attempt start for new evidence; legacy original bounds ${bounds} are repaired or explained without selecting a faster rerun`, async () => {
    const checkout = await materializeLocalCheckout(undefined, description, {
      gitTemplates: false,
    });
    const repository = checkout.integration;
    const {
      base,
      original: originalRevision,
      newer: newerRevision,
    } = checkout.revisions;
    const stopped = new AbortController();
    vi.stubEnv("HOME", checkout.fixture);
    onTestFinished(async () => {
      stopped.abort();
      vi.unstubAllEnvs();
      await checkout.cleanup();
    });

    const originalLanding = makeMe.aLaunchLanding
      .capturedFrom({ repository })
      .comparing({ base, revision: originalRevision })
      .deliveredAs({
        delivery: "legacy",
        receipt: "41000000-0000-4000-8000-000000000001",
      })
      .receivedAt("2026-11-05T09:00:00.000Z")
      .please();
    const newerLanding = makeMe.aLaunchLanding
      .capturedFrom({ repository })
      .comparing({ base: originalRevision, revision: newerRevision })
      .deliveredAs({
        delivery: "41000000-0000-4000-8000-000000000002",
        receipt: "41000000-0000-4000-8000-000000000002",
      })
      .receivedAt("2026-11-05T12:00:00.000Z")
      .please();
    const original = makeMe.aCiRun
      .with({
        id: 41,
        attempt: 1,
        headSha: originalRevision,
        createdAt: "2026-11-05T10:00:00Z",
        startedAt: "2026-11-05T10:01:00Z",
        completedAt: "2026-11-05T10:03:00Z",
      })
      .please();
    const rerun = makeMe.aCiRun
      .with({
        id: 41,
        attempt: 2,
        headSha: originalRevision,
        createdAt: "2026-11-05T10:00:00Z",
        startedAt: "2026-11-05T11:00:00Z",
        completedAt: "2026-11-05T11:00:10Z",
      })
      .please();
    const latest = makeMe.aCiRun
      .with({
        id: 42,
        attempt: 1,
        headSha: newerRevision,
        createdAt: "2026-11-05T12:00:00Z",
        startedAt: "2026-11-05T12:02:00Z",
        completedAt: "2026-11-05T12:04:00Z",
      })
      .please();
    const proof = makeMe.aCiProof
      .forRun({ revision: originalRevision, runId: 41 })
      .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
      .please();
    const latestProof = makeMe.aCiProof
      .forRun({ revision: newerRevision, runId: 42 })
      .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
      .please();
    await updateProjectHistory(source.id, () =>
      makeMe.aLandedCiHistory
        .inTrunkOrder([originalRevision, newerRevision])
        .recording(
          originalLanding,
          "run/41/1",
          makeMe.aKeptBuild
            .with({
              revision: originalRevision,
              state: "pass",
              runId: 41,
              runAttempt: 1,
              runUrl: "https://ci.invalid/runs/41",
              startedAt: original.createdAt,
              completedAt: original.completedAt,
              timingBasis: undefined,
              proof,
            })
            .please(),
        )
        .recording(
          newerLanding,
          "run/42/1",
          makeMe.aKeptBuild
            .with({
              revision: newerRevision,
              state: "pass",
              runId: 42,
              runAttempt: 1,
              runUrl: "https://ci.invalid/runs/42",
              startedAt: latest.startedAt,
              completedAt: latest.completedAt,
              proof: latestProof,
            })
            .please(),
        )
        .please(),
    );

    expect(
      await performIntentCiHistoryRead(source, {
        kind: "intent-ci-history",
        gapReasons: "timing-basis",
      }),
    ).toMatchObject({
      kind: "answered",
      answer: {
        entries: [
          {
            kind: "gap",
            reason: "timing-basis",
            build: { runId: 41, runAttempt: 1 },
          },
          {
            kind: "point",
            runId: 42,
            startedAt: latest.startedAt,
            completedAt: latest.completedAt,
          },
        ],
      },
    });

    const github = vi.fn(
      githubApi(
        (request: {
          kind: string;
          runId?: number;
          attempt?: number;
          commit?: string;
        }) => {
          if (
            request.kind === "attempt" &&
            request.runId === 41 &&
            request.attempt === 1
          ) {
            if (bounds === "unavailable")
              throw new Error("Original attempt bounds unavailable");
            return apiRun(original);
          }
          if (request.kind === "runs") {
            if (request.commit === originalRevision) return [rerun];
            if (request.commit === newerRevision) return [latest];
            return [];
          }
          if (request.kind === "run") {
            if (request.runId === 41) return rerun;
            if (request.runId === 42) return latest;
          }
          throw new Error(`Unexpected GitHub request ${request.kind}`);
        },
      ),
    );
    const artifact = vi.fn();

    await collectLandedCiPass({
      source,
      receipts: [originalLanding, newerLanding],
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
    expect(kept.builds["run/41/1"]).toMatchObject(
      bounds === "available"
        ? {
            runId: 41,
            runAttempt: 1,
            startedAt: original.startedAt,
            completedAt: original.completedAt,
            timingBasis: "attempt-start",
          }
        : {
            runId: 41,
            runAttempt: 1,
            startedAt: original.createdAt,
            completedAt: original.completedAt,
          },
    );
    if (bounds === "unavailable")
      expect(kept.builds["run/41/1"]?.timingBasis).toBeUndefined();
    expect(kept.builds["run/42/1"]).toMatchObject({
      runId: 42,
      startedAt: latest.startedAt,
    });
    expect(JSON.stringify(github.mock.calls)).toContain("/runs/41/attempts/1");

    expect(
      await performIntentCiHistoryRead(source, {
        kind: "intent-ci-history",
        gapReasons: "timing-basis",
      }),
    ).toMatchObject({
      kind: "answered",
      answer: {
        entries: [
          bounds === "available"
            ? {
                kind: "point",
                runId: 41,
                runAttempt: 1,
                startedAt: original.startedAt,
                completedAt: original.completedAt,
              }
            : {
                kind: "gap",
                reason: "timing-basis",
                build: { runId: 41, runAttempt: 1 },
              },
          {
            kind: "point",
            runId: 42,
            startedAt: latest.startedAt,
            completedAt: latest.completedAt,
          },
        ],
        reference: {
          sampleCount: bounds === "available" ? 1 : 0,
          selected: { key: "run/42/1", ms: 120000 },
          evidence: [
            bounds === "available"
              ? { key: "run/41/1", status: "included", ms: 120000 }
              : {
                  key: "run/41/1",
                  status: "excluded",
                  reason: unverifiedAttemptTiming,
                },
            { key: "run/42/1", status: "selected", ms: 120000 },
          ],
        },
      },
    });

    // One representative restart: reopening the retained document asks CI nothing.
    const asked = github.mock.calls.length;
    expect(
      await performIntentCiHistoryRead(source, {
        kind: "intent-ci-history",
        gapReasons: "timing-basis",
      }),
    ).toMatchObject({
      kind: "answered",
      answer: {
        entries: [
          bounds === "available"
            ? {
                kind: "point",
                runId: 41,
                runAttempt: 1,
                startedAt: original.startedAt,
              }
            : {
                kind: "gap",
                reason: "timing-basis",
                build: { runId: 41, runAttempt: 1 },
              },
          { kind: "point", runId: 42, startedAt: latest.startedAt },
        ],
      },
    });
    expect(github.mock.calls.length).toBe(asked);
    expect(artifact).not.toHaveBeenCalled();
  });
}
