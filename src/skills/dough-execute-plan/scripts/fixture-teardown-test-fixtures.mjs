import { rmSync } from "node:fs";

// A test stops or releases what it started before removing the fixture those
// things run from. Register `cleanup` with `t.after` when the fixture is
// created and each stop or release step with `defer` once its process starts:
// the steps run in reverse order of registration, then the fixture is removed.
// A failing step fails the test after the remaining steps and removal ran.
export function fixtureTeardown(root) {
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
      rmSync(root, { recursive: true, force: true });
      if (errors.length === 1) throw errors[0];
      if (errors.length)
        throw new AggregateError(errors, "Fixture teardown steps failed");
    },
  };
}
