import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { repository, until } from "./local-test-suite-fixtures.mjs";

// How many controlled checks have marked their start in `observation`.
export function startedChecks(observation) {
  return readdirSync(observation).filter((entry) => entry.startsWith("start-"))
    .length;
}

// Runs the repository suite like `repository`, giving `gate.variable` this
// invocation's own marker file in `observation`; nested runs never inherit
// it. Each `atGate` observation resolves with matching marker content, read
// by `gate.read`, once the runner has written it whole at that gate. It
// rejects when the run ends first, when more than `gate.limit` checks have
// marked their start, or when `until` times out. It checks the files
// themselves, not a directory watcher's events: on macOS a process's
// watchers share one FSEvents stream that starts after `watch` returns and
// restarts whenever a watcher opens or closes, so a write in between raises
// no event.
function repositoryAtGate(t, project, observation, gate, env) {
  const marker = path.join(observation, gate.name.replace(" ", "-"));
  const run = repository(t, project, observation, {
    ...env,
    [gate.variable]: marker,
  });
  // The run's own teardown ends it, settling every pending observation even
  // when the test stops early.
  let ended;
  run.result.then(
    (result) => {
      ended = new Error(`Run ended before the ${gate.name}: ${result.output}`);
    },
    (error) => {
      ended = error;
    },
  );
  const atGate = (matches = () => true) => {
    let value;
    const reached = until(`${gate.name} in ${observation}`, () => {
      // Taken before the files are read: a run that had already ended wrote
      // its last marker before this check.
      const endedBefore = ended;
      const starts = startedChecks(observation);
      if (starts > gate.limit)
        throw new Error(`${starts} checks started before the ${gate.name}`);
      if (existsSync(marker)) {
        value = gate.read(readFileSync(marker, "utf8"));
        if (matches(value)) return true;
      }
      if (endedBefore) throw endedBefore;
      return false;
    }).then(() => value);
    reached.catch(() => {});
    return reached;
  };
  return { run, atGate };
}

// `gate` resolves with the number of jobs the runner had started when it
// first found every job slot occupied with a check still queued.
export function repositoryAtSlotGate(t, project, observation, limit, env = {}) {
  const { run, atGate } = repositoryAtGate(
    t,
    project,
    observation,
    {
      name: "slot gate",
      variable: "OPEN_DOUGH_TEST_SLOT_GATE",
      limit,
      read: Number,
    },
    env,
  );
  return { ...run, gate: atGate() };
}

// `gate` resolves with the admission record id of the live owner that blocks
// this full suite once it has found that owner outside its ancestry. No check
// may start before then. `blockedBy(expectedOid)` waits for that exact owner
// record with the same zero-start and early-exit requirements, even after
// an earlier owner has been observed.
export function repositoryAtAdmissionGate(t, project, observation, env = {}) {
  const { run, atGate } = repositoryAtGate(
    t,
    project,
    observation,
    {
      name: "admission gate",
      variable: "OPEN_DOUGH_TEST_ADMISSION_GATE",
      limit: 0,
      read: String,
    },
    env,
  );
  return {
    ...run,
    gate: atGate(),
    blockedBy: (expectedOid) => atGate((owner) => owner === expectedOid),
  };
}
