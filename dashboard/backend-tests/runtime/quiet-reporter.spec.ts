// QuietReporter's output rules, from reported events and the run's own
// output on the streams it watches.
import { expect, test } from "vitest";
import type { Suite, TestCase, TestResult } from "@playwright/test/reporter";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import QuietReporter from "../../test-support/support/quietReporter.ts";
import { shown } from "../../test-support/support/quietReporterFormat.ts";
import { proofFixtures } from "../../test-support/support/proofRecordRun.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  beginReporter,
  collectingStream,
  onlyCase,
  temporaryProof,
} from "../support/directProofRecord.ts";

function quietRun(
  directory: string,
  outputDir: string,
  file: string,
  title: string,
  outcome: "expected" | "unexpected",
) {
  return makeMe.aReporterRun
    .withOutputDir(outputDir)
    .withConfigFile(path.join(directory, "config.ts"))
    .withRootDir(repoRoot)
    .holdingCase({ title, file, line: 3, outcome })
    .please();
}

function openReporter() {
  const stdout = collectingStream();
  const stderr = collectingStream();
  return {
    stdout,
    stderr,
    reporter: new QuietReporter({}, { stdout, stderr }),
  };
}

async function driveCase(
  reporter: QuietReporter,
  run: { config: unknown; suite: Suite },
  testCase: TestCase,
  result: TestResult,
  endStatus: "passed" | "failed" | "timedout" = "failed",
) {
  beginReporter(reporter, run);
  reporter.onTestBegin(testCase, result);
  reporter.onTestEnd(testCase, result);
  return reporter.onEnd({
    status: endStatus,
    duration: 1,
    startTime: new Date(),
  });
}

test("a passing run prints nothing and succeeds", async () => {
  const { directory, outputDir } = temporaryProof("quiet-reporter-");
  const file = path.join(proofFixtures, "passing.proof.ts");
  const run = quietRun(directory, outputDir, file, "adds quietly", "expected");
  const { stdout, stderr, reporter } = openReporter();
  const end = await driveCase(
    reporter,
    run,
    onlyCase(run.cases),
    makeMe.aReporterResult.withStatus("passed").please(),
    "passed",
  );
  await reporter.onExit();
  expect(end).toBeUndefined();
  expect(stdout.text()).toBe("");
  expect(stderr.text()).toBe("");
  expect(existsSync(outputDir)).toBe(false);
});

test("a failing case is named with its error and its kept attachment paths", async () => {
  const { directory, outputDir } = temporaryProof("quiet-reporter-");
  const file = path.join(proofFixtures, "failing.proof.ts");
  const run = quietRun(
    directory,
    outputDir,
    file,
    "compares the wrong sum",
    "unexpected",
  );
  const tracePath = path.join(
    outputDir,
    "failing.proof.ts-retry0",
    "trace.zip",
  );
  const { stdout, reporter } = openReporter();
  const end = await driveCase(
    reporter,
    run,
    onlyCase(run.cases),
    makeMe.aReporterResult
      .withStatus("failed")
      .withError({ message: "the substitute's deliberate mismatch" })
      .with({
        attachments: [
          { name: "trace", path: tracePath, contentType: "application/zip" },
        ],
      })
      .please(),
  );
  expect(end).toEqual({ status: "failed" });
  expect(stdout.text()).toContain("failing.proof.ts");
  expect(stdout.text()).toContain("compares the wrong sum");
  expect(stdout.text()).toContain("the substitute's deliberate mismatch");
  expect(stdout.text()).toContain("trace.zip");
});

test("a failed run writes report.txt and names its directory last", async () => {
  const { directory, outputDir } = temporaryProof("quiet-reporter-");
  const file = path.join(proofFixtures, "failing.proof.ts");
  const run = quietRun(
    directory,
    outputDir,
    file,
    "compares the wrong sum",
    "unexpected",
  );
  const { stdout, reporter } = openReporter();
  await driveCase(
    reporter,
    run,
    onlyCase(run.cases),
    makeMe.aReporterResult
      .withStatus("failed")
      .withError({ message: "compares the wrong sum" })
      .please(),
  );
  const report = readFileSync(path.join(outputDir, "report.txt"), "utf8");
  expect(report).toContain("compares the wrong sum");
  expect(stdout.text()).toBe(`${report}Kept: ${shown(outputDir)}\n`);
});

test("a passing case that printed fails the run and shows its output", async () => {
  const { directory, outputDir } = temporaryProof("quiet-reporter-");
  const file = path.join(proofFixtures, "printing.proof.ts");
  const run = quietRun(
    directory,
    outputDir,
    file,
    "passes but chatters",
    "expected",
  );
  const { stdout, reporter } = openReporter();
  const end = await driveCase(
    reporter,
    run,
    onlyCase(run.cases),
    makeMe.aReporterResult
      .withStatus("passed")
      .writing("stray chatter from a passing spec\n")
      .please(),
  );
  expect(end).toEqual({ status: "failed" });
  expect(stdout.text()).toContain("passes but chatters");
  expect(stdout.text()).toContain("stray chatter from a passing spec");
});

test("a deadline names it, shows the completed failure, and keeps the report", async () => {
  const { directory, outputDir } = temporaryProof("quiet-reporter-");
  const file = path.join(proofFixtures, "failing.proof.ts");
  const run = quietRun(
    directory,
    outputDir,
    file,
    "compares the wrong sum",
    "unexpected",
  );
  const { stdout, reporter } = openReporter();
  beginReporter(reporter, run);
  const failed = onlyCase(run.cases);
  const result = makeMe.aReporterResult
    .withStatus("failed")
    .withError({ message: "compares the wrong sum" })
    .please();
  reporter.onTestBegin(failed, result);
  reporter.onTestEnd(failed, result);
  reporter.onError({ message: "Timed out waiting 8s for the test run" });
  const end = await reporter.onEnd({
    status: "timedout",
    duration: 8000,
    startTime: new Date(),
  });
  expect(end).toEqual({ status: "failed" });
  expect(stdout.text()).toContain("Timed out waiting");
  expect(stdout.text()).not.toContain("Test timeout of");
  expect(stdout.text()).toContain("compares the wrong sum");
  expect(existsSync(path.join(outputDir, "report.txt"))).toBe(true);
  expect(stdout.text().trimEnd().split("\n").at(-1)).toBe(
    `Kept: ${shown(outputDir)}`,
  );
});

// Global setup runs in the runner process and writes straight to its
// stdout, which the reporter watches from its creation.
test("output from the run itself fails the run and is shown", async () => {
  const { directory, outputDir } = temporaryProof("quiet-reporter-");
  const file = path.join(proofFixtures, "passing.proof.ts");
  const run = quietRun(directory, outputDir, file, "adds quietly", "expected");
  const { stdout, reporter } = openReporter();
  stdout.write("stray chatter from global setup\n");
  const end = await driveCase(
    reporter,
    run,
    onlyCase(run.cases),
    makeMe.aReporterResult.withStatus("passed").please(),
    "passed",
  );
  expect(end).toEqual({ status: "failed" });
  expect(stdout.text()).toContain("outside any test");
  expect(stdout.text()).toContain("stray chatter from global setup");
});
