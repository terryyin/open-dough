// Each runner owning one group owns its selection, settings and output:
// Dashboard Integrated UI Test (../../integrated.playwright.config.ts),
// Dashboard Frontend Test (../../frontend.playwright.config.ts), Dashboard
// Backend Test (../../backend.playwright.config.ts) and E2E Test
// (../../../e2e/playwright.config.ts), started through npm or as a direct
// config from another working directory, record only their own selection
// through their own proof variable into their own run directory, whichever
// other runner's share, record, times or deadline the caller's environment
// also names; runs started beside each other keep their own run directories
// and records. A runner's setup registers only the artifacts its own specs
// request.
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
  splitExcluding,
} from "../../tests/support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

// Each runner owning one group, with one quick case of its own as its
// arguments; `config`, `directory` (the config's testDir) and `root` are
// relative to the repository, `durations` to `directory`.
const runners = [
  {
    name: "Dashboard Integrated UI Test",
    script: "test:dashboard:integrated",
    config: "dashboard/integrated.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_INTEGRATED",
    directory: "dashboard",
    root: "dashboard/tests",
    durations: "integrated.longest-first",
    spec: "configuration/project-add-refusal.spec.ts",
    grep: "origin mismatch stays linked to the path",
  },
  {
    name: "Dashboard Frontend Test",
    script: "test:dashboard:frontend",
    config: "dashboard/frontend.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_FRONTEND",
    directory: "dashboard",
    root: "dashboard/frontend-tests",
    durations: "frontend.longest-first",
    spec: "control-reachability-observation.spec.ts",
    grep: "a control revealed by earlier scrolling is still checked",
  },
  {
    name: "Dashboard Backend Test",
    script: "test:dashboard:backend",
    config: "dashboard/backend.playwright.config.ts",
    prefix: "OPEN_DOUGH_DASHBOARD_BACKEND",
    directory: "dashboard",
    root: "dashboard/backend-tests",
    durations: "backend.longest-first",
    spec: "launches/agent-launch-options-rules.spec.ts",
    grep: "the shipped definition is valid",
  },
  {
    name: "E2E Test",
    script: "test:e2e",
    config: "e2e/playwright.config.ts",
    prefix: "OPEN_DOUGH_E2E",
    directory: "e2e",
    root: "e2e",
    durations: "longest-first",
    spec: "runtime/browser-identity.spec.ts",
    grep: "tab, bookmark and touch icons",
  },
] as const;
type Runner = (typeof runners)[number];
const [integrated, frontend, backend, e2e] = runners;

const selection = (runner: Pick<Runner, "spec" | "grep">) => [
  runner.spec,
  "--grep",
  runner.grep,
  "--workers=1",
];
const cli = path.join(repoRoot, "node_modules/playwright/cli.js");
const configOf = (config: string) => path.join(repoRoot, config);

for (const runner of runners)
  for (const entry of [
    "normal npm",
    "direct config from another working directory",
  ])
    test(`${runner.name} ${entry} records only its own selection under its own settings`, async () => {
      const directory = proofDirectory();
      const recordPath = path.join(directory, "own-proof.json");
      const configFile = configOf(runner.config);
      const target = path.join(repoRoot, runner.root, runner.spec);
      const direct = entry !== "normal npm";
      const args = direct
        ? [cli, "test", "--config", configFile, ...selection(runner)]
        : ["run", "--silent", runner.script, "--", ...selection(runner)];
      const cwd = direct ? directory : repoRoot;
      // Every other runner's settings as its CI shard sets them: a share
      // that would exclude the target from this runner's own deal, a record,
      // a times file, and a deadline already passed. Reading any of them
      // would deselect the target, write elsewhere or fail the run.
      const others = runners
        .map(({ prefix }) => prefix)
        .filter((prefix) => prefix !== runner.prefix);
      const otherOutputs = others.flatMap((prefix) => [
        path.join(directory, `${prefix}.json`),
        path.join(directory, `${prefix}-times.txt`),
      ]);
      const excluding = splitExcluding(target, {
        ...runner,
        root: path.relative(runner.directory, runner.root) || ".",
      });
      const run = startProofCommand(
        direct ? process.execPath : "npm",
        args,
        cwd,
        {
          ...Object.fromEntries(
            others.flatMap((prefix) => [
              [`${prefix}_SPLIT`, excluding],
              [
                `${prefix}_PROOF_RECORD`,
                path.join(directory, `${prefix}.json`),
              ],
              [`${prefix}_TIMES`, path.join(directory, `${prefix}-times.txt`)],
              [`${prefix}_DEADLINE_MS`, "1"],
            ]),
          ),
          [`${runner.prefix}_PROOF_RECORD`]: recordPath,
        },
      );
      expect(await run.result).toMatchObject({
        status: 0,
        stdout: "",
        stderr: "",
      });
      expect(otherOutputs.filter((output) => existsSync(output))).toEqual([]);
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
      // E2E Test's two projects share its run's one directory.
      expect([...new Set(record.run.outputDirs)]).toEqual([
        expect.stringContaining(
          path.join(repoRoot, runner.root, "test-results/"),
        ),
      ]);
      expect(record.run.outputDirs.every((dir) => !existsSync(dir))).toBe(true);
    });

test("group runs started beside each other keep their own run directories and records", async () => {
  const directory = proofDirectory();
  const runs = [
    integrated,
    integrated,
    frontend,
    frontend,
    backend,
    backend,
    e2e,
    e2e,
  ].map(({ config, prefix, ...runner }, index) => {
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
  });
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
    // E2E Test's two projects share their run's one directory.
    outputs.push(...new Set(proof.run.outputDirs));
  }
  const root = path.join(repoRoot, "dashboard");
  expect(
    outputs.map((output) => path.relative(root, path.dirname(output))),
  ).toEqual([
    "tests/test-results",
    "tests/test-results",
    "frontend-tests/test-results",
    "frontend-tests/test-results",
    "backend-tests/test-results",
    "backend-tests/test-results",
    "../e2e/test-results",
    "../e2e/test-results",
  ]);
  expect(new Set(outputs).size).toBe(8);
  if (process.env["CI"]) {
    for (const output of outputs) {
      const report = path.join(
        output,
        "../../playwright-report",
        path.basename(output),
        "index.html",
      );
      expect(existsSync(report), report).toBe(true);
    }
  }
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
