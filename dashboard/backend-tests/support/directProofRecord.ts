// Vitest helpers for direct ProofRecord / QuietReporter hook cases.
import { onTestFinished } from "vitest";
import type { FullConfig, Suite, TestCase } from "@playwright/test/reporter";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ProofRecord } from "../../test-support/support/proofRecord.ts";
import type { DashboardProofRecord } from "../../test-support/support/proofRecordTypes.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";

export const proofFixtures = path.join(
  repoRoot,
  "dashboard/test-support/fixtures/quiet-reporter",
);

export function temporaryProof(prefix = "dashboard-proof-record-"): {
  directory: string;
  recordPath: string;
  outputDir: string;
} {
  const directory = mkdtempSync(path.join(tmpdir(), prefix));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return {
    directory,
    recordPath: path.join(directory, "proof-record.json"),
    outputDir: path.join(directory, "test-results"),
  };
}

export function readProof(file: string): DashboardProofRecord {
  return JSON.parse(readFileSync(file, "utf8")) as DashboardProofRecord;
}

export function onlyCase(cases: TestCase[]): TestCase {
  const [selected] = cases;
  if (selected === undefined) throw new Error("expected one selected case");
  return selected;
}

// MakeMe's JSDoc FullConfig erases to FullConfig<any, any>; ProofRecord wants {}.
export function openProof(
  destination: string,
  run: { config: unknown; suite: Suite },
): ProofRecord {
  return new ProofRecord(
    destination,
    run.config as FullConfig,
    run.suite,
    () => {},
  );
}
