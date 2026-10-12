import { expect, test } from "./support/pageTest.ts";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "./support/repositoryRoot.ts";
import {
  proofDirectory,
  proofFixtures,
  readProof,
  removeProofDirectories,
  startProofRun,
} from "./support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

test("a filtered quiet run retains its actual selection and attempts after cleanup", async () => {
  const directory = proofDirectory();
  const log = path.join(directory, "executed.txt");
  const run = startProofRun({
    directory,
    spec: "selection.proof.ts",
    args: ["--grep", "selected alpha"],
    env: { PROOF_EXECUTION_LOG: log },
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  expect(existsSync(run.outputDir)).toBe(false);
  expect(readFileSync(log, "utf8")).toBe("selected alpha\n");
  const record = readProof(run.recordPath);
  expect(record).toMatchObject({
    schemaVersion: 1,
    phase: "completed",
    selectedCount: 1,
    run: {
      configFile: run.configFile,
      cwd: path.resolve(repoRoot),
      listing: false,
    },
    terminal: { runnerStatus: "passed", strictStatus: "passed" },
  });
  expect(record.tests).toHaveLength(1);
  expect(record.tests[0]).toMatchObject({
    project: "proof-fixtures",
    location: { file: path.join(proofFixtures, "selection.proof.ts"), line: 5 },
    titlePath: ["", "proof-fixtures", "selection.proof.ts", "selected alpha"],
    attempts: [{ status: "passed", retry: 0, repeatEachIndex: 0 }],
  });
  expect(record.tests[0]?.executions[0]?.testId).toBe(
    record.tests[0]?.attempts[0]?.testId,
  );
  expect(record.run.argv).toContain("selected alpha");
});

test("listing retains selection without representing completed executed proof", async () => {
  const run = startProofRun({ spec: "passing.proof.ts", args: ["--list"] });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const record = readProof(run.recordPath);
  expect(record).toMatchObject({
    phase: "listed",
    selectedCount: 1,
    run: { listing: true },
    terminal: { runnerStatus: "passed", strictStatus: "passed" },
  });
  expect(record.tests[0]?.attempts).toEqual([]);
});

test("repetitions and skips remain separate from the selected test count", async () => {
  const run = startProofRun({
    spec: ["passing.proof.ts", "skipped.proof.ts"],
    args: ["--repeat-each", "2"],
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const record = readProof(run.recordPath);
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

test("a retry adds an attempt without inflating selection or weakening strict failure", async () => {
  const run = startProofRun({
    spec: "retried.proof.ts",
    config: { retries: 1 },
  });
  expect((await run.result).status).toBe(1);
  const record = readProof(run.recordPath);
  expect(record.selectedCount).toBe(1);
  expect(
    record.tests[0]?.attempts.map((attempt) => [attempt.retry, attempt.status]),
  ).toEqual([
    [0, "failed"],
    [1, "passed"],
  ]);
  expect(record.terminal?.strictStatus).toBe("failed");
});

test("overlapping filtered invocations retain their own selection and identity", async () => {
  const first = startProofRun({
    spec: "selection.proof.ts",
    args: ["--grep", "selected alpha"],
  });
  const second = startProofRun({
    spec: "selection.proof.ts",
    args: ["--grep", "unselected beta"],
  });
  for (const result of await Promise.all([first.result, second.result])) {
    expect(result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  }
  const records = [readProof(first.recordPath), readProof(second.recordPath)];
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
