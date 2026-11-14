// Replays a retained publication attempt's stream fields and verdict for
// corpus replay (native-stream-replay.mjs): its journey's stream-field function
// (git-publication-native-stream-fields.mjs) runs on the stream, those fields
// replace the same fields in the retained `observations.txt`, and today's
// assessor reassesses them (git-publication-native-reassess.sh). Adding an
// attempt to the corpus (native-stream-corpus-add.mjs) drafts its verdict the
// same way.
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  hasStreamFields,
  publicationStreamFields,
} from "./git-publication-native-stream-fields.mjs";

const reassess = fileURLToPath(
  new URL("./git-publication-native-reassess.sh", import.meta.url),
);

const observationKey = (line) => /^([a-z-]+):( |$)/.exec(line)?.[1];

// The verdict of a publication journey that derives no stream fields: its
// verdict rests on fixture state alone, so replay checks only its commands,
// status, and response. Null for a journey with stream fields.
export function noFieldsVerdict(journey) {
  return hasStreamFields(journey)
    ? null
    : `not-replayable: ${journey} has no stream fields`;
}

// Checks the reviewed `expected` of a journey that derives no stream fields:
// its verdict, if named, must be noFieldsVerdict, and it names no fields.
// Returns false, checking nothing, for a journey with stream fields.
export function replayFieldless(journey, expected, fail) {
  const verdict = noFieldsVerdict(journey);
  if (verdict === null) {
    return false;
  }
  if (expected.verdict !== undefined && expected.verdict !== verdict) {
    fail(`verdict is ${verdict}, expected ${expected.verdict}`);
  }
  for (const key of expected.fields.keys()) {
    fail(`${key} is not a stream field of ${journey}`);
  }
  return true;
}

// The retained attempt beside the stream at `path`, as reassessment needs it:
// its `observations.txt` with `fields` (a Map of stream fields) replacing the
// same fields and without its former assessment, the retained keys, and its
// response file ("" when none).
export function replayedAttempt(path, fields) {
  const lines = readFileSync(
    join(dirname(path), "observations.txt"),
    "utf8",
  ).split("\n");
  const response = join(dirname(path), "response.md");
  return {
    observations: lines
      .filter((line) => !/^assessment-(status|reason): /.test(line))
      .map((line) => {
        const key = observationKey(line);
        return fields.has(key) ? `${key}: ${fields.get(key)}` : line;
      })
      .join("\n"),
    retained: new Set(lines.map(observationKey)),
    response: existsSync(response) ? response : "",
  };
}

// Compares `journey`'s stream fields from the `host` stream at `path`, each
// passed through its function in `changes` if any, with the reviewed
// `expected` ones. Returns the attempt as reassessment needs it
// (replayedAttempt).
export function replayFields(journey, host, path, expected, changes, fail) {
  const fields = new Map(
    publicationStreamFields(journey, host, path).map(([key, value]) => [
      key,
      String(Object.hasOwn(changes, key) ? changes[key](value) : value),
    ]),
  );
  for (const [key, value] of fields) {
    const want = expected.get(key);
    if (want === undefined) {
      fail(`expected has no ${key}:`);
    } else if (value !== want) {
      fail(`stream field ${key} is ${value}, expected ${want}`);
    }
  }
  for (const key of expected.keys()) {
    if (!fields.has(key)) {
      fail(`${key} is not a stream field of ${journey}`);
    }
  }
  return replayedAttempt(path, fields);
}

// Reassesses each attempt (replayedAttempt) in one assessor process. Returns
// one verdict per attempt: `<status> / <reason>`, or, when the retained
// observations lack fields today's assessor reads,
// `not-replayable: <those fields>`. Throws when reassessment fails.
export function reassessVerdicts(attempts) {
  if (attempts.length === 0) {
    return [];
  }
  const work = mkdtempSync(join(tmpdir(), "native-stream-replay."));
  try {
    const args = attempts.flatMap(({ observations, response }, index) => {
      const file = join(work, `${index}.txt`);
      writeFileSync(file, observations);
      return [file, response];
    });
    const run = spawnSync("bash", [reassess, ...args], { encoding: "utf8" });
    const lines = run.stdout.split("\n");
    if (run.status !== 0 || lines.length <= attempts.length) {
      throw new Error(`reassessment exited ${run.status}: ${run.stderr}`);
    }
    return attempts.map(({ retained }, index) => {
      const [status, reason, read = ""] = lines[index].split("\t");
      const missing = read
        .split(",")
        .filter((key) => key !== "" && !retained.has(key));
      return missing.length > 0
        ? `not-replayable: ${missing.join(", ")}`
        : `${status} / ${reason}`;
    });
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

// Compares each attempt's reassessed verdict with its reviewed `verdict`.
export function replayVerdicts(attempts, failures) {
  let verdicts;
  try {
    verdicts = reassessVerdicts(attempts);
  } catch (error) {
    failures.push(`FAIL: ${error.message}`);
    return;
  }
  attempts.forEach(({ entry, verdict }, index) => {
    if (verdicts[index] !== verdict) {
      failures.push(
        `FAIL: ${entry}: verdict is ${verdicts[index]}, expected ${verdict}`,
      );
    }
  });
}
