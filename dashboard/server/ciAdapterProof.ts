// The CI proof of one ciAdapter attempt (`./intentCiProofRead.ts`): asked of
// the project's configured adapter (`proof`), run from the project folder
// through the shared CI proof read
// (`../../src/skills/dough-test-optimization/scripts/ci-proof-read.mjs`)
// with the collector contract's summary read limit as `answerBytes`, then
// validated with the collector's own contract, read in its current version
// (a version 1 summary's results as legacy evidence) and used only when it
// names the asked repository, attempt (the text form of its `attemptId`) and
// revision (ADR 0008: missing, outdated or conflicting evidence is never a
// result). Asks no `gh`. This module says why a read shows no summary. A
// valid summary is immutable per attempt, so it is remembered by repository
// and attempt for this process's lifetime beside the GitHub Actions summary
// memory (`./ciProofArtifact.ts`); every other answer is asked of the
// adapter again.
import { readCommandProof } from "../../src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs";
import {
  readCiAdapterSummary,
  type CiAdapterSummaryRead,
} from "../../src/skills/dough-test-optimization/scripts/ci-proof-read.mjs";
import {
  ciProofTooLarge,
  type CiAdapterProofAttempt,
  type CiProof,
} from "../src/ciProof.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { ciAdapterFailureOf } from "./ciAdapterFailure.ts";
import { ciAdapterTimeoutMs } from "./ciAdapterTimeout.ts";
import { rememberedByKey } from "./rememberedByKey.ts";

const rememberedKey = (repository: string, attempt: CiAdapterProofAttempt) =>
  JSON.stringify([
    repository.toLowerCase(),
    attempt.runId,
    attempt.attemptId,
    attempt.revision,
  ]);

const unavailable = (
  reason: Extract<CiProof, { kind: "unavailable" }>["reason"],
  detail: string,
): CiProof => ({ kind: "unavailable", reason, detail });

// The proof `read` answers: its summary, or why there is none to show.
function proofOf(read: CiAdapterSummaryRead): CiProof {
  if ("summary" in read)
    return { kind: "summary", summary: read.summary } as CiProof;
  switch (read.why) {
    case "adapter-unavailable":
      return unavailable("none", read.unavailable);
    case "too-large":
      return ciProofTooLarge(read.limitBytes, read.sizeBytes);
    case "invalid":
      return unavailable("invalid", read.problems.join("; "));
    case "mismatched":
      return unavailable(
        "mismatched",
        `it names ${read.names} ${String(read.value)}`,
      );
  }
}

// The proof of `attempt` in `repository` as the adapter configured in
// `folder` answers it: its summary, or why there is none to show.
export function ciAdapterProofReader(
  commandProof: typeof readCommandProof = readCommandProof,
) {
  const remembered = rememberedByKey<Record<string, unknown>>();
  return async (
    repository: string,
    folder: string,
    attempt: CiAdapterProofAttempt,
    signal: AbortSignal,
    // The adapter's time limit; the dashboard's adapter limit unless a test
    // shortens it.
    timeoutMs: number = ciAdapterTimeoutMs(),
  ): Promise<CiProof> => {
    const key = rememberedKey(repository, attempt);
    const kept = remembered.get(key);
    if (kept !== undefined)
      return { kind: "summary", summary: kept } as CiProof;
    let read: CiAdapterSummaryRead;
    try {
      const { adapter } = ciConfiguration(folder);
      if (adapter === undefined)
        return unavailable(
          "unreadable",
          "this project's CI is not read through a ciAdapter",
        );
      read = await readCiAdapterSummary(
        adapter,
        repository,
        attempt,
        {
          signal,
          cwd: folder,
          timeoutMs,
        },
        commandProof,
      );
    } catch (error) {
      if (signal.aborted) throw error;
      return unavailable("unreadable", ciAdapterFailureOf(error, timeoutMs));
    }
    if ("summary" in read) remembered.set(key, read.summary);
    return proofOf(read);
  };
}

export const readCiAdapterProof = ciAdapterProofReader();
