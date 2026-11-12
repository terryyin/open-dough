// Repeat requests as a machine's follow-up ledger holds them
// (../../server/ciFollowUpStore.ts) before a dashboard starts there, each for
// a landing of the origin's repository that machine keeps no prior build,
// published story or receipt of, with the provider's facts for the run each
// names (./ciFollowUpRepeatRun.ts): what a collecting production dashboard
// observes of requests it already spent. They are kept as every kept landing
// is (./ciFollowUpKeptLanding.ts), alone or beside a published story's.
import { repeatLedgerFacts } from "../../../tests/support/ciFollowUpLedgerFacts.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { RepeatRequest } from "../../server/ciFollowUpStore.ts";
import { historyWallTimeMs } from "../../src/landedCiHistory.ts";
import { keepRepeats, type KeptRepeat } from "./ciFollowUpKeptLanding.ts";
import { providerRepeatRun } from "./ciFollowUpRepeatRun.ts";
import { followUpSettings, readFollowUpLedger } from "./ciFollowUpScenario.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { passedBetween } from "./landedCiTrunk.ts";
import { expect } from "./pageTest.ts";
import type { StartOrigin } from "./startOrigin.ts";

// One saved request: the run whose first attempt took `seconds` against an
// average of `averageSeconds`, and what became of its rerun request.
export type SavedRepeat = {
  readonly run: number;
  readonly seconds: number;
  readonly averageSeconds: number;
  readonly submission: RepeatRequest["submission"];
};

// A landing of its own on trunk as a machine keeps it once its request is
// spent as `facts` name, and the provider's facts for the request's run as the
// request names it, with no repeat yet.
export function heldRequest(facts: SavedRepeat): KeptRepeat {
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
}

// `saved` held by the origin's machine, in that order, and the provider
// serving each request's run: the provider's facts for one of those runs.
export const saveRepeatRequests = async (
  origin: StartOrigin,
  github: FakeGitHub,
  saved: readonly SavedRepeat[],
) => keepRepeats(origin, github, saved.map(heldRequest));

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

// The cards the server reads now for Open Dough's published completions.
export const repeatCards = async (server: DashboardServer) =>
  (await followUpSettings(server)).body.cards;

// The runs the provider was asked to rerun, in the order it was asked.
export const rerunRuns = (github: FakeGitHub) =>
  github.calls.flatMap(({ request }) =>
    request.kind === "actions-workflow-rerun" ? [request.runId] : [],
  );

// Waits until a whole collection pass, its reads and its spending, has ended
// after the provider's first `after` calls. A collecting dashboard reads the
// run of every request it still waits on once in each pass, before that pass
// spends any receipt: the second such read of `run` belongs to a pass that
// began once a whole pass had ended. `run` is the run of a waiting request
// for a landing no pass can spend on (`heldRequest`, its repeat not started),
// so a pass reads it that once whatever it spends: a pass preparing a rerun
// request reads the run it is about to rerun again before it asks.
export async function aWholePass(
  github: FakeGitHub,
  run: number,
  after = 0,
): Promise<void> {
  const reads = () =>
    github.calls
      .slice(after)
      .filter(
        ({ request }) =>
          request.kind === "actions-current-run" && request.runId === run,
      ).length;
  await expect.poll(reads, "a whole pass").toBeGreaterThanOrEqual(2);
}
