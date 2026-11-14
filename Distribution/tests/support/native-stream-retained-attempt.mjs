// Reads a retained paid native attempt (`<results-dir>/<host>/<case>/
// <attempt-id>/`) for adding to the replay corpus
// (native-stream-corpus-add.mjs), refusing one replay cannot use. Its `record`
// names the host, the case (one or more `/`-separated segments; a publication
// case is `publication/<journey>`), and each events stream
// (`artifact-events:`, or `artifact-<phase>-events:` for a two-stage attempt);
// each stream is read through the shared reader (native-host-stream.mjs).
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  hosts,
  readHostStreamText,
  readStreamFile,
} from "./native-host-stream.mjs";

// Names what a retained attempt lacks for replay.
export class Refusal extends Error {}

// `key: value` lines as a Map of each key's first value, and all values of
// `artifact-*` keys in order.
function keyValues(text) {
  const values = new Map();
  const artifacts = [];
  for (const line of text.split("\n")) {
    const match = /^([a-z-]+): ?(.*)$/.exec(line);
    if (match && !values.has(match[1])) {
      values.set(match[1], match[2]);
    }
    if (match?.[1].startsWith("artifact-")) {
      artifacts.push([match[1], match[2]]);
    }
  }
  return { values, artifacts };
}

// The retained attempt at `attemptDir`: its absolute `attempt` path, `record`
// and `observations` (Maps of first values), `host`, `caseId`, `family`,
// `journey`, and one `phases` entry per stream with its `phase` prefix ("" or
// `<phase>-`), `file`, raw `text`, and the reader's `read`. Throws a Refusal
// naming everything missing: no record, no observations.txt, or a stream that
// is missing or not complete.
export function readRetainedAttempt(attemptDir) {
  const attempt = resolve(attemptDir);
  if (!existsSync(attempt) || !statSync(attempt).isDirectory()) {
    throw new Refusal("not a retained attempt directory");
  }
  const recordPath = join(attempt, "record");
  if (!existsSync(recordPath)) {
    throw new Refusal("no record");
  }
  const record = keyValues(readFileSync(recordPath, "utf8"));
  const host = record.values.get("host");
  const caseId = record.values.get("case") ?? "";
  if (!hosts.includes(host)) {
    throw new Refusal(`record names no known host: ${host ?? "(none)"}`);
  }
  const segments = caseId.split("/");
  const [family, journey, ...rest] = segments;
  if (segments.includes("")) {
    throw new Refusal(`record names no case: ${caseId || "(none)"}`);
  }
  if (family === "publication" && (!journey || rest.length > 0)) {
    throw new Refusal(`record names no publication/<journey> case: ${caseId}`);
  }
  const phases = record.artifacts.flatMap(([key, file]) => {
    const match = /^artifact-(?:([a-z]+)-)?events$/.exec(key);
    return match ? [{ phase: match[1] ? `${match[1]}-` : "", file }] : [];
  });
  if (phases.length === 0) {
    throw new Refusal("record names no events stream (artifact-events:)");
  }
  const missing = [];
  const observationsPath = join(attempt, "observations.txt");
  if (!existsSync(observationsPath)) {
    missing.push("no observations.txt");
  }
  for (const stage of phases) {
    const path = join(attempt, stage.file);
    stage.text = readStreamFile(path);
    stage.read = readHostStreamText(host, stage.text);
    if (!existsSync(path)) {
      missing.push(`stream ${stage.file} is missing`);
    } else if (stage.read.status !== "complete") {
      missing.push(
        `stream ${stage.file} is ${stage.read.status}, not complete`,
      );
    }
  }
  if (missing.length > 0) {
    throw new Refusal(missing.join("; "));
  }
  return {
    attempt,
    record: record.values,
    observations: keyValues(readFileSync(observationsPath, "utf8")).values,
    host,
    caseId,
    family,
    journey,
    phases,
  };
}
