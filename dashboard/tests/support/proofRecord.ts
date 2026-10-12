// Optional evidence belongs to this strict reporter invocation, never to a
// shared archive. Snapshots replace only a destination this instance claimed.
import type {
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import { randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  openSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type {
  Attempt,
  DashboardProofRecord,
  Selection,
} from "./proofRecordTypes.ts";

function canonicalPath(file: string): string {
  const missing: string[] = [];
  let ancestor = path.resolve(file);
  while (!existsSync(ancestor)) {
    missing.unshift(path.basename(ancestor));
    ancestor = path.dirname(ancestor);
  }
  return path.join(realpathSync(ancestor), ...missing);
}

export class ProofRecord {
  private readonly record: DashboardProofRecord;
  private readonly selections = new Map<TestCase, Selection>();
  private readonly attempts = new Map<TestResult, Attempt>();
  private destination = "";
  private available = false;

  constructor(
    requested: string,
    config: FullConfig,
    suite: Suite,
    private readonly diagnostic: (message: string) => void,
  ) {
    const tests = new Map<string, Selection>();
    for (const test of suite.allTests()) {
      const project = test.parent.project()?.name ?? "";
      const titlePath = test.titlePath();
      const key = JSON.stringify([project, test.location, titlePath]);
      let selection = tests.get(key);
      if (!selection) {
        selection = {
          project,
          location: test.location,
          titlePath,
          executions: [],
          attempts: [],
        };
        tests.set(key, selection);
      }
      selection.executions.push({
        testId: test.id,
        repeatEachIndex: test.repeatEachIndex,
        expectedStatus: test.expectedStatus,
      });
      this.selections.set(test, selection);
    }
    this.record = {
      schemaVersion: 1,
      run: {
        id: randomUUID(),
        startedAt: new Date().toISOString(),
        pid: process.pid,
        // eslint-disable-next-line no-restricted-syntax -- records invocation context, never locates repository files
        cwd: process.cwd(),
        configFile: config.configFile,
        rootDir: config.rootDir,
        outputDirs: config.projects.map((project) => project.outputDir),
        argv: config.argv,
        listing: config.argv.includes("--list"),
      },
      phase: "running",
      selectedCount: tests.size,
      tests: [...tests.values()],
    };
    try {
      if (!path.isAbsolute(requested))
        throw new Error("use an absolute unused file path");
      this.destination = path.join(
        realpathSync(path.dirname(requested)),
        path.basename(requested),
      );
      for (const project of config.projects) {
        const relative = path.relative(
          canonicalPath(project.outputDir),
          this.destination,
        );
        if (
          relative === "" ||
          (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))
        ) {
          throw new Error(
            "the record must be outside every disposable output directory",
          );
        }
      }
      closeSync(openSync(this.destination, "wx"));
      this.available = true;
      this.save();
    } catch (error) {
      this.unavailable(requested, error);
    }
  }

  begin(test: TestCase, result: TestResult): void {
    const attempt: Attempt = {
      testId: test.id,
      repeatEachIndex: test.repeatEachIndex,
      retry: result.retry,
      startedAt: result.startTime.toISOString(),
    };
    this.attempts.set(result, attempt);
    this.selections.get(test)?.attempts.push(attempt);
    this.save();
  }

  end(test: TestCase, result: TestResult): void {
    if (!this.attempts.has(result)) this.begin(test, result);
    const attempt = this.attempts.get(result);
    if (attempt) {
      attempt.status = result.status;
      attempt.durationMs = result.duration;
    }
    const execution = this.selections
      .get(test)
      ?.executions.find((entry) => entry.testId === test.id);
    if (execution) {
      execution.expectedStatus = test.expectedStatus;
      execution.outcome = test.outcome();
    }
    this.save();
  }

  finish(result: FullResult, strictStatus: FullResult["status"]): void {
    this.record.phase = this.record.run.listing ? "listed" : "completed";
    this.record.terminal = {
      runnerStatus: result.status,
      strictStatus,
      finishedAt: new Date().toISOString(),
      durationMs: result.duration,
    };
    this.save();
  }

  private save(): void {
    if (!this.available) return;
    const temporary = `${this.destination}.${this.record.run.id}.tmp`;
    let created = false;
    let descriptor: number | undefined;
    try {
      // Readers see either the preceding complete JSON snapshot or this one.
      descriptor = openSync(temporary, "wx");
      created = true;
      writeFileSync(descriptor, `${JSON.stringify(this.record)}\n`);
      closeSync(descriptor);
      descriptor = undefined;
      renameSync(temporary, this.destination);
    } catch (error) {
      this.unavailable(this.destination, error);
    } finally {
      if (descriptor !== undefined) {
        try {
          closeSync(descriptor);
        } catch {
          /* Preserve the recording diagnostic. */
        }
      }
      if (created) {
        try {
          rmSync(temporary, { force: true });
        } catch {
          /* Directory may have disappeared. */
        }
      }
    }
  }

  private unavailable(destination: string, error: unknown): void {
    this.available = false;
    this.diagnostic(
      `Proof record unavailable at ${destination}: ${error instanceof Error ? error.message : String(error)}\n`,
    );
  }
}
