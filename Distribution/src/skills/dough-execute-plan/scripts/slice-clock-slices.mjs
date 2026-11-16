// The slices of a slice clock record: their entries, their active time and
// their overruns. `slice-clock-record.mjs` describes the record and stores it.
export const sliceLimitMinutes = 15;

const minuteMs = 60_000;

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

// Moves the entry of slice `from` to `named`, so a renumbered slice keeps its
// elapsed time and its overrun.
export function continueSlice(record, { identity, slice }, from) {
  const slices = record.stories[identity]?.slices ?? {};
  if (slices[from] === undefined)
    throw new Error(`no record of slice ${from} of ${identity} to continue`);
  if (from === slice) return;
  if (slices[slice] !== undefined)
    throw new Error(`slice ${slice} of ${identity} already has a record`);
  slices[slice] = slices[from];
  delete slices[from];
}

// Drops the entry of slice `from` when it has overrun, so a slice split from
// it can reuse its key from zero. The story keeps the overrun.
export function dropOverrunSlice(record, identity, from) {
  const slices = record.stories[identity]?.slices ?? {};
  if (slices[from]?.overrunDetectedAt !== undefined) delete slices[from];
}

// Ends the previous session at its last clock command, without observing a
// new overrun. Legacy records have only period and command timestamps.
export function settleEndedSession(record) {
  if (!record.running) return;
  const timestamps = Object.values(record.stories).flatMap(({ slices }) =>
    Object.values(slices).flatMap(({ periods, commands }) =>
      [...periods, ...commands].flatMap(({ startedAt, endedAt }) =>
        endedAt === null ? [startedAt] : [startedAt, endedAt],
      ),
    ),
  );
  const endedAt = record.lastClockCommandAt ?? Math.max(...timestamps);
  const entry = sliceOf(record, record.running);
  for (const interval of [...entry.periods, ...entry.commands])
    interval.endedAt ??= endedAt;
  Object.assign(record, { running: null });
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

// Whether `elapsed` active time is at or past the limit.
function reachesLimit(elapsed) {
  return elapsed >= sliceLimitMinutes * minuteMs;
}

// Whether the slice running in the checkout is at or past the limit. It
// changes nothing, so a reader can ask before it takes the record to report.
export function runningSliceReachedLimit(record, now) {
  if (!record.running) return false;
  const entry = sliceOf(record, record.running);
  return entry !== undefined && reachesLimit(elapsedMs(entry, now));
}

// Counts the slice's overrun in its story the first time it is seen at or
// past the limit, and returns whether the slice has overrun.
function overrunSeen(record, named, elapsed, now) {
  const story = record.stories[named.identity];
  const entry = story.slices[named.slice];
  if (entry.overrunDetectedAt !== undefined) return true;
  if (!reachesLimit(elapsed)) return false;
  entry.overrunDetectedAt = now;
  story.overruns = [
    ...(story.overruns ?? []),
    { slice: named.slice, detectedAt: now },
  ];
  return true;
}

// What every clock command reports about one slice. Seeing the slice at the
// limit records its overrun, so report inside `updateRecord`.
export function sliceReport(record, named, now) {
  const elapsed = elapsedMs(sliceOf(record, named), now);
  const minutes = (ms) => Math.round((ms / minuteMs) * 10) / 10;
  const overrun = overrunSeen(record, named, elapsed, now);
  const report = {
    identity: named.identity,
    slice: named.slice,
    state: isRunning(record, named) ? "running" : "paused",
    elapsedMinutes: minutes(elapsed),
    remainingMinutes: minutes(
      Math.max(0, sliceLimitMinutes * minuteMs - elapsed),
    ),
    limitMinutes: sliceLimitMinutes,
    overrun,
    storyOverruns: record.stories[named.identity].overruns?.length ?? 0,
  };
  if (!overrun) return report;
  return {
    ...report,
    message: `slice ${named.slice} of ${named.identity} reached the ${sliceLimitMinutes}-minute limit: ${report.elapsedMinutes} active minutes`,
  };
}

// The slice's overrun message for `agent`, once per overrun: undefined while
// the slice is under the limit and after the agent has been told. Seeing the
// slice at the limit records its overrun, as `sliceReport` does.
export function overrunMessageFor(record, named, agent, now) {
  const report = sliceReport(record, named, now);
  const entry = sliceOf(record, named);
  const told = entry.overrunReportedTo ?? [];
  if (!report.overrun || told.includes(agent)) return undefined;
  entry.overrunReportedTo = [...told, agent];
  return report.message;
}
