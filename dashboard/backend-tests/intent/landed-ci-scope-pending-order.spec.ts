// Collected scope evidence shares project history's bounded retained cohort.
import assert from "node:assert/strict";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  keepLandedCiHistory,
  restartAsLandedCiReader,
} from "../../tests/support/landedCiHistory.ts";
import {
  retainedHistory as retained,
  collectedScopeHistory,
} from "../../tests/support/collectedScopeHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { actionsForRuns } from "../../tests/support/baseCiActions.ts";
import { runArtifactsAnswer } from "../../tests/support/ciProofArtifacts.ts";
import {
  collectedSummary,
  playwrightRecord,
  summaryTextZipAnswer,
} from "../../tests/support/ciProofCollected.ts";
import { retainedTrunkProofs } from "../../tests/support/retainedTrunkProofs.ts";
import { publishes } from "../../tests/support/publishedRepository.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import { readFileSync } from "node:fs";
import { withoutScopeHistoryGit } from "../../tests/support/scopeHistoryCollectedGit.ts";
import path from "node:path";
import { historyFile } from "../../tests/support/collectedScopeHistory.ts";
import { publishedLanding } from "../../tests/support/landedCiTrunk.ts";
import { commonGitDir } from "../../tests/support/launchLanding.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";

test.use({ serverMode: "boundary" });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});
const scopedHistory = (origin: string, revision: string, through: string) =>
  collectedScopeHistory(origin, "dashboard/tests", revision, through);

