// A CI proof summary made as CI makes it, from raw runner reports: each
// producer's report is written to a file and converted by the collector's own
// command line (`fragment`, ../../../src/skills/dough-test-optimization/
// scripts/ci-proof-summary.mjs), then `summarize` collects the fragments
// against the declared parts. The summary's actual serialized text is kept,
// so a journey serves those bytes, not a re-encoding of them. Playwright
// reports are dashboard proof records (../proof-record.md) whose test
// locations are absolute paths under the record's run directory.

import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { OriginAnswer } from "../originAnswers.ts";
import type { ProofRun } from "./ciProofArtifacts.ts";
import { zipOf } from "./ciProofArtifacts.ts";

const cli = fileURLToPath(
  new URL(
    "../../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs",
    import.meta.url,
  ),
);

// The directory a CI runner checked the repository out into.
export const runnerCheckout = "/home/runner/work/open-dough/open-dough";

// One Playwright test in a record: its repository file, its outcome, and its
// finished attempts' durations (none: it recorded no duration).
export type RecordedTest = readonly [
  file: string,
  outcome: "expected" | "unexpected" | "flaky" | "skipped",
  durations: readonly number[],
];

// A completed dashboard proof record run from `runnerCheckout`.
export function playwrightRecord(tests: readonly RecordedTest[]): unknown {
  return {
    schemaVersion: 1,
    run: {
      id: "run",
      cwd: runnerCheckout,
      rootDir: `${runnerCheckout}/dashboard/tests`,
    },
    phase: "completed",
    selectedCount: tests.length,
    tests: tests.map(([file, outcome, durations], index) => ({
      project: "chromium",
      location: { file: `${runnerCheckout}/${file}`, line: 3, column: 1 },
      titlePath: ["", "chromium", file, `test ${String(index)}`],
      executions: [{ testId: `t${String(index)}`, outcome }],
      attempts: durations.map((durationMs, retry) => ({
        testId: `t${String(index)}`,
        retry,
        status: "passed",
        durationMs,
      })),
    })),
  };
}

// One job part's report: a Playwright record for one entry, or outcomes
// (`<status>\t<check>` lines) with optional times for several.
export type Producer = {
  readonly entries: readonly string[];
  readonly part: number;
  readonly of: number;
  // Whether the part's fragment is broken down by file (`--by-file`).
  readonly byFile: boolean;
} & (
  | { readonly record: unknown }
  | { readonly outcomes: string; readonly times?: string }
);

// The summary text `summarize` writes for RUN from PRODUCERS' fragments,
// declaring EXPECT.
export function collectedSummary(
  run: ProofRun,
  expect: readonly (readonly [string, number])[],
  producers: readonly Producer[],
): string {
  const directory = mkdtempSync(join(tmpdir(), "ci-proof-collected-"));
  try {
    const fragments = join(directory, "fragments");
    for (const [index, producer] of producers.entries()) {
      const at = (name: string) => join(directory, `${String(index)}-${name}`);
      const report: string[] = [];
      if ("record" in producer) {
        writeFileSync(at("record.json"), JSON.stringify(producer.record));
        report.push("--playwright-record", at("record.json"));
      } else {
        writeFileSync(at("outcomes.txt"), producer.outcomes);
        report.push("--outcomes", at("outcomes.txt"));
        if (producer.times !== undefined) {
          writeFileSync(at("times.txt"), producer.times);
          report.push("--times", at("times.txt"));
        }
      }
      const out = join(fragments, `producer-${String(index)}`);
      mkdirSync(out, { recursive: true });
      runCli(
        "fragment",
        ...report,
        ...(producer.byFile ? ["--by-file"] : []),
        ...producer.entries.flatMap((entry) => ["--entry", entry]),
        "--part",
        String(producer.part),
        "--of",
        String(producer.of),
        "--attempt",
        String(run.attempt),
        "--revision",
        run.revision,
        "--out",
        out,
      );
    }
    const summary = join(directory, "summary.json");
    runCli(
      "summarize",
      "--fragments",
      fragments,
      ...expect.flatMap(([entry, parts]) => [
        "--expect",
        `${entry}=${String(parts)}`,
      ]),
      "--repository",
      run.repository,
      "--run-id",
      String(run.runId),
      "--attempt",
      String(run.attempt),
      "--revision",
      run.revision,
      "--out",
      summary,
    );
    return readFileSync(summary, "utf8");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function runCli(...args: string[]) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
  });
  if (result.status !== 0)
    throw new Error(
      `ci-proof-summary ${args[0] ?? ""} failed: ${result.stderr}`,
    );
}

// The summary artifact's zip holding TEXT exactly, as GitHub serves it.
export function summaryTextZipAnswer(text: string): OriginAnswer {
  return {
    status: 200,
    contentType: "application/zip",
    encoding: "base64",
    body: zipOf("ci-proof-summary.json", text).toString("base64"),
  };
}
