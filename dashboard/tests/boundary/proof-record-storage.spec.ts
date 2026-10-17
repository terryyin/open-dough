import { expect, test } from "../support/pageTest.ts";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  proofDirectory,
  proofFixtures,
  readProof,
  removeProofDirectories,
  startProofRun,
} from "../support/proofRecordRun.ts";

test.afterAll(removeProofDirectories);

test("an alias into an existing disposable output directory is refused", async () => {
  const directory = proofDirectory();
  const outputDir = path.join(directory, "test-results");
  const alias = path.join(directory, "output-alias");
  mkdirSync(outputDir);
  symlinkSync(outputDir, alias, "dir");
  const recordPath = path.join(alias, "proof.json");
  const run = startProofRun({
    directory,
    recordPath,
    spec: "passing.proof.ts",
    config: {
      globalSetup: path.join(proofFixtures, "outputDirectorySetup.ts"),
    },
  });
  const result = await run.result;
  expect(result).toMatchObject({ status: 0, stdout: "" });
  expect(result.stderr).toContain("outside every disposable output directory");
  expect(existsSync(recordPath)).toBe(false);
  expect(existsSync(outputDir)).toBe(false);
});

test("an existing path remains byte-for-byte unchanged without changing the test verdict", async () => {
  const directory = proofDirectory();
  const recordPath = path.join(directory, "proof.json");
  const before = "existing caller-owned evidence\n";
  writeFileSync(recordPath, before);
  const run = startProofRun({
    directory,
    recordPath,
    spec: "passing.proof.ts",
  });
  const result = await run.result;
  expect(result).toMatchObject({ status: 0, stdout: "" });
  expect(result.stderr).toContain(`Proof record unavailable at ${recordPath}:`);
  expect(readFileSync(recordPath, "utf8")).toBe(before);
  expect(existsSync(run.outputDir)).toBe(false);
});

test("invalid and disposable destinations report recording unavailability with the underlying verdict", async () => {
  const directory = proofDirectory();
  const blockedParent = path.join(directory, "regular-file");
  writeFileSync(blockedParent, "a file cannot contain a record");
  const cases = [
    { recordPath: "relative-proof.json", spec: "passing.proof.ts", status: 0 },
    {
      recordPath: path.join(directory, "missing", "proof.json"),
      spec: "failing.proof.ts",
      status: 1,
    },
    {
      recordPath: path.join(blockedParent, "proof.json"),
      spec: "passing.proof.ts",
      status: 0,
    },
    {
      recordPath: path.join(directory, "test-results", "proof.json"),
      spec: "passing.proof.ts",
      status: 0,
    },
  ];
  for (const entry of cases) {
    const run = startProofRun({ directory, ...entry });
    const result = await run.result;
    expect(result.status).toBe(entry.status);
    expect(result.stderr).toContain("Proof record unavailable at");
    expect(existsSync(entry.recordPath)).toBe(false);
  }
});

test("a controlled snapshot write failure leaves incomplete evidence and the original passed verdict", async () => {
  const directory = proofDirectory();
  const recordPath = path.join(directory, "proof.json");
  const run = startProofRun({
    directory,
    spec: "record-write-failure.proof.ts",
    env: { PROOF_WRITE_FAILURE_PATH: recordPath },
  });
  const result = await run.result;
  expect(result).toMatchObject({ status: 0, stdout: "" });
  expect(result.stderr).toContain("Proof record unavailable at");
  const record = readProof(recordPath);
  expect(record.phase).toBe("running");
  expect(record.terminal).toBeUndefined();
  expect(record.tests[0]?.attempts[0]?.status).toBeUndefined();
  expect(existsSync(run.outputDir)).toBe(false);
  const obstructing = `${recordPath}.${record.run.id}.tmp`;
  expect(readFileSync(obstructing, "utf8")).toBe("reserved by the fixture");
});

test("ordinary repeated runs add no proof store or passing output directories", async () => {
  const directory = proofDirectory();
  for (let index = 0; index < 2; index++) {
    const run = startProofRun({
      directory,
      spec: "passing.proof.ts",
      recordPath: false,
    });
    expect(await run.result).toMatchObject({
      status: 0,
      stdout: "",
      stderr: "",
    });
    expect(readdirSync(directory)).toEqual(["playwright.config.mjs"]);
  }
});
