import { expect, test } from "../../tests/support/pageTest.ts";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";
import {
  proofDirectory,
  readProof,
  removeProofDirectories,
  startProofCommand,
  splitExcluding,
} from "../../tests/support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

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
          path.join(repoRoot, "dashboard/backend.playwright.config.ts"),
          ...selection,
        ]
      : ["run", "--silent", "test:dashboard:backend", "--", ...selection];
    const cwd = direct ? directory : repoRoot;
    // The surrounding CI share excludes the target of this independent run.
    // Exercise that inherited condition even when this spec runs locally.
    const splitVariable = "OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT";
    const inheritedSplit = process.env[splitVariable];
    const nestedTarget = path.join(
      repoRoot,
      "dashboard/backend-tests/runtime/quiet-reporter.spec.ts",
    );
    const excludingSplit = splitExcluding(nestedTarget, {
      directory: "dashboard",
      root: "backend-tests",
      durations: "backend.longest-first",
    });
    let run: ReturnType<typeof startProofCommand>;
    try {
      process.env[splitVariable] = excludingSplit;
      run = startProofCommand(direct ? process.execPath : "npm", args, cwd, {
        OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD: recordPath,
        // On CI this config also writes an HTML report, which empties its
        // folder first. Concurrent nested runs sharing the checkout's
        // folder would remove one another's report mid-write, so each
        // writes its own and the outer run keeps the checkout's.
        PLAYWRIGHT_HTML_OUTPUT_DIR: path.join(directory, "playwright-report"),
      });
    } finally {
      if (inheritedSplit === undefined)
        delete process.env["OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT"];
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
        configFile: path.join(
          repoRoot,
          "dashboard/backend.playwright.config.ts",
        ),
        listing: false,
      },
      terminal: { runnerStatus: "passed", strictStatus: "passed" },
    });
    expect(record.tests[0]).toMatchObject({
      project: "chromium",
      location: {
        file: path.join(
          repoRoot,
          "dashboard/backend-tests/runtime/quiet-reporter.spec.ts",
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
