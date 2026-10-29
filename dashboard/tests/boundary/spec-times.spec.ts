// The per-spec-file times a run writes when OPEN_DOUGH_DASHBOARD_TIMES names
// a file (support/specTimes.ts): the form, the order, the per-file sum, and
// that a failed run still writes it while a listing does not.
import { expect, test } from "../support/pageTest.ts";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  proofDirectory,
  proofFixtures,
  quietReporter,
  readProof,
  removeProofDirectories,
  startProofRun,
} from "../support/proofRecordRun.ts";
import type { DashboardProofRecord } from "../support/proofRecordTypes.ts";

test.afterAll(removeProofDirectories);

type Line = { seconds: string; file: string };

function bytewise(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

// Each line of the times file as `<seconds><TAB><file>`, seconds to a tenth.
function timesLines(timesPath: string): Line[] {
  const text = readFileSync(timesPath, "utf8");
  expect(text.endsWith("\n")).toBe(true);
  return text
    .slice(0, -1)
    .split("\n")
    .map((line) => {
      const match = /^([0-9]+\.[0-9])\t([^\t]+)$/.exec(line);
      if (!match?.[1] || !match[2])
        throw new Error(`${JSON.stringify(line)} is not <seconds><TAB><file>`);
      return { seconds: match[1], file: match[2] };
    });
}

// What the proof record says each spec file should show: the sum of its
// attempts' durations, to a tenth, under its path relative to the testDir.
// The spec file is the file suite's title (titlePath[2], after the root and
// project titles), not the test's own location, which a case module owns for
// the tests it registers.
function recordedSeconds(record: DashboardProofRecord): Map<string, string> {
  const totals = new Map<string, number>();
  for (const selected of record.tests) {
    const file = selected.titlePath[2];
    if (file === undefined) throw new Error("a test without a file suite");
    const attempts = selected.attempts.reduce(
      (sum, attempt) => sum + (attempt.durationMs ?? 0),
      0,
    );
    totals.set(file, (totals.get(file) ?? 0) + attempts);
  }
  return new Map(
    [...totals].map(([file, total]) => [file, (total / 1000).toFixed(1)]),
  );
}

function expectTimesToMatchRecord(
  lines: Line[],
  record: DashboardProofRecord,
): void {
  expect(new Map(lines.map((line) => [line.file, line.seconds]))).toEqual(
    recordedSeconds(record),
  );
}

test("a run lists each spec file's summed seconds, longest first, by its path under the testDir", async () => {
  const directory = proofDirectory();
  const timesPath = path.join(directory, "times.txt");
  const run = startProofRun({
    directory,
    timesPath,
    spec: ["passing.proof.ts", "selection.proof.ts", "nested/waiting.proof.ts"],
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  expect(existsSync(run.outputDir)).toBe(false);
  const lines = timesLines(timesPath);
  expect(lines.map((line) => line.file).sort(bytewise)).toEqual([
    "nested/waiting.proof.ts",
    "passing.proof.ts",
    "selection.proof.ts",
  ]);
  // Longest first, ahead of the bytewise order the others tie into; its two
  // waits (700 and 500 ms) are summed, not taken as the longer one.
  expect(lines[0]?.file).toBe("nested/waiting.proof.ts");
  expect(Number(lines[0]?.seconds)).toBeGreaterThanOrEqual(1.2);
  expect(lines).toEqual(
    [...lines].sort(
      (left, right) =>
        Number(right.seconds) - Number(left.seconds) ||
        bytewise(left.file, right.file),
    ),
  );
  expectTimesToMatchRecord(lines, readProof(run.recordPath));
});

test("tests registered from an imported case module count under the spec file that ran them", async () => {
  const directory = proofDirectory();
  const timesPath = path.join(directory, "times.txt");
  const run = startProofRun({
    directory,
    timesPath,
    spec: ["nested/importing.proof.ts", "passing.proof.ts"],
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const lines = timesLines(timesPath);
  expect(lines.map((line) => line.file).sort(bytewise)).toEqual([
    "nested/importing.proof.ts",
    "passing.proof.ts",
  ]);
  // The imported cases' waits (300 and 200 ms) are in the importing spec's
  // sum, and the case module itself has no line.
  expect(lines[0]?.file).toBe("nested/importing.proof.ts");
  expect(Number(lines[0]?.seconds)).toBeGreaterThanOrEqual(0.5);
  const record = readProof(run.recordPath);
  expect(
    record.tests.filter((selected) =>
      selected.location.file.endsWith("nested/cases.ts"),
    ),
  ).toHaveLength(2);
  expectTimesToMatchRecord(lines, record);
});

test("a failed run still writes the times of what completed", async () => {
  const directory = proofDirectory();
  const timesPath = path.join(directory, "times.txt");
  const run = startProofRun({
    directory,
    timesPath,
    spec: ["failing.proof.ts", "passing.proof.ts"],
  });
  const result = await run.result;
  expect(result.status).toBe(1);
  expect(result.stdout).toContain("FAIL:");
  const lines = timesLines(timesPath);
  expect(lines.map((line) => line.file).sort(bytewise)).toEqual([
    "failing.proof.ts",
    "passing.proof.ts",
  ]);
  expectTimesToMatchRecord(lines, readProof(run.recordPath));
});

test("a listing runs no test and writes no times file", async () => {
  const directory = proofDirectory();
  const timesPath = path.join(directory, "times.txt");
  const run = startProofRun({
    directory,
    timesPath,
    spec: "passing.proof.ts",
    args: ["--list"],
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  expect(existsSync(timesPath)).toBe(false);
  expect(readProof(run.recordPath).phase).toBe("listed");
});

test("serial file hooks contribute once while test-scoped hooks stay inside each attempt", async () => {
  const directory = proofDirectory();
  const timesPath = path.join(directory, "times.txt");
  const recordPath = path.join(directory, "proof.json");
  const hooksPath = path.join(directory, "hooks.json");
  const run = startProofRun({
    directory,
    timesPath,
    recordPath,
    spec: "shared-hooks.proof.ts",
    config: {
      reporter: [
        [quietReporter, { proofRecord: recordPath, times: timesPath }],
        [
          path.join(proofFixtures, "hookReporter.ts"),
          { destination: hooksPath },
        ],
      ],
    },
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const record = readProof(recordPath);
  expect(record.selectedCount).toBe(2);
  const hooks = JSON.parse(readFileSync(hooksPath, "utf8")) as {
    title: string;
    duration: number;
  }[];
  const shared = hooks.filter((hook) =>
    ["beforeAll hook", "afterAll hook"].includes(hook.title),
  );
  expect(shared.map((hook) => hook.title)).toEqual([
    "beforeAll hook",
    "afterAll hook",
  ]);
  expect(hooks.filter((hook) => hook.title === "beforeEach hook")).toHaveLength(
    2,
  );
  expect(hooks.filter((hook) => hook.title === "afterEach hook")).toHaveLength(
    2,
  );
  const attempts = record.tests.flatMap((selected) => selected.attempts);
  const attemptMs = attempts.reduce(
    (total, attempt) => total + (attempt.durationMs ?? 0),
    0,
  );
  const sharedMs = shared.reduce((total, hook) => total + hook.duration, 0);
  expect(sharedMs).toBeGreaterThanOrEqual(500);
  expect(attemptMs).toBeGreaterThanOrEqual(400);
  expect(timesLines(timesPath)).toEqual([
    {
      seconds: ((attemptMs + sharedMs) / 1000).toFixed(1),
      file: "shared-hooks.proof.ts",
    },
  ]);
});
