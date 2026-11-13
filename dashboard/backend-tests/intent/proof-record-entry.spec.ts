import { expect, test } from "../../tests/support/pageTest.ts";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";
import { dashboardTestMatch } from "../../tests/support/testFiles.mjs";
import {
  proofDirectory,
  readProof,
  removeProofDirectories,
  startProofCommand,
} from "../../tests/support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

// The umbrella share (`OPEN_DOUGH_DASHBOARD_SPLIT`) that does not select
// `target`.
function umbrellaSplitExcluding(target: string): string {
  return dashboardTestMatch(new URL("../../", import.meta.url), "1/2").some(
    (pattern: RegExp) => pattern.test(target),
  )
    ? "2/2"
    : "1/2";
}

// One quick Dashboard Frontend Test case, as a runner's arguments.
const frontendSelection = [
  "control-reachability-observation.spec.ts",
  "--grep",
  "a control revealed by earlier scrolling is still checked",
  "--workers=1",
];

for (const entry of [
  "normal npm",
  "direct config from another working directory",
]) {
  test(`${entry} opts in through normal config and attributes nested runs to their outer invocation`, async () => {
    const directory = proofDirectory();
    const recordPath = path.join(directory, "outer-proof.json");
    const selection = [
      "quiet-reporter.spec.ts",
      "--grep",
      "a passing run prints nothing and succeeds",
      "--workers=1",
    ];
    const direct = entry !== "normal npm";
    const args = direct
      ? [
          path.join(repoRoot, "node_modules/playwright/cli.js"),
          "test",
          "--config",
          path.join(repoRoot, "dashboard/playwright.config.ts"),
          ...selection,
        ]
      : ["run", "--silent", "test:dashboard", "--", ...selection];
    const cwd = direct ? directory : repoRoot;
    // The surrounding CI share excludes the target of this independent run.
    // Exercise that inherited condition even when this spec runs locally.
    const splitVariable = "OPEN_DOUGH_DASHBOARD_SPLIT";
    const inheritedSplit = process.env[splitVariable];
    const nestedTarget = path.join(
      repoRoot,
      "dashboard/tests/runtime/quiet-reporter.spec.ts",
    );
    const excludingSplit = umbrellaSplitExcluding(nestedTarget);
    let run: ReturnType<typeof startProofCommand>;
    try {
      process.env[splitVariable] = excludingSplit;
      run = startProofCommand(direct ? process.execPath : "npm", args, cwd, {
        OPEN_DOUGH_DASHBOARD_PROOF_RECORD: recordPath,
        // On CI this config also writes an HTML report, which empties its
        // folder first. Concurrent nested runs sharing the checkout's
        // folder would remove one another's report mid-write, so each
        // writes its own and the outer run keeps the checkout's.
        PLAYWRIGHT_HTML_OUTPUT_DIR: path.join(directory, "playwright-report"),
      });
    } finally {
      if (inheritedSplit === undefined)
        delete process.env["OPEN_DOUGH_DASHBOARD_SPLIT"];
      else process.env[splitVariable] = inheritedSplit;
    }
    expect(await run.result).toMatchObject({
      status: 0,
      stdout: "",
      stderr: "",
    });
    const record = readProof(recordPath);
    expect(record).toMatchObject({
      phase: "completed",
      selectedCount: 1,
      run: {
        cwd: realpathSync(cwd),
        configFile: path.join(repoRoot, "dashboard/playwright.config.ts"),
        listing: false,
      },
      terminal: { runnerStatus: "passed", strictStatus: "passed" },
    });
    expect(record.tests[0]).toMatchObject({
      project: "chromium",
      location: {
        file: path.join(
          repoRoot,
          "dashboard/tests/runtime/quiet-reporter.spec.ts",
        ),
      },
      attempts: [{ status: "passed" }],
    });
    expect(record.tests[0]?.titlePath.at(-1)).toBe(
      "a passing run prints nothing and succeeds",
    );
    expect(record.run.outputDirs.every((dir) => !existsSync(dir))).toBe(true);
    // The outer selected spec ran an inner passing fixture under a custom
    // config while inheriting the outer path. Its selection never replaced it.
    expect(
      record.tests.some((selected) =>
        selected.location.file.endsWith("passing.proof.ts"),
      ),
    ).toBe(false);
  });
}

// Dashboard Frontend Test owns its selection, settings and output: it records
// through its own proof variable into its own run directory, whichever
// umbrella split or record the caller's environment also names.
for (const entry of [
  "normal npm",
  "direct config from another working directory",
]) {
  test(`Dashboard Frontend Test ${entry} records only its own selection under its own settings`, async () => {
    const directory = proofDirectory();
    const recordPath = path.join(directory, "frontend-proof.json");
    const umbrellaRecord = path.join(directory, "umbrella-proof.json");
    const configFile = path.join(
      repoRoot,
      "dashboard/frontend.playwright.config.ts",
    );
    const target = path.join(
      repoRoot,
      "dashboard/frontend-tests/control-reachability-observation.spec.ts",
    );
    const direct = entry !== "normal npm";
    const args = direct
      ? [
          path.join(repoRoot, "node_modules/playwright/cli.js"),
          "test",
          "--config",
          configFile,
          ...frontendSelection,
        ]
      : [
          "run",
          "--silent",
          "test:dashboard:frontend",
          "--",
          ...frontendSelection,
        ];
    const cwd = direct ? directory : repoRoot;
    // An umbrella share that excludes the target, and an umbrella record.
    const run = startProofCommand(
      direct ? process.execPath : "npm",
      args,
      cwd,
      {
        OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD: recordPath,
        OPEN_DOUGH_DASHBOARD_SPLIT: umbrellaSplitExcluding(target),
        OPEN_DOUGH_DASHBOARD_PROOF_RECORD: umbrellaRecord,
      },
    );
    expect(await run.result).toMatchObject({
      status: 0,
      stdout: "",
      stderr: "",
    });
    expect(existsSync(umbrellaRecord)).toBe(false);
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
        path.join(repoRoot, "dashboard/frontend-tests/test-results/"),
      ),
    ]);
    expect(record.run.outputDirs.every((dir) => !existsSync(dir))).toBe(true);
  });
}

test("Dashboard Frontend Test runs started beside each other and the umbrella keep their own run directories and records", async () => {
  const directory = proofDirectory();
  const runs = [
    ["frontend.playwright.config.ts", "OPEN_DOUGH_DASHBOARD_FRONTEND"],
    ["frontend.playwright.config.ts", "OPEN_DOUGH_DASHBOARD_FRONTEND"],
    ["playwright.config.ts", "OPEN_DOUGH_DASHBOARD"],
  ].map(([config = "", prefix = ""], index) => {
    const record = path.join(directory, `${String(index)}.json`);
    const cli = path.join(repoRoot, "node_modules/playwright/cli.js");
    const configFile = path.join(repoRoot, "dashboard", config);
    const args = [cli, "test", "--config", configFile, ...frontendSelection];
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
    // The umbrella's two projects share their run's one directory.
    outputs.push(...new Set(proof.run.outputDirs));
  }
  const root = path.join(repoRoot, "dashboard");
  expect(
    outputs.map((output) => path.relative(root, path.dirname(output))),
  ).toEqual([
    "frontend-tests/test-results",
    "frontend-tests/test-results",
    "test-results",
  ]);
  expect(new Set(outputs).size).toBe(3);
  expect(outputs.every((output) => !existsSync(output))).toBe(true);
});
