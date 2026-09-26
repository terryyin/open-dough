import { rmSync } from "node:fs";

// A test stops or releases what it started before removing the fixture those
// things run from. Register `cleanup` with `t.after` when the fixture is
// created and each stop or release step with `defer` once its process starts:
// the steps run in reverse order of registration, then every fixture root is
// removed. A failing step fails the test after the remaining steps and
// removal ran.
export function fixtureTeardown(...roots) {
  const steps = [];
  return {
    defer(step) {
      steps.push(step);
    },
    async cleanup() {
      const errors = [];
      for (const step of steps.splice(0).reverse()) {
        try {
          await step();
        } catch (error) {
          errors.push(error);
        }
      }
      for (const root of roots) rmSync(root, { recursive: true, force: true });
      if (errors.length === 1) throw errors[0];
      if (errors.length)
        throw new AggregateError(errors, "Fixture teardown steps failed");
    },
  };
}

// Registers, on a `fixtureTeardown`, stopping an in-process worker right after
// it starts: `requestStop` asks it to stop, then its promise is awaited so a
// rejection fails the test. Requesting a stop the test already made inline is
// harmless; the step then finds the worker ended.
export function deferWorkerStop(teardown, worker, requestStop) {
  teardown.defer(async () => {
    requestStop();
    await worker;
  });
}

// Registers, on a `fixtureTeardown`, ending a child process of this test right
// after it is spawned: send `signal` unless it already exited, then await its
// exit. A child the test already ended or awaited is only confirmed gone.
export function deferChildExit(teardown, child, signal = "SIGTERM") {
  const exited =
    child.exitCode !== null || child.signalCode !== null
      ? Promise.resolve()
      : new Promise((resolve) => child.once("exit", resolve));
  teardown.defer(async () => {
    child.kill(signal);
    await exited;
  });
}
