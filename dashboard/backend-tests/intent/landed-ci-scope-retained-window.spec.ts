// Collected scope evidence shares project history's bounded retained cohort.
import assert from "node:assert/strict";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  collectingLandedCi,
  keepLandedCiHistory,
  landedCiHistory,
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
import { resultToLand } from "../../tests/support/landedCiHistory.ts";
import { land } from "../../tests/support/startSessionLandingContext.ts";

test.use({ serverMode: "boundary", extraEnv: collectingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});
const scopedHistory = (origin: string, revision: string, through: string) =>
  collectedScopeHistory(origin, "dashboard/tests", revision, through);

test("the twenty-first accepted landing evicts the oldest trunk measurement despite reversed receipt dates and retains the other twenty proofs", async ({
  dashboard,
  origin,
  github,
}) => {
  const receiptStart = Date.now() + 24 * 60 * 60_000;
  const buildStart = Date.parse("2026-11-05T10:00:00Z");
  // Actual ancestor commits, with oldest A's receipt newest; accepted U arrives
  // last with an earlier receipt than every retained record. No order is injected.
  const previous = retainedTrunkProofs(origin, {
    titles: [...Array<number>(20).keys()].map(
      (index) => `retained-${String(index + 1).padStart(2, "0")}`,
    ),
    receiptPrefix: "51000000-0000-4000-8000-",
    firstRunId: 100,
    firstDurationMs: 1000,
    scope: "dashboard/tests",
    linkedRuns: true,
    receiptAt: (index) => new Date(receiptStart - index * 60_000).toISOString(),
    measuredAt: (index) => new Date(buildStart + index * 60_000).toISOString(),
  });
  const oldest = previous[0];
  const lastRetained = previous.at(-1);
  assert(
    oldest !== undefined && lastRetained !== undefined,
    "The arranged cohort has twenty measurements.",
  );
  let history = makeMe.aLandedCiHistory;
  for (const { landing, key, build } of previous)
    history = history.recording(landing, key, build);
  const before = history.please();
  expect(before.trunkOrder).toBeUndefined();
  keepLandedCiHistory(dashboard.home, before);

  const newest = await resultToLand(dashboard, "retained-twenty-first.txt");
  const lastKey = "run/120/1";
  const run = makeMe.aCiRun
    .with({
      headSha: newest.revision,
      id: 120,
      attempt: 1,
      conclusion: "success",
      url: "https://ci.invalid/runs/120",
      createdAt: "2026-11-05T10:20:00Z",
      startedAt: "2026-11-05T10:20:00Z",
      completedAt: "2026-11-05T10:20:30Z",
    })
    .please();
  const proofRun = {
    repository: "terryyin/open-dough",
    runId: 120,
    attempt: 1,
    revision: newest.revision,
  };
  const text = collectedSummary(
    proofRun,
    [["dashboard/tests", 1, "case"]],
    [
      {
        entries: ["dashboard/tests"],
        part: 1,
        of: 1,
        byFile: true,
        record: playwrightRecord([
          ["dashboard/tests/newest.spec.ts", "expected", [2100]],
        ]),
      },
    ],
  );
  github.serve("terryyin/open-dough", async (call) => {
    if (call.request.kind === "actions-run-artifacts")
      return runArtifactsAnswer(proofRun, 1120);
    if (call.request.kind === "actions-artifact-zip")
      return summaryTextZipAnswer(text);
    const main = await originMain(origin);
    return (
      actionsForRuns([run])(call.argv, main) ??
      publishes({ revision: main })(call)
    );
  });
  const accepted = land(newest.record, origin, dashboard.home).result.landing
    .receipt;
  expect(accepted.revision).toBe(newest.revision);
  expect(Date.parse(accepted.receivedAt)).toBeLessThan(
    Date.parse(lastRetained.landing.receivedAt),
  );

  const window = previous.slice(1);
  const expectedReceipts = [
    ...window.map(({ landing }) => landing.receipt),
    accepted.receipt,
  ].sort();
  // This is the first decisive assertion: a receipt-ordered walk keeps A
  // and fails to reach U, even though U was accepted after every ancestor.
  await expect
    .poll(() => Object.keys(retained(dashboard.home)?.landings ?? {}).sort())
    .toEqual(expectedReceipts);
  await expect
    .poll(() => retained(dashboard.home)?.builds[lastKey]?.proof)
    .toEqual({ kind: "summary", summary: JSON.parse(text) as unknown });
  const expectedOrder = [
    ...window.map(({ landing }) => landing.revision),
    newest.revision,
  ];
  await expect
    .poll(() => retained(dashboard.home)?.trunkOrder)
    .toEqual(expectedOrder);
  const kept = retained(dashboard.home);
  assert(kept !== undefined, "Collection retained its accepted window.");
  expect(Object.keys(kept.builds).sort()).toEqual(
    [...window.map(({ key }) => key), lastKey].sort(),
  );
  expect(kept.landings).not.toHaveProperty(oldest.landing.receipt);
  expect(kept.builds).not.toHaveProperty(oldest.key);
  for (const { landing, key, build } of window) {
    expect(kept.landings[landing.receipt]).toEqual(
      before.landings[landing.receipt],
    );
    expect(kept.builds[key]).toEqual(build);
  }
  expect(
    github.calls.filter(
      ({ request }) => request.kind === "actions-artifact-zip",
    ),
  ).toHaveLength(1);

  readers.push(await restartAsLandedCiReader(dashboard, origin, "boundary"));
  const asked = github.calls.length;
  const selected = await scopedHistory(
    dashboard.origin,
    newest.revision,
    accepted.receivedAt,
  );
  expect(selected).toMatchObject({
    status: 200,
    body: { selectedRevision: newest.revision, availability: "retained" },
  });
  expect(selected.body.entries.map((entry) => entry.kind)).toEqual(
    Array<string>(20).fill("point"),
  );
  expect(
    selected.body.entries.map((entry) => {
      const reading = entry.readings.find((reading) => reading.unit === "case");
      return reading?.kind === "point" ? reading.ms : undefined;
    }),
  ).toEqual([...window.map(({ ms }) => ms), 2100]);
  expect(
    selected.body.entries.flatMap((entry) =>
      entry.landings.map(({ revision }) => revision),
    ),
  ).toEqual(expectedOrder);
  expect(selected.body.entries.filter((entry) => entry.selected)).toEqual([
    expect.objectContaining({
      kind: "point",
      key: lastKey,
      readings: [
        expect.objectContaining({ kind: "point", unit: "case", ms: 2100 }),
      ],
    }),
  ]);
  const project = await landedCiHistory(dashboard);
  expect(project.status).toBe(200);
  const projectEntries = (
    project.body as {
      entries: {
        kind: string;
        revision: string;
        landings?: { revision: string }[];
      }[];
    }
  ).entries;
  expect(projectEntries.map((entry) => [entry.kind, entry.revision])).toEqual(
    expectedOrder.map((revision) => ["point", revision]),
  );
  expect(
    projectEntries.flatMap(
      (entry) => entry.landings?.map((landing) => landing.revision) ?? [],
    ),
  ).toEqual(expectedOrder);
  const evicted = await scopedHistory(
    dashboard.origin,
    oldest.landing.revision,
    oldest.landing.receivedAt,
  );
  expect(evicted).toMatchObject({
    status: 200,
    body: {
      selectedRevision: oldest.landing.revision,
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
  expect(evicted.body.entries).toHaveLength(1);
  expect(
    evicted.body.entries[0]?.readings.every(
      (reading) => reading.kind === "gap",
    ),
  ).toBe(true);
  expect(evicted.body.entries[0]).not.toHaveProperty("build");
  expect(
    await scopedHistory(dashboard.origin, newest.revision, accepted.receivedAt),
  ).toEqual(selected);
  expect(github.calls).toHaveLength(asked);
});
