// A `node --test --test-reporter=<this file>` reporter that prints nothing when
// every test passes silently. For each failing test it prints the test's name
// (with its enclosing suites), location, and error; then, once per failing
// file, the output that file's tests wrote. A passing file that wrote output
// is shown too, so a passing test that prints is never hidden. Node attributes
// captured stdout, stderr, and file diagnostics to a test file, not to a single
// test, so that is the narrowest scope it can show. `node --test` still sets
// the exit status.
import path from "node:path";
import { inspect, stripVTControlCharacters } from "node:util";

function fileKey(file) {
  return file ? path.resolve(file) : "";
}

function indent(text) {
  return text.replace(/\n$/, "").replace(/^/gm, "  ");
}

function describeError(error) {
  const cause =
    error?.code === "ERR_TEST_FAILURE" && error.cause !== undefined
      ? error.cause
      : error;
  // Assertion diffs may arrive coloured; the report is read as plain text.
  const description = stripVTControlCharacters(
    cause instanceof Error ? inspect(cause) : String(cause),
  );
  // A test file's own failure carries the exit of the process that ran it.
  if (Number.isInteger(error?.exitCode) || error?.signal) {
    return `${description} (exit code ${error.exitCode}, signal ${error.signal})`;
  }
  return description;
}

export default async function* failuresOnly(source) {
  const openTests = new Map();
  const captured = new Map();
  const failuresByFile = new Map();

  const capture = (file, text) => {
    const key = fileKey(file);
    captured.set(key, (captured.get(key) ?? "") + text);
  };

  for await (const { type, data } of source) {
    if (type === "test:start") {
      const stack = openTests.get(fileKey(data.file)) ?? [];
      stack.length = data.nesting;
      stack.push(data.name);
      openTests.set(fileKey(data.file), stack);
    } else if (type === "test:stdout" || type === "test:stderr") {
      capture(data.file, data.message);
    } else if (type === "test:diagnostic" && data.file) {
      capture(data.file, `${data.message}\n`);
    } else if (
      type === "test:fail" &&
      data.details.error?.failureType !== "subtestsFailed"
    ) {
      const key = fileKey(data.file);
      const suites = (openTests.get(key) ?? []).slice(0, data.nesting);
      failuresByFile.set(key, [
        ...(failuresByFile.get(key) ?? []),
        {
          name: [...suites, data.name].join(" > "),
          location: data.file
            ? `${data.file}:${data.line}:${data.column}`
            : "(unknown location)",
          error: describeError(data.details.error),
        },
      ]);
    }
  }

  const files = new Set([...failuresByFile.keys(), ...captured.keys()]);
  for (const file of files) {
    const fileFailures = failuresByFile.get(file) ?? [];
    for (const failure of fileFailures) {
      yield `not ok: ${failure.name}\n  at ${failure.location}\n${indent(failure.error)}\n`;
    }
    const output = captured.get(file);
    if (output) {
      const heading = fileFailures.length
        ? "captured output of"
        : "output from passing";
      yield `${heading} ${path.relative(process.cwd(), file) || file}:\n${indent(output)}\n`;
    }
  }
}
