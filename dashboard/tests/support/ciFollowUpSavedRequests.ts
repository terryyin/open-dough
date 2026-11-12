// Repeat requests as a machine's follow-up ledger holds them
// (../../server/ciFollowUpStore.ts) before a dashboard starts there, each for
// a landing of the origin's repository that machine keeps no prior build,
// published story or receipt of, with the provider's facts for the run each
// names (./ciFollowUpRepeatRun.ts): what a collecting production dashboard
// observes of requests it already spent.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { repeatLedgerFacts } from "../../../tests/support/ciFollowUpLedgerFacts.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  followUpKey,
  type FollowUpLedger,
  type RepeatRequest,
} from "../../server/ciFollowUpStore.ts";
import { historyWallTimeMs } from "../../src/landedCiHistory.ts";
import { machineHome } from "../machineLaunchRecords.ts";
import { providerRepeatRun, serveRepeatRuns } from "./ciFollowUpRepeatRun.ts";
import { followUpFile, readFollowUpLedger } from "./ciFollowUpScenario.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { passedBetween } from "./landedCiTrunk.ts";
import type { StartOrigin } from "./startOrigin.ts";

// One saved request: the run whose first attempt took `seconds` against an
// average of `averageSeconds`, and what became of its rerun request.
export type SavedRepeat = {
  readonly run: number;
  readonly seconds: number;
  readonly averageSeconds: number;
  readonly submission: RepeatRequest["submission"];
};

// `saved` held by the origin's machine, in that order, each for a landing of
// its own on trunk, and the provider serving each request's run as the request
// names it, with no repeat yet: the provider's facts for one of those runs.
export function saveRepeatRequests(
  origin: StartOrigin,
  github: FakeGitHub,
  saved: readonly SavedRepeat[],
) {
  const held = saved.map((facts) => {
    const { landing, request } = repeatLedgerFacts({
      ...facts,
      repository: "terryyin/open-dough",
      revision: facts.run.toString(16).padStart(40, "0"),
    });
    const { startedAt, completedAt } = request.original;
    if (startedAt === undefined || completedAt === undefined)
      throw new Error("A saved request's original names its bounds.");
    const entry = makeMe.aCiFollowUpEntry
      .with({
        project: "open-dough",
        revision: landing.revision,
        target: landing.target,
        receipts: [
          `cccccccc-0000-4000-8000-${String(facts.run).padStart(12, "0")}`,
        ],
        eligible: true,
        request,
      })
      .please();
    const provider = providerRepeatRun(
      landing.revision,
      facts.run,
      {
        ...passedBetween(startedAt, completedAt),
        workflowId: request.workflowId,
        headBranch: "main",
      },
      request.originalJobs[0],
    );
    return { run: facts.run, entry, provider };
  });
  const ledger: FollowUpLedger = {
    landings: Object.fromEntries(
      held.map(({ entry }) => [followUpKey(entry.project, entry), entry]),
    ),
  };
  const file = followUpFile({ home: machineHome(origin.machine) });
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(ledger));
  serveRepeatRuns(
    github,
    origin,
    held.map(({ provider }) => provider),
  );
  return (run: number) => {
    const found = held.find((each) => each.run === run);
    if (found === undefined)
      throw new Error(`No saved request names run ${String(run)}.`);
    return found.provider;
  };
}

// The request the machine's ledger holds for `run`, as collection left it.
export const savedRepeatRequest = (
  server: Pick<DashboardServer, "home">,
  run: number,
) =>
  Object.values(readFollowUpLedger(server).landings).find(
    (landing) => landing.request?.original.runId === run,
  )?.request;

// What that request keeps of its comparison whatever its repeat decides: the
// attempt it names as the original, that attempt's wall time and the average
// it was compared with.
export function savedRepeatComparison(
  server: Pick<DashboardServer, "home">,
  run: number,
) {
  const request = savedRepeatRequest(server, run);
  return {
    run: request?.original.runId,
    attempt: request?.original.runAttempt,
    originalMs: historyWallTimeMs(
      request?.original.startedAt,
      request?.original.completedAt,
    ),
    averageMs: request?.reference.averageMs,
  };
}

// The rerun requests the provider received.
export const rerunRequests = (github: FakeGitHub) =>
  github.calls.filter(
    ({ request }) => request.kind === "actions-workflow-rerun",
  );
