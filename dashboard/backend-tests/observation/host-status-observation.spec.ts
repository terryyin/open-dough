import { expect, onTestFinished, test, vi } from "vitest";
import {
  HostStatusObservation,
  type CpuSnapshot,
  type HostStatusReaders,
} from "../../server/hostStatusObservation.ts";

const open = () => new AbortController().signal;
const freeBytes = 12_000_000_000;

function scripted(
  snapshots: (CpuSnapshot | undefined)[],
  overrides: Partial<HostStatusReaders> = {},
) {
  let samples = 0;
  const readers: HostStatusReaders = {
    cpuSnapshot: () => snapshots.shift(),
    freeBytes: () => {
      samples += 1;
      return Promise.resolve(freeBytes);
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

test("CPU usage averages the trailing minute of counter snapshots, or the span sampled so far", async () => {
  const { readers } = scripted([
    at(0, 0, 0),
    at(0.25, 50, 100),
    at(15, 50, 1100),
    at(30, 50, 2100),
    at(45, 50, 3100),
    // One wholly busy interval before the earliest snapshots leave the window.
    at(60, 1050, 4100),
    at(75, 1050, 5100),
    // The gap requires the next demand to prime a new window.
    at(500, 9000, 9000),
    at(500.25, 9010, 9100),
  ]);
  const observation = new HostStatusObservation(readers);
  const percents: (number | null)[] = [];
  for (let sample = 0; sample < 7; sample += 1)
    percents.push((await observation.observed(open())).cpuPercent);

  expect(percents.map((percent) => percent?.toFixed(1) ?? null)).toEqual([
    "50.0",
    "4.5",
    "2.4",
    "1.6",
    "25.6",
    "25.0",
    "10.0",
  ]);
});

test("each figure reads unavailable on its own when the disk or CPU counters cannot be read", async () => {
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
    freeBytes,
  });
  // Counters that did not advance give no share to report either.
  expect(await cpuless.observed(open())).toEqual({
    cpuPercent: null,
    freeBytes,
  });
});

test("concurrent demand shares one sample while it serves, and nothing is sampled until the next demand", async () => {
  vi.useFakeTimers({
    toFake: [
      "Date",
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
    ],
  });
  onTestFinished(() => {
    vi.useRealTimers();
  });

  let reuseMs = 30;
  const snapshots = [0, 1, 2, 3].map((index) => at(index, index, index * 10));
  const { readers, samples } = scripted(snapshots, { reuseMs: () => reuseMs });
  const observation = new HostStatusObservation(readers);
  const [first, second] = await Promise.all([
    observation.observed(open()),
    observation.observed(open()),
  ]);
  expect(second).toEqual(first);
  expect(samples()).toBe(1);

  await vi.advanceTimersByTimeAsync(10);
  expect(await observation.observed(open())).toEqual(first);
  expect(samples()).toBe(1);

  await vi.advanceTimersByTimeAsync(21);
  expect(samples()).toBe(1);
  await observation.observed(open());
  expect(samples()).toBe(2);

  reuseMs = 1;
  await vi.advanceTimersByTimeAsync(2);
  await observation.observed(open());
  expect(samples()).toBe(3);
});
