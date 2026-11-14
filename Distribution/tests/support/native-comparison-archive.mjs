// Immutable, account-free observations. Capture provenance stays distinct from
// a current assessor's derived judgment and from comparison applicability.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import {
  digest,
  parseFields,
  retainedTurns,
  retainedTestRuns,
  safeObservations,
} from "./native-comparison-archive-evidence.mjs";
import { retainedUsage } from "./native-comparison-archive-usage.mjs";
import { assessBaseline } from "./native-comparison-archive-assessment.mjs";
import { appliedSettings } from "./native-comparison-settings.mjs";

export { assessBaseline } from "./native-comparison-archive-assessment.mjs";

const safe = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_ .:=+,-]+$/.test(value)
    ? value
    : "unknown";
const sha = (file) => digest(readFileSync(file));

export function readBaseline(file) {
  const result = JSON.parse(readFileSync(file, "utf8"));
  const { integrity, ...value } = result;
  if (
    value.schema !== "native-comparison-baseline/v1" ||
    integrity !== digest(JSON.stringify(value))
  )
    throw new Error("baseline is malformed or its integrity does not match");
  if (
    !value.capture?.complete ||
    !value.evidence?.turns?.length ||
    !value.inputs?.length ||
    !/^[0-9a-f]{40}$/.test(value.payload?.revision ?? "")
  )
    throw new Error("baseline is incomplete");
  for (const turn of value.evidence.turns) {
    if (
      turn.status !== "completed" ||
      (turn.proofStatus === "passed" &&
        !turn.proof.some(
          (call) => call.status === "passed" && call.exitCode === 0,
        ))
    )
      throw new Error("baseline lacks decisive proof");
  }
  return result;
}

function writeBaseline(destination, archive) {
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, `${JSON.stringify(archive)}\n`, { flag: "wx" });
  return archive;
}

function attemptFor(input, arm) {
  const record = parseFields(readFileSync(join(input, "record"), "utf8"));
  if (!record.has("comparison")) return input;
  const relative = record.get(`${arm}-attempt`);
  if (!relative || relative.includes("..") || relative.startsWith("/"))
    throw new Error("pair has no retained arm");
  for (
    let root = resolve(input);
    dirname(root) !== root;
    root = dirname(root)
  ) {
    if (existsSync(join(root, relative, "record"))) return join(root, relative);
  }
  throw new Error("pair arm's raw evidence is unavailable");
}

export function exportBaseline(
  input,
  destination,
  source,
  temporary,
  arm = "baseline",
) {
  if (existsSync(destination))
    throw new Error("refusing to overwrite an existing baseline observation");
  if (statSync(input).isFile())
    return writeBaseline(destination, readBaseline(input));
  const attempt = attemptFor(input, arm),
    raw = readFileSync(join(attempt, "record"), "utf8"),
    record = parseFields(raw);
  const text = readFileSync(join(attempt, "observations.txt"), "utf8"),
    observations = safeObservations(text);
  if (!["pass", "fail"].includes(observations.get("assessment-status")))
    throw new Error("baseline has no completed original assessment");
  const revision = record.get("payload-revision");
  if (!/^[0-9a-f]{40}$/.test(revision ?? ""))
    throw new Error("baseline payload is not a resolved frozen revision");
  if (/^unstarted:|^turn-\d+-stopped:/m.test(text))
    throw new Error("baseline stopped before its outcome was judged");
  const inputs = raw.split("\n").flatMap((line) => {
    const match = /^input-hash: ([0-9a-f]{64}) ([a-zA-Z0-9_./-]+)$/.exec(line);
    return match ? [{ path: match[2], sha256: match[1] }] : [];
  });
  if (!inputs.length) throw new Error("baseline lacks input provenance");
  const turns = retainedTurns(attempt, observations, record);
  const settings = appliedSettings(raw).map(safe);
  const archive = {
    schema: "native-comparison-baseline/v1",
    case: record.get("case")?.replace(/^native-comparison\//, ""),
    capture: {
      complete: true,
      observedAt: /^\d{4}-\d{2}-\d{2}T[0-9:.]+Z$/.test(
        record.get("observed-at") ?? "",
      )
        ? record.get("observed-at")
        : "unknown",
      exportedAt: new Date().toISOString(),
      recordHash: digest(raw),
      observationsHash: digest(text),
      originalAssessment: observations.get("assessment-status"),
      sourceRevision: safe(record.get("source-revision")),
      attempt: /^\d{8}T\d{6}-[a-z0-9]+$/.test(basename(attempt))
        ? basename(attempt)
        : digest(basename(attempt)),
    },
    exporter: {
      archiveHash: sha(fileURLToPath(import.meta.url)),
      settingsHash: sha(
        join(
          source,
          "Distribution/tests/support/native-comparison-settings.mjs",
        ),
      ),
      evidenceHash: sha(
        join(
          source,
          "Distribution/tests/support/native-comparison-archive-evidence.mjs",
        ),
      ),
      usageHash: sha(
        join(
          source,
          "Distribution/tests/support/native-comparison-archive-usage.mjs",
        ),
      ),
      assessmentHash: sha(
        join(
          source,
          "Distribution/tests/support/native-comparison-archive-assessment.mjs",
        ),
      ),
    },
    payload: {
      revision,
      digest: record.get("payload-digest"),
      requested: safe(record.get("payload-requested")),
    },
    inputs,
    projectBasis: safe(record.get("project-basis")),
    conditions: {
      host: "codex",
      route: safe(record.get("host-route")),
      version: safe(record.get("native-version")),
      settings: [...new Set(settings)].sort(),
      requestedSettings: safe(record.get("native-requested-settings")),
      loadStart: safe(record.get("host-load-start")),
      loadEnd: safe(record.get("host-load-end")),
      machine: safe(record.get("machine")),
    },
    observations: Object.fromEntries(observations),
    evidence: { turns, testRuns: retainedTestRuns(attempt, observations) },
    usage: retainedUsage(
      attempt,
      record.get("thread"),
      raw.split("\n").filter((line) => line.startsWith("codex-worker: "))
        .length,
    ),
    limits: [
      "one historical stochastic observation, not a fresh concurrent pair",
      "seconds include the recorded load and service latency",
      "unknown usage is not zero; worker and response attribution is required for totals",
    ],
  };
  archive.integrity = digest(JSON.stringify(archive));
  const derived = assessBaseline(archive, source, temporary);
  // The immutable observation records the assessment at export separately from
  // original capture. Later reassessments name this archive without changing it.
  delete archive.integrity;
  delete derived.sourceIntegrity;
  derived.sourceRecordHash = archive.capture.recordHash;
  archive.exportAssessment = derived;
  archive.integrity = digest(JSON.stringify(archive));
  return writeBaseline(destination, archive);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [operation, input, output, source, temporary, arm] =
    process.argv.slice(2);
  try {
    if (operation === "export") {
      const archive = exportBaseline(input, output, source, temporary, arm);
      process.stdout.write(
        `saved-baseline: ${output}\nbaseline-outcome: ${archive.exportAssessment.status}\nbaseline-integrity: ${archive.integrity}\n`,
      );
    } else if (operation === "assess") {
      const archive = readBaseline(input);
      const result = assessBaseline(archive, source, temporary);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else throw new Error("unknown baseline operation");
  } catch (error) {
    process.stderr.write(`error: ${error.message}\n`);
    process.exitCode = 2;
  }
}
