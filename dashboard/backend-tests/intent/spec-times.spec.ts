// SpecTimes attribution: summed seconds per enclosing file suite, longest
// first under rootDir, shared hooks once, listings write nothing.
import { expect, test } from "vitest";
import type { TestCase } from "@playwright/test/reporter";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { SpecTimes } from "../../test-support/support/specTimes.ts";
import {
  asFullConfig,
  proofFixtures,
  temporaryProof,
} from "../support/directProofRecord.ts";

type Line = { seconds: string; file: string };

function bytewise(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

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

function fixture(...parts: string[]): string {
  return path.join(proofFixtures, ...parts);
}

function openTimes(
  destination: string,
  cases: Array<{
    title: string;
    file: string;
    locationFile?: string;
    line?: number;
  }>,
  argv: string[] = [],
): { times: SpecTimes; cases: TestCase[] } {
  const run = makeMe.aReporterRun
    .withRootDir(proofFixtures)
    .withArgv(argv)
    .withConfigFile(path.join(proofFixtures, "unused.config.ts"))
    .holdingCases(cases)
    .please();
  return {
    times: new SpecTimes(destination, asFullConfig(run.config), () => {}),
    cases: run.cases,
  };
}

test("a run lists each spec file's summed seconds, longest first, by path under rootDir", () => {
  const { directory } = temporaryProof();
  const timesPath = path.join(directory, "times.txt");
  const waiting = fixture("nested", "waiting.proof.ts");
  const passing = fixture("passing.proof.ts");
  const selection = fixture("selection.proof.ts");
  const { times, cases: selected } = openTimes(timesPath, [
    { title: "waits 700ms", file: waiting, line: 3 },
    { title: "waits 500ms", file: waiting, line: 6 },
    { title: "adds quietly", file: passing, line: 3 },
    { title: "selected alpha", file: selection, line: 5 },
  ]);
  const [wait700, wait500, pass, select] = selected;
  if (!wait700 || !wait500 || !pass || !select)
    throw new Error("expected four cases");
  times.add(wait700, makeMe.aReporterResult.lasting(700).please());
  times.add(wait500, makeMe.aReporterResult.lasting(500).please());
  times.add(pass, makeMe.aReporterResult.lasting(40).please());
  times.add(select, makeMe.aReporterResult.lasting(80).please());
  times.write();
  const lines = timesLines(timesPath);
  expect(lines.map((line) => line.file).sort(bytewise)).toEqual([
    "nested/waiting.proof.ts",
    "passing.proof.ts",
    "selection.proof.ts",
  ]);
  expect(lines[0]).toEqual({ seconds: "1.2", file: "nested/waiting.proof.ts" });
  expect(lines).toEqual(
    [...lines].sort(
      (left, right) =>
        Number(right.seconds) - Number(left.seconds) ||
        bytewise(left.file, right.file),
    ),
  );
  expect(new Map(lines.map((line) => [line.file, line.seconds]))).toEqual(
    new Map([
      ["nested/waiting.proof.ts", "1.2"],
      ["selection.proof.ts", "0.1"],
      ["passing.proof.ts", "0.0"],
    ]),
  );
});

test("tests registered from an imported case module count under the spec file that ran them", () => {
  const { directory } = temporaryProof();
  const timesPath = path.join(directory, "times.txt");
  const importing = fixture("nested", "importing.proof.ts");
  const casesModule = fixture("nested", "cases.ts");
  const passing = fixture("passing.proof.ts");
  const { times, cases: selected } = openTimes(timesPath, [
    { title: "own test", file: importing, line: 7 },
    {
      title: "imported 300ms",
      file: importing,
      locationFile: casesModule,
      line: 4,
    },
    {
      title: "imported 200ms",
      file: importing,
      locationFile: casesModule,
      line: 8,
    },
    { title: "adds quietly", file: passing, line: 3 },
  ]);
  const [own, imported300, imported200, pass] = selected;
  if (!own || !imported300 || !imported200 || !pass)
    throw new Error("expected four cases");
  expect(imported300.location.file).toBe(casesModule);
  expect(imported300.parent.type).toBe("file");
  expect(imported300.parent.location?.file).toBe(importing);
  times.add(own, makeMe.aReporterResult.lasting(10).please());
  times.add(imported300, makeMe.aReporterResult.lasting(300).please());
  times.add(imported200, makeMe.aReporterResult.lasting(200).please());
  times.add(pass, makeMe.aReporterResult.lasting(40).please());
  times.write();
  const lines = timesLines(timesPath);
  expect(lines.map((line) => line.file).sort(bytewise)).toEqual([
    "nested/importing.proof.ts",
    "passing.proof.ts",
  ]);
  expect(lines[0]).toEqual({
    seconds: "0.5",
    file: "nested/importing.proof.ts",
  });
  expect(lines.some((line) => line.file.includes("cases.ts"))).toBe(false);
});

test("a failed run still writes the times of what completed", () => {
  const { directory } = temporaryProof();
  const timesPath = path.join(directory, "times.txt");
  const failing = fixture("failing.proof.ts");
  const passing = fixture("passing.proof.ts");
  const { times, cases: selected } = openTimes(timesPath, [
    { title: "fails", file: failing, line: 3 },
    { title: "adds quietly", file: passing, line: 3 },
  ]);
  const [fail, pass] = selected;
  if (!fail || !pass) throw new Error("expected two cases");
  times.add(
    fail,
    makeMe.aReporterResult.withStatus("failed").lasting(55).please(),
  );
  times.add(pass, makeMe.aReporterResult.lasting(40).please());
  times.write();
  expect(
    timesLines(timesPath)
      .map((line) => line.file)
      .sort(bytewise),
  ).toEqual(["failing.proof.ts", "passing.proof.ts"]);
});

test("a listing runs no test and writes no times file", () => {
  const { directory } = temporaryProof();
  const timesPath = path.join(directory, "times.txt");
  const { times } = openTimes(
    timesPath,
    [{ title: "adds quietly", file: fixture("passing.proof.ts"), line: 3 }],
    ["--list"],
  );
  times.write();
  expect(existsSync(timesPath)).toBe(false);
});

test("serial file hooks contribute once while test-scoped hooks stay inside each attempt", () => {
  const { directory } = temporaryProof();
  const timesPath = path.join(directory, "times.txt");
  const file = fixture("shared-hooks.proof.ts");
  const { times, cases: selected } = openTimes(timesPath, [
    { title: "first test with shared hooks", file, line: 19 },
    { title: "second test with shared hooks", file, line: 22 },
  ]);
  const [first, second] = selected;
  if (!first || !second) throw new Error("expected two cases");
  // Attempt durations already include beforeEach/afterEach (100+100 each).
  const firstAttempt = makeMe.aReporterResult.lasting(200).please();
  const secondAttempt = makeMe.aReporterResult.lasting(200).please();
  const beforeAll = makeMe.aReporterStep
    .inCategory("hook")
    .titled("beforeAll hook")
    .lasting(200)
    .please();
  const afterAll = makeMe.aReporterStep
    .inCategory("hook")
    .titled("afterAll hook")
    .lasting(300)
    .please();
  const beforeEach = makeMe.aReporterStep
    .inCategory("hook")
    .titled("beforeEach hook")
    .lasting(100)
    .please();
  times.addSharedHook(first, beforeAll);
  times.addSharedHook(first, beforeEach);
  times.add(first, firstAttempt);
  times.addSharedHook(second, beforeEach);
  times.add(second, secondAttempt);
  times.addSharedHook(second, afterAll);
  times.write();
  expect(timesLines(timesPath)).toEqual([
    { seconds: "0.9", file: "shared-hooks.proof.ts" },
  ]);
});
