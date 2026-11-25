import { expect, test } from "vitest";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  onlyCase,
  openProof,
  proofFixtures,
  readProof,
  temporaryProof,
} from "../support/directProofRecord.ts";

test("a filtered quiet run retains its actual selection and attempts after cleanup", () => {
  const { directory, recordPath } = temporaryProof();
  const file = path.join(proofFixtures, "selection.proof.ts");
  const run = makeMe.aReporterRun
    .withOutputDir(path.join(directory, "test-results"))
    .withArgv(["--grep", "selected alpha"])
    .withConfigFile(path.join(directory, "config.ts"))
    .withRootDir(repoRoot)
    .holdingCase({ title: "selected alpha", file, line: 5 })
    .please();
  const selected = onlyCase(run.cases);
  const attempt = makeMe.aReporterResult.withStatus("passed").please();
  const proof = openProof(recordPath, run);
  proof.begin(selected, attempt);
  proof.end(selected, attempt);
  proof.finish(
    { status: "passed", duration: 1, startTime: new Date() },
    "passed",
  );
  const record = readProof(recordPath);
  expect(record).toMatchObject({
    schemaVersion: 1,
    phase: "completed",
    selectedCount: 1,
    run: {
      configFile: path.join(directory, "config.ts"),
      cwd: path.resolve(repoRoot),
      listing: false,
    },
    terminal: { runnerStatus: "passed", strictStatus: "passed" },
  });
  expect(record.tests).toHaveLength(1);
  expect(record.tests[0]).toMatchObject({
    project: "proof-fixtures",
    location: { file, line: 5 },
    titlePath: ["", "proof-fixtures", file, "selected alpha"],
    attempts: [{ status: "passed", retry: 0, repeatEachIndex: 0 }],
  });
  expect(record.tests[0]?.executions[0]?.testId).toBe(
    record.tests[0]?.attempts[0]?.testId,
  );
  expect(record.run.argv).toContain("selected alpha");
});

test("listing retains selection without representing completed executed proof", () => {
  const { directory, recordPath } = temporaryProof();
  const file = path.join(proofFixtures, "passing.proof.ts");
  const run = makeMe.aReporterRun
    .withOutputDir(path.join(directory, "test-results"))
    .withArgv(["--list"])
    .withConfigFile(path.join(directory, "config.ts"))
    .withRootDir(repoRoot)
    .holdingCase({ title: "adds quietly", file, line: 3 })
    .please();
  const proof = openProof(recordPath, run);
  proof.finish(
    { status: "passed", duration: 1, startTime: new Date() },
    "passed",
  );
  const record = readProof(recordPath);
  expect(record).toMatchObject({
    phase: "listed",
    selectedCount: 1,
    run: { listing: true },
    terminal: { runnerStatus: "passed", strictStatus: "passed" },
  });
  expect(record.tests[0]?.attempts).toEqual([]);
});