test("an unpositioned twenty-first landing waits without losing the known twenty proofs and periodic collection resumes when local Git returns", async ({
  origin,
  github,
  startServer,
}) => {
  const home = path.join(origin.machine, "home");
  const repository = commonGitDir(origin.project);
  const firstMeasured = Date.parse("2026-11-05T10:00:00Z");
  const known = retainedTrunkProofs(origin, {
    titles: [...Array<number>(20).keys()].map(
      (index) => `known-order-${String(index + 1).padStart(2, "0")}`,
    ),
    receiptPrefix: "53000000-0000-4000-8000-",
    firstRunId: 300,
    firstDurationMs: 3000,
    scope: "dashboard/tests",
    receiptAt: (index) =>
      new Date(firstMeasured + index * 60_000).toISOString(),
    measuredAt: (index) =>
      new Date(firstMeasured + index * 60_000).toISOString(),
  });
  const knownOrder = known.map(({ landing }) => landing.revision);
  const lastKnown = knownOrder.at(-1);
  assert(
    lastKnown !== undefined,
    "The arranged cohort has twenty measurements.",
  );
  let history = makeMe.aLandedCiHistory.inTrunkOrder(knownOrder);
  for (const { landing, key, build } of known)
    history = history.recording(landing, key, build);
  const before = history.please();
  await keepLandedCiHistory(home, before);
  const newest = await publishedLanding(origin, {
    title: "awaiting-local-order",
    receipt: "53000000-0000-4000-8000-000000000021",
    at: "2026-11-05T11:00:00Z",
  });
  const accepted = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .forLaunch(newest.receipt)
    .deliveredAs({ delivery: newest.receipt, receipt: newest.receipt })
    .comparing({ base: lastKnown, revision: newest.revision })
    .receivedAt(newest.at)
    .please();
  keepLaunchRecords(home, [
    makeMe.aLaunchRecord
      .executing({
        identity: "SEED-9#awaiting-local-order",
        title: "Awaiting local landing order",
      })
      .inClaudeSession({ sessionId: newest.receipt })
      .launchedAt(newest.at)
      .completedWith({ message: "", receivedAt: newest.at })
      .markedDoneAt(newest.at)
      .withCapturedLanding(accepted)
      .please(),
  ]);

  const proofRun = makeMe.aCiProofCollectorRun
    .with({
      repository: "terryyin/open-dough",
      runId: 320,
      attempt: 1,
      revision: newest.revision,
    })
    .please();
  const run = makeMe.aCiRun
    .with({
      headSha: newest.revision,
      id: 320,
      attempt: 1,
      conclusion: "success",
      createdAt: "2026-11-05T11:00:00Z",
      startedAt: "2026-11-05T11:00:00Z",
      completedAt: "2026-11-05T11:00:30Z",
    })
    .please();
  const text = collectedSummary(
    proofRun,
    [{ entry: "dashboard/tests", parts: 1, unit: "case" }],
    [
      {
        entries: ["dashboard/tests"],
        part: 1,
        of: 1,
        byFile: true,
        record: playwrightRecord([
          ["dashboard/tests/resumed.spec.ts", "expected", [3200]],
        ]),
      },
    ],
  );
  github.serve("terryyin/open-dough", async (call) => {
    if (call.request.kind === "actions-run-artifacts")
      return runArtifactsAnswer(proofRun, 1320);
    if (call.request.kind === "actions-artifact-zip")
      return summaryTextZipAnswer(text);
    const main = await originMain(origin);
    return (
      actionsForRuns([run])(call.argv, main) ??
      publishes({ revision: main })(call)
    );
  });

  // Every authority belongs to this fixture, including its bare origin. The
  // helper restores all metadata even if an observation fails.
  const storedBeforeMissingGit = readFileSync(historyFile(home), "utf8");
  const collecting = await withoutScopeHistoryGit(
    origin,
    before,
    async () => {
      expect(readFileSync(historyFile(home), "utf8")).toBe(
        storedBeforeMissingGit,
      );
      const collecting = await startServer();
      await expect
        .poll(() => retained(home)?.landings[accepted.receipt]?.observed)
        .toEqual({ kind: "pending", waitsFor: "order" });
      const waiting = retained(home);
      assert(
        waiting !== undefined,
        "The pending collector preserved its known history.",
      );
      expect(Object.keys(waiting.builds).sort()).toEqual(
        known.map(({ key }) => key).sort(),
      );
      expect(waiting.trunkOrder).toEqual(knownOrder);
      expect(Object.keys(waiting.landings).sort()).toEqual(
        [
          ...known.map(({ landing }) => landing.receipt),
          accepted.receipt,
        ].sort(),
      );
      for (const { landing, key, build } of known) {
        expect(waiting.landings[landing.receipt]).toEqual(
          before.landings[landing.receipt],
        );
        expect(waiting.builds[key]).toEqual(build);
      }
      expect(waiting.builds).not.toHaveProperty("run/320/1");
      expect(
        github.calls.filter(({ request }) =>
          request.kind.startsWith("actions-"),
        ),
      ).toEqual([]);
      return collecting;
    },
    [origin.origin],
  );

  // The existing periodic loop discovers restored Git; no clock sleep or
  // manual collection nudge advances this pending landing.
  const window = known.slice(1);
  await expect
    .poll(() => Object.keys(retained(home)?.landings ?? {}).sort())
    .toEqual(
      [
        ...window.map(({ landing }) => landing.receipt),
        accepted.receipt,
      ].sort(),
    );
  await expect
    .poll(() => retained(home)?.builds["run/320/1"]?.proof)
    .toEqual({ kind: "summary", summary: JSON.parse(text) as unknown });
  await expect
    .poll(() => retained(home)?.trunkOrder)
    .toEqual([...knownOrder.slice(1), newest.revision]);
  const resumed = retained(home);
  assert(
    resumed !== undefined,
    "Periodic collection retained the resumed history.",
  );
  expect(Object.keys(resumed.builds).sort()).toEqual(
    [...window.map(({ key }) => key), "run/320/1"].sort(),
  );
  for (const { key, build } of window)
    expect(resumed.builds[key]).toEqual(build);
  expect(
    github.calls.filter(
      ({ request }) => request.kind === "actions-artifact-zip",
    ),
  ).toHaveLength(1);

  const reader = await restartAsLandedCiReader(collecting, origin, "boundary");
  readers.push(reader);
  const asked = github.calls.length;
  const answer = await scopedHistory(reader.origin, newest.revision, newest.at);
  expect(answer).toMatchObject({
    status: 200,
    body: { availability: "retained", selectedRevision: newest.revision },
  });
  expect(answer.body.entries).toHaveLength(20);
  expect(answer.body.entries.every((entry) => entry.kind === "point")).toBe(
    true,
  );
  expect(answer.body.entries.at(-1)).toMatchObject({
    kind: "point",
    selected: true,
    readings: [{ kind: "point", unit: "case", ms: 3200 }],
  });
  expect(
    await scopedHistory(reader.origin, newest.revision, newest.at),
  ).toEqual(answer);
  expect(github.calls).toHaveLength(asked);
});
