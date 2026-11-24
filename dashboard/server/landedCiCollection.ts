// Background collection of the landed CI history (`./landedCiHistoryStore.ts`)
// for the local launch boundary (`./launchBoundary.ts`), which starts it with
// the boundary and stops it with the same cleanup, as it does the feedback
// maintenance check (`./feedbackMaintenanceCheck.ts`). One loop
// (`./repeatingCheck.ts`) collects once the boundary starts -- so landings
// recorded before this server, or before collection existed, are collected by
// the same rebuild -- and then every few minutes, so a landing whose CI was
// still pending is checked again until it is final; each accepted landing the
// boundary records nudges it at once (`./launchBoundaryAnswer.ts`), whether or
// not a page is open. Passes never overlap: a nudge while one runs asks for
// one more once it ends.
//
// A pass reads this machine's launch records (`./launchRecordStore.ts`), so
// it finds the landings every dashboard process on this machine recorded,
// with the landings the history itself keeps, whose records may have expired.
// For each configured project the ordered pass (`./landedCiPass.ts`) walks
// the landings onto its configured ref, newest first, until the history
// holds `measuredWindow` measured builds for it, and resolves each landing
// whose resolution is not final yet over the project's CI read. A final
// resolution is kept and never resolved again, except a retained equivalent
// `No CI proof summary` gap that timed wall-time reuse without proof would
// now measure (`reopenableRetainedNoProofSkip`, `./landedCiNoProofReopen.ts`);
// a pending one is kept until a later pass resolves it again. A new measured
// pass retains its first CI proof ask with that observation. The history keeps
// only that window, so a landing the walk no longer reaches is neither kept
// nor asked about again. CI that could not be read leaves that project until
// the next pass; a landing whose stand-in build's CI proof read GitHub left
// unanswered waits for that proof alone, and the walk goes on to the
// landings past it.
//
// Only a production project environment collects, as only it launches
// feedback maintenance, so a development server sharing this machine's
// records asks CI nothing; every server reads the history. A test server
// collects nothing either unless its test asks: its harness sets
// `DOUGH_TEST_LANDED_CI_COLLECTION=off`.

import { collectCiFollowUps } from "./ciFollowUpCollection.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { configuredLimit } from "./configuredLimit.ts";
import type { LandingReference } from "./landedCiHistoryStore.ts";
import { collectLandedCiPass } from "./landedCiPass.ts";
import { providerProof } from "./landedCiCollectedProof.ts";
import { homedir } from "node:os";
import { readLandingOrder } from "./launchLandingGit.ts";
import { passRead } from "./landedCiResolution.ts";
import { observationNow } from "./observationClock.ts";
import { readableRecordsByProject } from "./launchRecordStore.ts";
import {
  projectEnvironment,
  publishedProjects,
} from "./projectConfiguration.ts";
import { repeatUntilStopped } from "./repeatingCheck.ts";
import { executionCheckout } from "./executionCheckout.ts";

// How often recorded landings are collected again, so a pending one is
// checked until it is final. A test may shorten it through the environment.
function recheckMs(): number {
  return configuredLimit("DOUGH_LANDED_CI_RECHECK_MS", 2 * 60_000);
}

function collects(): boolean {
  return (
    projectEnvironment() === "production" &&
    process.env["DOUGH_TEST_LANDED_CI_COLLECTION"] !== "off"
  );
}

// The candidates' trunk order their checkouts and the project's execution
// checkout know.
function localLandingOrder(
  source: PublishedSource,
  candidates: readonly LandingReference[],
  stopped: AbortSignal,
): Promise<readonly string[] | undefined> {
  return readLandingOrder(
    [
      ...candidates.flatMap((landing) =>
        landing.repository === undefined ? [] : [landing.repository],
      ),
      executionCheckout(source).path,
    ],
    candidates.map((landing) => landing.revision),
    undefined,
    stopped,
  );
}

// This machine's pass: its readable launch records and configured projects,
// their checkouts' Git order, their providers' CI and proof, and its home's
// history.
async function machinePass(stopped: AbortSignal): Promise<void> {
  const records = await readableRecordsByProject();
  if (records === undefined) return;
  await collectLandedCiPass({
    projects: publishedProjects(),
    records,
    landingOrder: localLandingOrder,
    read: passRead,
    readProof: providerProof,
    now: observationNow,
    home: homedir(),
    followUps: collectCiFollowUps,
    stopped,
  });
}

// Whether a server collects, how often it collects again, and its pass.
export type LandedCiLifecycle = {
  readonly collects: () => boolean;
  readonly recheckMs: () => number;
  readonly pass: (stopped: AbortSignal) => Promise<void>;
};

const machineLifecycle: LandedCiLifecycle = {
  collects,
  recheckMs,
  pass: machinePass,
};

export class LandedCiCollection {
  private readonly stopped = new AbortController();
  // The pass under way, or the last one.
  private running: Promise<void> = Promise.resolve();
  // The pass asked for once the one under way ends.
  private next: Promise<void> | undefined;

  constructor(private readonly lifecycle = machineLifecycle) {
    if (!lifecycle.collects()) return;
    void repeatUntilStopped(
      this.stopped.signal,
      lifecycle.recheckMs,
      async () => {
        await this.collected();
        return undefined;
      },
    );
  }

  // Collects the recorded landings not yet final, now, or once the pass
  // under way ends; nothing where this server does not collect.
  nudge(): void {
    if (this.ended() || !this.lifecycle.collects()) return;
    void this.collected();
  }

  // A pass that starts once the one under way ends, joined by every ask
  // before it starts.
  private collected(): Promise<void> {
    if (this.next !== undefined) return this.next;
    const next = this.running.then(async () => {
      this.next = undefined;
      if (this.ended()) return;
      try {
        await this.lifecycle.pass(this.stopped.signal);
      } catch {
        // Collected again at the next pass.
      }
    });
    this.next = next;
    this.running = next;
    return next;
  }

  // Whether collection has ended, as it may have during any read.
  private ended(): boolean {
    return this.stopped.signal.aborted;
  }

  // Ends collection and any read it waits on.
  close(): void {
    this.stopped.abort();
  }
}
