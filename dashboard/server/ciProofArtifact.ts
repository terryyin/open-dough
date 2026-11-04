// The CI proof of one GitHub Actions run attempt (`./intentCiProofRead.ts`):
// the run's `ci-proof-summary-attempt-<n>` artifact, listed by that name,
// downloaded as its zip and its one `ci-proof-summary.json` extracted
// (`./zipEntry.ts`), then validated with the collector's own contract and
// used only when it names the asked repository, run, attempt and revision
// (ADR 0008: missing, outdated or conflicting evidence is never a result).
// Every request goes through the CI evidence requests
// (`ci-github-actions.mjs`); nothing is kept beyond the request.
import {
  summaryArtifactName,
  summaryProblems,
} from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import {
  askGitHubArchive,
  GitHubAcquisitionFailed,
  GitHubAcquisitionHeld,
  readGitHubActions,
} from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import type { CiProof, CiProofRun } from "../src/ciProof.ts";
import { onlyZipEntry, ZipEntryProblem } from "./zipEntry.ts";

const summaryFile = "ci-proof-summary.json";
// A summary is a few kilobytes; anything far larger is not one.
const summaryLimitBytes = 1024 * 1024;

type ListedArtifact = {
  readonly id?: unknown;
  readonly name?: unknown;
  readonly expired?: unknown;
  readonly size_in_bytes?: unknown;
  readonly workflow_run?: { readonly id?: unknown } | null;
};

const unavailable = (
  reason: Extract<CiProof, { kind: "unavailable" }>["reason"],
  detail?: string,
): CiProof => ({
  kind: "unavailable",
  reason,
  ...(detail === undefined ? {} : { detail }),
});

// GitHub refused or could not answer; a directed wait is GitHub's too.
function refusedBy(error: unknown): CiProof {
  if (error instanceof GitHubAcquisitionHeld)
    return unavailable(
      "refused",
      `GitHub directed a wait of ${String(error.waitSeconds)} s before the next request`,
    );
  if (error instanceof GitHubAcquisitionFailed)
    return unavailable("refused", error.message);
  throw error;
}

// Why `summary` is not the asked run's proof, undefined when it is.
function mismatchOf(
  summary: Record<string, unknown>,
  repository: string,
  run: CiProofRun,
): string | undefined {
  if (
    typeof summary.repository !== "string" ||
    summary.repository.toLowerCase() !== repository.toLowerCase()
  )
    return `The summary names repository ${String(summary.repository)}`;
  if (summary.runId !== run.runId)
    return `The summary names run ${String(summary.runId)}`;
  if (summary.runAttempt !== run.runAttempt)
    return `The summary names attempt ${String(summary.runAttempt)}`;
  if (summary.revision !== run.revision)
    return `The summary names revision ${String(summary.revision)}`;
  return undefined;
}

// The one listed artifact of `name` for `run` that can be read, or why none
// can.
function chosenArtifact(
  listed: unknown,
  name: string,
  run: CiProofRun,
): number | CiProof {
  const listing: unknown =
    (listed as { readonly artifacts?: unknown } | null)?.artifacts ?? [];
  if (!Array.isArray(listing))
    return unavailable("invalid", "GitHub's artifact listing is unreadable");
  const artifacts = listing as readonly ListedArtifact[];
  const named = artifacts.filter(
    (artifact) =>
      artifact.name === name &&
      (artifact.workflow_run?.id ?? run.runId) === run.runId,
  );
  if (named.length === 0) return unavailable("none");
  const kept = named.filter((artifact) => artifact.expired !== true);
  if (kept.length === 0) return unavailable("expired");
  const [only] = kept;
  if (kept.length > 1 || only === undefined)
    return unavailable("invalid", `The run has more than one ${name}`);
  if (typeof only.id !== "number")
    return unavailable("invalid", "GitHub's artifact listing is unreadable");
  if (
    typeof only.size_in_bytes === "number" &&
    only.size_in_bytes > summaryLimitBytes
  )
    return unavailable("invalid", `${name} is too large to be a summary`);
  return only.id;
}

// The proof of `run` in `repository`: its summary, or why there is none to
// show.
export async function readCiProofArtifact(
  repository: string,
  run: CiProofRun,
  signal: AbortSignal,
): Promise<CiProof> {
  const name = summaryArtifactName(run.runAttempt);
  let archive: Buffer;
  try {
    const listed: unknown = await readGitHubActions(
      [
        "api",
        `repos/${repository}/actions/runs/${String(run.runId)}/artifacts?name=${name}&per_page=100`,
      ],
      signal,
    );
    const chosen = chosenArtifact(listed, name, run);
    if (typeof chosen !== "number") return chosen;
    archive = await askGitHubArchive(
      ["api", `repos/${repository}/actions/artifacts/${String(chosen)}/zip`],
      signal,
    );
  } catch (error) {
    return refusedBy(error);
  }
  let summary: unknown;
  try {
    summary = JSON.parse(onlyZipEntry(archive, summaryFile, summaryLimitBytes));
  } catch (error) {
    return unavailable(
      "invalid",
      error instanceof ZipEntryProblem
        ? `The ${name} artifact is unreadable: ${error.message}`
        : `${summaryFile} is not JSON`,
    );
  }
  const problems = summaryProblems(summary) as readonly string[];
  if (problems.length > 0)
    return unavailable("invalid", `${summaryFile}: ${problems.join("; ")}`);
  const valid = summary as Record<string, unknown>;
  const mismatch = mismatchOf(valid, repository, run);
  if (mismatch !== undefined) return unavailable("mismatched", mismatch);
  return { kind: "summary", summary: valid } as CiProof;
}
