import { expect, test } from "vitest";
import type { Suite, TestCase, TestResult } from "@playwright/test/reporter";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import QuietReporter from "../../test-support/support/quietReporter.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  beginReporter,
  collectingStream,
  onlyCase,
  proofFixtures,
  readProof,
  temporaryProof,
} from "../support/directProofRecord.ts";

function passingRun(directory: string, outputDir: string, file: string) {
  return makeMe.aReporterRun
    .withOutputDir(outputDir)
    .withConfigFile(path.join(directory, "config.ts"))
    .withRootDir(repoRoot)
    .holdingCase({ title: "adds quietly", file, line: 3 })
    .please();
}

async function drivePassing(
  reporter: QuietReporter,
  run: { config: unknown; suite: Suite },
  testCase: TestCase,
  result: TestResult,
) {
  beginReporter(reporter, run);
  reporter.onTestBegin(testCase, result);
  reporter.onTestEnd(testCase, result);
  return reporter.onEnd({
    status: "passed",
    duration: 1,
    startTime: new Date(),
  });
}

test("an alias into an existing disposable output directory is refused", async () => {
  const { directory, outputDir } = temporaryProof();
  const alias = path.join(directory, "output-alias");
  mkdirSync(outputDir);
  symlinkSync(outputDir, alias, "dir");
  const recordPath = path.join(alias, "proof.json");
  const file = path.join(proofFixtures, "passing.proof.ts");
  const run = passingRun(directory, outputDir, file);
  const stdout = collectingStream();
  const stderr = collectingStream();
  const reporter = new QuietReporter(
    { proofRecord: recordPath },
    { stdout, stderr },
  );
  const end = await drivePassing(
    reporter,
    run,
    onlyCase(run.cases),
    makeMe.aReporterResult.withStatus("passed").please(),
  );
  await reporter.onExit();
  expect(end).toBeUndefined();
  expect(stdout.text()).toBe("");
  expect(stderr.text()).toContain("outside every disposable output directory");
  expect(existsSync(recordPath)).toBe(false);
  expect(existsSync(outputDir)).toBe(false);
});

test("an existing path remains byte-for-byte unchanged without changing the test verdict", async () => {
  const { directory, recordPath, outputDir } = temporaryProof();
  mkdirSync(outputDir);
  const before = "existing caller-owned evidence\n";
  writeFileSync(recordPath, before);
  const file = path.join(proofFixtures, "passing.proof.ts");
  const run = passingRun(directory, outputDir, file);
  const stdout = collectingStream();
  const stderr = collectingStream();
  const reporter = new QuietReporter(
    { proofRecord: recordPath },
    { stdout, stderr },
  );
  const end = await drivePassing(
    reporter,
    run,
    onlyCase(run.cases),
    makeMe.aReporterResult.withStatus("passed").please(),
  );
  await reporter.onExit();
  expect(end).toBeUndefined();
  expect(stdout.text()).toBe("");
  expect(stderr.text()).toContain(`Proof record unavailable at ${recordPath}:`);
  expect(readFileSync(recordPath, "utf8")).toBe(before);
  expect(existsSync(outputDir)).toBe(false);
});

