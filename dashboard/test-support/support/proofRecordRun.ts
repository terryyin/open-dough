// Real subprocesses exercise reporter hooks, storage, and the final CLI verdict.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { DashboardProofRecord } from "./proofRecordTypes.ts";
import { spawnGroupLeader, endGroup } from "./processGroup.ts";
import { repoRoot } from "./repositoryRoot.ts";
import {
  ciGroupSelection,
  dashboardTestMatch,
  declaredShards,
} from "./testFiles.mjs";

export const proofFixtures = path.join(
  repoRoot,
  "dashboard/test-support/fixtures/quiet-reporter",
);
export const quietReporter = path.join(
  repoRoot,
  "dashboard/test-support/support/quietReporter.ts",
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

// A split of one group's own CI shards that does not select `target`: its
// `root` under its configuration's `directory` (relative to the repository),
// sharded as its `job` declares in .github/workflows/ci.yml. A nested run
// handed that split through any variable it must not read proves it ignores
// that variable. A one-shard group has no such shard, so it gets a split its
// configuration refuses, which fails a run that reads it.
export function splitExcluding(
  target: string,
  group: {
    readonly directory: string;
    readonly root: string;
    readonly job: string;
  },
): string {
  const selection = ciGroupSelection(
    group.root,
    "the excluding split",
    group.job,
  );
  const shards = declaredShards(selection);
  const count = shards.length;
  const excluding = shards.find(
    (shard) =>
      !dashboardTestMatch(
        pathToFileURL(`${path.join(repoRoot, group.directory)}/`),
        `${shard}/${String(count)}`,
        selection,
      ).some((pattern: RegExp) => pattern.test(target)),
  );
  return excluding === undefined
    ? `${String(count + 1)}/${String(count + 1)}`
    : `${excluding}/${String(count)}`;
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
        // Every runner's share, record and times (./runnerConfig.mjs).
        !/^OPEN_DOUGH_(?:DASHBOARD_(?:INTEGRATED|FRONTEND|BACKEND)|E2E)_(?:SPLIT|PROOF_RECORD|TIMES)$/.test(
          name,
        ) &&
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
