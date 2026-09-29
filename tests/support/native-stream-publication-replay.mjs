// Replays a retained publication attempt's stream fields and verdict for
// corpus replay (native-stream-replay.mjs): its journey's stream-field function
// (git-publication-native-stream-fields.mjs) runs on the stream, those fields
// replace the same fields in the retained `observations.txt`, and today's
// assessor reassesses them (git-publication-native-reassess.sh).
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
import { publicationStreamFields } from "./git-publication-native-stream-fields.mjs";

const reassess = fileURLToPath(
  new URL("./git-publication-native-reassess.sh", import.meta.url),
);

const observationKey = (line) => /^([a-z-]+):( |$)/.exec(line)?.[1];

// Compares `journey`'s stream fields from the `host` stream at `path`, each
// passed through its function in `changes` if any, with the reviewed
// `expected` ones. Returns what reassessment needs: the retained observations
// with those fields replaced and without their former assessment, the retained
// keys, and the response file ("" when none).
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

// Reassesses each attempt's replayed observations in one assessor process and
// compares the verdict with the reviewed one: `<status> / <reason>`, or, when
// the retained observations lack fields today's assessor reads,
// `not-replayable: <those fields>`.
export function replayVerdicts(attempts, failures) {
  if (attempts.length === 0) {
    return;
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
      failures.push(`FAIL: reassessment exited ${run.status}: ${run.stderr}`);
      return;
    }
    attempts.forEach(({ entry, retained, verdict }, index) => {
      const [status, reason, read = ""] = lines[index].split("\t");
      const missing = read
        .split(",")
        .filter((key) => key !== "" && !retained.has(key));
      const actual =
        missing.length > 0
          ? `not-replayable: ${missing.join(", ")}`
          : `${status} / ${reason}`;
      if (actual !== verdict) {
        failures.push(
          `FAIL: ${entry}: verdict is ${actual}, expected ${verdict}`,
        );
      }
    });
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
