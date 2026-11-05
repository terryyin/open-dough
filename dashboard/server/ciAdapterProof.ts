// The CI proof of one ciAdapter attempt (`./intentCiProofRead.ts`): asked of
// the project's configured adapter (`proof`), run from the project folder
// with the shared adapter limits as discover is
// (`ci-command-adapter.mjs` `readCommandProof`), then validated with the
// collector's own contract and used only when it names the asked
// repository, attempt (the text form of its `attemptId`) and revision
// (ADR 0008: missing, outdated or conflicting evidence is never a result).
// Asks no `gh`, and keeps nothing: every read asks the adapter again.
import { readCommandProof } from "../../src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs";
import { summaryProblems } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import type { CiAdapterProofAttempt, CiProof } from "../src/ciProof.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";

const unavailable = (
  reason: Extract<CiProof, { kind: "unavailable" }>["reason"],
  detail: string,
): CiProof => ({ kind: "unavailable", reason, detail });

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

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
    return `The summary names repository ${String(summary.repository)}`;
  // A valid summary names its attemptId and revision as text.
  const { attemptId, revision } = summary as {
    readonly attemptId?: string;
    readonly revision: string;
  };
  if (attemptId === undefined)
    return `The summary names run ${String(summary.runId)}`;
  if (attemptId !== attempt.attemptId)
    return `The summary names attempt ${attemptId}`;
  if (revision.toLowerCase() !== attempt.revision)
    return `The summary names revision ${revision}`;
  return undefined;
}

// The proof of `attempt` in `repository` as the adapter configured in
// `folder` answers it: its summary, or why there is none to show.
export async function readCiAdapterProof(
  repository: string,
  folder: string,
  attempt: CiAdapterProofAttempt,
  signal: AbortSignal,
): Promise<CiProof> {
  let answer: { summary?: Record<string, unknown>; unavailable?: string };
  try {
    const { adapter } = ciConfiguration(folder);
    if (adapter === undefined)
      return unavailable(
        "unreadable",
        "This project's CI is not read through a ciAdapter",
      );
    answer = await readCommandProof(
      adapter,
      { repo: repository, branch: attempt.branch },
      {
        runId: attempt.runId,
        attemptId: attempt.attemptId,
        sha: attempt.revision,
      },
      { signal, cwd: folder },
    );
  } catch (error) {
    if (signal.aborted) throw error;
    return unavailable("unreadable", messageOf(error));
  }
  const { summary } = answer;
  if (summary === undefined)
    return unavailable("none", answer.unavailable ?? "");
  const problems = summaryProblems(summary) as readonly string[];
  if (problems.length > 0) return unavailable("invalid", problems.join("; "));
  const mismatch = mismatchOf(summary, repository, attempt);
  if (mismatch !== undefined) return unavailable("mismatched", mismatch);
  return { kind: "summary", summary } as CiProof;
}
