import { expect, test } from "vitest";
import type {
  FullConfig,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import QuietReporter from "../../test-support/support/quietReporter.ts";
import { shown } from "../../test-support/support/quietReporterFormat.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  onlyCase,
  proofFixtures,
  readProof,
  temporaryProof,
} from "../support/directProofRecord.ts";

// MakeMe's JSDoc FullConfig erases to FullConfig<any, any>; QuietReporter wants {}.
function beginReporter(
  reporter: QuietReporter,
  run: { config: unknown; suite: Suite },
): void {
  reporter.onBegin(run.config as FullConfig, run.suite);
}

function collectingStream(): {
  write: typeof process.stdout.write;
  text: () => string;
} {
  const chunks: string[] = [];
  return {
    write(chunk: unknown): boolean {
      chunks.push(
        typeof chunk === "string"
          ? chunk
          : Buffer.isBuffer(chunk)
            ? chunk.toString("utf8")
            : String(chunk),
      );
      return true;
    },
    text: () => chunks.join(""),
  };
}

for (const scenario of [
  {
    name: "assertion failure",
    title: "compares the wrong sum",
    file: "failing.proof.ts",
    line: 3,
    status: "failed" as const,
    runner: "failed" as const,
    outcome: "unexpected" as const,
    diagnostic: "FAIL:",
    result: (): TestResult =>
      makeMe.aReporterResult
        .withStatus("failed")
        .withError({ message: "expected 1 to be 2" })
        .please(),
    drive(reporter: QuietReporter, testCase: TestCase, result: TestResult) {
      reporter.onTestBegin(testCase, result);
      reporter.onTestEnd(testCase, result);
    },
  },
  {
    name: "passing assertion output",
    title: "passes but chatters",
    file: "printing.proof.ts",
    line: 3,
    status: "passed" as const,
    runner: "passed" as const,
    outcome: "expected" as const,
    diagnostic: "PRINTED:",
    result: (): TestResult =>
      makeMe.aReporterResult
        .withStatus("passed")
        .writing("stray chatter from a passing spec\n")
        .please(),
    drive(reporter: QuietReporter, testCase: TestCase, result: TestResult) {
      reporter.onTestBegin(testCase, result);
      reporter.onTestEnd(testCase, result);
    },
  },
  {
    name: "setup output",
    title: "adds quietly",
    file: "passing.proof.ts",
    line: 3,
    status: "passed" as const,
    runner: "passed" as const,
    outcome: "expected" as const,
    diagnostic: "outside any test",
    result: (): TestResult =>
      makeMe.aReporterResult.withStatus("passed").please(),
    drive(reporter: QuietReporter, testCase: TestCase, result: TestResult) {
      reporter.onStdOut("setup printed\n");
      reporter.onTestBegin(testCase, result);
      reporter.onTestEnd(testCase, result);
    },
  },
]) {
  test(`${scenario.name} retains assertion results separately from the strict failed verdict`, async () => {
    const { directory, recordPath, outputDir } = temporaryProof(
      "dashboard-proof-verdict-",
    );
    const file = path.join(proofFixtures, scenario.file);
    const run = makeMe.aReporterRun
      .withOutputDir(outputDir)
      .withConfigFile(path.join(directory, "config.ts"))
      .withRootDir(repoRoot)
      .holdingCase({
        title: scenario.title,
        file,
        line: scenario.line,
        outcome: scenario.outcome,
      })
      .please();
    const testCase = onlyCase(run.cases);
    const result = scenario.result();
    const stdout = collectingStream();
    const stderr = collectingStream();
    const reporter = new QuietReporter(
      { proofRecord: recordPath },
      { stdout, stderr },
    );
    beginReporter(reporter, run);
    scenario.drive(reporter, testCase, result);
    const end = await reporter.onEnd({
      status: scenario.runner,
      duration: 1,
      startTime: new Date(),
    });
    expect(end).toEqual({ status: "failed" });
    expect(stdout.text()).toContain(scenario.diagnostic);
    expect(stdout.text().trimEnd().split("\n").at(-1)).toBe(
      `Kept: ${shown(outputDir)}`,
    );
    const record = readProof(recordPath);
    expect(record).toMatchObject({
      phase: "completed",
      selectedCount: 1,
      terminal: { runnerStatus: scenario.runner, strictStatus: "failed" },
    });
    expect(record.tests[0]?.attempts).toMatchObject([
      { status: scenario.status },
    ]);
  });
}
