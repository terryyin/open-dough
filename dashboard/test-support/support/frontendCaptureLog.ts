import { appendFileSync } from "node:fs";

export type CaptureLog = (event: string, details?: object) => void;

// One append per event keeps every line ordered in a single file, even when the
// run dies before an orderly close.
export function captureLog(file: string): CaptureLog {
  const started = performance.now();
  appendFileSync(file, "");
  return (event, details = {}) => {
    const at = new Date().toISOString();
    const elapsedMs = Math.round(performance.now() - started);
    const line = JSON.stringify({ at, elapsedMs, event, ...details });
    appendFileSync(file, `${line}\n`);
  };
}

// With DEBUG=vitest:browser* set before Vitest starts, Vitest writes its
// browser API debug lines to stderr; tee them into the log so they interleave
// with the observed events.
export function captureVitestBrowserDebug(record: CaptureLog) {
  const write = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk: unknown, ...rest: never[]) => {
    const text = String(chunk);
    if (text.includes("vitest:browser"))
      for (const line of text.split("\n").filter(Boolean))
        record("vitest-debug", { line: withoutQueries(line) });
    return write(chunk as string, ...rest);
  };
}

function withoutQueries(text: string) {
  return text.replace(/\?[^\s"']*/g, "");
}

export function urlPath(url: string | undefined) {
  if (!url) return undefined;
  if (url.startsWith("about:")) return url;
  return URL.canParse(url, "http://localhost")
    ? new URL(url, "http://localhost").pathname
    : undefined;
}
