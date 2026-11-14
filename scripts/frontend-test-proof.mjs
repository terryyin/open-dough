// Offline Markdown report of one Intent location from a validated CI proof
// summary. CI writes it beside the combined summary for
// `dashboard/frontend-tests`; it runs no tests and changes no verdict.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  summaryProblems,
  unitNoun,
} from "../Distribution/src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";

export const FRONTEND_TEST_PROOF_FILE = "frontend-test-proof.md";

// The artifact name of a GitHub Actions run attempt's frontend test proof.
export function frontendTestProofArtifactName(attempt) {
  return `frontend-test-proof-attempt-${attempt}`;
}

const USAGE = `usage: frontend-test-proof.mjs --summary <summary.json> --entry <path> --out <report.md>
Reads a validated CI proof summary and writes a Markdown report for one entry.
Invalid or missing summary input fails; it never writes an empty passing report.`;

function options(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) throw new Error(USAGE);
    const name = arg.slice(2);
    const value = argv[++index];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`--${name} needs a value`);
    }
    values[name] = value;
  }
  for (const name of ["summary", "entry", "out"]) {
    if (!values[name]) throw new Error(`--${name} is required`);
  }
  return values;
}

function readSummary(path) {
  if (!existsSync(path)) {
    throw new Error(`summary file not found: ${path}`);
  }
  let value;
  try {
    value = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`summary is not valid JSON (${error.message})`, {
      cause: error,
    });
  }
  const problems = summaryProblems(value);
  if (problems.length > 0) {
    throw new Error(`summary is invalid: ${problems.join("; ")}`);
  }
  return value;
}

function evidenceOf(entry) {
  const cases = entry.evidence.filter((item) => item.unit === "case");
  if (cases.length === 1) return cases[0];
  if (entry.evidence.length === 1) return entry.evidence[0];
  throw new Error(
    `${entry.path}: expected one case evidence set for the frontend report`,
  );
}

function durationText(figures) {
  if (figures.durationMs === undefined) return "unavailable";
  return `${figures.durationMs} ms`;
}

function identityLines(summary) {
  const lines = [
    `- Repository: ${summary.repository}`,
    `- Revision: ${summary.revision}`,
  ];
  if (summary.runId !== undefined) {
    lines.push(`- Run ID: ${summary.runId}`);
    lines.push(`- Attempt: ${summary.runAttempt}`);
  } else {
    lines.push(`- Attempt ID: ${summary.attemptId}`);
  }
  return lines;
}

function partLines(evidence) {
  const of = evidence.parts.length;
  return evidence.parts.map((part) => {
    if (part.status === "missing") {
      return `- Part ${part.part} of ${of}: missing (unknown; not a reported zero)`;
    }
    if (part.status === "ambiguous") {
      return `- Part ${part.part} of ${of}: ambiguous (conflicting evidence; not counted)`;
    }
    const counts = `${part.passed} passed, ${part.failed} failed, ${part.other} other`;
    const timed =
      part.durationMs === undefined
        ? "no recorded duration"
        : `${part.durationMs} ms`;
    const label =
      part.passed === 0 && part.failed === 0 && part.other === 0
        ? "present zero"
        : "present";
    return `- Part ${part.part} of ${of}: ${label} (${counts}; ${timed})`;
  });
}

function fileLines(evidence) {
  if (evidence.files === undefined) {
    return [
      "No per-file breakdown is available for the present parts of this entry.",
    ];
  }
  if (evidence.files.length === 0) {
    return [
      "Present parts reported no test files under this entry (reported zero).",
    ];
  }
  return [
    "| File | Passed | Failed | Other | Duration |",
    "| --- | ---: | ---: | ---: | --- |",
    ...evidence.files.map((file) => {
      const untimed =
        file.untimed !== undefined && file.untimed > 0
          ? file.durationMs === undefined
            ? "unavailable"
            : `${durationText(file)} (${file.untimed} untimed)`
          : durationText(file);
      return `| ${file.path} | ${file.passed} | ${file.failed} | ${file.other} | ${untimed} |`;
    }),
  ];
}

function completenessLines(entryPath, evidence) {
  const gaps = evidence.parts.filter((part) => part.status !== "present");
  const unit = unitNoun(evidence.unit, 2);
  if (gaps.length > 0) {
    return [
      "Incomplete. Missing or ambiguous parts leave unknown results; the observed",
      `totals below cover only present parts and do not establish an executed pass of ${entryPath}.`,
    ];
  }
  if (evidence.failed > 0) {
    return [
      `Complete parts with failures: ${evidence.failed} failed ${unit} remain failed; report generation does not change that verdict.`,
    ];
  }
  if (evidence.other > 0) {
    return [
      `Complete parts include ${evidence.other} other ${unit} (skipped or unfinished); this is not an all-passed result.`,
    ];
  }
  return [
    `All declared parts are present. Observed: ${evidence.passed} passed, ${evidence.failed} failed, ${evidence.other} other ${unit}.`,
  ];
}

// Markdown for ENTRY's evidence in a validated SUMMARY.
export function renderFrontendTestProof(summary, entryPath) {
  const problems = summaryProblems(summary);
  if (problems.length > 0) {
    throw new Error(`summary is invalid: ${problems.join("; ")}`);
  }
  const entry = summary.entries.find((item) => item.path === entryPath);
  if (entry === undefined) {
    throw new Error(`summary has no entry ${entryPath}`);
  }
  const evidence = evidenceOf(entry);
  const unit = unitNoun(evidence.unit, 2);
  const untimed =
    evidence.untimed === undefined || evidence.untimed === 0
      ? ""
      : `; ${evidence.untimed} untimed`;
  const duration =
    evidence.durationMs === undefined
      ? `no summed duration recorded${untimed}`
      : `${evidence.durationMs} ms summed recorded test execution${untimed}`;
  return [
    `# Frontend test proof: ${entryPath}`,
    "",
    ...identityLines(summary),
    "",
    "Durations are summed recorded test execution time from the proof record,",
    "not elapsed job wall time.",
    "",
    "Other results include skipped or unfinished selections; the existing",
    "evidence does not distinguish them further.",
    "",
    "## Totals",
    "",
    `${evidence.passed} passed, ${evidence.failed} failed, ${evidence.other} other ${unit}`,
    `Duration: ${duration}`,
    "",
    "## Files",
    "",
    ...fileLines(evidence),
    "",
    "## Evidence parts",
    "",
    ...partLines(evidence),
    "",
    "## Completeness",
    "",
    ...completenessLines(entryPath, evidence),
    "",
  ].join("\n");
}

function run(argv) {
  const values = options(argv);
  const summary = readSummary(values.summary);
  const markdown = renderFrontendTestProof(summary, values.entry);
  mkdirSync(dirname(values.out), { recursive: true });
  writeFileSync(values.out, markdown);
}

function isDirectEntry() {
  if (!process.argv[1]) return false;
  if (import.meta.url === pathToFileURL(process.argv[1]).href) return true;
  try {
    return (
      realpathSync(fileURLToPath(import.meta.url)) ===
      realpathSync(process.argv[1])
    );
  } catch {
    return false;
  }
}

if (isDirectEntry()) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`frontend-test-proof: ${error.message}\n`);
    process.exitCode = 1;
  }
}
