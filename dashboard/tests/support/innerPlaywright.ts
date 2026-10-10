// Runs Playwright itself on a temporary config, for specs that prove how the
// suite's own runs behave. The config is written into `workDir`, which the
// caller owns. The inner run does not inherit this worker's own Playwright
// wiring; it keeps the rest of this environment, which names this run's
// build (./dashboardBuild.ts).

import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "./repositoryRoot.ts";

const playwrightBin = path.join(repoRoot, "node_modules", ".bin", "playwright");

export type InnerRun = {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
};

export async function runInnerPlaywright(
  workDir: string,
  config: Readonly<Record<string, unknown>>,
  extraEnv: Readonly<Record<string, string>> = {},
): Promise<InnerRun> {
  const configFile = path.join(workDir, "playwright.config.mjs");
  writeFileSync(configFile, `export default ${JSON.stringify(config)};\n`);
  const env = {
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        ([name]) => !name.startsWith("TEST_") && !name.startsWith("PW_"),
      ),
    ),
    ...extraEnv,
  };
  const child = spawn(playwrightBin, ["test", "--config", configFile], {
    cwd: repoRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];
  child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
  child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
  const status = await new Promise<number | null>((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  return {
    status,
    stdout: Buffer.concat(stdout).toString("utf8"),
    stderr: Buffer.concat(stderr).toString("utf8"),
  };
}
