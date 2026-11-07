// This machine's host status (../../server/hostStatusObservation.ts): the
// boundary server answers a page's GET with whole-machine CPU usage and the
// bytes free on the dashboard home's volume from a real sample, and refuses
// other sites and methods; the CPU figure averages the counters across the
// trailing minute of snapshots, or the span sampled so far; each figure
// reads unavailable on its own; and concurrent demand shares one sample,
// after which nothing is sampled until the next demand.

import { expect, test } from "../../tests/support/pageTest.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { hostStatusEndpoint } from "../../src/hostStatus.ts";
import {
  HostStatusObservation,
  type CpuSnapshot,
  type HostStatusReaders,
} from "../../server/hostStatusObservation.ts";

const open = () => new AbortController().signal;

// Readers whose CPU snapshots come from `snapshots` in order, whose free
// disk is `freeBytes`, and which count each sample's disk read.
function scripted(
  snapshots: (CpuSnapshot | undefined)[],
  overrides: Partial<HostStatusReaders> = {},
) {
  let samples = 0;
  const readers: HostStatusReaders = {
    cpuSnapshot: () => snapshots.shift(),
    freeBytes: () => {
      samples += 1;
      return Promise.resolve(12_000_000_000);
    },
    prime: () => Promise.resolve(),
    reuseMs: () => 0,
    ...overrides,
  };
  return { readers, samples: () => samples };
}

const at = (seconds: number, busy: number, total: number): CpuSnapshot => ({
  at: seconds * 1000,
  busy,
  total,
});

test.describe("the host status endpoint", () => {
  let server: DashboardServer;
  test.beforeAll(async () => {
    server = await startDashboardServer({ mode: "boundary" });
  });
  test.afterAll(() => server.close());

  test("answers this page's GET with CPU percent and free bytes from a real sample, and refuses other sites and methods", async () => {
    const endpoint = `${server.baseURL}${hostStatusEndpoint}`;
    const answered = await rawRequest({
      url: endpoint,
      headers: { Origin: server.origin },
    });
    expect(answered.status).toBe(200);
    expect(answered.headers["cache-control"]).toBe("no-store");
    const { cpuPercent, freeBytes } = JSON.parse(answered.body) as {
      cpuPercent: unknown;
      freeBytes: unknown;
    };
    expect(typeof cpuPercent).toBe("number");
    expect(cpuPercent).toBeGreaterThanOrEqual(0);
    expect(cpuPercent).toBeLessThanOrEqual(100);
    expect(typeof freeBytes).toBe("number");
    expect(freeBytes).toBeGreaterThan(0);
    for (const refused of [
      { Origin: "http://other.example" },
      { Origin: server.origin, Host: "other.example" },
    ])
      expect(
        (await rawRequest({ url: endpoint, headers: refused })).status,
      ).toBe(403);
    expect(
      (
        await rawRequest({
          url: endpoint,
          method: "POST",
          headers: { Origin: server.origin },
        })
      ).status,
    ).toBe(405);
  });
});

test("CPU usage averages the trailing minute of counter snapshots, or the span sampled so far", async () => {
  const { readers } = scripted([
    // A first sample primes a second snapshot: that one span is its answer.
    at(0, 0, 0),
    at(0.25, 50, 100),
    // Idle intervals at the steady pace.
    at(15, 50, 1100),
    at(30, 50, 2100),
    at(45, 50, 3100),
    // One wholly busy interval: alone it would read 100%.
    at(60, 1050, 4100),
    // The first two snapshots have left the window.
    at(75, 1050, 5100),
    // After sampling stopped for longer than the window: primed afresh.
    at(500, 9000, 9000),
    at(500.25, 9010, 9100),
  ]);
  const observation = new HostStatusObservation(readers);
  const percents: (number | null)[] = [];
  for (let sample = 0; sample < 7; sample += 1)
    percents.push((await observation.observed(open())).cpuPercent);
  expect(percents.map((percent) => percent?.toFixed(1) ?? null)).toEqual([
    // The span sampled so far: 50 busy of 100.
    "50.0",
    "4.5",
    "2.4",
    "1.6",
    // The whole window from the first snapshot, not the busy interval alone.
    ((100 * 1050) / 4100).toFixed(1),
    // From the oldest snapshot still within the window (15 s).
    "25.0",
    // Nothing retained from before the gap: the primed span alone.
    "10.0",
  ]);
});

test("each figure reads unavailable on its own: free disk when its volume cannot be read, CPU when its counters cannot", async () => {
  const diskless = new HostStatusObservation(
    scripted([at(0, 0, 0), at(0.25, 25, 100)], {
      freeBytes: () => Promise.reject(new Error("ENOENT: statfs failed")),
    }).readers,
  );
  expect(await diskless.observed(open())).toEqual({
    cpuPercent: 25,
    freeBytes: null,
  });
  const cpuless = new HostStatusObservation(
    scripted([undefined, at(15, 0, 0), at(15.25, 0, 0)]).readers,
  );
  expect(await cpuless.observed(open())).toEqual({
    cpuPercent: null,
    freeBytes: 12_000_000_000,
  });
  // Counters that did not advance give no share to report either.
  expect(await cpuless.observed(open())).toEqual({
    cpuPercent: null,
    freeBytes: 12_000_000_000,
  });
});

test("concurrent demand shares one sample while it serves, and nothing is sampled until the next demand", async () => {
  const snapshots = [0, 1, 2, 3].map((index) => at(index, index, index * 10));
  const { readers, samples } = scripted(snapshots, { reuseMs: () => 100 });
  const observation = new HostStatusObservation(readers);
  const [first, second] = await Promise.all([
    observation.observed(open()),
    observation.observed(open()),
  ]);
  expect(second).toEqual(first);
  expect(samples()).toBe(1);
  // Within the reuse window a later demand is answered by the same sample.
  expect(await observation.observed(open())).toEqual(first);
  expect(samples()).toBe(1);
  // With no demand, no sample runs, though the reuse window has passed.
  await new Promise((resolve) => setTimeout(resolve, 300));
  expect(samples()).toBe(1);
  await observation.observed(open());
  expect(samples()).toBe(2);
});
