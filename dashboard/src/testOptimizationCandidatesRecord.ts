// The two published versions of a Test Optimization Candidates record as
// Intent reads them (`./testOptimizationCandidates.ts`): each version's
// section headings and labelled entry fields, in one authoritative order and
// wording for parse and display, and the record shape they parse into. The
// format owner is dough-test-optimization's candidate-record reference.

export type CandidateFieldDefinition = {
  readonly label: string;
  readonly key: string;
  readonly required: boolean;
};

// The live record's one section.
export const liveSectionHeading = "Live candidates";

// A four-section record's finding sections in order, each with the record
// key it parses into.
export const findingSections = [
  { heading: "Pending candidates", key: "pending" },
  { heading: "Accepted necessary costs", key: "accepted" },
  { heading: "Profile-only exclusions", key: "profileOnly" },
  { heading: "Transferred obligations", key: "transferred" },
] as const;

// A four-section record's finding entry fields. Both versions key the
// affected test `locations`, which Intent opens.
export const findingEntryFields = [
  { label: "Locations / scope", key: "locations", required: true },
  { label: "Observed cost", key: "observedCost", required: true },
  { label: "Unique protection", key: "uniqueProtection", required: true },
  {
    label: "Alternatives attempted",
    key: "alternativesAttempted",
    required: true,
  },
  {
    label: "Disposition / rationale",
    key: "dispositionRationale",
    required: true,
  },
  { label: "Date", key: "date", required: true },
  {
    label: "Human decision needed",
    key: "humanDecisionNeeded",
    required: false,
  },
  { label: "Evidence / follow-up", key: "evidence", required: true },
] as const satisfies readonly CandidateFieldDefinition[];

// A live candidate's five facts.
export const liveCandidateFields = [
  { label: "Affected test or fixture", key: "locations", required: true },
  {
    label: "Observed cost and conditions",
    key: "observedCost",
    required: true,
  },
  { label: "Unique protection", key: "uniqueProtection", required: true },
  { label: "Alternatives tried", key: "alternativesTried", required: true },
  {
    label: "Decision or evidence needed",
    key: "decisionOrEvidenceNeeded",
    required: true,
  },
] as const satisfies readonly CandidateFieldDefinition[];

type EntryOf<Fields extends readonly CandidateFieldDefinition[]> = {
  readonly slug: string;
} & {
  readonly [K in Extract<Fields[number], { required: true }>["key"]]: string;
} & {
  readonly [K in Extract<Fields[number], { required: false }>["key"]]?: string;
};

export type FindingEntry = EntryOf<typeof findingEntryFields>;

export type LiveCandidateEntry = EntryOf<typeof liveCandidateFields>;

// A section's entries, or `None.`. A note is the paragraph naming the
// project's exclusion mechanism that opens Profile-only exclusions.
export type RecordSection<Entry> =
  | { readonly kind: "none" }
  | {
      readonly kind: "entries";
      readonly entries: readonly Entry[];
      readonly note?: string;
    };

export type FindingSection = RecordSection<FindingEntry>;

export type TestOptimizationCandidatesRecord =
  | {
      readonly version: "live";
      readonly live: RecordSection<LiveCandidateEntry>;
    }
  | {
      readonly version: "four-section";
      readonly pending: FindingSection;
      readonly accepted: FindingSection;
      readonly profileOnly: FindingSection;
      readonly transferred: FindingSection;
    };
