import { existsSync, readFileSync, readdirSync, watch } from "node:fs";
import path from "node:path";
import { repository } from "./local-test-suite-fixtures.mjs";

// How many controlled checks have marked their start in `observation`.
export function startedChecks(observation) {
  return readdirSync(observation).filter((entry) => entry.startsWith("start-"))
    .length;
}

// Runs the repository suite like `repository`, giving `gate.variable` this
// invocation's own marker file in `observation`; nested runs never inherit
// it. Each `atGate` observation resolves with matching marker content, read
// by `gate.read`, once the runner writes it whole at that gate. It rejects
// when the run ends first or when more than `gate.limit` checks have marked
// their start.
function repositoryAtGate(t, project, observation, gate, env) {
  const marker = path.join(observation, gate.name.replace(" ", "-"));
  const run = repository(t, project, observation, {
    ...env,
    [gate.variable]: marker,
  });
  const atGate = (matches = () => true) => {
    const watcher = watch(observation);
    const reached = new Promise((resolve, reject) => {
      const inspect = () => {
        try {
          const starts = startedChecks(observation);
          if (starts > gate.limit)
            reject(
              new Error(`${starts} checks started before the ${gate.name}`),
            );
          else if (existsSync(marker)) {
            const value = gate.read(readFileSync(marker, "utf8"));
            if (matches(value)) resolve(value);
          }
        } catch (error) {
          reject(error);
        }
      };
      watcher.on("change", inspect);
      watcher.on("error", reject);
      // The run's own teardown ends it, settling every pending observation
      // and closing its watcher even when the test stops early.
      run.result.then(
        (result) =>
          reject(
            new Error(`Run ended before the ${gate.name}: ${result.output}`),
          ),
        reject,
      );
      inspect();
    }).finally(() => watcher.close());
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
