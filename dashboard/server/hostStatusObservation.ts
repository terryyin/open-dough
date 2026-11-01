// This machine's host status, sampled on demand for every viewer through one
// shared observation (`./sharedObservation.ts`): while a settled sample is
// within its reuse window (a little under the page's check interval), every
// page's read is answered by it, so pages polling at that pace share about
// one sample per interval; no timer samples on its own, so sampling stops
// when no page asks.
//
// CPU is whole-machine utilization from `os.cpus()` time counters: the busy
// share of all counted time between the oldest counter snapshot retained
// within the trailing window (about a minute) and the newest one. The
// snapshots live in memory only. A snapshot older than the window is
// dropped, so after sampling stops for longer than the window, the next
// sample starts afresh: with no snapshot retained it takes one, waits a
// short priming interval and takes another, answering for that span; until
// the window fills, it answers for the span sampled so far.
//
// Free disk is what `fs.statfs` reports available to this user on the volume
// of this machine's dashboard home (`./machineHome.ts`), read through its
// nearest existing folder while the home does not exist yet. No subprocess is
// spawned. A figure that cannot be read is `null`; each fails on its own.

import { statfs } from "node:fs/promises";
import { cpus } from "node:os";
import path from "node:path";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import type { HostStatus } from "../src/hostStatus.ts";
import { machineDashboardDirectory } from "./machineHome.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { SharedObservation } from "./sharedObservation.ts";

// One reading of the machine's CPU time counters, summed over every core.
export type CpuSnapshot = {
  readonly at: number;
  readonly busy: number;
  readonly total: number;
};

export type HostStatusReaders = {
  // The counters now, or undefined when they cannot be read.
  readonly cpuSnapshot: () => CpuSnapshot | undefined;
  // The bytes free on the dashboard home's volume; rejects when unreadable.
  readonly freeBytes: () => Promise<number>;
  // Waits out the priming interval before a second snapshot.
  readonly prime: () => Promise<void>;
  // How long a settled sample serves later reads.
  readonly reuseMs: () => number;
};

// The trailing span the CPU figure averages over.
const cpuWindowMs = 60_000;
// How long a first sample waits between its two snapshots.
const primingMs = 250;
// How long a waiter waits for the sample before it is told to ask again.
const waitMs = 5_000;

function machineCpuSnapshot(): CpuSnapshot | undefined {
  const cores = cpus();
  if (cores.length === 0) return undefined;
  let busy = 0;
  let total = 0;
  for (const { times } of cores) {
    const coreBusy = times.user + times.nice + times.sys + times.irq;
    busy += coreBusy;
    total += coreBusy + times.idle;
  }
  return { at: Date.now(), busy, total };
}

// Available bytes on the volume holding the dashboard home, through its
// nearest existing folder.
async function dashboardHomeFreeBytes(): Promise<number> {
  let folder = machineDashboardDirectory();
  for (;;) {
    try {
      const { bavail, bsize } = await statfs(folder);
      return bavail * bsize;
    } catch (error) {
      const parent = path.dirname(folder);
      if (
        (error as NodeJS.ErrnoException).code !== "ENOENT" ||
        parent === folder
      )
        throw error;
      folder = parent;
    }
  }
}

const machineReaders: HostStatusReaders = {
  cpuSnapshot: machineCpuSnapshot,
  freeBytes: dashboardHomeFreeBytes,
  prime: () =>
    new Promise((resolve) => {
      setTimeout(resolve, primingMs);
    }),
  reuseMs: () => checkIntervalMs - 1_000,
};

const unanswered = `The host status was not sampled within ${String(waitMs / 1000)} seconds. Ask again.`;

export class HostStatusObservation {
  private readonly shared: SharedObservation<HostStatus>;
  // Counter snapshots within the trailing window, oldest first.
  private snapshots: CpuSnapshot[] = [];

  constructor(private readonly readers: HostStatusReaders = machineReaders) {
    this.shared = new SharedObservation(() => this.sample(), readers.reuseMs);
  }

  // The shared sample, or a retryable refusal past the wait. A waiter whose
  // `signal` ends is refused too; nobody hears that answer.
  async observed(signal: AbortSignal): Promise<HostStatus> {
    const demanded = await this.shared.demand([], waitMs, signal);
    if (demanded.kind === "observed") return demanded.value;
    throw new RefusedRequest(503, unanswered);
  }

  private async sample(): Promise<HostStatus> {
    const [cpuPercent, freeBytes] = await Promise.all([
      this.cpuPercent(),
      this.readers.freeBytes().then(
        (bytes) => (Number.isFinite(bytes) && bytes >= 0 ? bytes : null),
        () => null,
      ),
    ]);
    return { cpuPercent, freeBytes };
  }

  private async cpuPercent(): Promise<number | null> {
    const newest = this.snapshot();
    if (newest === undefined) return null;
    this.snapshots = this.snapshots.filter(
      (kept) => newest.at - kept.at <= cpuWindowMs,
    );
    this.snapshots.push(newest);
    if (this.snapshots.length === 1) {
      await this.readers.prime();
      const primed = this.snapshot();
      if (primed === undefined) return null;
      this.snapshots.push(primed);
    }
    const oldest = this.snapshots[0];
    const latest = this.snapshots.at(-1);
    if (oldest === undefined || latest === undefined) return null;
    const total = latest.total - oldest.total;
    const busy = latest.busy - oldest.busy;
    if (!(total > 0) || busy < 0) return null;
    return Math.min(100, (100 * busy) / total);
  }

  // A counter snapshot; an unreadable one forgets the window, since counters
  // across the gap cannot be trusted to compare.
  private snapshot(): CpuSnapshot | undefined {
    let read: CpuSnapshot | undefined;
    try {
      read = this.readers.cpuSnapshot();
    } catch {
      read = undefined;
    }
    if (read === undefined) this.snapshots = [];
    return read;
  }
}
