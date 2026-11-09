// Recorded Test Optimization Candidates groups and entries for Intent
// (`./IntentCandidatesRecord.tsx`): a live record's Live candidates, each
// with its five facts, or a four-section record's Pending, Accepted, and
// other sections, with the note that names its profile-only mechanism. Each
// entry shows every recorded field, in its version's section and field order
// (`./testOptimizationCandidatesRecord.ts`). Locations open configured Intent
// files through the shared selection; evidence Markdown links to those files
// do the same. Returning, the entry a test was opened from comes into view,
// and takes the keyboard when the developer activates the tab.

import { useEffect, useId, useRef } from "react";
import type { IntentConfiguredInventory } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesLocationsText } from "./IntentCandidatesLocationsText.tsx";
import type { OpenCandidateLocation } from "./intentWorkspaceSelection.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { RecordedMarkdownText } from "./RecordedMarkdownText.tsx";
import { testOptimizationCandidatesPath } from "./testOptimizationCandidatesPath.ts";
import {
  findingEntryFields,
  findingSections,
  liveCandidateFields,
  liveSectionHeading,
  type CandidateFieldDefinition,
  type RecordSection,
  type TestOptimizationCandidatesRecord,
} from "./testOptimizationCandidatesRecord.ts";

// The entry a test was opened from, which takes the keyboard when the
// developer returns to Optimization Candidates (`./IntentPage.tsx`).
const returnEntryAttribute = "data-return-entry";

export function focusReturnEntry(panel: HTMLElement | null) {
  panel?.querySelector<HTMLElement>(`[${returnEntryAttribute}]`)?.focus();
}

// An entry of either version: its slug and recorded fields by key.
type ShownEntry = { readonly slug: string } & {
  readonly [key: string]: string | undefined;
};

// The record's revision and the selection its locations open into.
type Reading = {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly inventory: IntentConfiguredInventory;
  readonly onOpenLocation: OpenCandidateLocation;
  readonly focusEntrySlug?: string;
};

function Field({
  label,
  fieldKey,
  value,
  entrySlug,
  reading: { source, revision, inventory, onOpenLocation },
}: {
  readonly label: string;
  readonly fieldKey: string;
  readonly value: string;
  readonly entrySlug: string;
  readonly reading: Reading;
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
  fields,
  reading,
}: {
  readonly entry: ShownEntry;
  readonly fields: readonly CandidateFieldDefinition[];
  readonly reading: Reading;
}) {
  const headingId = useId();
  const articleRef = useRef<HTMLElement>(null);
  const { focusEntrySlug } = reading;
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
      {...(focusEntrySlug === entry.slug
        ? { [returnEntryAttribute]: true, tabIndex: -1 }
        : {})}
    >
      <h4 id={headingId}>{entry.slug}</h4>
      <dl>
        {fields.map((field) => {
          const value = entry[field.key];
          if (value === undefined) return null;
          return (
            <Field
              key={field.key}
              label={field.label}
              fieldKey={field.key}
              value={value}
              entrySlug={entry.slug}
              reading={reading}
            />
          );
        })}
      </dl>
    </article>
  );
}

function RecordGroup({
  heading,
  section,
  fields,
  reading,
}: {
  readonly heading: string;
  readonly section: RecordSection<ShownEntry>;
  readonly fields: readonly CandidateFieldDefinition[];
  readonly reading: Reading;
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
        <>
          {section.note === undefined ? null : (
            <p className="intent-candidate-note">
              <RecordedMarkdownText
                text={section.note}
                source={reading.source}
                revision={reading.revision}
                containingFilePath={testOptimizationCandidatesPath}
              />
            </p>
          )}
          {section.entries.map((entry) => (
            <Entry
              key={entry.slug}
              entry={entry}
              fields={fields}
              reading={reading}
            />
          ))}
        </>
      )}
    </section>
  );
}

function Empty({ children }: { readonly children: string }) {
  return (
    <p className="intent-candidates-empty" role="status">
      {children}
    </p>
  );
}

export function IntentCandidatesSections({
  record,
  empty,
  ...reading
}: Reading & {
  readonly record: TestOptimizationCandidatesRecord;
  readonly empty: boolean;
}) {
  if (record.version === "live") {
    return (
      <>
        {empty ? <Empty>This record has no live candidates.</Empty> : null}
        <RecordGroup
          heading={liveSectionHeading}
          section={record.live}
          fields={liveCandidateFields}
          reading={reading}
        />
      </>
    );
  }
  return (
    <>
      {empty ? (
        <Empty>
          This record has no pending candidates or accepted necessary costs.
        </Empty>
      ) : null}
      {findingSections.map(({ heading, key }) => (
        <RecordGroup
          key={key}
          heading={heading}
          section={record[key]}
          fields={findingEntryFields}
          reading={reading}
        />
      ))}
    </>
  );
}
