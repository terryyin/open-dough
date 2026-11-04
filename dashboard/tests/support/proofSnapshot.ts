// Second consumer of the quiet reporter's events: maintains committed
// Playwright proof under tests/support/proofStore.mjs when recording is on.
import type {
  FullConfig,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import path from "node:path";
import {
  canonicalPath,
  identityOf,
  openProofStore,
} from "../../../tests/support/proofStore.mjs";
import { projectsSelectingFile } from "./proofSnapshotProjects.ts";

type ProofIdentity = {
  file: string;
  test: readonly string[];
  project?: string;
};

type ProofObservation = ProofIdentity & {
  outcome: "passed";
  attempts: number;
  durationMs: number;
  finishedAt: string;
  commit: string;
  fileBlob: string;
};

type FoldState = {
  cleared: boolean;
  observation?: ProofObservation;
};

type ProofStore = {
  active: boolean;
  commit: string | undefined;
  root: string | undefined;
  fileBlob: (relativeFile: string) => string | undefined;
  record: (observation: ProofObservation) => void;
  clear: (identity: ProofIdentity) => void;
};

function silently(action: () => void): void {
  try {
    action();
  } catch {
    // Proof is deliberately best effort; the suite's own failures keep their path.
  }
}

function textOf(chunk: string | Buffer): string {
  return typeof chunk === "string" ? chunk : chunk.toString("utf8");
}

function fileSuitePath(test: TestCase): string {
  let suite: Suite | undefined = test.parent;
  while (suite !== undefined && suite.type !== "file") suite = suite.parent;
  return suite?.location?.file ?? test.location.file;
}

function titlePathOf(test: TestCase): string[] {
  // ["", project, file, …describes, title] → after project and file.
  return test.titlePath().slice(3);
}

export class ProofSnapshot {
  private store: ProofStore | undefined;
  private config: FullConfig | undefined;
  private readonly attemptDurations = new Map<string, number[]>();
  private readonly folds = new Map<string, FoldState>();

  constructor(private readonly enabled: boolean) {}

  onBegin(config: FullConfig): void {
    if (!this.enabled) return;
    silently(() => {
      this.store = openProofStore({ runner: "playwright" });
      this.config = config;
    });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (!this.enabled || !this.store?.active || !this.config) return;
    silently(() => {
      this.finishAttempt(test, result);
    });
  }

  onEnd(): void {
    this.attemptDurations.clear();
    this.folds.clear();
  }

  private finishAttempt(test: TestCase, result: TestResult): void {
    const store = this.store;
    const config = this.config;
    if (!store?.active || !config || store.commit === undefined) return;

    const attemptKey = test.id;
    const durations = this.attemptDurations.get(attemptKey) ?? [];
    durations[result.retry] = result.duration;
    this.attemptDurations.set(attemptKey, durations);

    const final = result.status === "passed" || result.retry >= test.retries;
    if (!final) return;

    if (result.status === "skipped" || result.status === "interrupted") {
      return;
    }

    const absoluteFile = canonicalPath(fileSuitePath(test));
    const root = store.root;
    if (typeof root !== "string" || root.length === 0) return;
    const relativeFile = path
      .relative(canonicalPath(root), absoluteFile)
      .split(path.sep)
      .join("/");
    if (
      relativeFile.startsWith("..") ||
      path.isAbsolute(relativeFile) ||
      relativeFile.length === 0
    ) {
      return;
    }

    const titlePath = titlePathOf(test);
    const selecting = projectsSelectingFile(config, absoluteFile);
    const identity: ProofIdentity = {
      file: relativeFile,
      test: titlePath,
      ...(selecting.length > 1
        ? { project: test.parent.project()?.name ?? "" }
        : {}),
    };
    const foldKey = identityOf(identity);
    const fold = this.folds.get(foldKey) ?? { cleared: false };
    if (fold.cleared) return;

    const output = [...result.stdout, ...result.stderr].map(textOf).join("");
    const plainPass =
      result.status === "passed" &&
      test.expectedStatus === "passed" &&
      output === "";
    const attempts = result.retry + 1;
    let durationMs = 0;
    for (let index = 0; index < attempts; index += 1) {
      durationMs += durations[index] ?? 0;
    }
    const finishedAt = new Date().toISOString();

    if (!plainPass) {
      fold.cleared = true;
      delete fold.observation;
      this.folds.set(foldKey, fold);
      store.clear(identity);
      return;
    }

    const fileBlob = store.fileBlob(relativeFile);
    if (fileBlob === undefined) return;

    if (fold.observation === undefined) {
      fold.observation = {
        ...identity,
        outcome: "passed",
        attempts,
        durationMs,
        finishedAt,
        commit: store.commit,
        fileBlob,
      };
    } else {
      fold.observation = {
        ...fold.observation,
        attempts: Math.max(fold.observation.attempts, attempts),
        durationMs: fold.observation.durationMs + durationMs,
        finishedAt,
      };
    }
    this.folds.set(foldKey, fold);
    store.record(fold.observation);
  }
}
