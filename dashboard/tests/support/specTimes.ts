// One run's seconds per spec file, the dashboard's counterpart of the Node
// runner's times file: one `<seconds><TAB><file>` line per spec file that
// ran, in the times form of scripts/share-deal.mjs (`formatTimes`), from which
// a duration list such as `dashboard/tests/longest-first` is refreshed. A
// file's seconds sum test attempts and their beforeAll/afterAll hooks once,
// including the tests it registers through a module it imports (a case
// module), which Playwright places under the spec file's suite while their
// own `location.file` is the module; `<file>` is the spec's path relative to
// the configuration's testDir, the label `support/testFiles.mjs` lists. The
// file is written once, when the run ends however it ended, so a failed or
// deadline-ended run keeps what completed. A listing (`--list`) runs no test
// and writes nothing.
import type {
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  TestStep,
} from "@playwright/test/reporter";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { formatTimes } from "../../../scripts/share-deal.mjs";

export class SpecTimes {
  private readonly milliseconds = new Map<string, number>();

  constructor(
    private readonly destination: string,
    private readonly config: FullConfig,
    private readonly diagnostic: (message: string) => void,
  ) {}

  // The spec file Playwright ran the test from: its enclosing file suite's
  // location. A test's own location is where `test(...)` was called, which
  // for an imported case module is that module, not the spec.
  private specFile(test: TestCase): string {
    let suite: Suite | undefined = test.parent;
    while (suite !== undefined && suite.type !== "file") suite = suite.parent;
    return suite?.location?.file ?? test.location.file;
  }

  // These hooks are attached to a test's result steps, but Playwright excludes
  // their duration from result.duration. Per-test hooks are already included.
  addSharedHook(test: TestCase, step: TestStep): void {
    if (
      step.category === "hook" &&
      (step.title === "beforeAll hook" || step.title === "afterAll hook")
    ) {
      this.addMilliseconds(test, step.duration);
    }
  }

  add(test: TestCase, result: TestResult): void {
    this.addMilliseconds(test, result.duration);
  }

  private addMilliseconds(test: TestCase, duration: number): void {
    const file = path.relative(this.config.rootDir, this.specFile(test));
    this.milliseconds.set(file, (this.milliseconds.get(file) ?? 0) + duration);
  }

  write(): void {
    if (this.config.argv.includes("--list")) return;
    const lines = formatTimes(
      [...this.milliseconds].map(([file, total]): [string, number] => [
        file,
        total / 1000,
      ]),
    );
    try {
      writeFileSync(
        this.destination,
        lines.map((line) => `${line}\n`).join(""),
      );
    } catch (error) {
      this.diagnostic(
        `Spec times unavailable at ${this.destination}: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
  }
}
