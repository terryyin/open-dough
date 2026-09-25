// The browser suite's only console reporter. A passing run prints nothing.
// It prints each failing test with its error, captured output, and retained
// files (such as its trace), and any error outside a test. Output from a
// passing test, or from the run itself (global setup, workers between
// tests), fails the run and is shown, locally and in CI alike.
//
// Global setup runs in this runner process and writes straight to its
// stdout/stderr, which no reporter event carries, so the reporter watches
// those streams itself from the moment it is created until the run ends.

import type {
  FullResult,
  Reporter,
  TestCase,
  TestError,
  TestResult,
} from "@playwright/test/reporter";
import path from "node:path";

type Write = typeof process.stdout.write;

function text(chunk: string | Buffer): string {
  return typeof chunk === "string" ? chunk : chunk.toString("utf8");
}

// Paths under the working directory are shown relative to it.
function shown(file: string): string {
  const relative = path.relative(process.cwd(), file);
  return relative.startsWith("..") ? file : relative;
}

function indent(block: string): string {
  return block.replace(/^(?=.)/gm, "    ");
}

export default class QuietReporter implements Reporter {
  private readonly writeOut: Write;
  private readonly writeErr: Write;
  private readonly strayRunOutput: string[] = [];
  private failed = false;
  private watching = true;

  constructor() {
    this.writeOut = process.stdout.write.bind(process.stdout);
    this.writeErr = process.stderr.write.bind(process.stderr);
    process.stdout.write = this.watch(this.writeOut);
    process.stderr.write = this.watch(this.writeErr);
  }

  // The reporter itself writes the console; no default reporter is added.
  printsToStdio(): boolean {
    return true;
  }

  // Output a test wrote arrives with its result; anything else is the run's.
  onStdOut(chunk: string | Buffer, test?: TestCase): void {
    if (!test) {
      this.strayRunOutput.push(text(chunk));
    }
  }

  onStdErr(chunk: string | Buffer, test?: TestCase): void {
    this.onStdOut(chunk, test);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const outcome = test.outcome();
    const output = [...result.stdout, ...result.stderr].map(text).join("");
    if (outcome === "skipped" || (outcome === "expected" && output === "")) {
      return;
    }
    this.failed = true;
    const location = `${shown(test.location.file)}:${String(test.location.line)}`;
    const title = test.titlePath().filter(Boolean).slice(1).join(" › ");
    const lines = [
      outcome === "expected"
        ? `PRINTED: ${location} › ${title} passed but wrote output`
        : `FAIL: ${location} › ${title} (${result.status})`,
    ];
    for (const error of result.errors) {
      lines.push(indent(this.describe(error)));
    }
    if (output !== "") {
      lines.push("  output:", indent(output.replace(/\n$/, "")));
    }
    const kept = result.attachments.flatMap((attachment) =>
      attachment.path
        ? [`  ${attachment.name}: ${shown(attachment.path)}`]
        : [],
    );
    lines.push(...kept);
    this.print(`${lines.join("\n")}\n\n`);
  }

  onError(error: TestError): void {
    this.failed = true;
    this.print(`ERROR outside a test:\n${indent(this.describe(error))}\n\n`);
  }

  onEnd(
    result: FullResult,
  ): Promise<{ status: FullResult["status"] } | undefined> {
    this.stopWatching();
    const stray = this.strayRunOutput.join("");
    if (stray !== "") {
      this.print(
        `PRINTED: the run wrote output outside any test:\n${indent(stray.replace(/\n$/, ""))}\n\n`,
      );
    }
    const nothingShown = stray === "" && !this.failed;
    if (nothingShown && result.status === "passed") {
      return Promise.resolve(undefined);
    }
    // A run that ends otherwise (interrupted, timed out) with nothing shown
    // yet still says why it failed.
    if (nothingShown) {
      this.print(`The test run ended ${result.status}.\n`);
    }
    return Promise.resolve({ status: "failed" });
  }

  onExit(): Promise<void> {
    this.stopWatching();
    return Promise.resolve();
  }

  private describe(error: TestError): string {
    const where = error.location
      ? `at ${shown(error.location.file)}:${String(error.location.line)}\n`
      : "";
    const detail = error.stack ?? error.message ?? error.value ?? "";
    return `${detail}\n${where}${error.snippet ? `${error.snippet}\n` : ""}`.replace(
      /\n+$/,
      "",
    );
  }

  private print(message: string): void {
    this.writeOut(message);
  }

  private watch(original: Write): Write {
    return (chunk: unknown, ...rest: unknown[]): boolean => {
      if (!this.watching) {
        return (original as (...args: unknown[]) => boolean)(chunk, ...rest);
      }
      this.strayRunOutput.push(
        typeof chunk === "string" || Buffer.isBuffer(chunk)
          ? text(chunk)
          : String(chunk),
      );
      // A write's completion callback, if any, still runs.
      const done = rest.find(
        (argument): argument is () => void => typeof argument === "function",
      );
      done?.();
      return true;
    };
  }

  private stopWatching(): void {
    if (this.watching) {
      this.watching = false;
      process.stdout.write = this.writeOut;
      process.stderr.write = this.writeErr;
    }
  }
}
