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
// For each configured project it walks the landings onto its configured ref,
// newest first, until the history holds `measuredWindow` measured builds for
// it (`./landedCiMeasuredBuilds.ts`), and resolves each landing whose
// resolution is not final yet over the project's CI read for the pass
// (`./landedCiResolution.ts`, `./landedCiCollectionLanding.ts`). A final
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
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { configuredLimit } from "./configuredLimit.ts";

import { keptLandedCiHistory } from "./landedCiHistoryStore.ts";
import { collectLandedCiPass } from "./landedCiPass.ts";
import { readLandedProof } from "./landedCiCollectedProof.ts";

import { landedCiReadSignal, passRead } from "./landedCiPassRead.ts";
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

export class LandedCiCollection {
  private readonly stopped = new AbortController();
  // The pass under way, or the last one.
  private running: Promise<void> = Promise.resolve();
  // The pass asked for once the one under way ends.
  private next: Promise<void> | undefined;

  constructor() {
    if (!collects()) return;
    void repeatUntilStopped(this.stopped.signal, recheckMs, async () => {
      await this.collected();
      return undefined;
    });
  }

  // Collects the recorded landings not yet final, now, or once the pass
  // under way ends; nothing where this server does not collect.
  nudge(): void {
    if (this.ended() || !collects()) return;
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
        await this.pass();
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

  private async pass(): Promise<void> {
    const records = await readableRecordsByProject();
    if (records === undefined) return;
    for (const source of publishedProjects()) {
      if (this.ended()) return;
      await this.collect(source, records.get(source.id) ?? []);
    }
  }

  private async collect(
    source: PublishedSource,
    records: readonly LaunchRecord[],
  ): Promise<void> {
    const history = await keptLandedCiHistory(source.id);
    const repository = executionCheckout(source).path;
    await collectLandedCiPass({
      source,
      history,
      receipts: records.flatMap(({ landing }) =>
        landing === undefined ? [] : [landing],
      ),
      repository,
      stopped: this.stopped.signal,
      read: passRead(source, repository, this.stopped.signal),
      readProof: readLandedProof,
    });
    if (!this.ended())
      await collectCiFollowUps(
        source,
        await keptLandedCiHistory(source.id),
        landedCiReadSignal(this.stopped.signal),
      );
  }

  // Ends collection and any read it waits on.
  close(): void {
    this.stopped.abort();
  }
}
