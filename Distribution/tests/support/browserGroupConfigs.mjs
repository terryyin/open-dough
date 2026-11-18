// Each browser test group as ci.yml runs it (./ci-proof-action-fixtures.mjs
// `browserGroups`), joined to the configured npm command and the runner
// that owns its settings prefix, directory, test root and CI job.
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  frontendDirectory,
  frontendGroup,
} from "../../../dashboard/test-support/support/frontendSelection.mjs";
import { browserGroups, root } from "./ci-proof-action-fixtures.mjs";

const read = (path) => readFileSync(new URL(path, root), "utf8");
const scripts = JSON.parse(read("package.json")).scripts;
const frontendCommand = "scripts/test-frontend.mjs";

function runnerConfig(command) {
  if (
    command === `node ${frontendCommand}` &&
    existsSync(new URL(frontendCommand, root))
  ) {
    return {
      config: frontendCommand,
      frontend: true,
      prefix: frontendGroup.prefix,
      directory: relative(
        fileURLToPath(root),
        fileURLToPath(frontendDirectory),
      ),
      root: frontendGroup.root,
      configuredJob: frontendGroup.job,
    };
  }
  const config = /^playwright test --config (\S+)$/.exec(command)?.[1];
  const run =
    config &&
    /prepareFocusedRun\(\s*"([A-Z0-9_]+)",\s*new URL\("\.\/", import\.meta\.url\),\s*"([^"]+)",\s*"([^"]+)",?\s*\)/.exec(
      read(config),
    );
  return {
    // Its times file names specs relative to testDir, which is the directory
    // handed to prepareFocusedRun.
    timesRelativeToDirectory:
      config !== undefined && /\n {2}testDir: "\.",\n/.test(read(config)),
    config,
    prefix: run?.[1],
    directory: config && dirname(config),
    root: run?.[2],
    configuredJob: run?.[3],
  };
}

export const browserGroupConfigs = browserGroups.map(({ job, inputs }) => ({
  job,
  inputs,
  shards: JSON.parse(inputs.shards).length,
  ...runnerConfig(scripts[inputs.command] ?? ""),
}));
