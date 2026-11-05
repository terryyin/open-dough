// The CI proof of one ciAdapter attempt (`./intentCiProofRead.ts`): asked of
// the project's configured adapter (`proof`), run from the project folder
// with the shared adapter limits as discover is
// (`ci-command-adapter.mjs` `readCommandProof`), then validated with the
// collector's own contract and used only when it names the asked
// repository, attempt (the text form of its `attemptId`) and revision
// (ADR 0008: missing, outdated or conflicting evidence is never a result).
// Asks no `gh`. A valid summary is immutable per attempt, so it is
// remembered by repository and attempt for this process's lifetime beside
// the GitHub Actions summary memory (`./ciProofArtifact.ts`); every other
// answer is asked of the adapter again.
import { readCommandProof } from "../../src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs";
import {
  adapterResponseBytes,
  defaultAdapterTimeoutMs,
  truncateUtf8,
} from "../../src/skills/dough-execute-plan/scripts/ci-command-run.mjs";
import { summaryProblems } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import type { CiAdapterProofAttempt, CiProof } from "../src/ciProof.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { rememberedByKey } from "./rememberedByKey.ts";

// Valid summaries read so far, by repository and attempt.
const remembered = rememberedByKey<Record<string, unknown>>();
const rememberedKey = (repository: string, attempt: CiAdapterProofAttempt) =>
  `${repository.toLowerCase()}#${attempt.runId}#${attempt.attemptId}#${attempt.revision}`;

const unavailable = (
  reason: Extract<CiProof, { kind: "unavailable" }>["reason"],
  detail: string,
): CiProof => ({ kind: "unavailable", reason, detail });

// The most of the adapter's own stderr line a reason shows, bounded like
// its unavailability reason.
const stderrLineBytes = 600;

type AdapterRunError = Error & {
  readonly code?: unknown;
  readonly killed?: boolean;
  readonly stderr?: string;
};

// Why the adapter answered no proof read: it ran past the shared limits,
// exited nonzero (with its last stderr line), or otherwise failed with the
// runner's own error, such as an answer the runner refuses or a command that
// could not start.
function failureOf(error: unknown, timeoutMs: number): string {
  if (!(error instanceof Error)) return String(error);
  const { code, killed, stderr } = error as AdapterRunError;
  if (killed === true)
    return `it gave no answer within ${String(timeoutMs / 1000)} seconds`;
  if (code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER")
    return `its answer is longer than ${String(adapterResponseBytes / 1024)} KiB`;
  if (typeof code === "number") {
    const line = (stderr ?? "")
      .split("\n")
      .map((text) => text.trim())
      .filter((text) => text !== "")
      .at(-1);
    return line === undefined
      ? `it exited with status ${String(code)}`
      : `it exited with status ${String(code)} (${truncateUtf8(line, stderrLineBytes).text})`;
  }
  return error.message;
}

// Why `summary` is not the asked attempt's proof, undefined when it is.
function mismatchOf(
  summary: Record<string, unknown>,
  repository: string,
  attempt: CiAdapterProofAttempt,
): string | undefined {
  if (
    typeof summary.repository !== "string" ||
    summary.repository.toLowerCase() !== repository.toLowerCase()
  )
    return `it names repository ${String(summary.repository)}`;
  // A valid summary names its attemptId and revision as text.
  const { attemptId, revision } = summary as {
    readonly attemptId?: string;
    readonly revision: string;
  };
  if (attemptId === undefined) return `it names run ${String(summary.runId)}`;
  if (attemptId !== attempt.attemptId) return `it names attempt ${attemptId}`;
  if (revision.toLowerCase() !== attempt.revision)
    return `it names revision ${revision}`;
  return undefined;
}

// The proof of `attempt` in `repository` as the adapter configured in
// `folder` answers it: its summary, or why there is none to show.
export async function readCiAdapterProof(
  repository: string,
  folder: string,
  attempt: CiAdapterProofAttempt,
  signal: AbortSignal,
  // The adapter's time limit; the shared adapter limit unless a test
  // shortens it.
  timeoutMs: number = defaultAdapterTimeoutMs,
): Promise<CiProof> {
  const key = rememberedKey(repository, attempt);
  const rememberedSummary = remembered.get(key);
  if (rememberedSummary !== undefined)
    return { kind: "summary", summary: rememberedSummary } as CiProof;
  let answer: { summary?: Record<string, unknown>; unavailable?: string };
  try {
    const { adapter } = ciConfiguration(folder);
    if (adapter === undefined)
      return unavailable(
        "unreadable",
        "this project's CI is not read through a ciAdapter",
      );
    answer = await readCommandProof(
      adapter,
      { repo: repository, branch: attempt.branch },
      {
        runId: attempt.runId,
        attemptId: attempt.attemptId,
        sha: attempt.revision,
      },
      { signal, cwd: folder, timeoutMs },
    );
  } catch (error) {
    if (signal.aborted) throw error;
    return unavailable("unreadable", failureOf(error, timeoutMs));
  }
  const { summary } = answer;
  if (summary === undefined)
    return unavailable("none", answer.unavailable ?? "");
  const problems = summaryProblems(summary) as readonly string[];
  if (problems.length > 0) return unavailable("invalid", problems.join("; "));
  const mismatch = mismatchOf(summary, repository, attempt);
  if (mismatch !== undefined) return unavailable("mismatched", mismatch);
  remembered.set(key, summary);
  return { kind: "summary", summary } as CiProof;
}
