// Each browser test group as ci.yml runs it (./ci-proof-action-fixtures.mjs
// `browserGroups`), joined to the npm script its job names and the
// Playwright configuration that script runs: the settings prefix, testDir
// (`directory`, repository-relative), root and duration list the
// configuration hands prepareFocusedRun
// (dashboard/tests/support/runnerConfig.mjs).
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { browserGroups, root } from "./ci-proof-action-fixtures.mjs";

const read = (path) => readFileSync(new URL(path, root), "utf8");
const scripts = JSON.parse(read("package.json")).scripts;

export const browserGroupConfigs = browserGroups.map(({ job, inputs }) => {
  const config = /^playwright test --config (\S+)$/.exec(
    scripts[inputs.command] ?? "",
  )?.[1];
  const run =
    config &&
    /prepareFocusedRun\(\s*"([A-Z0-9_]+)",\s*new URL\("\.\/", import\.meta\.url\),\s*"([^"]+)",\s*"([^"]+)",?\s*\)/.exec(
      read(config),
    );
  return {
    job,
    inputs,
    // Its times file names specs relative to testDir; the deal, relative to
    // the directory handed to prepareFocusedRun.
    timesRelativeToDeal:
      config !== undefined && /\n {2}testDir: "\.",\n/.test(read(config)),
    shards: JSON.parse(inputs.shards).length,
    config,
    prefix: run?.[1],
    directory: config && dirname(config),
    root: run?.[2],
    durations: run?.[3],
  };
});
