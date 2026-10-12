import type {
  FullResult,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

export type Attempt = {
  testId: string;
  repeatEachIndex: number;
  retry: number;
  startedAt: string;
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
  phase: "running" | "listed" | "completed";
  selectedCount: number;
  tests: Selection[];
  terminal?: {
    runnerStatus: FullResult["status"];
    strictStatus: FullResult["status"];
    finishedAt: string;
    durationMs: number;
  };
};
