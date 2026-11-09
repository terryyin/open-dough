// What the landed CI wall-time history specs share on a real start origin
// (./startOrigin.ts) with the synthetic `claude`: the environment a test
// server collects recorded landings' CI in, which a test server does only when
// its test asks (../../server/landedCiCollection.ts), and checks pending
// landings again in at a test's pace; an unattached Start session's result
// committed in its isolated workspace, for the installed publication to land
// (./startSessionLandingContext.ts), or a trunk landing already recorded in
// the machine's launch records; trunk's builds served to the server's `gh`
// with no page open; the history read (`intent=ci-history`,
// ../../server/intentCiHistoryRead.ts) as the server answers it; and the
// history file every dashboard process on the machine shares
// (../../server/landedCiHistoryStore.ts), as collection left it.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { CiRunAnswer } from "./baseCiActions.ts";
import { actionsForRuns } from "./baseCiActions.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { notFoundAnswer } from "../originAnswers.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { isActionsRequest } from "./ghActionsRequest.ts";
import { commit } from "./launchLanding.ts";
import { publishes } from "./publishedRepository.ts";
import { rawRequest } from "./rawHttp.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";
import {
  launched,
  type UnattachedPolicy,
} from "./startSessionLandingCapture.ts";
import { landingHandoff } from "./startSessionLandingContext.ts";

// A test server collects nothing on its own; one started with this in its
// environment collects as a production dashboard does.
export const collectingLandedCi = { DOUGH_TEST_LANDED_CI_COLLECTION: "on" };

// A collecting server that checks its pending landings again every 200 ms
// instead of every few minutes, so a test waits on the history it observes
// changing, never on the production pace.
export const recheckingLandedCi = {
  ...collectingLandedCi,
  DOUGH_LANDED_CI_RECHECK_MS: "200",
};

// An unattached Start session in an isolated workspace that may land, and
// the revision its result commit `name` made there, not yet landed.
export async function resultToLand(
  dashboard: DashboardServer,
  name: string,
): Promise<{ readonly record: LaunchRecord; readonly revision: string }> {
  const { record } = await launched(dashboard, {
    instruction: `Land ${name}`,
    policy: {
      workspace: "isolated",
      landing: "auto-land",
    } satisfies UnattachedPolicy,
  });
  const { session } = landingHandoff(record);
  return { record, revision: commit(session.workspace, name) };
}

// `minutes` before now, on this machine's clock.
export const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

// A revision published on the origin's trunk for the landing titled `title`,
// with the receipt and time the dashboard records that landing under.
export async function publishedLanding(
  origin: StartOrigin,
  landing: {
    readonly title: string;
    readonly receipt: string;
    readonly at: string;
  },
) {
  return {
    ...landing,
    revision: await origin.publishRevision({
      message: `Land ${landing.title}`,
      files: { [`${landing.title}.txt`]: `${landing.title}\n` },
    }),
  };
}

// A trunk landing the dashboard recorded for an execution, kept in the
// machine's launch records: the execution that landed it, its revision, the
// receipt and time it was recorded under, and, when the case lets its Done
// record expire, when it was marked Done.
export function landedRecord(
  landing: {
    readonly title: string;
    readonly revision: string;
    readonly receipt: string;
    readonly at: string;
  },
  doneAt?: string,
) {
  const record = makeMe.aLaunchRecord
    .executing({ identity: `SEED-9#${landing.title}`, title: landing.title })
    .launchedAt(landing.at)
    .landedAt(landing.revision, { receipt: landing.receipt });
  return (doneAt === undefined ? record : record.markedDoneAt(doneAt)).please();
}

// A push run of trunk's selected workflow at `revision`: run `id`, its first
// attempt, linked under ci.invalid, with the facts the case states.
export const trunkRun = (
  revision: string,
  id: number,
  facts: Partial<CiRunAnswer>,
): CiRunAnswer =>
  makeMe.aCiRun
    .with({
      headSha: revision,
      id,
      attempt: 1,
      url: `https://ci.invalid/runs/${String(id)}`,
      ...facts,
    })
    .please();

// Open Dough's trunk as GitHub answers the server's `gh` with no page open:
// the origin's `main` as published when asked, with `runs` of that `main` as
// the selected workflow's push runs, whichever revision or branch a listing
// names; while `readable` says no, every Actions read is not found.
export function serveTrunkRuns(
  github: FakeGitHub,
  origin: StartOrigin,
  runs: (main: string) => readonly CiRunAnswer[],
  readable: () => boolean = () => true,
): void {
  github.serve("terryyin/open-dough", async (call) => {
    if (!readable() && isActionsRequest(call.request)) return notFoundAnswer();
    const main = await originMain(origin);
    return (
      actionsForRuns(runs(main))(call.argv, main) ??
      publishes({ revision: main })(call)
    );
  });
}

// Open Dough's landed CI wall-time history as the server answers it now.
export async function landedCiHistory(
  dashboard: DashboardServer,
): Promise<{ readonly status: number; readonly body: unknown }> {
  const answer = await rawRequest({
    url: `${dashboard.origin}/__authenticated-read?source=open-dough&intent=ci-history`,
    headers: { Origin: dashboard.origin },
  });
  return { status: answer.status, body: JSON.parse(answer.body) as unknown };
}

// What the machine's history file keeps for Open Dough now: each landing's
// observation by its receipt, and each build by its run and attempt; nothing
// before collection first wrote it.
export function keptLandedCiHistory(home: string): {
  readonly landings: Readonly<
    Record<string, { readonly observed: { readonly kind: string } }>
  >;
  readonly builds: Readonly<Record<string, unknown>>;
} {
  const file = path.join(home, ".open-dough/dashboard/landed-ci-history.json");
  const kept = existsSync(file)
    ? (JSON.parse(readFileSync(file, "utf8")) as Record<
        string,
        ReturnType<typeof keptLandedCiHistory>
      >)
    : {};
  return kept["open-dough"] ?? { landings: {}, builds: {} };
}

// What each landing the history keeps resolved to, by its receipt.
export const observedKinds = (kept: ReturnType<typeof keptLandedCiHistory>) =>
  Object.fromEntries(
    Object.entries(kept.landings).map(([receipt, { observed }]) => [
      receipt,
      observed.kind,
    ]),
  );
