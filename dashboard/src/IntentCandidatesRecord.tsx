// Intent view of the project's published Test Optimization Candidates
// record (`./authenticatedIntentCandidatesRead.ts`): named revision,
// Pending and Accepted groups with every recorded field, other sections
// under their own headings, and distinct explanations for absent,
// unreadable (with retry), mismatched, and empty records. Location
// browsing stays with the Intent browser that hosts this view.

import { useEffect, useId, useState } from "react";
import {
  readIntentCandidatesAt,
  type IntentCandidatesReadResult,
} from "./authenticatedIntentCandidatesRead.ts";
import { IntentCandidatesSections } from "./IntentCandidatesSections.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { shortRevision } from "./publishedWork.ts";
import {
  parseTestOptimizationCandidates,
  testOptimizationCandidatesPath,
} from "./testOptimizationCandidates.ts";

export function IntentCandidatesRecord({
  source,
  revision,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
}) {
  const [result, setResult] = useState<
    IntentCandidatesReadResult | "loading" | "failed"
  >("loading");
  const [retry, setRetry] = useState(0);
  const titleId = useId();

  useEffect(() => {
    const controller = new AbortController();
    setResult("loading");
    void readIntentCandidatesAt(source, revision, controller.signal)
      .then((read) => {
        if (!controller.signal.aborted) setResult(read);
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult("failed");
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, retry]);

  const retryButton = (
    <button
      type="button"
      onClick={() => {
        setRetry((n) => n + 1);
      }}
    >
      Retry
    </button>
  );

  let body;
  if (result === "loading") {
    body = <p className="quiet">Reading Test Optimization Candidates…</p>;
  } else if (result === "failed" || result.status === "unreadable") {
    body = (
      <p className="intent-candidates-problem" role="alert">
        {testOptimizationCandidatesPath} could not be read at this revision.{" "}
        {retryButton}
      </p>
    );
  } else if (result.status === "absent") {
    body = (
      <p className="intent-candidates-absent" role="status">
        No Test Optimization Candidates record has been published for{" "}
        {source.label} at this revision.
      </p>
    );
  } else {
    const parsed = parseTestOptimizationCandidates(result.text);
    if (parsed.status === "mismatched") {
      body = (
        <p className="intent-candidates-problem" role="alert">
          {testOptimizationCandidatesPath} is not a Test Optimization Candidates
          record, so Intent shows none of its contents.
        </p>
      );
    } else {
      body = (
        <IntentCandidatesSections
          record={parsed.record}
          source={source}
          revision={revision}
          empty={parsed.empty}
        />
      );
    }
  }

  return (
    <section className="intent-candidates-record" aria-labelledby={titleId}>
      <h3 id={titleId}>Test Optimization Candidates</h3>
      <p className="intent-candidates-revision">
        Recorded at revision {shortRevision(revision)} (<code>{revision}</code>
        ).
      </p>
      {body}
    </section>
  );
}
