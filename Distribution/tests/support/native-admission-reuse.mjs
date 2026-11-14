// Facts for a maintainer's host-specific admission impact review. This command
// neither decides semantic applicability nor skips or starts a native run.
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseRecord,
  compareInputIdentity,
} from "./native-admission-reuse-identity.mjs";
import { assessRetainedAdmission } from "./native-admission-reuse-assessment.mjs";

export { candidateIdentity } from "./native-admission-reuse-identity.mjs";

const unknown = (value) => !value || value === "unknown";
const scalarKeys = [
  "host",
  "case",
  "origin",
  "execution-status",
  "assessment-status",
  "native-executable",
  "native-version",
  "native-model",
  "native-runtime-settings",
  "source-revision",
  "fixture-commit",
  "prompt-identity",
  "helper-identity",
  "adapter-identity",
  "fixture-identity",
  "assessor-identity",
];

/**
 * Compare the capture, current assessment and supplied candidate runtime facts.
 * Context is evidence supplied by the caller, never recovered historical facts.
 */
export function compareAdmission({
  attempt: attemptPath,
  candidate: candidatePath,
  context = {},
}) {
  const attempt = resolve(attemptPath);
  const candidate = resolve(candidatePath);
  const gaps = [];
  const report = {
    requirement: "publication/admission-investigation",
    attempt,
    candidate,
    context,
    capture: {},
    differences: {
      complete: false,
      changed: [],
      added: [],
      removed: [],
      unrecorded: [],
    },
    artifacts: [],
    prompt: {},
    runtime: {},
    assessment: { status: "unavailable" },
    gaps,
    reviewQuestions: [
      "Does every affected input group preserve remote Taken with the owned story and claim before the first probe, human edits, and investigation-only behavior? Record a reason, including why unchanged admission coverage still applies.",
      "Review skill descriptions and discovery, applicable registration/hooks, installer output, release identity, helpers and fixtures. Path membership alone cannot establish independence.",
      "Establish prompt and runtime applicability on this result's host. Unknown is not equality; justify any immaterial unknown.",
      "Conclude eligible reuse, fresh proof required, or pending with named gaps in the active work record. Capture and reassessment are separate from applicability and native behavior.",
    ],
  };
  let retained;
  try {
    retained = parseRecord(
      readFileSync(join(attempt, "record"), "utf8"),
      "retained",
      gaps,
    );
  } catch (error) {
    gaps.push(`retained record unavailable: ${error.message}`);
    return report;
  }
  const { values, inputs } = retained;
  report.capture = { facts: Object.fromEntries(values), inputs };
  for (const key of [
    "artifact-events",
    "artifact-response",
    "artifact-stderr",
    "artifact-observations",
  ])
    if (!retained.artifacts.some((artifact) => artifact.key === key))
      gaps.push(`retained ${key} declaration is absent`);
  for (const key of scalarKeys)
    if (unknown(values.get(key)))
      gaps.push(`retained ${key} is unknown or absent`);
  if (values.get("origin") !== "fresh")
    gaps.push("retained origin does not establish fresh execution");
  if (values.get("case") !== report.requirement)
    gaps.push(`retained case differs: ${values.get("case")}`);
  if (values.get("execution-status") !== "completed")
    gaps.push("retained execution did not complete");
  if (values.get("assessment-status") !== "pass")
    gaps.push("retained assessment did not pass");
  const host = values.get("host");
  if (!["codex", "cursor", "claude"].includes(host)) {
    gaps.push(`retained host is unsupported: ${host}`);
    return report;
  }
  report.host = {
    retained: host,
    candidate: context.host ?? "unknown",
    correspondence: unknown(context.host)
      ? "unknown"
      : host === context.host
        ? "same"
        : "different",
  };
  if (report.host.correspondence !== "same")
    gaps.push("candidate host is unknown or differs; no cross-host proof");
  for (const [name, key] of [
    ["version", "native-version"],
    ["model", "native-model"],
    ["runtimeSettings", "native-runtime-settings"],
  ]) {
    const before = values.get(key) ?? "unknown";
    const after = context[name] ?? "unknown";
    const correspondence =
      unknown(before) || unknown(after)
        ? "unknown"
        : before === after
          ? "same"
          : "different";
    report.runtime[name] = {
      retained: before,
      candidate: after,
      correspondence,
      provenance: `retained record ${key}; caller context ${name}`,
    };
    if (correspondence !== "same")
      gaps.push(`${name} correspondence is ${correspondence}`);
  }
  const prompt = values.get("prompt-identity") ?? "unknown";
  report.prompt = {
    retained: prompt,
    candidate: context.promptHash ?? "unknown",
    correspondence:
      unknown(prompt) || unknown(context.promptHash)
        ? "unknown"
        : prompt === context.promptHash
          ? "same"
          : "different",
    provenance:
      "retained record prompt-identity; caller context promptHash (review how it was obtained)",
  };
  if (!/^[a-f0-9]{64}$/.test(prompt))
    gaps.push("retained prompt identity is missing or malformed");
  if (!/^[a-f0-9]{64}$/.test(context.promptHash ?? ""))
    gaps.push("candidate prompt identity is missing or malformed");
  if (report.prompt.correspondence !== "same")
    gaps.push(
      `prompt correspondence is ${report.prompt.correspondence}; review semantic equivalence`,
    );
  Object.assign(
    report,
    compareInputIdentity({ candidate, host, retained, gaps }),
  );
  Object.assign(
    report,
    assessRetainedAdmission({
      candidate,
      attempt,
      host,
      artifacts: retained.artifacts,
      gaps: report.gaps,
    }),
  );
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = {};
  if (
    args.length !== 6 ||
    args.some(
      (arg, index) =>
        index % 2 === 0 &&
        !["--attempt", "--candidate", "--context"].includes(arg),
    )
  ) {
    process.stderr.write(
      "usage: native-admission-reuse.mjs --attempt DIR --candidate CHECKOUT --context FILE.json\n",
    );
    process.exit(2);
  }
  for (let index = 0; index < args.length; index += 2)
    options[args[index].slice(2)] = args[index + 1];
  try {
    const context = JSON.parse(readFileSync(options.context, "utf8"));
    if (!context || typeof context !== "object" || Array.isArray(context))
      throw new Error("context must be an object");
    process.stdout.write(
      `${JSON.stringify(compareAdmission({ attempt: options.attempt, candidate: options.candidate, context }), null, 2)}\n`,
    );
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
