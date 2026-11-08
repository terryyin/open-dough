import { existsSync, readFileSync, readdirSync, watch } from "node:fs";
import path from "node:path";
import { repository } from "./local-test-suite-fixtures.mjs";

// How many controlled checks have marked their start in `observation`.
export function startedChecks(observation) {
  return readdirSync(observation).filter((entry) => entry.startsWith("start-"))
    .length;
}

// Runs the repository suite like `repository`, and also resolves `gate` with
// the number of jobs the runner had started when it first found every job
// slot occupied with a check still queued. Its own observation file is this
// invocation's alone; nested runs never inherit it. `gate` rejects when the
// run ends first or when more than `limit` checks have marked their start.
export function repositoryAtSlotGate(t, project, observation, limit, env = {}) {
  const marker = path.join(observation, "slot-gate");
  const run = repository(t, project, observation, {
    ...env,
    OPEN_DOUGH_TEST_SLOT_GATE: marker,
  });
  const watcher = watch(observation);
  const gate = new Promise((resolve, reject) => {
    const inspect = () => {
      try {
        const starts = startedChecks(observation);
        if (starts > limit)
          reject(new Error(`${starts} checks started before the slot gate`));
        else if (existsSync(marker))
          resolve(Number(readFileSync(marker, "utf8")));
      } catch (error) {
        reject(error);
      }
    };
    watcher.on("change", inspect);
    watcher.on("error", reject);
    // The run's own teardown ends it, which settles `gate` and closes the
    // watcher even when the test stops early.
    run.result.then(
      (result) =>
        reject(new Error(`Run ended before the slot gate: ${result.output}`)),
      reject,
    );
    inspect();
  }).finally(() => watcher.close());
  gate.catch(() => {});
  return { ...run, gate };
}
