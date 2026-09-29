// Replays every real host stream in tests/fixtures/native-streams through the
// shared reader and compares it with that stream's reviewed expectation.
//
// An entry is one `<phase->events.jsonl.gz` under `<host>/<case>/<attempt>/`,
// reviewed in the `<phase->expected` beside it: `source:` (the commit and
// path it was recovered from), `stream-status:`, `response:` (present or
// absent), and one `command:` JSON string per started command, in order.
// An entry with commands also names `last-start-line:`, the stream line whose
// event starts its last command. `corrected:` and `verdict:` lines and `#`
// comments are for reviewers.
//
// Each entry with commands is also replayed cut just after its last start
// line, as a run killed mid-command leaves it: every expected command must
// still be read, and the stream must read truncated.
//
// Prints one `FAIL: <entry>: <difference>` line per mismatch and exits 1;
// silent on success. `--variant <name>` replays through a deliberately broken
// reader, which this suite's counterexamples expect to fail.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  hosts,
  readHostStreamText,
  readStreamFile,
} from "./native-host-stream.mjs";

const corpus = fileURLToPath(
  new URL("../fixtures/native-streams", import.meta.url),
);
const streamSuffix = "events.jsonl.gz";
const knownKeys = new Set([
  "source",
  "stream-status",
  "response",
  "last-start-line",
  "command",
  "corrected",
  "verdict",
]);

// Counterexample readers: each hides events the real reader depends on.
const variants = {
  "codex-completed-only": (host, event) =>
    host === "codex" && event.type === "item.started",
  "cursor-without-tool-call": (host, event) =>
    host === "cursor" && event.type === "tool_call",
};

function streamFiles(directory) {
  return readdirSync(directory)
    .sort()
    .flatMap((name) => {
      const path = join(directory, name);
      if (statSync(path).isDirectory()) {
        return streamFiles(path);
      }
      return name.endsWith(streamSuffix) ? [path] : [];
    });
}

function parseExpected(text, fail) {
  const expected = { commands: [] };
  for (const line of text.split("\n")) {
    if (line.trim() === "" || line.startsWith("#")) {
      continue;
    }
    const match = /^([a-z-]+): (.*)$/.exec(line);
    if (!match || !knownKeys.has(match[1])) {
      fail(`unreadable expected line: ${line.slice(0, 80)}`);
      continue;
    }
    const [, key, value] = match;
    if (key === "command") {
      try {
        expected.commands.push(JSON.parse(value));
      } catch {
        fail(`command is not a JSON string: ${value.slice(0, 80)}`);
      }
    } else {
      expected[key] = value;
    }
  }
  for (const key of ["source", "stream-status", "response"]) {
    if (expected[key] === undefined) {
      fail(`expected has no ${key}:`);
    }
  }
  if (
    expected.commands.length > 0 &&
    !/^[1-9][0-9]*$/.test(expected["last-start-line"] ?? "")
  ) {
    fail("expected has commands but no last-start-line:");
  }
  return expected;
}

function compare(read, expected, fail) {
  if (read.status !== expected["stream-status"]) {
    fail(`stream status ${read.status}, expected ${expected["stream-status"]}`);
  }
  const response = read.response?.trim() ? "present" : "absent";
  if (expected.response !== undefined && response !== expected.response) {
    fail(`response ${response}, expected ${expected.response}`);
  }
  const want = expected.commands;
  const got = read.commands;
  const differs = want.findIndex((command, index) => command !== got[index]);
  if (differs !== -1) {
    fail(
      `started command ${differs + 1} of ${want.length} is ${JSON.stringify(got[differs] ?? null).slice(0, 120)}, expected ${JSON.stringify(want[differs]).slice(0, 120)}`,
    );
  } else if (got.length !== want.length) {
    fail(`read ${got.length} started commands, expected ${want.length}`);
  }
}

// Reads `lines` of a `host` stream, through the `variant` reader when named.
function readLines(host, lines, variant) {
  const shown = variant
    ? lines.filter((line) => {
        try {
          return !variants[variant](host, JSON.parse(line));
        } catch {
          return true;
        }
      })
    : lines;
  return readHostStreamText(host, shown.join("\n"));
}

export function replayCorpus({ variant } = {}) {
  const failures = [];
  const commandsByHost = new Map(hosts.map((host) => [host, 0]));
  for (const path of streamFiles(corpus)) {
    const entry = relative(corpus, path).slice(0, -".jsonl.gz".length);
    const host = entry.split("/")[0];
    const fail = (message) => failures.push(`FAIL: ${entry}: ${message}`);
    if (!hosts.includes(host)) {
      fail(`unknown host ${host}`);
      continue;
    }
    const phase = path.slice(0, -streamSuffix.length);
    let expectedText;
    try {
      expectedText = readFileSync(`${phase}expected`, "utf8");
    } catch {
      fail(`missing ${relative(corpus, phase)}expected`);
      continue;
    }
    const expected = parseExpected(expectedText, fail);
    commandsByHost.set(
      host,
      commandsByHost.get(host) + expected.commands.length,
    );
    const lines = readStreamFile(path).split("\n");
    compare(readLines(host, lines, variant), expected, fail);
    const lastStart = Number(expected["last-start-line"]);
    if (expected.commands.length > 0 && lastStart > 0) {
      compare(
        readLines(host, lines.slice(0, lastStart), variant),
        { ...expected, "stream-status": "truncated", response: undefined },
        (message) => fail(`cut after its last started command: ${message}`),
      );
    }
  }
  for (const host of hosts) {
    if (commandsByHost.get(host) === 0) {
      failures.push(`FAIL: no ${host} corpus entry with started commands`);
    }
  }
  return failures;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [option, variant] = process.argv.slice(2);
  if (option !== undefined && (option !== "--variant" || !variants[variant])) {
    process.stderr.write(
      `usage: native-stream-replay.mjs [--variant <${Object.keys(variants).join("|")}>]\n`,
    );
    process.exit(2);
  }
  const failures = replayCorpus({ variant });
  process.stdout.write(failures.map((line) => `${line}\n`).join(""));
  process.exit(failures.length === 0 ? 0 : 1);
}
