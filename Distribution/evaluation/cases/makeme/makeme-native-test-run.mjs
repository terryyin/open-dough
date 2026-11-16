import { spawnSync } from "node:child_process";

// A native assessment may itself run as a node:test negative control. Node's
// private child marker would make a nested --test silently skip every file.
export function runTests(checkout, paths) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, ["--test", ...paths], {
    cwd: checkout,
    encoding: "utf8",
    env,
  });
}
