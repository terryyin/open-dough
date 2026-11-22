// Combine a dashboard group's two runners' reports without replacing
// Playwright's case identities, retry semantics, or file attribution. The
// existing CI producer reads the combined dashboard record once per shard.
import { relative, sep } from "node:path";

/**
 * @typedef {import("./proofRecordTypes.ts").DashboardProofRecord} ProofRecord
 * @typedef {import("./proofRecordTypes.ts").Selection} Selection
 * @typedef {{
 *   ancestorTitles: string[],
 *   fullName: string,
 *   title: string,
 *   status: "passed" | "failed" | "skipped" | "todo" | "pending",
 *   duration?: number,
 *   location?: { line: number, column: number },
 * }} VitestCase
 * @typedef {{
 *   name: string,
 *   status: "passed" | "failed",
 *   message: string,
 *   assertionResults: VitestCase[],
 * }} VitestFile
 * @typedef {{
 *   status: number | null,
 *   report?: { testResults: VitestFile[] },
 *   // Exact selected titles keyed by each absolute spec path, when known.
 *   selected?: ReadonlyMap<string, ReadonlySet<string>>,
 * }} VitestRun
 */

const outcome = {
  passed: "expected",
  failed: "unexpected",
  skipped: "skipped",
  todo: "skipped",
  pending: undefined,
};

/**
 * @param {VitestFile} file
 * @param {VitestCase} test
 * @param {number} index
 * @param {string} rootDir
 * @param {string} engine
 * @returns {Selection}
 */
function vitestSelection(file, test, index, rootDir, engine) {
  const spec = relative(rootDir, file.name).split(sep).join("/");
  const testId = JSON.stringify([engine, spec, index]);
  const observed = outcome[test.status];
  return {
    project: engine,
    location: { file: file.name, ...(test.location ?? { line: 0, column: 0 }) },
    titlePath: ["", engine, spec, ...test.ancestorTitles, test.title],
    executions: [
      {
        testId,
        repeatEachIndex: 0,
        expectedStatus: observed === "skipped" ? "skipped" : "passed",
        ...(observed === undefined ? {} : { outcome: observed }),
      },
    ],
    attempts:
      test.duration === undefined
        ? []
        : [
            {
              testId,
              repeatEachIndex: 0,
              retry: 0,
              durationMs: test.duration,
              ...(test.status === "passed" || test.status === "failed"
                ? { status: test.status }
                : {}),
            },
          ],
  };
}

/**
 * @param {VitestRun} vitestRun
 * @param {string} rootDir
 * @param {string} engine
 */
function vitestEvidence(vitestRun, rootDir, engine) {
  const files = vitestRun.report?.testResults;
  if (!Array.isArray(files)) {
    return {
      tests: [],
      failed: true,
      diagnostics: ["Vitest wrote no case report."],
    };
  }
  const diagnostics = [];
  const tests = [];
  const reported = new Map(
    files.map((file) => [
      file.name,
      new Set(file.assertionResults.map((test) => test.fullName)),
    ]),
  );
  for (const [file, titles] of vitestRun.selected ?? []) {
    const found = reported.get(file);
    if (found === undefined) {
      diagnostics.push(`Vitest reported no collection for ${file}.`);
      continue;
    }
    for (const title of titles) {
      if (!found.has(title)) {
        diagnostics.push(`Vitest reported no result for ${file} › ${title}.`);
      }
    }
  }
  let failed = false;
  for (const file of files) {
    const selected = vitestRun.selected?.get(file.name);
    const failedCase = file.assertionResults.some(
      (test) => test.status === "failed",
    );
    if (file.status === "failed" && (file.message || !failedCase)) {
      diagnostics.push(
        `${file.name}: ${file.message || "no case accounts for the file failure."}`,
      );
    } else if (
      file.assertionResults.length === 0 &&
      (vitestRun.selected === undefined || selected !== undefined)
    ) {
      diagnostics.push(`Vitest reported no cases for ${file.name}.`);
    }
    for (const [index, test] of file.assertionResults.entries()) {
      // Vitest includes deselected assertions with skipped status.
      if (vitestRun.selected !== undefined && !selected?.has(test.fullName)) {
        continue;
      }
      failed ||= test.status === "failed" || test.status === "pending";
      tests.push(vitestSelection(file, test, index, rootDir, engine));
    }
  }
  // A browser or setup error can fail the command after all known cases pass.
  if (vitestRun.status !== 0 && !failed && diagnostics.length === 0) {
    diagnostics.push(
      "Vitest failed without reporting a failed or unfinished case.",
    );
  }
  if (tests.length === 0 && diagnostics.length === 0) {
    diagnostics.push("Vitest reported no selected cases.");
  }
  return { tests, failed, diagnostics };
}

/**
 * Assembly runs once the selected runners have exited. An omitted runner was
 * never selected. A selected runner without complete collection evidence
 * returns a nonzero verdict and leaves an incomplete record for inspection;
 * the CI fragment reader refuses incomplete parts.
 *
 * @param {{
 *   playwright?: {status: number | null, record?: ProofRecord},
 *   vitestRun?: VitestRun,
 *   engine: string,
 *   run: ProofRecord["run"],
 *   finishedAt: string,
 * }} input
 * @returns {{ status: number, record: ProofRecord, diagnostics: string[] }}
 */
export function combineGroupProof({
  playwright,
  vitestRun,
  engine,
  run,
  finishedAt,
}) {
  const native = playwright?.record;
  const nativeStatus = playwright === undefined ? 0 : (playwright.status ?? 1);
  if (vitestRun === undefined && native?.phase === "completed") {
    return { status: nativeStatus, record: native, diagnostics: [] };
  }
  const diagnostics = [];
  if (playwright !== undefined && native?.phase !== "completed") {
    diagnostics.push("Playwright wrote no completed case report.");
  } else if (native?.tests.length === 0) {
    diagnostics.push("Playwright reported no selected cases.");
  }
  const vitest =
    vitestRun === undefined
      ? undefined
      : vitestEvidence(vitestRun, run.rootDir, engine);
  diagnostics.push(...(vitest?.diagnostics ?? []));
  const tests = [...(native?.tests ?? []), ...(vitest?.tests ?? [])];
  if (tests.length === 0 && diagnostics.length === 0) {
    diagnostics.push("No test case was reported.");
  }
  const status =
    nativeStatus ||
    (vitestRun === undefined ? 0 : (vitestRun.status ?? 1)) ||
    (vitest?.failed || diagnostics.length > 0 ? 1 : 0);
  const verdict = status === 0 ? "passed" : "failed";
  return {
    status,
    diagnostics,
    record: {
      schemaVersion: 1,
      run,
      phase: diagnostics.length === 0 ? "completed" : "incomplete",
      selectedCount: tests.length,
      tests,
      terminal: {
        runnerStatus:
          native?.terminal?.runnerStatus === "interrupted" ||
          native?.terminal?.runnerStatus === "timedout"
            ? native.terminal.runnerStatus
            : verdict,
        strictStatus: verdict,
        finishedAt,
        durationMs: Date.parse(finishedAt) - Date.parse(run.startedAt),
      },
    },
  };
}
