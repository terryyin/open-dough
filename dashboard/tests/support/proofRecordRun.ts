// Real subprocesses exercise reporter hooks, storage, and the final CLI verdict.
import { expect } from "@playwright/test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { DashboardProofRecord } from "./proofRecordTypes.ts";
import { spawnGroupLeader, endGroup } from "./processGroup.ts";
import { repoRoot } from "./repositoryRoot.ts";

export const proofFixtures = path.join(
  repoRoot,
  "dashboard/tests/fixtures/quiet-reporter",
);
export const quietReporter = path.join(
  repoRoot,
  "dashboard/tests/support/quietReporter.ts",
);
const dirs: string[] = [];

export function proofDirectory(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "dashboard-proof-record-"));
  dirs.push(dir);
  return dir;
}

export function removeProofDirectories(): void {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
}

export function readProof(file: string | undefined): DashboardProofRecord {
  if (file === undefined)
    throw new Error("This invocation requested no proof record");
  return JSON.parse(readFileSync(file, "utf8")) as DashboardProofRecord;
}

export function startProofCommand(
  command: string,
  args: readonly string[],
  cwd: string,
  extraEnv: Readonly<Record<string, string>> = {},
) {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) =>
        !name.startsWith("TEST_") &&
        !name.startsWith("PW_") &&
        name !== "OPEN_DOUGH_DASHBOARD_SPLIT" &&
        name !== "OPEN_DOUGH_DASHBOARD_PROOF_RECORD" &&
        name !== "OPEN_DOUGH_DASHBOARD_TIMES" &&
        name !== "FORCE_COLOR" &&
        name !== "NO_COLOR",
    ),
  );
  const child = spawnGroupLeader(command, args, {
    cwd,
    env: { ...env, ...extraEnv },
  });
  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];
  child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
  child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
  const result = new Promise<{
    status: number | null;
    signal: NodeJS.Signals | null;
    stdout: string;
    stderr: string;
  }>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (status, signal) => {
      resolve({
        status,
        signal,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      });
    });
  });
  return { child, result, stop: () => endGroup(child) };
}

export function startProofRun(options: {
  spec: string | string[];
  directory?: string;
  recordPath?: string | false;
  // The per-spec-file times file (support/specTimes.ts); none unless named.
  timesPath?: string;
  config?: Readonly<Record<string, unknown>>;
  args?: string[];
  env?: Readonly<Record<string, string>>;
}) {
  const directory = options.directory ?? proofDirectory();
  const recordPath =
    options.recordPath === false
      ? undefined
      : (options.recordPath ?? path.join(directory, "proof.json"));
  const outputDir = path.join(directory, "test-results");
  const configFile = path.join(directory, "playwright.config.mjs");
  const config = {
    testDir: proofFixtures,
    testMatch: options.spec,
    outputDir,
    retries: 0,
    workers: 1,
    projects: [{ name: "proof-fixtures" }],
    reporter: [
      [
        quietReporter,
        // JSON.stringify leaves out an option that is undefined.
        {
          proofRecord: recordPath,
          times: options.timesPath,
        },
      ],
    ],
    ...options.config,
  };
  writeFileSync(configFile, `export default ${JSON.stringify(config)};\n`);
  const run = startProofCommand(
    process.execPath,
    [
      path.join(repoRoot, "node_modules/playwright/cli.js"),
      "test",
      "--config",
      configFile,
      ...(options.args ?? []),
    ],
    repoRoot,
    options.env,
  );
  return { ...run, directory, recordPath, outputDir, configFile };
}

// Wait for the producer's actual progress before interrupting it. Readiness
// uses the existing test deadline, not the generic five-second matcher limit.
// Observe either progress or producer/error disposition, then throw after
// polling stops so diagnostics never become a retried readiness predicate.
export async function waitForProofState(
  run: ReturnType<typeof startProofRun>,
  reached: (record: DashboardProofRecord) => boolean,
): Promise<void> {
  let ended: string | undefined;
  const observation: { failure?: Error } = {};
  const failed = (error: unknown) => {
    observation.failure =
      error instanceof Error
        ? error
        : new Error(`Proof readiness failed: ${String(error)}`);
    return true;
  };
  void run.result.then(
    (result) => {
      ended = JSON.stringify({
        ...result,
        stdout: result.stdout.slice(-4_000),
        stderr: result.stderr.slice(-4_000),
      });
    },
    (error: unknown) => {
      ended = String(error);
    },
  );
  await expect
    .poll(
      () => {
        let record: DashboardProofRecord | undefined;
        try {
          record = readProof(run.recordPath);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT")
            return failed(error);
        }
        try {
          if (record !== undefined && reached(record)) return true;
        } catch (error) {
          return failed(error);
        }
        if (ended !== undefined)
          return failed(
            new Error(`Proof runner ended before requested progress: ${ended}`),
          );
        return false;
      },
      { timeout: 0 },
    )
    .toBe(true);
  if ("failure" in observation) throw observation.failure;
}
