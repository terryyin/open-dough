// What the landed CI wall-time history specs share on a real start origin
// (./startOrigin.ts) with the synthetic `claude`: the environment a test
// server collects recorded landings' CI in, which a test server does only when
// its test asks (../../server/landedCiCollection.ts), and checks pending
// landings again in at a test's pace; an unattached Start session's result
// committed in its isolated workspace, for the installed publication to land
// (./startSessionLandingContext.ts), or a trunk landing already recorded in
// the machine's launch records, for a story's execution or refinement or ad
// hoc, and how the history read names a story's landing; the history read
// (`intent=ci-history`, ../../server/intentCiHistoryRead.ts) as the server
// answers it; and the history file every dashboard process on the machine
// shares (../../server/landedCiHistoryStore.ts), as collection left it or as
// a case keeps it. Trunk's changes and CI are ./landedCiTrunk.ts's.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { ProjectHistory } from "../../server/landedCiHistoryStore.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  sharedDashboardBuild,
  type DashboardServer,
} from "./dashboardServer.ts";
import { startLandedCiReader } from "./landedCiReader.ts";
import { serveTrunkRuns as serveTrunkCiRuns } from "./landedCiTrunk.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { commit } from "./launchLanding.ts";
import { rawRequest } from "./rawHttp.ts";
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

// After a test observes collection's persisted evidence, read that same
// machine with collection stopped. Its stopped server no longer owns that
// address: callers use the returned reader's origin for HTTP and navigation.
// Later CI calls then belong to live reads, never a collection poll racing a
// local-history assertion. The caller closes the returned reader.
export async function restartAsLandedCiReader(
  dashboard: DashboardServer,
  origin: Pick<StartOrigin, "machine">,
  mode: "boundary" | "preview",
): Promise<DashboardServer> {
  const prebuilt = dashboard.outDir ?? sharedDashboardBuild;
  await dashboard.close();
  return startLandedCiReader(dashboard, origin, mode, prebuilt);
}

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

// The story a recorded landing titled `title` landed for: `SEED-9#<title>`.
const storyOf = (title: string) => ({ identity: `SEED-9#${title}`, title });

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
    .executing(storyOf(landing.title))
    .launchedAt(landing.at)
    .landedAt(landing.revision, { receipt: landing.receipt });
  return (doneAt === undefined ? record : record.markedDoneAt(doneAt)).please();
}

// A trunk landing the dashboard recorded, kept in the machine's launch
// records, naming the story it landed for: `SEED-9#<title>`'s execution or
// refinement; or an ad hoc session's, naming none.
export function storyLandingRecord(
  landing: {
    readonly title: string;
    readonly revision: string;
    readonly receipt: string;
    readonly at: string;
  },
  workflow: "execution" | "refinement" | "ad hoc",
) {
  const story = storyOf(landing.title);
  const launch =
    workflow === "execution"
      ? makeMe.aLaunchRecord.executing(story)
      : workflow === "refinement"
        ? makeMe.aLaunchRecord.refining(story)
        : makeMe.aLaunchRecord.adHoc({
            instruction: `Land ${landing.title}`,
            title: landing.title,
          });
  return launch
    .launchedAt(landing.at)
    .landedAt(landing.revision, {
      receipt: landing.receipt,
      ...(workflow === "ad hoc" ? {} : { identity: story.identity }),
    })
    .please();
}

// A landing `storyLandingRecord` recorded for a story, as the history read
// names it.
export const answeredLanding = (landing: {
  readonly title: string;
  readonly revision: string;
  readonly at: string;
}) => ({
  revision: landing.revision,
  receivedAt: landing.at,
  identity: storyOf(landing.title).identity,
});

// Open Dough's landed CI wall-time history as the server answers it now.
export async function landedCiHistory(
  dashboard: DashboardServer,
  gapReasons?: "timing-basis",
): Promise<{ readonly status: number; readonly body: unknown }> {
  const vocabulary =
    gapReasons === undefined ? "" : `&gap-reasons=${gapReasons}`;
  const answer = await rawRequest({
    url: `${dashboard.origin}/__authenticated-read?source=open-dough&intent=ci-history${vocabulary}`,
    headers: { Origin: dashboard.origin },
  });
  return { status: answer.status, body: JSON.parse(answer.body) as unknown };
}

// The machine's history file, which every dashboard process on it shares.
const historyFile = (home: string) =>
  path.join(home, ".open-dough/dashboard/landed-ci-history.json");

// What the machine's history file keeps for Open Dough now: each landing's
// observation by its receipt, and each build by its run and attempt; nothing
// before collection first wrote it.
export function keptLandedCiHistory(home: string): {
  readonly landings: Readonly<
    Record<string, { readonly observed: { readonly kind: string } }>
  >;
  readonly builds: Readonly<Record<string, unknown>>;
} {
  const file = historyFile(home);
  const kept = existsSync(file)
    ? (JSON.parse(readFileSync(file, "utf8")) as Record<
        string,
        ReturnType<typeof keptLandedCiHistory>
      >)
    : {};
  return kept["open-dough"] ?? { landings: {}, builds: {} };
}

// Keeps `history` as Open Dough's in the machine's history file, as
// collection would have left it.
export function keepLandedCiHistory(
  home: string,
  history: ProjectHistory,
): void {
  const file = historyFile(home);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ "open-dough": history }));
}

// What each landing the history keeps resolved to, by its receipt.
export const observedKinds = (kept: ReturnType<typeof keptLandedCiHistory>) =>
  Object.fromEntries(
    Object.entries(kept.landings).map(([receipt, { observed }]) => [
      receipt,
      observed.kind,
    ]),
  );

// Waits until the machine's history keeps what each of `landings` resolved
// to, one landing at a time, newest first, as a collection pass walks and
// keeps them, so each wait covers one landing's CI reads.
export async function untilKept(
  home: string,
  landings: readonly { readonly receipt: string; readonly at: string }[],
): Promise<void> {
  const newestFirst = [...landings].sort(
    (a, b) => Date.parse(b.at) - Date.parse(a.at),
  );
  for (const { receipt } of newestFirst)
    await expect
      .poll(() => observedKinds(keptLandedCiHistory(home))[receipt])
      .toBeDefined();
}

// Existing scope-collection cases name a readability predicate directly;
// trunk CI setup and all provider answers stay with the shared trunk owner.
export function serveTrunkRuns(
  github: Parameters<typeof serveTrunkCiRuns>[0],
  origin: Parameters<typeof serveTrunkCiRuns>[1],
  runs: Parameters<typeof serveTrunkCiRuns>[2],
  readableOrOptions:
    Parameters<typeof serveTrunkCiRuns>[3] | (() => boolean) = {},
): void {
  serveTrunkCiRuns(
    github,
    origin,
    runs,
    typeof readableOrOptions === "function"
      ? { readable: readableOrOptions }
      : readableOrOptions,
  );
}
