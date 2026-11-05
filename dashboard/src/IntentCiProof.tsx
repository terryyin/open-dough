// The CI proof of the attempt Intent's CI status tab shows a result of
// (`./IntentCiStatus.tsx`): its own labelled part after the judgment, read
// apart from it through `./authenticatedIntentCiProofRead.ts` once the
// judgment names a GitHub Actions run or a ciAdapter attempt, so the
// judgment is shown first and never changes with it. It names that attempt
// once -- a run's attempt and link, or an adapter's attempt id, and the
// revision -- then one row per declared entry, in the order the project's CI
// declares them, with the counts, their unit and any gap
// (`./ciProofWording.ts`); otherwise one line says why there is no proof to
// show. A running result's proof is its completed ancestor's, the result the
// tab shows beside it. Proof is read again with each judgment the tab reads,
// so Check again refreshes both.

import { useEffect, useId, useState } from "react";
import type { IntentCiStatus as Judgment } from "./authenticatedIntentCiStatusRead.ts";
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import { shortSha } from "./baseCiWording.ts";
import {
  ciProofSubjectOf,
  isAdapterProofAttempt,
  type CiProof,
  type CiProofEntry,
  type CiProofSubject,
} from "./ciProof.ts";
import {
  entryCountsLine,
  entryGapLines,
  entryPartsLine,
  noAttemptLine,
  noRunLine,
  unavailableLine,
} from "./ciProofWording.ts";
import type { PublishedSource } from "./publishedSource.ts";

type Shown = CiProofSubject & { readonly runUrl: string | undefined };

// The attempt whose result the tab shows: a running result's completed
// ancestor, otherwise the judged result; undefined when it names neither a
// GitHub Actions run nor a ciAdapter attempt.
export function shownRunOf(judgment: Judgment): Shown | undefined {
  const shown =
    judgment.state === "running" ? judgment.completedAncestor : judgment;
  if (shown === undefined) return undefined;
  const { adapterAttempt } = shown;
  if (adapterAttempt !== undefined)
    return shown.runBranch === undefined
      ? undefined
      : {
          runId: String(adapterAttempt.runId),
          attemptId: String(adapterAttempt.attemptId),
          branch: shown.runBranch,
          revision: shown.revision,
          runUrl: shown.runUrl,
        };
  if (shown.runId === undefined || shown.runAttempt === undefined)
    return undefined;
  return {
    runId: shown.runId,
    runAttempt: shown.runAttempt,
    revision: shown.revision,
    runUrl: shown.runUrl,
  };
}

function boundaryUnavailable(error: unknown): CiProof {
  return {
    kind: "unavailable",
    reason: "unreadable",
    ...(error instanceof Error && error.message !== ""
      ? { detail: error.message }
      : {}),
  };
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

function RunNamed({ run }: { readonly run: Shown }) {
  return (
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
  );
}

const keyOf = (shown: Shown) => JSON.stringify(ciProofSubjectOf(shown));

function ReadProof({
  source,
  run,
}: {
  readonly source: PublishedSource;
  readonly run: Shown;
}) {
  // Read once per mount: the parent keys it by the attempt and the judgment.
  const [proof, setProof] = useState<CiProof | undefined>(undefined);
  const [subject] = useState(() => ciProofSubjectOf(run));
  useEffect(() => {
    const controller = new AbortController();
    void readIntentCiProof(source, subject, controller.signal)
      .then((answer) => {
        if (!controller.signal.aborted) setProof(answer);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setProof(boundaryUnavailable(error));
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
          Checking the CI proof of this run…
        </p>
      ) : proof.kind === "summary" ? (
        <ul className="intent-ci-proof-entries">
          {proof.summary.entries.map((entry) => (
            <ProofEntry key={entry.path} entry={entry} />
          ))}
        </ul>
      ) : (
        <p className="intent-ci-proof-unavailable">
          {unavailableLine(proof.reason, proof.detail)}
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
