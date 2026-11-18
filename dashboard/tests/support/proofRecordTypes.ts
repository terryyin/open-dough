import type {
  FullResult,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

export type Attempt = {
  testId: string;
  repeatEachIndex: number;
  retry: number;
  // The mounted runner reports case durations without a per-attempt start.
  startedAt?: string;
  status?: TestResult["status"];
  durationMs?: number;
};
export type Selection = {
  project: string;
  location: TestCase["location"];
  titlePath: string[];
  executions: {
    testId: string;
    repeatEachIndex: number;
    expectedStatus: TestCase["expectedStatus"];
    outcome?: ReturnType<TestCase["outcome"]>;
  }[];
  attempts: Attempt[];
};

export type DashboardProofRecord = {
  schemaVersion: 1;
  run: {
    id: string;
    startedAt: string;
    pid: number;
    cwd: string;
    configFile: string | undefined;
    rootDir: string;
    outputDirs: string[];
    argv: string[];
    listing: boolean;
  };
  // "listed" records selection only. A combined run whose evidence could not
  // account for a selected runner or file leaves its part "incomplete".
  phase: "running" | "listed" | "completed" | "incomplete";
  selectedCount: number;
  tests: Selection[];
  // Absent from a run that never finished: no executed pass.
  terminal?: {
    // Playwright's verdict, before the strict reporter checks output.
    runnerStatus: FullResult["status"];
    // The run's verdict.
    strictStatus: FullResult["status"];
    finishedAt: string;
    durationMs: number;
  };
};
