// The CI proof of the attempt a judgment shows (`./shownCiProofRun.ts`), as
// Intent's one CI evidence owner reads it (`./IntentCiEvidence.tsx`) through
// `./authenticatedIntentCiProofRead.ts`, and what that proof says now: no
// attempt, checking, unavailable with why, or the attempt's summary. Intent's
// CI status homepage (`./IntentCiProof.tsx`) and a selected entry's or
// folder's Summary (`./IntentScopeProof.tsx`) say it in the same words
// (`./ciProofAbsenceWording.ts`). An ambiguous adapter attempt is never read.

import { useEffect, useRef, useState } from "react";
import type { IntentCiStatus as Judgment } from "./authenticatedIntentCiStatusRead.ts";
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import { shortSha } from "./baseCiWording.ts";
import {
  ciProofSubjectOf,
  isAdapterProofAttempt,
  type CiProof,
} from "./ciProof.ts";
import {
  adapterReadFailedLine,
  adapterUnavailableLine,
  ambiguousAttemptLine,
  noAttemptLine,
  noRunLine,
  unavailableLine,
} from "./ciProofAbsenceWording.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { shownRunOf, type ShownCiProofRun } from "./shownCiProofRun.ts";

// The proof read's answer, or the boundary's own failure to answer it.
export type ProofRead =
  CiProof | { readonly kind: "unanswered"; readonly detail?: string };

// The shown judgment's proof: the attempt it shows, if any, and that
// attempt's proof read once answered.
export type ShownProof = {
  readonly run: ShownCiProofRun | undefined;
  readonly read: ProofRead | undefined;
};

function boundaryUnanswered(error: unknown): ProofRead {
  return {
    kind: "unanswered",
    ...(error instanceof Error && error.message !== ""
      ? { detail: error.message }
      : {}),
  };
}

// The proof of the attempt JUDGMENT shows, read again with each judgment (so
// Check again refreshes both) and kept only for the source, attempt and
// judgment it was read for.
export function useIntentCiShownProof(
  source: PublishedSource,
  judgment: Judgment | undefined,
): ShownProof | undefined {
  const run =
    judgment === undefined || judgment.unpublished === true
      ? undefined
      : shownRunOf(judgment);
  const readable =
    run !== undefined &&
    !(run.ambiguous === true && isAdapterProofAttempt(run));
  const key =
    judgment === undefined || !readable
      ? undefined
      : `${source.id}|${JSON.stringify(ciProofSubjectOf(run))}|${judgment.checkedAt}`;
  const [answer, setAnswer] = useState<
    { readonly key: string; readonly read: ProofRead } | undefined
  >(undefined);
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    const shown = runRef.current;
    if (key === undefined || shown === undefined) return;
    const controller = new AbortController();
    void readIntentCiProof(source, ciProofSubjectOf(shown), controller.signal)
      .then((read) => {
        if (!controller.signal.aborted) setAnswer({ key, read });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setAnswer({ key, read: boundaryUnanswered(error) });
      });
    return () => {
      controller.abort();
    };
  }, [source, key]);

  if (judgment === undefined || judgment.unpublished === true) return undefined;
  return {
    run,
    read: key !== undefined && answer?.key === key ? answer.read : undefined,
  };
}

// What the shown proof says now, each state but a summary with its one line.
// A `too-large` unavailable answer is a problem so Proof and Summary can
// reuse evidence-problem styling.
export type ShownProofState =
  | { readonly kind: "no attempt"; readonly line: string }
  | {
      readonly kind: "checking";
      readonly run: ShownCiProofRun;
      readonly line: string;
    }
  | {
      readonly kind: "unavailable";
      readonly run: ShownCiProofRun;
      readonly line: string;
      readonly problem?: true;
    }
  | {
      readonly kind: "summary";
      readonly run: ShownCiProofRun;
      readonly summary: Extract<CiProof, { kind: "summary" }>["summary"];
    };

// The one line saying why READ shows no counts.
function unavailableOf(
  adapter: boolean,
  read: Exclude<ProofRead, { kind: "summary" }>,
): string {
  if (read.kind === "unanswered")
    return adapter
      ? adapterReadFailedLine(read.detail)
      : unavailableLine({
          kind: "unavailable",
          reason: "unreadable",
          ...(read.detail === undefined ? {} : { detail: read.detail }),
        });
  return (adapter ? adapterUnavailableLine : unavailableLine)(read);
}

export function shownProofStateOf(
  judgment: Judgment,
  { run, read }: ShownProof,
): ShownProofState {
  if (run === undefined)
    return {
      kind: "no attempt",
      line: judgment.ciAdapter === true ? noAttemptLine : noRunLine,
    };
  const adapter = isAdapterProofAttempt(run);
  if (run.ambiguous === true && adapter)
    return {
      kind: "unavailable",
      run,
      line: ambiguousAttemptLine(run.attemptId, shortSha(run.revision)),
    };
  if (read === undefined)
    return {
      kind: "checking",
      run,
      line: `Checking the CI proof of this ${adapter ? "attempt" : "run"}…`,
    };
  if (read.kind !== "summary")
    return {
      kind: "unavailable",
      run,
      line: unavailableOf(adapter, read),
      ...(read.kind !== "unanswered" && read.reason === "too-large"
        ? { problem: true as const }
        : {}),
    };
  return { kind: "summary", run, summary: read.summary };
}
