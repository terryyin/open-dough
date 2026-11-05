// The CI proof of the attempt Intent's CI status homepage shows a result of
// (`./IntentCiStatus.tsx`): its own labelled part after the judgment, read
// apart from it through `./authenticatedIntentCiProofRead.ts` once the
// judgment names a GitHub Actions run or a ciAdapter attempt, so the
// judgment is shown first and never changes with it. It names that attempt
// once -- a run's attempt and link, or an adapter's attempt id, and the
// revision -- then one row per declared entry, in the order the project's CI
// declares them, with the counts, their unit and any gap
// (`./ciProofWording.ts`); otherwise one line says why there is no proof to
// show. An adapter attempt whose attemptId another discovered attempt shares
// at its revision is ambiguous: no proof is read for it. A running result's
// proof is its completed ancestor's, the result the homepage shows beside it.
// Proof is read again with each judgment the homepage reads, so Check again
// refreshes both.

import { useEffect, useId, useState } from "react";
import type { IntentCiStatus as Judgment } from "./authenticatedIntentCiStatusRead.ts";
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import { shortSha } from "./baseCiWording.ts";
import {
  ciProofSubjectOf,
  isAdapterProofAttempt,
  type CiProof,
  type CiProofEntry,
} from "./ciProof.ts";
import {
  adapterReadFailedLine,
  adapterUnavailableLine,
  ambiguousAttemptLine,
  ciWallTimeLine,
  entryCountsLine,
  entryGapLines,
  entryPartsLine,
  noAttemptLine,
  noRunLine,
  unavailableLine,
} from "./ciProofWording.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { shownRunOf, type ShownCiProofRun } from "./shownCiProofRun.ts";

export { shownRunOf } from "./shownCiProofRun.ts";

// The proof read's answer, or the boundary's own failure to answer it.
type ProofRead =
  CiProof | { readonly kind: "unanswered"; readonly detail?: string };

function boundaryUnanswered(error: unknown): ProofRead {
  return {
    kind: "unanswered",
    ...(error instanceof Error && error.message !== ""
      ? { detail: error.message }
      : {}),
  };
}

// The one line saying why `proof` shows no counts.
function unavailableOf(
  adapter: boolean,
  proof: Exclude<ProofRead, { kind: "summary" }>,
): string {
  if (proof.kind === "unanswered")
    return adapter
      ? adapterReadFailedLine(proof.detail)
      : unavailableLine("unreadable", proof.detail);
  return (adapter ? adapterUnavailableLine : unavailableLine)(
    proof.reason,
    proof.detail,
  );
}

function ProofEntry({ entry }: { readonly entry: CiProofEntry }) {
  return (
    <li className="intent-ci-proof-entry">
      <code>{entry.path}</code>
      {": "}
      <span className="intent-ci-proof-counts">{entryCountsLine(entry)}</span>
      {"; "}
      <span className="intent-ci-proof-parts">{entryPartsLine(entry)}</span>
      {entryGapLines(entry).map((gap) => (
        <span key={gap} className="intent-ci-proof-gap">
          {"; "}
          {gap}
        </span>
      ))}
      .
    </li>
  );
}

function Linked({
  name,
  url,
}: {
  readonly name: string;
  readonly url: string | undefined;
}) {
  return url === undefined ? (
    name
  ) : (
    <a href={url} target="_blank" rel="noreferrer">
      {name}
    </a>
  );
}

function RunNamed({ run }: { readonly run: ShownCiProofRun }) {
  return (
    <>
      <p className="intent-ci-proof-run">
        {isAdapterProofAttempt(run) ? (
          <>
            Attempt <Linked name={run.attemptId} url={run.runUrl} />
          </>
        ) : (
          <>
            Attempt {run.runAttempt} of{" "}
            <Linked name={`run ${String(run.runId)}`} url={run.runUrl} />
          </>
        )}{" "}
        at <code>{shortSha(run.revision)}</code>.
      </p>
      <p className="intent-ci-wall-time">
        {ciWallTimeLine(run.startedAt, run.completedAt)}
      </p>
    </>
  );
}

const keyOf = (shown: ShownCiProofRun) =>
  JSON.stringify(ciProofSubjectOf(shown));

function ReadProof({
  source,
  run,
}: {
  readonly source: PublishedSource;
  readonly run: ShownCiProofRun;
}) {
  // Read once per mount: the parent keys it by the attempt and the judgment.
  const [proof, setProof] = useState<ProofRead | undefined>(undefined);
  const [subject] = useState(() => ciProofSubjectOf(run));
  const adapter = isAdapterProofAttempt(subject);
  useEffect(() => {
    const controller = new AbortController();
    void readIntentCiProof(source, subject, controller.signal)
      .then((answer) => {
        if (!controller.signal.aborted) setProof(answer);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setProof(boundaryUnanswered(error));
      });
    return () => {
      controller.abort();
    };
  }, [source, subject]);
  return (
    <>
      <RunNamed run={run} />
      {proof === undefined ? (
        <p aria-live="polite" className="intent-ci-proof-checking quiet">
          Checking the CI proof of this {adapter ? "attempt" : "run"}…
        </p>
      ) : proof.kind === "summary" ? (
        <ul className="intent-ci-proof-entries">
          {proof.summary.entries.map((entry) => (
            <ProofEntry key={entry.path} entry={entry} />
          ))}
        </ul>
      ) : (
        <p className="intent-ci-proof-unavailable">
          {unavailableOf(adapter, proof)}
        </p>
      )}
    </>
  );
}

export function IntentCiProof({
  source,
  judgment,
}: {
  readonly source: PublishedSource;
  readonly judgment: Judgment;
}) {
  const run = shownRunOf(judgment);
  const heading = useId();
  return (
    <section className="intent-ci-proof" aria-labelledby={heading}>
      <h4 id={heading}>Proof</h4>
      {run === undefined ? (
        <p className="intent-ci-proof-unavailable">
          {judgment.ciAdapter === true ? noAttemptLine : noRunLine}
        </p>
      ) : run.ambiguous === true && isAdapterProofAttempt(run) ? (
        <>
          <RunNamed run={run} />
          <p className="intent-ci-proof-unavailable">
            {ambiguousAttemptLine(run.attemptId, shortSha(run.revision))}
          </p>
        </>
      ) : (
        <ReadProof
          key={`${keyOf(run)}/${judgment.checkedAt}`}
          source={source}
          run={run}
        />
      )}
    </section>
  );
}
