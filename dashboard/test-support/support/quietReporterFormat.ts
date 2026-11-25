// Path and text shaping for QuietReporter's console and report lines.
import path from "node:path";
import type { TestError } from "@playwright/test/reporter";

export function text(chunk: string | Buffer): string {
  return typeof chunk === "string" ? chunk : chunk.toString("utf8");
}

// Paths under the working directory are shown relative to it.
export function shown(file: string): string {
  // eslint-disable-next-line no-restricted-syntax -- shows paths relative to where the run started, not the repository root
  const relative = path.relative(process.cwd(), file);
  return relative.startsWith("..") ? file : relative;
}

export function indent(block: string): string {
  return block.replace(/^(?=.)/gm, "    ");
}

export function describeError(error: TestError): string {
  const where = error.location
    ? `at ${shown(error.location.file)}:${String(error.location.line)}\n`
    : "";
  const detail = error.stack ?? error.message ?? error.value ?? "";
  return `${detail}\n${where}${error.snippet ? `${error.snippet}\n` : ""}`.replace(
    /\n+$/,
    "",
  );
}
