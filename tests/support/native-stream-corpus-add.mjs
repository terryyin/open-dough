// Adds an accepted paid native attempt to the replay corpus
// (tests/fixtures/native-streams), where the free suite
// (tests/native-stream-replay.sh) replays it once its expectation is reviewed.
//
//   node tests/support/native-stream-corpus-add.mjs [--corpus <dir>] <attempt>
//
// <attempt> is a retained attempt directory, read as
// native-stream-retained-attempt.mjs describes. The entry goes to
// `<corpus>/<host>/<case>/<attempt-id>/`: each stream gzipped as
// `<phase->events.jsonl.gz`, the `record`, `observations.txt`, and each
// `<phase->response.md` copied, and a draft `<phase->expected` written.
//
// The draft takes stream-derived fields from the retained observations, which
// were observed independently of today's reader; only the started commands, and
// fields the observations lack, come from the reader. `last-start-line` is
// found by searching the raw stream lines for each started command in turn,
// not from the reader. A publication draft adds today's replayed `verdict:`
// (native-stream-publication-replay.mjs), or, for a journey that derives no
// stream fields, `not-replayable: <journey> has no stream fields`. Its first
// line is a `# draft:` comment, which replay fails until a reviewer checks the
// draft, adds `corrected:` where a harness fault changed a value, and deletes
// that line.
//
// Prints the entry added and one `review:` line per field where the reader, or
// today's verdict, disagrees with the retained attempt. Refuses (exit 1, naming
// what is missing, writing nothing) an attempt without a `record`, without
// `observations.txt`, or with a stream that is missing or not complete, and an
// entry the corpus already holds.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { publicationStreamFields } from "./git-publication-native-stream-fields.mjs";
import { joinContinuations } from "./native-host-stream.mjs";
import {
  noFieldsVerdict,
  reassessVerdicts,
  replayedAttempt,
} from "./native-stream-publication-replay.mjs";
import { defaultCorpus, draftMarker } from "./native-stream-replay.mjs";
import {
  readRetainedAttempt,
  Refusal,
} from "./native-stream-retained-attempt.mjs";

// Every string value in parsed JSON, as the reader joins its continuations.
function strings(value) {
  if (typeof value === "string") {
    return [joinContinuations(value)];
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(strings);
  }
  return [];
}

// How many string values in the raw stream line `text` equal `command`.
function holds(text, command) {
  try {
    return strings(JSON.parse(text)).filter((value) => value === command)
      .length;
  } catch {
    return 0;
  }
}

// The 1-based stream line holding the last of `commands`, found by walking the
// raw lines for each command in order, or null when one is not found. A line
// may start several commands, so each command's matches on a line are used up
// in turn.
function lastStartLine(lines, commands) {
  let line = 0;
  let used = new Map();
  for (const command of commands) {
    while (holds(lines[line] ?? "", command) <= (used.get(command) ?? 0)) {
      line += 1;
      used = new Map();
      if (line >= lines.length) {
        return null;
      }
    }
    used.set(command, (used.get(command) ?? 0) + 1);
  }
  return commands.length === 0 ? null : line + 1;
}

// Where the stream at `path` came from: `<commit> <repository path>` when a
// commit holds it, otherwise its absolute path.
function streamSource(path) {
  const git = (...args) =>
    spawnSync("git", ["-C", dirname(path), ...args], {
      encoding: "utf8",
    }).stdout?.trim() ?? "";
  const commit = git("log", "-1", "--format=%h", "--abbrev=8", "--", path);
  const file = git("ls-files", "--full-name", "--", path);
  return commit && file ? `${commit} ${file}` : path;
}

