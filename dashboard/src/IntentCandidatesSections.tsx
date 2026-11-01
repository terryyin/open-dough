// Recorded Test Optimization Candidates groups and entries for Intent
// (`./IntentCandidatesRecord.tsx`): Pending, Accepted, and other sections
// with every recorded field, driven by the parser's field order.

import { useId } from "react";
import type { PublishedSource } from "./publishedSource.ts";
import { RecordedMarkdownText } from "./RecordedMarkdownText.tsx";
import {
  candidateEntryFields,
  testOptimizationCandidatesPath,
  type CandidateEntry,
  type FindingSection,
  type TestOptimizationCandidatesRecord,
} from "./testOptimizationCandidates.ts";

function Field({
  label,
  value,
  source,
  revision,
}: {
  readonly label: string;
  readonly value: string;
  readonly source: PublishedSource;
  readonly revision: string;
}) {
  return (
    <div className="intent-candidate-field">
      <dt>{label}</dt>
      <dd>
        <RecordedMarkdownText
          text={value}
          source={source}
          revision={revision}
          containingFilePath={testOptimizationCandidatesPath}
        />
      </dd>
    </div>
  );
}

function Entry({
  entry,
  source,
  revision,
}: {
  readonly entry: CandidateEntry;
  readonly source: PublishedSource;
  readonly revision: string;
}) {
  const headingId = useId();
  return (
    <article
      className="intent-candidate-entry"
      aria-labelledby={headingId}
      data-slug={entry.slug}
    >
      <h4 id={headingId}>{entry.slug}</h4>
      <dl>
        {candidateEntryFields.map((field) => {
          const value = entry[field.key];
          if (value === undefined) return null;
          return (
            <Field
              key={field.key}
              label={field.label}
              value={value}
              source={source}
              revision={revision}
            />
          );
        })}
      </dl>
    </article>
  );
}

function FindingGroup({
  heading,
  section,
  source,
  revision,
}: {
  readonly heading: string;
  readonly section: FindingSection;
  readonly source: PublishedSource;
  readonly revision: string;
}) {
  const headingId = useId();
  return (
    <section
      className="intent-candidate-group"
      aria-labelledby={headingId}
      data-group={heading}
    >
      <h3 id={headingId}>{heading}</h3>
      {section.kind === "none" ? (
        <p className="quiet">None.</p>
      ) : (
        section.entries.map((entry) => (
          <Entry
            key={entry.slug}
            entry={entry}
            source={source}
            revision={revision}
          />
        ))
      )}
    </section>
  );
}

export function IntentCandidatesSections({
  record,
  source,
  revision,
  empty,
}: {
  readonly record: TestOptimizationCandidatesRecord;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly empty: boolean;
}) {
  const latestId = useId();
  return (
    <>
      {empty ? (
        <p className="intent-candidates-empty" role="status">
          This record has no pending candidates or accepted necessary costs.
        </p>
      ) : null}
      <FindingGroup
        heading="Pending candidates"
        section={record.pending}
        source={source}
        revision={revision}
      />
      <FindingGroup
        heading="Accepted necessary costs"
        section={record.accepted}
        source={source}
        revision={revision}
      />
      <FindingGroup
        heading="Profile-only exclusions"
        section={record.profileOnly}
        source={source}
        revision={revision}
      />
      <FindingGroup
        heading="Transferred obligations"
        section={record.transferred}
        source={source}
        revision={revision}
      />
      <section className="intent-candidate-group" aria-labelledby={latestId}>
        <h3 id={latestId}>Latest pass</h3>
        <p className="intent-candidate-latest">
          <RecordedMarkdownText
            text={record.latestPass}
            source={source}
            revision={revision}
            containingFilePath={testOptimizationCandidatesPath}
          />
        </p>
      </section>
    </>
  );
}
