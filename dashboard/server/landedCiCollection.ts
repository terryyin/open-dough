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
// (`./landedCiResolution.ts`). A final resolution is kept and never resolved
// again; a pending one is kept until a later pass resolves it again. The
// history keeps only that window, so a landing the walk no longer reaches is
// neither kept nor asked about again. CI that could not be read leaves that
// project until the next pass; a landing whose stand-in build's CI proof
// read GitHub left unanswered waits for that proof alone, and the walk goes
// on to the landings past it.
//
// Only a production project environment collects, as only it launches
// feedback maintenance, so a development server sharing this machine's
// records asks CI nothing; every server reads the history. A test server
// collects nothing either unless its test asks: its harness sets
// `DOUGH_TEST_LANDED_CI_COLLECTION=off`.

import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { configuredLimit } from "./configuredLimit.ts";
import {
  keepLandedCiResolution,
  keptLandedCiHistory,
  keptLandingReferences,
  type LandingReference,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import {
  measuredBuildOf,
  measuredWindow,
  newestFirst,
} from "./landedCiMeasuredBuilds.ts";
import { landingResolution, passRead } from "./landedCiResolution.ts";
import { readableRecordsByProject } from "./launchRecordStore.ts";
import {
  projectEnvironment,
  publishedProjects,
} from "./projectConfiguration.ts";
import { repeatUntilStopped } from "./repeatingCheck.ts";

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

// The landings onto the project's configured ref that its records name, with
// those the history keeps, each once by receipt, newest first.
function trunkLandings(
  source: PublishedSource,
  records: readonly LaunchRecord[],
  history: ProjectHistory,
): LandingReference[] {
  const target = `refs/heads/${source.ref}`;
  const byReceipt = new Map<string, LandingReference>();
  for (const landing of keptLandingReferences(history))
    byReceipt.set(landing.receipt, landing);
  for (const { landing } of records)
    if (landing?.target === target) byReceipt.set(landing.receipt, landing);
  return [...byReceipt.values()].sort(newestFirst);
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
    let history = await keptLandedCiHistory(source.id);
    const landings = trunkLandings(source, records, history);
    const read = passRead(source, this.stopped.signal);
    const measured = new Set<string>();
    for (const landing of landings) {
      if (this.ended() || measured.size >= measuredWindow) return;
      const held = history.landings[landing.receipt]?.observed;
      if (held === undefined || held.kind === "pending") {
        const resolved = await landingResolution(source, landing, read);
        // A read the end of collection cut short says nothing of its CI.
        if (this.ended()) return;
        history = await keepLandedCiResolution(source.id, landing, resolved);
        // CI that cannot be read now is asked again at the next pass; a CI
        // proof that cannot be read is this landing's alone.
        if (resolved.kind === "pending" && resolved.waitsFor === "read") return;
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