// The draft `expected` lines for one stream, and its review lines.
function draftStream(found, stage) {
  const { host, family, journey, record, observations } = found;
  const path = join(found.attempt, stage.file);
  const label = `${stage.phase}expected`;
  const review = [];
  // A retained observation, or the reader's value where there is none.
  const drafted = (key, readValue) => {
    const read = String(readValue);
    if (!observations.has(key)) {
      review.push(
        `${label}: ${key} is not in the retained observations; drafted the reader's ${read}`,
      );
      return read;
    }
    const kept = observations.get(key);
    if (kept !== read) {
      review.push(`${label}: ${key}: retained ${kept}, reader ${read}`);
    }
    return kept;
  };
  const { read } = stage;
  const lines = [
    `${draftMarker} review every line against the retained attempt, add corrected: <field> <value>; <harness fault> where the reader is right, then delete this line`,
    `source: ${streamSource(path)}`,
    `stream-status: ${found.phases.length === 1 ? drafted("stream-status", read.status) : read.status}`,
    `response: ${read.response?.trim() ? "present" : "absent"}`,
  ];
  if (read.commands.length > 0) {
    const line = lastStartLine(stage.text.split("\n"), read.commands);
    if (line === null) {
      review.push(
        `${label}: last-start-line not found: a started command is not in the raw stream`,
      );
    } else {
      lines.push(`last-start-line: ${line}`);
    }
  }
  const fieldless = family === "publication" ? noFieldsVerdict(journey) : null;
  if (fieldless !== null) {
    lines.push(`verdict: ${fieldless}`);
  } else if (family === "publication") {
    const fields = publicationStreamFields(journey, host, path);
    for (const [key, value] of fields) {
      lines.push(`${key}: ${drafted(key, value)}`);
    }
    const [verdict] = reassessVerdicts([
      replayedAttempt(
        path,
        new Map(fields.map(([key, value]) => [key, String(value)])),
      ),
    ]);
    const recorded = `${record.get("assessment-status")} / ${record.get("assessment-reason")}`;
    if (!verdict.startsWith("not-replayable:") && verdict !== recorded) {
      review.push(
        `${label}: verdict: recorded ${recorded}, replayed ${verdict}`,
      );
    }
    lines.push(`verdict: ${verdict}`);
  }
  for (const command of read.commands) {
    lines.push(`command: ${JSON.stringify(command)}`);
  }
  return { expected: `${lines.join("\n")}\n`, review };
}

// Adds the retained attempt at `attemptDir` to `corpus`. Returns the report
// lines; throws a Refusal naming what is missing.
export function addToCorpus(attemptDir, corpus = defaultCorpus) {
  const found = readRetainedAttempt(attemptDir);
  const { attempt } = found;
  const entry = join(found.host, found.caseId, basename(attempt));
  const target = join(corpus, entry);
  if (existsSync(target)) {
    throw new Refusal(`the corpus already holds ${entry}`);
  }
  // Draft every stream before writing, so a refusal writes nothing.
  const stages = found.phases.map((stage) => ({
    ...stage,
    ...draftStream(found, stage),
  }));
  const execution = found.record.get("execution-status");
  const review =
    execution === "completed"
      ? []
      : [
          `record: execution-status ${execution ?? "(none)"}, but every stream reads complete`,
        ];
  mkdirSync(target, { recursive: true });
  for (const name of ["record", "observations.txt"]) {
    copyFileSync(join(attempt, name), join(target, name));
  }
  for (const stage of stages) {
    writeFileSync(
      join(target, `${stage.phase}events.jsonl.gz`),
      gzipSync(stage.text, { level: 9 }),
    );
    writeFileSync(join(target, `${stage.phase}expected`), stage.expected);
    const response = join(attempt, `${stage.phase}response.md`);
    if (existsSync(response)) {
      copyFileSync(response, join(target, `${stage.phase}response.md`));
    }
  }
  return [
    `added: ${target}`,
    ...[...review, ...stages.flatMap((stage) => stage.review)].map(
      (line) => `review: ${line}`,
    ),
    `next: review ${stages.map((stage) => `${stage.phase}expected`).join(" and ")}, then delete the ${draftMarker} line; replay fails the entry until then`,
  ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let corpus = defaultCorpus;
  if (args[0] === "--corpus" && args.length === 3) {
    [, corpus] = args.splice(0, 2);
  }
  if (args.length !== 1) {
    process.stderr.write(
      "usage: native-stream-corpus-add.mjs [--corpus <dir>] <retained attempt dir>\n",
    );
    process.exit(2);
  }
  try {
    process.stdout.write(
      addToCorpus(args[0], corpus)
        .map((line) => `${line}\n`)
        .join(""),
    );
  } catch (error) {
    if (!(error instanceof Refusal)) {
      throw error;
    }
    process.stderr.write(`refused: ${args[0]}: ${error.message}\n`);
    process.exit(1);
  }
}
