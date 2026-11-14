import {
  adapterResponseBytes,
  truncateUtf8,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-command-run.mjs";

// The most of the adapter's own stderr line a reason shows, bounded like
// its unavailability reason.
const stderrLineBytes = 600;

type AdapterRunError = Error & {
  readonly code?: unknown;
  readonly killed?: boolean;
  readonly stderr?: string;
};

// Why an adapter command did not answer: it ran past the shared limits,
// exited nonzero (with its last stderr line), or otherwise failed with the
// runner's own error, such as an answer the runner refuses or a command that
// could not start.
export function ciAdapterFailureOf(error: unknown, timeoutMs: number): string {
  if (!(error instanceof Error)) return String(error);
  const { code, killed, stderr } = error as AdapterRunError;
  if (killed === true)
    return `it gave no answer within ${String(timeoutMs / 1000)} seconds`;
  if (code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER")
    return `its answer is longer than ${String(adapterResponseBytes / 1024)} KiB`;
  if (typeof code === "number") {
    const line = (stderr ?? "")
      .split("\n")
      .map((text) => text.trim())
      .filter((text) => text !== "")
      .at(-1);
    return line === undefined
      ? `it exited with status ${String(code)}`
      : `it exited with status ${String(code)} (${truncateUtf8(line, stderrLineBytes).text})`;
  }
  return error.message;
}
