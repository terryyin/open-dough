import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { keepLandedCiOrder } from "../../server/landedCiHistoryStore.ts";
import { updateProjectHistory } from "../../server/landedCiKeepEvidence.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";

const source = makeMe.aPublishedSource.openDough.please();
test("a store write preserves old build provenance and explanation-only gaps beside current scoped proof", async () => {
  const home = mkdtempSync(path.join(tmpdir(), "landed-ci-legacy-"));
  vi.stubEnv("HOME", home);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });

  // The Git checkout is gone. The versioned document still records its order.
  const base = "a".repeat(40);
  const legacy = "b".repeat(40);
  const current = "c".repeat(40);
  const gap = "d".repeat(40);
  const order = [legacy, current, gap];
  const landings = [
    { base, revision: legacy, receivedAt: "2026-11-05T09:00:00Z" },
    { base: legacy, revision: current, receivedAt: "2026-11-05T10:00:00Z" },
    { base: current, revision: gap, receivedAt: "2026-11-05T11:00:00Z" },
  ].map(({ base, revision, receivedAt }, index) => {
    const receipt = `52000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
    return makeMe.aLaunchLanding
      .capturedFrom({ repository: path.join(home, "removed-repository") })
      .deliveredAs({ delivery: receipt, receipt })
      .comparing({ base, revision })
      .receivedAt(receivedAt)
      .please();
  });
  const [old, good, explanationOnly] = landings;
  if (!old || !good || !explanationOnly) {
    throw new Error("Expected three landings");
  }
  const scope = "dashboard/tests";
  const proof = makeMe.aCiProof
    .forRun({ revision: current, runId: 221 })
    .entries([
      makeMe.aCiProofEntry.at(scope).counting(2, "case").timed(2700).please(),
    ])
    .please();
  const explanation =
    "Earlier collection could not establish this landing's result.";
  const history = makeMe.aLandedCiHistory
    .inTrunkOrder(order)
    .measuredLanding({
      ...old,
      runId: 220,
      startedAt: old.receivedAt,
      completedAt: "2026-11-05T09:01:00Z",
    })
    .measuredLanding({
      ...good,
      runId: 221,
      startedAt: good.receivedAt,
      completedAt: "2026-11-05T10:01:00Z",
    })
    .proofFor("run/221/1", proof)
    .gap(explanationOnly, explanation)
    .please();
  await updateProjectHistory(source.id, () => history);

  // The old wire records deliberately lack today's proof and gap fields.
  const oldSummary = {
    schemaVersion: 1,
    repository: source.repository,
    revision: legacy,
    runId: 220,
    runAttempt: 1,
    entries: [
      {
        path: scope,
        unit: "test cases",
        passed: 2,
        failed: 0,
        other: 0,
        durationMs: 100,
        untimed: 0,
        parts: [
          {
            part: 1,
            status: "present",
            passed: 2,
            failed: 0,
            other: 0,
            durationMs: 100,
            untimed: 0,
            breakdown: true,
          },
        ],
        files: [
          {
            path: `${scope}/legacy.spec.ts`,
            passed: 2,
            failed: 0,
            other: 0,
            durationMs: 100,
            untimed: 0,
          },
        ],
      },
    ],
  };
  const file = machineDashboardPath("landed-ci-history.json");
  writeFileSync(
    file,
    JSON.stringify({
      [source.id]: {
        ...history,
        builds: {
          ...history.builds,
          "run/220/1": {
            ...history.builds["run/220/1"],
            proof: { kind: "summary", summary: oldSummary },
          },
        },
        landings: {
          ...history.landings,
          [explanationOnly.receipt]: {
            ...history.landings[explanationOnly.receipt],
            observed: { kind: "gap", explanation },
          },
        },
      },
    }),
  );
  const readScope = () =>
    performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
      scope,
      revision: gap,
      through: explanationOnly.receivedAt,
    });
  const before = await readScope();
  expect(before).toMatchObject({
    kind: "answered",
    answer: {
      availability: "retained",
      entries: [
        {
          kind: "gap",
          key: "run/220/1",
          reason: "Invalid CI proof summary",
          readings: [
            { kind: "gap", unit: "case", reason: "Invalid CI proof summary" },
          ],
        },
        {
          kind: "point",
          key: "run/221/1",
          readings: [{ kind: "point", unit: "case", ms: 2700 }],
        },
        { kind: "gap", selected: true, reason: explanation },
      ],
    },
  });
  const projectBefore = await performIntentCiHistoryRead(source);
  expect(projectBefore).toMatchObject({
    kind: "answered",
    answer: {
      entries: [
        {
          kind: "point",
          revision: legacy,
          runId: 220,
          runAttempt: 1,
          startedAt: old.receivedAt,
          completedAt: "2026-11-05T09:01:00Z",
        },
        { kind: "point", revision: current },
        { kind: "gap", reason: "unclassified", explanation, revision: gap },
      ],
    },
  });

  await keepLandedCiOrder(source.id, order);

  const kept: unknown = JSON.parse(readFileSync(file, "utf8"));
  expect(kept).toMatchObject({
    [source.id]: {
      landings: {
        [explanationOnly.receipt]: {
          observed: { kind: "gap", reason: "unclassified", explanation },
        },
      },
      builds: {
        "run/220/1": {
          proof: {
            kind: "unavailable",
            reason: "invalid",
            detail: expect.stringContaining(
              "schemaVersion is not 2",
            ) as unknown,
          },
        },
        "run/221/1": { proof },
      },
    },
  });
  expect(await readScope()).toEqual(before);
  expect(await performIntentCiHistoryRead(source)).toEqual(projectBefore);
});
