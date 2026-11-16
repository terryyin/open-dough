// The slice clock's record: local execution state of one checkout, kept in
// its Git directory so every process in that worktree reads the same record
// and nothing of it is committed.
//
// {
//   schemaVersion: 1,
//   running: { identity, slice } | null,   one slice runs at a time
//   stories: {
//     [identity]: {
//       slices: {
//         [slice]: {
//           periods:  [{ startedAt, endedAt | null }],      started .. paused
//           commands: [{ id, startedAt, endedAt | null }],  run through the clock
//         },
//       },
//     },
//   },
// }
//
// Times are epoch milliseconds. An open period or command lasts until now.
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

export const sliceLimitMinutes = 15;
export const timeFileSetting = "DOUGH_SLICE_CLOCK_TIME_FILE";

const minuteMs = 60_000;
const lockRetryMs = 10;
const lockStaleMs = 10_000;

// The clock's current time. The setting names a file holding an ISO time,
// read at every observation, so a spec moves time between and during clock
// commands without waiting.
export function currentTime(env = process.env) {
  const file = env[timeFileSetting];
  if (file === undefined) return Date.now();
  const supplied = readFileSync(file, "utf8").trim();
  const time = Date.parse(supplied);
  if (Number.isNaN(time))
    throw new Error(`${timeFileSetting} must hold an ISO time: ${supplied}`);
  return time;
}

// The record file of the worktree `checkout` is in.
export function recordPath(checkout) {
  const found = execFileSync(
    "git",
    ["rev-parse", "--git-path", "open-dough/slice-clock"],
    { cwd: checkout, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return resolve(checkout, found.trim());
}

function emptyRecord() {
  return { schemaVersion: 1, running: null, stories: {} };
}

export function readRecord(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return emptyRecord();
    throw error;
  }
}

function wait(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// Holds the record's lock directory; a lock left by a dead process is taken
// over once it is stale.
function locked(file, work) {
  const lock = `${file}.lock`;
  mkdirSync(dirname(file), { recursive: true });
  for (;;) {
    try {
      mkdirSync(lock);
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      try {
        if (Date.now() - statSync(lock).mtimeMs > lockStaleMs) rmdirSync(lock);
      } catch {
        // Released meanwhile; try again.
      }
      wait(lockRetryMs);
    }
  }
  try {
    return work();
  } finally {
    rmdirSync(lock);
  }
}

// Writes `file` whole, so a reader never sees it partly written.
export function writeWhole(file, text) {
  const draft = `${file}.${process.pid}.tmp`;
  writeFileSync(draft, text);
  renameSync(draft, file);
}

// Applies `change` to the record while no other clock process changes it,
// and returns what `change` returns.
export function updateRecord(file, change) {
  return locked(file, () => {
    const record = readRecord(file);
    const result = change(record);
    writeWhole(file, `${JSON.stringify(record)}\n`);
    return result;
  });
}

// Whether the slice is the one running in the checkout.
export function isRunning(record, { identity, slice }) {
  return (
    record.running?.identity === identity && record.running.slice === slice
  );
}

// The slice's entry, or undefined when the record has none.
export function sliceOf(record, { identity, slice }) {
  return record.stories[identity]?.slices[slice];
}

// The slice's entry, added when the record has none.
export function ensureSlice(record, { identity, slice }) {
  const { stories } = record;
  stories[identity] ??= { slices: {} };
  const { slices } = stories[identity];
  slices[slice] ??= { periods: [], commands: [] };
  return slices[slice];
}

// Intervals closed at `now`, sorted and merged so overlaps count once.
function union(intervals, now) {
  const merged = [];
  const closed = intervals
    .map(({ startedAt, endedAt }) => [startedAt, endedAt ?? now])
    .sort((a, b) => a[0] - b[0]);
  for (const [start, end] of closed) {
    const last = merged.at(-1);
    if (last !== undefined && start <= last[1])
      last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

// Active time: the wall time of the slice's periods minus the union of its
// command intervals inside them.
export function elapsedMs(entry, now) {
  const commands = union(entry.commands, now);
  let total = 0;
  for (const [start, end] of union(entry.periods, now)) {
    total += end - start;
    for (const [from, to] of commands)
      total -= Math.max(0, Math.min(end, to) - Math.max(start, from));
  }
  return total;
}

// What every clock command reports about one slice.
export function sliceReport(record, named, now) {
  const elapsed = elapsedMs(sliceOf(record, named), now);
  const minutes = (ms) => Math.round((ms / minuteMs) * 10) / 10;
  return {
    identity: named.identity,
    slice: named.slice,
    state: isRunning(record, named) ? "running" : "paused",
    elapsedMinutes: minutes(elapsed),
    remainingMinutes: minutes(
      Math.max(0, sliceLimitMinutes * minuteMs - elapsed),
    ),
    limitMinutes: sliceLimitMinutes,
  };
}
