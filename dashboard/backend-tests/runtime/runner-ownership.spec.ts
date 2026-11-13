// Each focused dashboard runner owns its selection, settings and output:
// Dashboard Frontend Test (../../frontend.playwright.config.ts) and Dashboard
// Backend Test (../../backend.playwright.config.ts), started through npm or
// as a direct config from another working directory, record only their own
// selection through their own proof variable into their own run directory,
// whichever umbrella share or other runner's record the caller's environment
// also names; runs started beside each other and the umbrella
// (../../playwright.config.ts) keep their own run directories and records.
// A runner's setup registers only the artifacts its own specs request.
import { expect, test } from "../../tests/support/pageTest.ts";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";
import {
  proofDirectory,
  readProof,
  removeProofDirectories,
  startProofCommand,
  startProofRun,
  umbrellaSplitExcluding,
} from "../../tests/support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

// Each focused runner, with one quick case of its own as its arguments.
const runners = [
  {
    name: "Dashboard Frontend Test",
    script: "test:dashboard:frontend",
    config: "frontend.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_FRONTEND",
    root: "frontend-tests",
    spec: "control-reachability-observation.spec.ts",
    grep: "a control revealed by earlier scrolling is still checked",
  },
  {
    name: "Dashboard Backend Test",
    script: "test:dashboard:backend",
    config: "backend.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_BACKEND",
    root: "backend-tests",
    spec: "launches/agent-launch-options-rules.spec.ts",
    grep: "the shipped definition is valid",
  },
] as const;
type Runner = (typeof runners)[number];
const [frontend, backend] = runners;

const selection = (runner: Pick<Runner, "spec" | "grep">) => [
  runner.spec,
  "--grep",
  runner.grep,
  "--workers=1",
];
const cli = path.join(repoRoot, "node_modules/playwright/cli.js");
const configOf = (config: string) => path.join(repoRoot, "dashboard", config);

for (const runner of runners)
  for (const entry of [
    "normal npm",
    "direct config from another working directory",
  ])
    test(`${runner.name} ${entry} records only its own selection under its own settings`, async () => {
      const directory = proofDirectory();
      const recordPath = path.join(directory, "own-proof.json");
      const configFile = configOf(runner.config);
      const target = path.join(repoRoot, "dashboard", runner.root, runner.spec);
      const direct = entry !== "normal npm";
      const args = direct
        ? [cli, "test", "--config", configFile, ...selection(runner)]
        : ["run", "--silent", runner.script, "--", ...selection(runner)];
      const cwd = direct ? directory : repoRoot;
      // An umbrella share that excludes the target, and every other runner's
      // record.
      const others = [
        "OPEN_DOUGH_DASHBOARD",
        ...runners.map(({ prefix }) => prefix),
      ].filter((prefix) => prefix !== runner.prefix);
      const otherRecords = others.map((prefix) =>
        path.join(directory, `${prefix}.json`),
      );
      const run = startProofCommand(
        direct ? process.execPath : "npm",
        args,
        cwd,
        {
          ...Object.fromEntries(
            others.map((prefix, index) => [
              `${prefix}_PROOF_RECORD`,
              otherRecords[index] ?? "",
            ]),
          ),
          [`${runner.prefix}_PROOF_RECORD`]: recordPath,
          OPEN_DOUGH_DASHBOARD_SPLIT: umbrellaSplitExcluding(target),
        },
      );
      expect(await run.result).toMatchObject({
        status: 0,
        stdout: "",
        stderr: "",
      });
      expect(otherRecords.filter((record) => existsSync(record))).toEqual([]);
      const record = readProof(recordPath);
      expect(record).toMatchObject({
        phase: "completed",
        selectedCount: 1,
        run: { cwd: realpathSync(cwd), configFile, listing: false },
        terminal: { runnerStatus: "passed", strictStatus: "passed" },
      });
      expect(record.tests[0]).toMatchObject({
        project: "chromium",
        location: { file: target },
        attempts: [{ status: "passed" }],
      });
      expect(record.run.outputDirs).toEqual([
        expect.stringContaining(
          path.join(repoRoot, "dashboard", runner.root, "test-results/"),
        ),
      ]);
      expect(record.run.outputDirs.every((dir) => !existsSync(dir))).toBe(true);
    });

test("focused runs started beside each other and the umbrella keep their own run directories and records", async () => {
  const directory = proofDirectory();
  const umbrella = {
    ...frontend,
    config: "playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD",
  };
  const runs = [frontend, frontend, backend, backend, umbrella].map(
    ({ config, prefix, ...runner }, index) => {
      const record = path.join(directory, `${String(index)}.json`);
      const args = [
        cli,
        "test",
        "--config",
        configOf(config),
        ...selection(runner),
      ];
      const env = { [`${prefix}_PROOF_RECORD`]: record };
      return {
        record,
        run: startProofCommand(process.execPath, args, repoRoot, env),
      };
    },
  );
  const outputs: string[] = [];
  for (const { record, run } of runs) {
    expect(await run.result).toMatchObject({
      status: 0,
      stdout: "",
      stderr: "",
    });
    const proof = readProof(record);
    expect(proof).toMatchObject({
      selectedCount: 1,
      terminal: { strictStatus: "passed" },
    });
    // The umbrella's two projects share their run's one directory.
    outputs.push(...new Set(proof.run.outputDirs));
  }
  const root = path.join(repoRoot, "dashboard");
  expect(
    outputs.map((output) => path.relative(root, path.dirname(output))),
  ).toEqual([
    "frontend-tests/test-results",
    "frontend-tests/test-results",
    "backend-tests/test-results",
    "backend-tests/test-results",
    "test-results",
  ]);
  expect(new Set(outputs).size).toBe(5);
  expect(outputs.every((output) => !existsSync(output))).toBe(true);
});

test("Dashboard Backend Test's setup registers no comparison mount, so a spec asking for one fails naming it", async () => {
  const run = startProofRun({
    spec: "unregistered.proof.ts",
    config: {
      testDir: path.join(repoRoot, "dashboard/tests/fixtures/artifact-demand"),
      globalSetup: path.join(
        repoRoot,
        "dashboard/tests/support/backendGlobalSetup.ts",
      ),
    },
  });
  try {
    const result = await run.result;
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
    expect(readProof(run.recordPath)).toMatchObject({
      selectedCount: 1,
      terminal: { strictStatus: "passed" },
    });
  } finally {
    await run.stop();
  }
});
