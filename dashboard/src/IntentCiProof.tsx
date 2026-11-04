// The CI proof of the run Intent's CI status tab shows a result of
// (`./IntentCiStatus.tsx`): its own labelled part after the judgment, read
// apart from it through `./authenticatedIntentCiProofRead.ts` once the
// judgment names a GitHub Actions run, so the judgment is shown first and
// never changes with it. It names that run once -- its revision, link and
// attempt -- then one row per declared entry, in the order the project's CI
// declares them, with the counts, their unit and any gap
// (`./ciProofWording.ts`); otherwise one line says why there is no proof to
// show. A running result's proof is its completed ancestor's run's, the
// result the tab shows beside it. Proof is read again with each judgment
// the tab reads, so Check again refreshes both.

import { useEffect, useId, useState } from "react";
import type { IntentCiStatus as Judgment } from "./authenticatedIntentCiStatusRead.ts";
import { readIntentCiProof } from "./authenticatedIntentCiProofRead.ts";
import { shortSha } from "./baseCiWording.ts";
import type { CiProof, CiProofEntry, CiProofRun } from "./ciProof.ts";
import {
  entryCountsLine,
  entryGapLines,
  entryPartsLine,
  noRunLine,
  unavailableLine,
} from "./ciProofWording.ts";
import type { PublishedSource } from "./publishedSource.ts";

type ShownRun = CiProofRun & { readonly runUrl: string | undefined };

// The run whose result the tab shows: a running result's completed
// ancestor, otherwise the judged result; undefined when it names no GitHub
// Actions run.
export function shownRunOf(judgment: Judgment): ShownRun | undefined {
  const shown =
    judgment.state === "running" ? judgment.completedAncestor : judgment;
  if (shown?.runId === undefined || shown.runAttempt === undefined)
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

function RunNamed({ run }: { readonly run: ShownRun }) {
  const name = `run ${String(run.runId)}`;
  return (
    <p className="intent-ci-proof-run">
      Attempt {run.runAttempt} of{" "}
      {run.runUrl === undefined ? (
        name
      ) : (
        <a href={run.runUrl} target="_blank" rel="noreferrer">
          {name}
        </a>
      )}{" "}
      at <code>{shortSha(run.revision)}</code>.
    </p>
  );
}

function ReadProof({
  source,
  run,
}: {
  readonly source: PublishedSource;
  readonly run: ShownRun;
}) {
  // Read once per mount: the parent keys it by the run and the judgment.
  const [proof, setProof] = useState<CiProof | undefined>(undefined);
  const { runId, runAttempt, revision } = run;
  useEffect(() => {
    const controller = new AbortController();
    void readIntentCiProof(
      source,
      { runId, runAttempt, revision },
      controller.signal,
    )
      .then((answer) => {
        if (!controller.signal.aborted) setProof(answer);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setProof(boundaryUnavailable(error));
      });
    return () => {
      controller.abort();
    };
  }, [source, runId, runAttempt, revision]);
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
      {judgment.ciAdapter === true ? (
        <p className="intent-ci-proof-unavailable">
          {unavailableLine("ci-adapter", undefined)}
        </p>
      ) : run === undefined ? (
        <p className="intent-ci-proof-unavailable">{noRunLine}</p>
      ) : (
        <ReadProof
          key={`${String(run.runId)}/${String(run.runAttempt)}/${run.revision}/${judgment.checkedAt}`}
          source={source}
          run={run}
        />
      )}
    </section>
  );
}
