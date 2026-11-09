// What the landed CI wall-time history specs share on a real start origin
// (./startOrigin.ts) with the synthetic `claude`: the environment a test
// server collects recorded landings' CI in, which a test server does only when
// its test asks (../../server/landedCiCollection.ts); an unattached Start
// session's result committed in its isolated workspace, for the installed
// publication to land (./startSessionLandingContext.ts); trunk's builds served
// to the server's `gh` with no page open; and the history read
// (`intent=ci-history`, ../../server/intentCiHistoryRead.ts) as the server
// answers it.

import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { CiRunAnswer } from "./baseCiActions.ts";
import { actionsForRuns } from "./baseCiActions.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
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

// Open Dough's trunk as GitHub answers the server's `gh` with no page open:
// the origin's `main` as published when asked, with `runs` of that `main` as
// the selected workflow's push runs, whichever revision or branch a listing
// names.
export function serveTrunkRuns(
  github: FakeGitHub,
  origin: StartOrigin,
  runs: (main: string) => readonly CiRunAnswer[],
): void {
  github.serve("terryyin/open-dough", async (call) => {
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
