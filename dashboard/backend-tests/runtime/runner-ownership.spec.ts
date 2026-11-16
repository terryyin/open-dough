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

import {
  groupRunnerExamples,
  type GroupRunnerExample,
} from "../../tests/support/groupRunnerExamples.ts";

test.afterAll(removeProofDirectories);
// One worker runs these in order, so only one group's two runs share the
// machine at a time: every group's runs at once took 18 of a case's 30
// seconds on an ordinary four-CPU CI runner and all of them on a slower one.
test.describe.configure({ mode: "default" });

const cli = path.join(repoRoot, "node_modules/playwright/cli.js");
const entries = [
  "normal npm",
  "direct config from another working directory",
] as const;

// One runner's own quick case started through `entry`, handed every other
// runner's settings as its CI shard sets them: a share that would exclude the
// target from this runner's own shard, a record, a times file, and a deadline
// already passed. Reading any of them would deselect the target, write
// elsewhere or fail the run.
function startOwnSelection(
  runner: GroupRunnerExample,
  entry: (typeof entries)[number],
) {
  const directory = proofDirectory();
  const recordPath = path.join(directory, "own-proof.json");
  const configFile = path.join(repoRoot, runner.config);
  const target = path.join(repoRoot, runner.root, runner.spec);
  const direct = entry !== "normal npm";
  const selection = [runner.spec, "--grep", runner.grep, "--workers=1"];
  const args = direct
    ? [cli, "test", "--config", configFile, ...selection]
    : ["run", "--silent", runner.script, "--", ...selection];
  const cwd = direct ? directory : repoRoot;
  const others = groupRunnerExamples
    .map(({ prefix }) => prefix)
    .filter((prefix) => prefix !== runner.prefix);
  const excluding = splitExcluding(target, {
    ...runner,
    root: path.relative(runner.directory, runner.root) || ".",
  });
  const run = startProofCommand(direct ? process.execPath : "npm", args, cwd, {
    ...Object.fromEntries(
      others.flatMap((prefix) => [
        [`${prefix}_SPLIT`, excluding],
        [`${prefix}_PROOF_RECORD`, path.join(directory, `${prefix}.json`)],
        [`${prefix}_TIMES`, path.join(directory, `${prefix}-times.txt`)],
        [`${prefix}_DEADLINE_MS`, "1"],
      ]),
    ),
    [`${runner.prefix}_PROOF_RECORD`]: recordPath,
  });
  const otherOutputs = others.flatMap((prefix) => [
    path.join(directory, `${prefix}.json`),
    path.join(directory, `${prefix}-times.txt`),
  ]);
  return { entry, run, recordPath, configFile, target, cwd, otherOutputs };
}

for (const runner of groupRunnerExamples)
  test(`${runner.name} runs started beside each other, by npm and by direct config from another working directory, each record only their own selection under their own settings in their own run directory`, async () => {
    const started = entries.map((entry) => startOwnSelection(runner, entry));
    const results = await Promise.allSettled(
      started.map(({ run }) => run.result),
    );
    const runRoot = path.join(repoRoot, runner.root, "test-results");
    const outputs: string[] = [];
    for (const [index, own] of started.entries()) {
      expect(results[index], own.entry).toMatchObject({
        status: "fulfilled",
        value: { status: 0, stdout: "", stderr: "" },
      });
      expect(
        own.otherOutputs.filter((output) => existsSync(output)),
        own.entry,
      ).toEqual([]);
      const record = readProof(own.recordPath);
      expect(record, own.entry).toMatchObject({
        phase: "completed",
        selectedCount: 1,
        run: {
          cwd: realpathSync(own.cwd),
          configFile: own.configFile,
          listing: false,
        },
        terminal: { runnerStatus: "passed", strictStatus: "passed" },
      });
      expect(record.tests[0], own.entry).toMatchObject({
        project: "chromium",
        location: { file: own.target },
        attempts: [{ status: "passed" }],
      });
      // E2E Test's two projects share its run's one directory.
      const runDirectories = [...new Set(record.run.outputDirs)];
      expect(
        runDirectories.map((output) => path.dirname(output)),
        own.entry,
      ).toEqual([runRoot]);
      outputs.push(...runDirectories);
    }
    expect(new Set(outputs).size).toBe(entries.length);
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
