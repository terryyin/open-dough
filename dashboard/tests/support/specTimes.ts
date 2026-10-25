// One run's seconds per spec file, the dashboard's counterpart of the Node
// runner's times file: one `<seconds><TAB><file>` line per spec file that
// ran, longest first (equal seconds bytewise by file), the form a duration
// list such as `dashboard/tests/longest-first` is refreshed from. A file's
// seconds are the sum of its test attempts' own durations, to a tenth;
// `<file>` is the spec's path relative to the configuration's testDir, the
// label `support/testFiles.mjs` lists. The file is written once, when the
// run ends however it ended, so a failed or deadline-ended run keeps what
// completed. A listing (`--list`) runs no test and writes nothing.
import type {
  FullConfig,
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

  add(test: TestCase, result: TestResult): void {
    const file = path.relative(this.config.rootDir, test.location.file);
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
