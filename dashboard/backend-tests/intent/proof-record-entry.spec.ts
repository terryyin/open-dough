// Opt-in through the backend runner's normal npm command and a direct
// Playwright config from another working directory. Nest target is the
// backend group's quick Playwright case (QuietReporter moved to Vitest).
import { afterAll, expect, test } from "vitest";
import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  proofDirectory,
  readProof,
  removeProofDirectories,
  startProofCommand,
  splitExcluding,
} from "../../test-support/support/proofRecordRun.ts";

afterAll(removeProofDirectories);

const nestedSpec = "launches/agent-launch-options-rules.spec.ts";
const nestedTitle = "accepts a definition with or without groups and focuses";
const nestedTarget = path.join(repoRoot, "dashboard/backend-tests", nestedSpec);

for (const entry of [
  "normal npm",
  "direct config from another working directory",
]) {
  test(`${entry} opts in through normal config and attributes nested runs to their outer invocation`, async () => {
    const directory = proofDirectory();
    const recordPath = path.join(directory, "outer-proof.json");
    const selection = [nestedSpec, "--grep", nestedTitle, "--workers=1"];
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
    const excludingSplit = splitExcluding(nestedTarget, {
      directory: "dashboard",
      root: "backend-tests",
      job: "dashboard-backend",
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
      location: { file: nestedTarget },
      attempts: [{ status: "passed" }],
    });
    expect(record.tests[0]?.titlePath.at(-1)).toBe(nestedTitle);
    expect(record.run.outputDirs.every((dir) => !existsSync(dir))).toBe(true);
    // Fixture paths from other nested proof helpers must not replace this
    // runner's selected outer invocation.
    expect(
      record.tests.some((selected) =>
        selected.location.file.endsWith("passing.proof.ts"),
      ),
    ).toBe(false);
  });
}
