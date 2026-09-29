// Guard: host stream shapes are parsed only by the shared reader
// (native-host-stream.mjs and its adapters). Every shell or JavaScript file
// under tests/ and scripts/ that contains a host-event literal must be the
// reader or a listed shape writer; any other file fails, named with the
// literal it holds. A listed file that is absent or holds no literal fails
// too, so the list stays exact.
//
// Usage: node native-stream-guard.mjs [--root <git work tree>] | --writers
// (--writers prints the listed shape writers, one per line.)
// Scans Git's tracked and untracked, non-ignored files, so a new file counts
// before it is committed. Prints one FAIL line per finding; exits 1 on any.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Each literal marks a host event a reader would select on. The result forms
// are the selection (jq `select(.type == "result")`, JS `.type === "result"`)
// and the raw JSON a grep matches (`'"type":"result"'`); jq and JS object
// construction (`{type:"result"}`) writes a shape and is not a selection.
const literals = [
  ["item.started", /item\.started/],
  ["item.completed", /item\.completed/],
  ["turn.completed", /turn\.completed/],
  ["tool_call", /tool_call/],
  ["tool_use", /tool_use/],
  [
    '"subtype":"started"',
    /"subtype"\s*:\s*"started"|\.subtype\s*===?\s*["']started["']/,
  ],
  ['"type":"result"', /"type"\s*:\s*"result"/],
  ['type == "result"', /\.type\s*===?\s*["']result["']/],
];

// The shared reader may hold any literal.
const reader = new Set([
  "tests/support/native-host-stream.mjs",
  "tests/support/native-host-stream-adapters.mjs",
]);

// Files allowed to hold literals because they write host shapes rather than
// read them. Each reason says what the file writes.
const shapeWriters = new Map([
  [
    "tests/support/native-agent-admission.sh",
    "substitute agent writing admission streams per host",
  ],
  [
    "tests/support/native-agent-journey.sh",
    "substitute agent writing journey streams",
  ],
  [
    "tests/support/native-agent-publication.sh",
    "substitute agent writing publication streams",
  ],
  [
    "tests/support/native-agent-recorded.sh",
    "substitute agent writing recorded-context streams",
  ],
  [
    "tests/support/git-publication-native-counterexamples.sh",
    "writes the single-marker Codex stream",
  ],
  [
    "tests/support/git-publication-native-owned-context-suite.sh",
    "appends started calls in each host's shape",
  ],
  [
    "tests/native-run-workspace-isolation.sh",
    "writes an incomplete Cursor stream",
  ],
  [
    "tests/support/git-publication-native-stream-fields.test.mjs",
    "builds each host's stream for field tests",
  ],
  [
    "tests/support/native-stream-replay.mjs",
    "counterexample readers hide named events",
  ],
  ["tests/support/native-stream-guard.mjs", "this guard's literal list"],
  [
    "tests/native-stream-replay.sh",
    "writes the guard's stray-reader counterexample",
  ],
]);

const scannedRoots = /^(?:tests|scripts)\//;
const skipped = /^tests\/fixtures\/native-streams\//;
const codeExtension = /\.(?:sh|bash|mjs|js|cjs|ts)$/;
const shellShebang = /^#![^\r\n]*\b(?:sh|bash|dash|ksh|zsh)\b/;

function listFiles(root) {
  const listing = spawnSync(
    "git",
    [
      "ls-files",
      "--cached",
      "--others",
      "--exclude-standard",
      "-z",
      "--",
      "tests",
      "scripts",
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (listing.status !== 0) {
    throw new Error(`git ls-files failed in ${root}: ${listing.stderr}`);
  }
  return [...new Set(listing.stdout.split("\0"))].filter(
    (file) => scannedRoots.test(file) && !skipped.test(file),
  );
}

// Returns the code file's text, or null for prose, data, and absent files.
function codeText(root, file) {
  const path = join(root, file);
  if (!existsSync(path) || !statSync(path).isFile()) {
    return null;
  }
  const text = readFileSync(path, "utf8");
  if (
    codeExtension.test(file) ||
    (!/\.[^/]*$/.test(file) && shellShebang.test(text))
  ) {
    return text;
  }
  return null;
}

// The first host-event literal in the text, with its 1-based line, or null.
function firstLiteral(text) {
  const lines = text.split("\n");
  for (const [index, line] of lines.entries()) {
    const found = literals.find(([, pattern]) => pattern.test(line));
    if (found) {
      return { literal: found[0], line: index + 1 };
    }
  }
  return null;
}

export function guardFindings(root) {
  const findings = [];
  const holders = new Set();
  for (const file of listFiles(root)) {
    const text = codeText(root, file);
    const found = text === null ? null : firstLiteral(text);
    if (found) {
      holders.add(file);
      if (!reader.has(file) && !shapeWriters.has(file)) {
        findings.push(
          `${file}:${found.line}: host-event literal ${found.literal} outside the shared reader; read the stream through tests/support/native-host-stream.mjs`,
        );
      }
    }
  }
  for (const file of shapeWriters.keys()) {
    if (!holders.has(file)) {
      findings.push(
        `${file}: listed as a shape writer but holds no host-event literal; remove it from the list`,
      );
    }
  }
  return findings;
}

const invokedDirectly = process.argv[1] === fileURLToPath(import.meta.url);
if (invokedDirectly && process.argv.includes("--writers")) {
  console.log([...shapeWriters.keys()].join("\n"));
} else if (invokedDirectly) {
  const rootFlag = process.argv.indexOf("--root");
  const root =
    rootFlag === -1
      ? fileURLToPath(new URL("../..", import.meta.url))
      : process.argv[rootFlag + 1];
  const findings = guardFindings(root);
  for (const finding of findings) {
    console.log(`FAIL: ${finding}`);
  }
  process.exitCode = findings.length === 0 ? 0 : 1;
}
