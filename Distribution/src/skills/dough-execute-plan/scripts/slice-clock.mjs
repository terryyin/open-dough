// Keeps a slice's active time for the checkout it runs in, so no agent counts
// with its own clock. Active time is the wall time while the slice runs minus
// the time inside commands run through the clock, overlaps excluded once.
// Each command prints one JSON result line.
//
//   start --identity ID --slice KEY   start the slice, or resume it when paused
//   pause                             pause the running slice
//   status [--identity ID --slice KEY]  report a slice; the running one unless named
//   run --log FILE --exit-file FILE -- COMMAND [ARG]...
//       run COMMAND with its time excluded from the running slice, write its
//       output to FILE and, when it ends, its exit status to the exit file;
//       exits with that status
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { closeSync, openSync, writeFileSync } from "node:fs";
import { constants } from "node:os";
import { resolve } from "node:path";
import { flagValues, isDirectCliEntry } from "./ci-direct-entry.mjs";
import {
  currentTime,
  ensureSlice,
  isRunning,
  readRecord,
  recordPath,
  sliceOf,
  sliceReport,
  updateRecord,
  writeWhole,
} from "./slice-clock-record.mjs";

const usage = `Usage: node slice-clock.mjs start --identity ID --slice KEY
       node slice-clock.mjs pause
       node slice-clock.mjs status [--identity ID --slice KEY]
       node slice-clock.mjs run --log FILE --exit-file FILE -- COMMAND [ARG]...`;

class UsageError extends Error {}

const noneRunning = "no slice is running in this checkout";

// The slice the flags name; undefined when they name none.
function namedSlice({ identity, slice }) {
  if (identity === undefined && slice === undefined) return undefined;
  if (identity === undefined || slice === undefined)
    throw new UsageError("name --identity and --slice together");
  return { identity, slice };
}

function flags(argv, allowed) {
  let values;
  try {
    values = flagValues(argv);
  } catch (error) {
    throw new UsageError(error.message);
  }
  for (const key of Object.keys(values))
    if (!allowed.includes(key)) throw new UsageError(`unknown flag for ${key}`);
  return values;
}

function start(file, argv) {
  const named = namedSlice(flags(argv, ["identity", "slice"]));
  if (named === undefined)
    throw new UsageError("start needs --identity and --slice");
  return updateRecord(file, (record) => {
    const now = currentTime();
    const { running } = record;
    const same = isRunning(record, named);
    if (running && !same)
      throw new Error(
        `slice ${running.slice} of ${running.identity} is running in this checkout; pause it first`,
      );
    if (!same) {
      ensureSlice(record, named).periods.push({
        startedAt: now,
        endedAt: null,
      });
      Object.assign(record, { running: named });
    }
    return { command: "start", ...sliceReport(record, named, now) };
  });
}

function pause(file, argv) {
  flags(argv, []);
  return updateRecord(file, (record) => {
    const named = record.running;
    if (!named) throw new Error(noneRunning);
    const now = currentTime();
    sliceOf(record, named).periods.at(-1).endedAt = now;
    Object.assign(record, { running: null });
    return { command: "pause", ...sliceReport(record, named, now) };
  });
}

function status(file, argv) {
  const record = readRecord(file);
  const named =
    namedSlice(flags(argv, ["identity", "slice"])) ?? record.running;
  if (!named) throw new Error(noneRunning);
  if (sliceOf(record, named) === undefined)
    throw new Error(`no record of slice ${named.slice} of ${named.identity}`);
  return { command: "status", ...sliceReport(record, named, currentTime()) };
}

// The command's exit status; a command ended by a signal reports 128 plus
// the signal's number, as a shell does.
function runToEnd(command, args, log) {
  const output = openSync(log, "w");
  return new Promise((done) => {
    const child = spawn(command, args, {
      stdio: ["ignore", output, output],
    });
    child.on("error", (error) => {
      writeFileSync(output, `${error.message}\n`);
      done(127);
    });
    child.on("exit", (code, signal) =>
      done(code ?? 128 + (constants.signals[signal] ?? 0)),
    );
  }).finally(() => closeSync(output));
}

async function run(file, argv) {
  const separator = argv.indexOf("--");
  const [command, ...args] = separator < 0 ? [] : argv.slice(separator + 1);
  const { log, exitFile } = flags(
    separator < 0 ? argv : argv.slice(0, separator),
    ["log", "exitFile"],
  );
  if (command === undefined || log === undefined || exitFile === undefined)
    throw new UsageError("run needs --log, --exit-file and a command after --");
  const id = randomUUID();
  // The slice running when the command starts owns its interval, even when
  // that slice is paused before the command ends.
  const named = updateRecord(file, (record) => {
    if (!record.running) return null;
    sliceOf(record, record.running).commands.push({
      id,
      startedAt: currentTime(),
      endedAt: null,
    });
    return record.running;
  });
  const exitStatus = await runToEnd(command, args, log);
  const report = updateRecord(file, (record) => {
    if (!named) return { slice: null };
    const now = currentTime();
    sliceOf(record, named).commands.find((entry) => entry.id === id).endedAt =
      now;
    return sliceReport(record, named, now);
  });
  // Written last, so whoever waits on it reads a finished run.
  writeWhole(exitFile, `${exitStatus}\n`);
  return {
    command: "run",
    exitStatus,
    log: resolve(log),
    exitFile: resolve(exitFile),
    ...report,
  };
}

const commands = { start, pause, status, run };

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  const [name, ...argv] = process.argv.slice(2);
  try {
    if (!Object.hasOwn(commands, name))
      throw new UsageError(`unknown command ${name ?? ""}`.trim());
    const result = await commands[name](recordPath(process.cwd()), argv);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = result.exitStatus ?? 0;
  } catch (error) {
    const usageError = error instanceof UsageError;
    process.stderr.write(`${error.message}\n${usageError ? `${usage}\n` : ""}`);
    process.exitCode = usageError ? 2 : 1;
  }
}
