// A nested run of one test-preparation-budget fixture spec under a group
// runner's own global setup, with readers for what it records: the run
// artifact trace, every case's fixture steps (fixtureSteps.mjs) and what each
// case reports (reportCase.ts).
import path from "node:path";
import { appendedFileRecords } from "../../test-support/support/appendedRecords.ts";
import { expect } from "../../test-support/support/pageTest.ts";
import {
  proofDirectory,
  quietReporter,
  readProof,
  startProofRun,
} from "../../test-support/support/proofRecordRun.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";

export const preparationFixtures = path.join(
  repoRoot,
  "dashboard/test-support/fixtures/test-preparation-budget",
);

type Trace = { event: string; key: string; at: number };
type FixtureStep = {
  event: "fixture";
  case: string;
  title: string;
  start: number;
  end: number;
};
type Step =
  | { event: "case"; title: string; at: number }
  | FixtureStep
  | { event: "end"; title: string; duration: number; status: string };
type ReportedCase = {
  title: string;
  host: string;
  origin: string;
  branches: string[];
  tree: string[];
  revisions: string[];
  mainIsLast: boolean;
};

export function startPreparationProofRun(options: {
  spec: string;
  // A global setup file in dashboard/test-support/support.
  setup: string;
  env?: Readonly<Record<string, string>>;
}) {
  const directory = proofDirectory();
  const file = (name: string) => path.join(directory, name);
  const recordPath = file("proof.json");
  const run = startProofRun({
    directory,
    recordPath,
    spec: options.spec,
    config: {
      testDir: preparationFixtures,
      workers: 1,
      globalSetup: path.join(
        repoRoot,
        "dashboard/test-support/support",
        options.setup,
      ),
      reporter: [
        [quietReporter, { proofRecord: recordPath }],
        [path.join(preparationFixtures, "fixtureSteps.mjs")],
      ],
    },
    env: {
      ...options.env,
      OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE: file("artifacts.jsonl"),
      OPEN_DOUGH_PREPARATION_PROOF_CASES: file("cases.jsonl"),
      OPEN_DOUGH_PREPARATION_PROOF_STEPS: file("steps.jsonl"),
    },
  });
  const trace = () => appendedFileRecords<Trace>(file("artifacts.jsonl"));
  const steps = () => appendedFileRecords<Step>(file("steps.jsonl"));
  const completedAt = (key: string) =>
    trace().find((entry) => entry.event === "complete" && entry.key === key)
      ?.at;
  const fixtureSteps = (name: string) =>
    steps().filter(
      (step): step is FixtureStep =>
        step.event === "fixture" && step.title === `Fixture "${name}"`,
    );
  return {
    result: run.result,
    stop: run.stop,
    // The nested run exits cleanly with every case passed.
    passed: async () => {
      const result = await run.result;
      expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
      expect(readProof(recordPath).terminal?.strictStatus).toBe("passed");
    },
    // Every run artifact key the run requested, once each, in request order.
    requestedArtifacts: () => [...new Set(trace().map(({ key }) => key))],
    // When the run artifact `key` completed preparing.
    completedAt,
    steps,
    // Every case's `Fixture "<name>"` steps, in recorded order.
    fixtureSteps,
    // The run artifact `key` completed before the first case's
    // `Fixture "<name>"` step started, so that case waited for none of it.
    expectPreparedBefore: (key: string, fixture: string) => {
      const prepared = completedAt(key);
      expect(prepared).toBeDefined();
      expect(fixtureSteps(fixture)[0]?.start).toBeGreaterThanOrEqual(
        prepared ?? Infinity,
      );
    },
    // What each case reported, in the shape its fixture spec writes.
    cases: <Reported = ReportedCase>() =>
      appendedFileRecords<Reported>(file("cases.jsonl")),
  };
}