test("invalid and disposable destinations report recording unavailability with the underlying verdict", async () => {
  const { directory, outputDir } = temporaryProof();
  mkdirSync(outputDir);
  const blockedParent = path.join(directory, "regular-file");
  writeFileSync(blockedParent, "a file cannot contain a record");
  const passing = path.join(proofFixtures, "passing.proof.ts");
  const failing = path.join(proofFixtures, "failing.proof.ts");
  const cases = [
    {
      recordPath: "relative-proof.json",
      file: passing,
      title: "adds quietly",
      status: "passed" as const,
      failed: false,
    },
    {
      recordPath: path.join(directory, "missing", "proof.json"),
      file: failing,
      title: "compares the wrong sum",
      status: "failed" as const,
      failed: true,
    },
    {
      recordPath: path.join(blockedParent, "proof.json"),
      file: passing,
      title: "adds quietly",
      status: "passed" as const,
      failed: false,
    },
    {
      recordPath: path.join(outputDir, "proof.json"),
      file: passing,
      title: "adds quietly",
      status: "passed" as const,
      failed: false,
    },
  ];
  for (const entry of cases) {
    const run = makeMe.aReporterRun
      .withOutputDir(outputDir)
      .withConfigFile(path.join(directory, "config.ts"))
      .withRootDir(repoRoot)
      .holdingCase({
        title: entry.title,
        file: entry.file,
        line: 3,
        outcome: entry.failed ? "unexpected" : "expected",
      })
      .please();
    const testCase = onlyCase(run.cases);
    const result = entry.failed
      ? makeMe.aReporterResult
          .withStatus("failed")
          .withError({ message: "expected 1 to be 2" })
          .please()
      : makeMe.aReporterResult.withStatus("passed").please();
    const stdout = collectingStream();
    const stderr = collectingStream();
    const reporter = new QuietReporter(
      { proofRecord: entry.recordPath },
      { stdout, stderr },
    );
    beginReporter(reporter, run);
    reporter.onTestBegin(testCase, result);
    reporter.onTestEnd(testCase, result);
    const end = await reporter.onEnd({
      status: entry.status,
      duration: 1,
      startTime: new Date(),
    });
    expect(end).toEqual(entry.failed ? { status: "failed" } : undefined);
    expect(stderr.text()).toContain("Proof record unavailable at");
    expect(existsSync(entry.recordPath)).toBe(false);
  }
});

test("a controlled snapshot write failure leaves incomplete evidence and the original passed verdict", async () => {
  const { directory, recordPath, outputDir } = temporaryProof();
  mkdirSync(outputDir);
  const file = path.join(proofFixtures, "passing.proof.ts");
  const run = passingRun(directory, outputDir, file);
  const testCase = onlyCase(run.cases);
  const result = makeMe.aReporterResult.withStatus("passed").please();
  const stdout = collectingStream();
  const stderr = collectingStream();
  const reporter = new QuietReporter(
    { proofRecord: recordPath },
    { stdout, stderr },
  );
  beginReporter(reporter, run);
  reporter.onTestBegin(testCase, result);
  const record = readProof(recordPath);
  const obstructing = `${recordPath}.${record.run.id}.tmp`;
  mkdirSync(obstructing);
  writeFileSync(
    path.join(obstructing, "fixture-marker"),
    "reserved by the fixture",
  );
  reporter.onTestEnd(testCase, result);
  const end = await reporter.onEnd({
    status: "passed",
    duration: 1,
    startTime: new Date(),
  });
  await reporter.onExit();
  expect(end).toBeUndefined();
  expect(stdout.text()).toBe("");
  expect(stderr.text()).toContain("Proof record unavailable at");
  const after = readProof(recordPath);
  expect(after.phase).toBe("running");
  expect(after.terminal).toBeUndefined();
  expect(after.tests[0]?.attempts[0]?.status).toBeUndefined();
  expect(existsSync(outputDir)).toBe(false);
  expect(readdirSync(obstructing)).toEqual(["fixture-marker"]);
  expect(readFileSync(path.join(obstructing, "fixture-marker"), "utf8")).toBe(
    "reserved by the fixture",
  );
});

test("ordinary repeated runs add no proof record or passing output directories", async () => {
  const { directory, outputDir } = temporaryProof();
  const file = path.join(proofFixtures, "passing.proof.ts");
  for (let index = 0; index < 2; index++) {
    mkdirSync(outputDir);
    const run = passingRun(directory, outputDir, file);
    const stdout = collectingStream();
    const stderr = collectingStream();
    const reporter = new QuietReporter({}, { stdout, stderr });
    const end = await drivePassing(
      reporter,
      run,
      onlyCase(run.cases),
      makeMe.aReporterResult.withStatus("passed").please(),
    );
    await reporter.onExit();
    expect(end).toBeUndefined();
    expect(stdout.text()).toBe("");
    expect(stderr.text()).toBe("");
    expect(existsSync(outputDir)).toBe(false);
    expect(readdirSync(directory)).toEqual([]);
  }
});
