// Recorded Test Optimization Candidates groups and entries for Intent
// (`./IntentCandidatesRecord.tsx`): Pending, Accepted, and other sections
// with every recorded field, driven by the parser's field order. Locations
// open configured Intent files through the shared selection; evidence Markdown
// links to those files do the same.

import { useEffect, useId, useRef } from "react";
import type { IntentConfiguredInventory } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesLocationsText } from "./IntentCandidatesLocationsText.tsx";
import type { OpenCandidateLocation } from "./intentWorkspaceSelection.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { RecordedMarkdownText } from "./RecordedMarkdownText.tsx";
import {
  candidateEntryFields,
  testOptimizationCandidatesPath,
  type CandidateEntry,
  type FindingSection,
  type TestOptimizationCandidatesRecord,
} from "./testOptimizationCandidates.ts";

const findingGroupOrder = [
  { heading: "Pending candidates", key: "pending" },
  { heading: "Accepted necessary costs", key: "accepted" },
  { heading: "Profile-only exclusions", key: "profileOnly" },
  { heading: "Transferred obligations", key: "transferred" },
] as const;

function Field({
  label,
  fieldKey,
  value,
  source,
  revision,
  inventory,
  entrySlug,
  onOpenLocation,
}: {
  readonly label: string;
  readonly fieldKey: (typeof candidateEntryFields)[number]["key"];
  readonly value: string;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly inventory: IntentConfiguredInventory;
  readonly entrySlug: string;
  readonly onOpenLocation: OpenCandidateLocation;
}) {
  return (
    <div className="intent-candidate-field">
      <dt>{label}</dt>
      <dd>
        {fieldKey === "locations" ? (
          <IntentCandidatesLocationsText
            text={value}
            recordPath={testOptimizationCandidatesPath}
            inventory={inventory}
            entrySlug={entrySlug}
            onOpen={onOpenLocation}
          />
        ) : (
          <RecordedMarkdownText
            text={value}
            source={source}
            revision={revision}
            containingFilePath={testOptimizationCandidatesPath}
            inventory={inventory}
            entrySlug={entrySlug}
            onOpenIntentFile={onOpenLocation}
          />
        )}
      </dd>
    </div>
  );
}

function Entry({
  entry,
  source,
  revision,
  inventory,
  onOpenLocation,
  focusEntrySlug,
}: {
  readonly entry: CandidateEntry;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly inventory: IntentConfiguredInventory;
  readonly onOpenLocation: OpenCandidateLocation;
  readonly focusEntrySlug?: string;
}) {
  const headingId = useId();
  const articleRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (focusEntrySlug !== entry.slug) return;
    articleRef.current?.scrollIntoView({ block: "nearest" });
  }, [focusEntrySlug, entry.slug]);
  return (
    <article
      ref={articleRef}
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
              fieldKey={field.key}
              value={value}
              source={source}
              revision={revision}
              inventory={inventory}
              entrySlug={entry.slug}
              onOpenLocation={onOpenLocation}
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
  inventory,
  onOpenLocation,
  focusEntrySlug,
}: {
  readonly heading: string;
  readonly section: FindingSection;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly inventory: IntentConfiguredInventory;
  readonly onOpenLocation: OpenCandidateLocation;
  readonly focusEntrySlug?: string;
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
            inventory={inventory}
            onOpenLocation={onOpenLocation}
            {...(focusEntrySlug === undefined ? {} : { focusEntrySlug })}
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
  inventory,
  onOpenLocation,
  focusEntrySlug,
}: {
  readonly record: TestOptimizationCandidatesRecord;
  readonly source: PublishedSource;
  readonly revision: string;
  readonly empty: boolean;
  readonly inventory: IntentConfiguredInventory;
  readonly onOpenLocation: OpenCandidateLocation;
  readonly focusEntrySlug?: string;
}) {
  const latestId = useId();
  const focusProps = focusEntrySlug === undefined ? {} : { focusEntrySlug };
  return (
    <>
      {empty ? (
        <p className="intent-candidates-empty" role="status">
          This record has no pending candidates or accepted necessary costs.
        </p>
      ) : null}
      {findingGroupOrder.map(({ heading, key }) => (
        <FindingGroup
          key={key}
          heading={heading}
          section={record[key]}
          source={source}
          revision={revision}
          inventory={inventory}
          onOpenLocation={onOpenLocation}
          {...focusProps}
        />
      ))}
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
