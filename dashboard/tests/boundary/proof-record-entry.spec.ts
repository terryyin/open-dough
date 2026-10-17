import { expect, test } from "../support/pageTest.ts";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "../support/repositoryRoot.ts";
import { dashboardTestMatch } from "../support/testFiles.mjs";
import {
  proofDirectory,
  readProof,
  removeProofDirectories,
  startProofCommand,
} from "../support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

for (const entry of [
  "normal npm",
  "direct config from another working directory",
]) {
  test(`${entry} opts in through normal config and attributes nested runs to their outer invocation`, async () => {
    test.setTimeout(60_000);
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
      "dashboard/tests/quiet-reporter.spec.ts",
    );
    const excludingSplit = dashboardTestMatch(
      new URL("../", import.meta.url),
      "1/2",
    ).some((pattern: RegExp) => pattern.test(nestedTarget))
      ? "2/2"
      : "1/2";
    let run: ReturnType<typeof startProofCommand>;
    try {
      process.env[splitVariable] = excludingSplit;
      run = startProofCommand(direct ? process.execPath : "npm", args, cwd, {
        OPEN_DOUGH_DASHBOARD_PROOF_RECORD: recordPath,
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
        file: path.join(repoRoot, "dashboard/tests/quiet-reporter.spec.ts"),
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
