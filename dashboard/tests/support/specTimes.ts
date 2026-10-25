// One run's seconds per spec file, the dashboard's counterpart of the Node
// runner's times file: one `<seconds><TAB><file>` line per spec file that
// ran, longest first (equal seconds bytewise by file), the form a duration
// list such as `dashboard/tests/longest-first` is refreshed from. A file's
// seconds are the sum of its test attempts' own durations, to a tenth,
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
} from "@playwright/test/reporter";
import { writeFileSync } from "node:fs";
import path from "node:path";

function bytewise(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

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

  add(test: TestCase, result: TestResult): void {
    const file = path.relative(this.config.rootDir, this.specFile(test));
    this.milliseconds.set(
      file,
      (this.milliseconds.get(file) ?? 0) + result.duration,
    );
  }

  write(): void {
    if (this.config.argv.includes("--list")) return;
    const lines = [...this.milliseconds]
      .map(([file, total]) => ({ file, seconds: (total / 1000).toFixed(1) }))
      .sort(
        (left, right) =>
          Number(right.seconds) - Number(left.seconds) ||
          bytewise(left.file, right.file),
      )
      .map(({ file, seconds }) => `${seconds}\t${file}\n`);
    try {
      writeFileSync(this.destination, lines.join(""));
    } catch (error) {
      this.diagnostic(
        `Spec times unavailable at ${this.destination}: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
  }
}
