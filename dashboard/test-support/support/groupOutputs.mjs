import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { formatTimes } from "../../../scripts/spec-times-format.mjs";
import { combineGroupProof } from "./groupProof.mjs";

function writeTimes(destination, nativeTimes, tests, dashboard, engine) {
  const times = new Map();
  if (existsSync(nativeTimes))
    for (const line of readFileSync(nativeTimes, "utf8").trim().split("\n")) {
      const [seconds, label] = line.split("\t");
      if (label) times.set(label, Number(seconds));
    }
  for (const test of tests) {
    if (test.project !== engine || test.attempts.length === 0) continue;
    const label = path
      .relative(dashboard, test.location.file)
      .split(path.sep)
      .join("/");
    const seconds = test.attempts.reduce(
      (total, attempt) => total + attempt.durationMs / 1000,
      0,
    );
    times.set(label, (times.get(label) ?? 0) + seconds);
  }
  writeFileSync(
    destination,
    formatTimes(times)
      .map((line) => `${line}\n`)
      .join(""),
  );
}

export function finishGroupRun({
  native,
  vitestRun,
  engine,
  run,
  nativeTimes,
  optionalReporter,
  destination,
  times,
  proofSetting,
}) {
  const finishedAt = new Date().toISOString();
  if (native?.record) run.outputDirs.push(...native.record.run.outputDirs);
  if (optionalReporter && !destination && !times && native && !native.record) {
    return (
      native.status ||
      (vitestRun
        ? combineGroupProof({ vitestRun, engine, run, finishedAt }).status
        : 0)
    );
  }
  const nativeWasListed = run.listing && native?.record?.phase === "listed";
  const result = combineGroupProof({
    playwright: nativeWasListed
      ? { ...native, record: { ...native.record, phase: "completed" } }
      : native,
    vitestRun,
    engine,
    run,
    finishedAt,
  });
  const { record } = result;
  if (run.listing && record.phase === "completed") {
    record.phase = "listed";
    delete record.terminal;
    for (const test of record.tests)
      for (const execution of test.executions) delete execution.outcome;
  }
  if (destination) {
    if (!path.isAbsolute(destination))
      throw new Error(`${proofSetting} needs an absolute unused file path.`);
    writeFileSync(destination, `${JSON.stringify(record)}\n`, { flag: "wx" });
  }
  if (times && !run.listing)
    writeTimes(times, nativeTimes, record.tests, run.rootDir, engine);
  for (const message of result.diagnostics) console.error(message);
  return result.status;
}
