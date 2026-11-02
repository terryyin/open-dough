// Intent view of the project's published Test Optimization Candidates
// record (`./authenticatedIntentCandidatesRead.ts`): named revision,
// Pending and Accepted groups with every recorded field, other sections
// under their own headings, and distinct explanations for absent,
// unreadable (with retry), mismatched, and empty records. Intent hosts this
// view on its Optimization Candidates tab (`./IntentBrowser.tsx`), apart from
// location browsing.

import { useEffect, useId, useRef, useState } from "react";
import {
  readIntentCandidatesAt,
  type IntentCandidatesReadResult,
} from "./authenticatedIntentCandidatesRead.ts";
import type { IntentConfiguredInventory } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesSections } from "./IntentCandidatesSections.tsx";
import type { OpenCandidateLocation } from "./intentWorkspaceSelection.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { shortRevision } from "./publishedWork.ts";
import {
  parseTestOptimizationCandidates,
  testOptimizationCandidatesPath,
} from "./testOptimizationCandidates.ts";

export function IntentCandidatesRecord({
  source,
  revision,
  inventory,
  onOpenLocation,
  focusEntrySlug,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly inventory: IntentConfiguredInventory;
  readonly onOpenLocation: OpenCandidateLocation;
  readonly focusEntrySlug?: string;
}) {
  const [result, setResult] = useState<
    IntentCandidatesReadResult | "loading" | "failed"
  >("loading");
  const [retry, setRetry] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const titleId = useId();
  const activeRead = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const readId = ++activeRead.current;
    setResult("loading");
    void readIntentCandidatesAt(source, revision, controller.signal)
      .then((read) => {
        if (!controller.signal.aborted && readId === activeRead.current) {
          setReadCount((n) => n + 1);
          setResult(read);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted && readId === activeRead.current) {
          setResult("failed");
        }
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
          inventory={inventory}
          onOpenLocation={onOpenLocation}
          {...(focusEntrySlug === undefined ? {} : { focusEntrySlug })}
        />
      );
    }
  }

  return (
    <section
      className="intent-candidates-record"
      aria-labelledby={titleId}
      data-candidates-reads={String(readCount)}
    >
      <h3 id={titleId}>Test Optimization Candidates</h3>
      <p className="intent-candidates-revision">
        Recorded at revision {shortRevision(revision)} (<code>{revision}</code>
        ).
      </p>
      {body}
    </section>
  );
}
