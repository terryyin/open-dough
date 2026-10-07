// The browser suite's reporter (./support/quietReporter.ts), proven by
// running Playwright itself on a temporary config whose specs are the
// substitutes in ./fixtures/quiet-reporter: a passing run prints nothing,
// a failure is named with its error and trace, output from a passing
// spec or from the run itself fails the run, and a run that reaches its
// deadline names it while keeping what completed.

import { expect, test } from "./support/pageTest.ts";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { repoRoot } from "./support/repositoryRoot.ts";

const playwrightBin = path.join(repoRoot, "node_modules", ".bin", "playwright");
const substitutes = path.join(
  repoRoot,
  "dashboard",
  "tests",
  "fixtures",
  "quiet-reporter",
);
const reporter = path.join(
  repoRoot,
  "dashboard",
  "tests",
  "support",
  "quietReporter.ts",
);

type Run = {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly outputDir: string;
  readonly reportDir: string;
};

const workDirs: string[] = [];

test.afterAll(() => {
  for (const dir of workDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

async function runSubstitute(options: {
  readonly spec: string | readonly string[];
  readonly globalSetup?: string;
  readonly globalTimeout?: number;
}): Promise<Run> {
  const workDir = mkdtempSync(path.join(tmpdir(), "quiet-reporter-"));
  workDirs.push(workDir);
  const outputDir = path.join(workDir, "test-results");
  const reportDir = path.join(workDir, "playwright-report");
  const config = {
    testDir: substitutes,
    testMatch: options.spec,
    outputDir,
    retries: 0,
    reporter: [[reporter]],
    use: { trace: "retain-on-failure" },
    ...(options.globalSetup
      ? { globalSetup: path.join(substitutes, options.globalSetup) }
      : {}),
    // A deadline run, as on CI, also keeps the HTML report. One worker runs
    // the substitutes in file order, so the failing one completes before the
    // hanging one starts.
    ...(options.globalTimeout
      ? {
          globalTimeout: options.globalTimeout,
          workers: 1,
          reporter: [
            [reporter],
            ["html", { open: "never", outputFolder: reportDir }],
          ],
        }
      : {}),
  };
  const configFile = path.join(workDir, "playwright.config.mjs");
  writeFileSync(configFile, `export default ${JSON.stringify(config)};\n`);

  // The inner run must not inherit this worker's own Playwright wiring.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) => !name.startsWith("TEST_") && !name.startsWith("PW_"),
    ),
  );
  const child = spawn(playwrightBin, ["test", "--config", configFile], {
    cwd: repoRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];
  child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
  child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
  const status = await new Promise<number | null>((resolve) => {
    child.on("close", resolve);
  });
  return {
    status,
    stdout: Buffer.concat(stdout).toString("utf8"),
    stderr: Buffer.concat(stderr).toString("utf8"),
    outputDir,
    reportDir,
  };
}

function retainedTraces(outputDir: string): string[] {
  if (!existsSync(outputDir)) {
    return [];
  }
  return readdirSync(outputDir, { recursive: true, encoding: "utf8" }).filter(
    (entry) => path.basename(entry) === "trace.zip",
  );
}

test("a passing run prints nothing and succeeds", async () => {
  const run = await runSubstitute({ spec: "passing.proof.ts" });

  expect(run).toMatchObject({ status: 0, stdout: "", stderr: "" });
});

test("a failing spec is named with its error and keeps its trace", async () => {
  const run = await runSubstitute({ spec: "failing.proof.ts" });

  expect(run.status).not.toBe(0);
  expect(run.stdout).toContain("failing.proof.ts");
  expect(run.stdout).toContain("compares the wrong sum");
  expect(run.stdout).toContain("the substitute's deliberate mismatch");
  expect(run.stdout).toContain("trace.zip");
  expect(retainedTraces(run.outputDir)).toHaveLength(1);
});

test("a passing spec that prints fails the run and shows its output", async () => {
  const run = await runSubstitute({ spec: "printing.proof.ts" });

  expect(run.status).not.toBe(0);
  expect(run.stdout).toContain("passes but chatters");
  expect(run.stdout).toContain("stray chatter from a passing spec");
});

test("output from the run itself fails the run and is shown", async () => {
  const run = await runSubstitute({
    spec: "passing.proof.ts",
    globalSetup: "printingSetup.ts",
  });

  expect(run.status).not.toBe(0);
  expect(run.stdout).toContain("outside any test");
  expect(run.stdout).toContain("stray chatter from global setup");
});

test("a run that reaches its deadline names it, keeps completed failures' traces, and records unfinished tests", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const run = await runSubstitute({
    spec: ["failing.proof.ts", "hanging.proof.ts"],
    globalTimeout: 8_000,
  });

  expect(run.status).not.toBe(0);
  expect(run.stdout).toContain("Timed out waiting");
  expect(run.stdout).toContain("compares the wrong sum");
  // The completed failure keeps its diagnostics; the interrupted test may
  // keep a trace of its own.
  const failed = retainedTraces(run.outputDir).filter((trace) =>
    trace.startsWith("failing.proof.ts-"),
  );
  expect(failed).toHaveLength(1);
  const failedDir = path.join(run.outputDir, path.dirname(failed[0] ?? ""));
  expect(existsSync(path.join(failedDir, "error-context.md"))).toBe(true);

  // The HTML report names the deadline, the completed failure, and the
  // interrupted test, which it lists with the skipped ones.
  const report = pathToFileURL(path.join(run.reportDir, "index.html")).href;
  await page.goto(report);
  await expect(page.getByText(/Timed out waiting 8s/).first()).toBeVisible();
  await page.getByRole("link", { name: "Failed1" }).click();
  await expect(
    page.getByRole("link", { name: "compares the wrong sum" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Skipped1" }).click();
  await expect(
    page.getByRole("link", { name: "waits past the deadline" }),
  ).toBeVisible();
});
