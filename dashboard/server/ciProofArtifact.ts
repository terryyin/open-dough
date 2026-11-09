// The CI proof of one GitHub Actions run attempt (`./intentCiProofRead.ts`):
// the run's `ci-proof-summary-attempt-<n>` artifact, listed by that name,
// downloaded as its zip and its one `ci-proof-summary.json` extracted
// (`./zipEntry.ts`), then validated with the collector's own contract and
// used only when it names the asked repository, run, attempt and revision
// (ADR 0008: missing, outdated or conflicting evidence is never a result).
// Every request goes through the CI evidence requests
// (`ci-github-actions.mjs`). A summary is immutable per run attempt, so a
// valid one is remembered by repository, run and attempt for this process's
// lifetime and never asked of GitHub again; every other answer is asked
// again on the next read. A read GitHub left unanswered -- a wait it
// directed, a request that failed, or an artifact listing that is not one --
// is told apart from GitHub's own answer that the run has no usable summary
// (`isUnansweredProof`), since only a later read may still answer it.
import {
  SUMMARY_READ_LIMIT_BYTES,
  summaryArtifactName,
  summaryProblems,
} from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import {
  askGitHubArchive,
  GitHubAcquisitionFailed,
  GitHubAcquisitionHeld,
  readGitHubActions,
} from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import {
  ciProofTooLarge,
  type CiProof,
  type CiProofRun,
} from "../src/ciProof.ts";
import { rememberedByKey } from "./rememberedByKey.ts";
import { onlyZipEntry, ZipEntryProblem, ZipEntryTooLarge } from "./zipEntry.ts";

const summaryFile = "ci-proof-summary.json";
// A summary, file breakdown included, is at most this large
// (ci-proof-contract.mjs); anything larger is not read as one.
const summaryLimitBytes: number = SUMMARY_READ_LIMIT_BYTES;

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

// What a developer can do when the local GitHub request owner passes an
// archive on as text: it ends once nothing on this machine uses it.
export const olderRequestOwnerDetail =
  "This machine's local GitHub request owner was started by an earlier Open Dough and passes the summary on as text. Restart the Open Dough dashboards and CI observers on this machine; the next read starts a current one";

// The unreadable answers of this process's reads that GitHub left
// unanswered, as each was answered.
const unanswered = new WeakSet<CiProof>();

const unansweredAs = (proof: CiProof): CiProof => {
  unanswered.add(proof);
  return proof;
};

// Whether GitHub left the read that answered `proof` unanswered: a wait it
// directed, a request that failed, or an artifact listing that is not one.
// GitHub's own answers -- no summary, an expired one, or an archive that
// cannot be opened or is not this run's usable summary -- are not: a run
// attempt's artifact does not change. Only an answer `readCiProofArtifact`
// gave is told, not a copy of it.
export function isUnansweredProof(proof: CiProof): boolean {
  return unanswered.has(proof);
}

// GitHub refused or could not answer, a directed wait is GitHub's too, or
// the local GitHub request owner could not pass the archive on.
export function unreadableBy(error: unknown): CiProof {
  if (error instanceof GitHubAcquisitionHeld)
    return unansweredAs(
      unavailable(
        "unreadable",
        `GitHub directed a wait of ${String(error.waitSeconds)} s before the next request`,
      ),
    );
  if (error instanceof GitHubAcquisitionFailed) {
    const { failure } = error as { readonly failure?: { kind?: unknown } };
    return unansweredAs(
      unavailable(
        "unreadable",
        failure?.kind === "archive-as-text"
          ? olderRequestOwnerDetail
          : error.message,
      ),
    );
  }
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

const unreadableListing = () =>
  unansweredAs(
    unavailable("unreadable", "GitHub's artifact listing is unreadable"),
  );

// The one listed artifact of `name` for `run` that can be read, or why none
// can.
function chosenArtifact(
  listed: unknown,
  name: string,
  run: CiProofRun,
): number | CiProof {
  const listing: unknown =
    (listed as { readonly artifacts?: unknown } | null)?.artifacts ?? [];
  if (!Array.isArray(listing)) return unreadableListing();
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
  if (typeof only.id !== "number") return unreadableListing();
  if (
    typeof only.size_in_bytes === "number" &&
    only.size_in_bytes > summaryLimitBytes
  )
    return ciProofTooLarge(summaryLimitBytes, only.size_in_bytes);
  return only.id;
}

// Valid summaries read so far, by repository, run and attempt.
const remembered = rememberedByKey<Record<string, unknown>>();
const rememberedKey = (repository: string, run: CiProofRun) =>
  `${repository.toLowerCase()}#${String(run.runId)}#${String(run.runAttempt)}`;

// The valid summary of `run`'s attempt as GitHub has it, not yet checked
// against the asked run, or why none can be read.
async function readSummary(
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
    return unreadableBy(error);
  }
  let summary: unknown;
  try {
    summary = JSON.parse(onlyZipEntry(archive, summaryFile, summaryLimitBytes));
  } catch (error) {
    if (error instanceof ZipEntryTooLarge)
      return ciProofTooLarge(error.limitBytes, error.sizeBytes);
    if (error instanceof ZipEntryProblem)
      return unavailable(
        "unreadable",
        `The ${name} artifact could not be opened: ${error.message}`,
      );
    return unavailable("invalid", `${summaryFile} is not JSON`);
  }
  const problems = summaryProblems(summary) as readonly string[];
  if (problems.length > 0)
    return unavailable("invalid", `${summaryFile}: ${problems.join("; ")}`);
  return { kind: "summary", summary } as CiProof;
}

// The proof of `run` in `repository`: its summary, or why there is none to
// show.
export async function readCiProofArtifact(
  repository: string,
  run: CiProofRun,
  signal: AbortSignal,
): Promise<CiProof> {
  const key = rememberedKey(repository, run);
  const rememberedSummary = remembered.get(key);
  if (rememberedSummary !== undefined)
    return { kind: "summary", summary: rememberedSummary } as CiProof;
  const read = await readSummary(repository, run, signal);
  if (read.kind !== "summary") return read;
  const mismatch = mismatchOf(read.summary, repository, run);
  if (mismatch !== undefined) return unavailable("mismatched", mismatch);
  remembered.set(key, read.summary);
  return read;
}