test("repetitions and skips remain separate from the selected test count", () => {
  const { directory, recordPath } = temporaryProof();
  const passing = path.join(proofFixtures, "passing.proof.ts");
  const skipped = path.join(proofFixtures, "skipped.proof.ts");
  const run = makeMe.aReporterRun
    .withOutputDir(path.join(directory, "test-results"))
    .withArgv(["--repeat-each", "2"])
    .withConfigFile(path.join(directory, "config.ts"))
    .withRootDir(repoRoot)
    .holdingCases([
      {
        title: "adds quietly",
        file: passing,
        line: 3,
        id: "pass-0",
        repeatEachIndex: 0,
      },
      {
        title: "adds quietly",
        file: passing,
        line: 3,
        id: "pass-1",
        repeatEachIndex: 1,
      },
      {
        title: "does not execute an assertion",
        file: skipped,
        line: 3,
        id: "skip-0",
        repeatEachIndex: 0,
        expectedStatus: "skipped",
        outcome: "skipped",
      },
      {
        title: "does not execute an assertion",
        file: skipped,
        line: 3,
        id: "skip-1",
        repeatEachIndex: 1,
        expectedStatus: "skipped",
        outcome: "skipped",
      },
    ])
    .please();
  const proof = openProof(recordPath, run);
  for (const testCase of run.cases) {
    const attempt = makeMe.aReporterResult
      .withStatus(testCase.expectedStatus === "skipped" ? "skipped" : "passed")
      .please();
    proof.begin(testCase, attempt);
    proof.end(testCase, attempt);
  }
  proof.finish(
    { status: "passed", duration: 1, startTime: new Date() },
    "passed",
  );
  const record = readProof(recordPath);
  expect(record.selectedCount).toBe(2);
  expect(record.tests).toHaveLength(2);
  for (const selected of record.tests) {
    expect(selected.executions).toHaveLength(2);
    expect(selected.attempts).toHaveLength(2);
    expect(
      selected.attempts.map((attempt) => attempt.repeatEachIndex).sort(),
    ).toEqual([0, 1]);
  }
  expect(
    record.tests
      .find((selected) => selected.location.file.endsWith("skipped.proof.ts"))
      ?.attempts.map((attempt) => attempt.status),
  ).toEqual(["skipped", "skipped"]);
  expect(
    record.tests
      .find((selected) => selected.location.file.endsWith("passing.proof.ts"))
      ?.attempts.map((attempt) => attempt.status),
  ).toEqual(["passed", "passed"]);
});

test("a retry adds an attempt without inflating selection or weakening strict failure", () => {
  const { directory, recordPath } = temporaryProof();
  const file = path.join(proofFixtures, "retried.proof.ts");
  const run = makeMe.aReporterRun
    .withOutputDir(path.join(directory, "test-results"))
    .withConfigFile(path.join(directory, "config.ts"))
    .withRootDir(repoRoot)
    .holdingCase({
      title: "passes only on its retry",
      file,
      line: 4,
      retries: 1,
      outcome: "flaky",
    })
    .please();
  const testCase = onlyCase(run.cases);
  const first = makeMe.aReporterResult.withStatus("failed").please();
  const second = makeMe.aReporterResult
    .withStatus("passed")
    .retried(1)
    .please();
  const proof = openProof(recordPath, run);
  proof.begin(testCase, first);
  proof.end(testCase, first);
  proof.begin(testCase, second);
  proof.end(testCase, second);
  proof.finish(
    { status: "passed", duration: 1, startTime: new Date() },
    "failed",
  );
  const record = readProof(recordPath);
  expect(record.selectedCount).toBe(1);
  expect(
    record.tests[0]?.attempts.map((attempt) => [attempt.retry, attempt.status]),
  ).toEqual([
    [0, "failed"],
    [1, "passed"],
  ]);
  expect(record.terminal?.strictStatus).toBe("failed");
});

test("overlapping filtered invocations retain their own selection and identity", () => {
  const firstDir = temporaryProof();
  const secondDir = temporaryProof();
  const file = path.join(proofFixtures, "selection.proof.ts");
  const records = (
    [
      ["selected alpha", firstDir],
      ["unselected beta", secondDir],
    ] as const
  ).map(([title, { directory, recordPath }]) => {
    const run = makeMe.aReporterRun
      .withOutputDir(path.join(directory, "test-results"))
      .withArgv(["--grep", title])
      .withConfigFile(path.join(directory, "config.ts"))
      .withRootDir(repoRoot)
      .holdingCase({ title, file, line: 5 })
      .please();
    const selected = onlyCase(run.cases);
    const attempt = makeMe.aReporterResult.withStatus("passed").please();
    const proof = openProof(recordPath, run);
    proof.begin(selected, attempt);
    proof.end(selected, attempt);
    proof.finish(
      { status: "passed", duration: 1, startTime: new Date() },
      "passed",
    );
    return readProof(recordPath);
  });
  expect(records[0]?.run.id).not.toBe(records[1]?.run.id);
  expect(records.map((record) => record.tests[0]?.titlePath.at(-1))).toEqual([
    "selected alpha",
    "unselected beta",
  ]);
  for (const record of records)
    expect(record).toMatchObject({
      selectedCount: 1,
      terminal: { strictStatus: "passed" },
    });
});
