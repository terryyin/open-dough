// Background collection of the landed CI history (`./landedCiHistoryStore.ts`)
// for the local launch boundary (`./launchBoundary.ts`), which starts it with
// the boundary and stops it with the same cleanup, as it does the feedback
// maintenance check (`./feedbackMaintenanceCheck.ts`). Each accepted landing
// the boundary records nudges it (`./launchBoundaryAnswer.ts`), whether or not
// a page is open; a nudge while it collects asks for one more pass once that
// pass ends.
//
// A pass reads this machine's launch records (`./launchRecordStore.ts`), so
// it finds the landings every dashboard process on this machine recorded,
// and for each configured project resolves the landings onto its configured
// ref, newest first, until the history holds `measuredWindow` measured
// builds for it: through the CI timing comparison's Landed rule
// (`lookupResultBuild` with `storyBranchLandedExactLookup`,
// `./baseCiRevisionLookup.ts`) over the project's own CI read
// (`./intentCiComparisonSlots.ts`) -- the project folder's Git with its
// `ciWorkflow` runs or its `ciAdapter` discovery -- each landing within the
// read boundary's wait. A landing whose resolution is final is kept and never
// resolved again; one whose CI is still running, or could not be read, is
// resolved again by the next pass.
//
// Only a production project environment collects, as only it launches
// feedback maintenance, so a development server sharing this machine's
// records asks CI nothing; every server reads the history. A test server
// collects nothing either unless its test asks: its harness sets
// `DOUGH_TEST_LANDED_CI_COLLECTION=off`.

import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { LaunchLanding } from "../src/launchLanding.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  lookupResultBuild,
  type RevisionBuildSlot,
} from "./baseCiRevisionLookup.ts";
import { storyBranchLandedExactLookup } from "./exactSkippedEquivalent.ts";
import {
  gapFromUnread,
  isUnreadJudgment,
  lookupContext,
  workflowOf,
} from "./intentCiComparisonSlots.ts";
import {
  keepLandedCiResolution,
  keptLandedCiHistory,
} from "./landedCiHistoryStore.ts";
import { measuredBuildOf } from "./landedCiMeasuredBuilds.ts";
import { readableRecordsByProject } from "./launchRecordStore.ts";
import {
  projectEnvironment,
  publishedProjects,
} from "./projectConfiguration.ts";
import { finalSlot } from "./revisionBuildSlot.ts";

// How many measured builds a pass resolves landings for, newest first.
const measuredWindow = 20;

function collects(): boolean {
  return (
    projectEnvironment() === "production" &&
    process.env["DOUGH_TEST_LANDED_CI_COLLECTION"] !== "off"
  );
}

// The landings onto the project's configured ref, each once, newest first.
function trunkLandings(
  source: PublishedSource,
  records: readonly LaunchRecord[],
): LaunchLanding[] {
  const target = `refs/heads/${source.ref}`;
  const byReceipt = new Map<string, LaunchLanding>();
  for (const { landing } of records)
    if (landing?.target === target) byReceipt.set(landing.receipt, landing);
  return [...byReceipt.values()].sort(
    (a, b) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt),
  );
}

// What the Landed rule resolves one landing to: the landed revision's own
// completed build, a confirmed skip's equivalent build, a cancelled landing's
// later trunk build, or why there is none.
async function resolved(
  source: PublishedSource,
  landing: LaunchLanding,
  signal: AbortSignal,
): Promise<RevisionBuildSlot> {
  const context = await lookupContext(source, signal, undefined);
  if ("unavailable" in context)
    return { kind: "unavailable", explanation: context.unavailable };
  const { call, lookupOrGap } = context;
  if (isUnreadJudgment(lookupOrGap)) return gapFromUnread(lookupOrGap);
  return lookupResultBuild(
    landing.revision,
    landing.revision,
    lookupOrGap,
    call,
    workflowOf(call),
    "No completed CI build was found at the landed revision.",
    storyBranchLandedExactLookup(
      true,
      source.repository,
      signal,
      `origin/${source.ref}`,
    ),
  );
}

export class LandedCiCollection {
  private readonly stopped = new AbortController();
  private collecting = false;
  private requested = false;

  // Collects the recorded landings not yet resolved, now, or once the pass
  // under way ends; nothing where this server does not collect.
  nudge(): void {
    if (this.stopped.signal.aborted || !collects()) return;
    this.requested = true;
    if (this.collecting) return;
    this.collecting = true;
    void this.passesWhileRequested();
  }

  private async passesWhileRequested(): Promise<void> {
    while (this.requested && !this.stopped.signal.aborted) {
      this.requested = false;
      try {
        await this.pass();
      } catch {
        // Collected again at the next nudge.
      }
    }
    this.collecting = false;
  }

  private async pass(): Promise<void> {
    const records = await readableRecordsByProject();
    if (records === undefined) return;
    for (const source of publishedProjects()) {
      if (this.stopped.signal.aborted) return;
      await this.collect(
        source,
        trunkLandings(source, records.get(source.id) ?? []),
      );
    }
  }

  private async collect(
    source: PublishedSource,
    landings: readonly LaunchLanding[],
  ): Promise<void> {
    if (landings.length === 0) return;
    let history = await keptLandedCiHistory(source.id);
    const measured = new Set<string>();
    for (const landing of landings) {
      if (this.stopped.signal.aborted || measured.size >= measuredWindow)
        return;
      if (history.landings[landing.receipt] === undefined) {
        const signal = AbortSignal.any([
          this.stopped.signal,
          AbortSignal.timeout(readWaitLimitMs),
        ]);
        const resolution = finalSlot(await resolved(source, landing, signal));
        if (resolution === undefined) continue;
        history = await keepLandedCiResolution(source.id, landing, resolution);
      }
      const observed = history.landings[landing.receipt]?.observed;
      const build =
        observed === undefined ? undefined : measuredBuildOf(history, observed);
      if (build !== undefined) measured.add(build);
    }
  }

  // Ends collection and any read it waits on.
  close(): void {
    this.stopped.abort();
  }
}
