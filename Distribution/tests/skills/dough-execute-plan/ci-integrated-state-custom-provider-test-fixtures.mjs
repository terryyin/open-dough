// The test-owned custom provider (ci-custom-command-adapter.mjs) installed for
// a managed fixture: its target attempts run actual, counted covered checks.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "./publication-test-fixtures.mjs";
import { workerPollingEnvironment } from "./ci-worker-poll-test-fixtures.mjs";
import { createCheckCommands } from "./ci-check-command-test-fixtures.mjs";

export const customAdapterScript = fileURLToPath(
  new URL("./ci-custom-command-adapter.mjs", import.meta.url),
);

export async function installCustomProvider(fixture) {
  Object.assign(fixture, { env: workerPollingEnvironment(fixture.env) });
  Object.assign(fixture.requestBase, { env: fixture.env });
  const check = { repo: "owner/project", workflow: "project-checks" };
  const checks = createCheckCommands(fixture);
  const state = join(fixture.fixture, "custom-provider.json");
  let sequence = 0;
  // Schedules `sha`'s target attempt on `ref`, running `covered`.
  const target = async (sha, { ref = "main", covered } = {}) => {
    const job = join(fixture.fixture, "custom-job.json");
    writeFileSync(
      job,
      JSON.stringify({
        ...check,
        sha,
        ref,
        event: "push",
        // Deliberately reverse lexical/numeric-looking identity order.
        runId: `target/opaque:${1000 - sequence++}`,
        attemptId: "try:alpha",
        covered,
      }),
    );
    const result = await exec(
      process.execPath,
      [customAdapterScript, state, job],
      { cwd: fixture.execution },
    ).catch((error) => error);
    return JSON.parse(result.stdout);
  };
  return {
    check,
    state,
    count: checks.count,
    coveredCommand: checks.coveredCommand,
    target,
  };
}
