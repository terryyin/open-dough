// @ts-check
// Domain data for a project's published Test Optimization Candidates record
// (`dashboard/src/testOptimizationCandidates.ts`), as the Markdown the project
// publishes: its four finding sections in order, each `None.` until entries
// are added, and every entry with each required labelled field. A case states
// an entry's slug, its Locations / scope and any other field it relies on;
// the remaining fields are incidental.
//
// makeMe registers this builder, and native journeys hash makeMe's runtime
// import closure as evidence identity (tests/support/native-import-closure.mjs),
// so this module imports no dashboard code: the labels are written as the
// format reference publishes them
// (src/skills/dough-test-optimization/references/candidate-record.md).

/** @typedef {import("../../dashboard/src/testOptimizationCandidates.ts").CandidateEntry} CandidateEntry */
/** @typedef {Partial<Omit<CandidateEntry, "slug" | "locations">>} CandidateFacts */

/** @type {readonly { label: string, key: Exclude<keyof CandidateEntry, "slug"> }[]} */
const entryFields = [
  { label: "Locations / scope", key: "locations" },
  { label: "Observed cost", key: "observedCost" },
  { label: "Unique protection", key: "uniqueProtection" },
  { label: "Alternatives attempted", key: "alternativesAttempted" },
  { label: "Disposition / rationale", key: "dispositionRationale" },
  { label: "Date", key: "date" },
  { label: "Human decision needed", key: "humanDecisionNeeded" },
  { label: "Evidence / follow-up", key: "evidence" },
];

/**
 * One `###` entry's Markdown: each field the entry holds, under the format's
 * label and in the format's order.
 * @param {CandidateEntry} entry
 */
function entryText(entry) {
  const fields = entryFields
    .filter(({ key }) => entry[key] !== undefined)
    .map(({ key, label }) => `- **${label}:** ${entry[key] ?? ""}`)
    .join("\n");
  return `### ${entry.slug}\n\n${fields}\n`;
}

/** @param {readonly CandidateEntry[]} entries */
const sectionText = (entries) =>
  entries.length === 0 ? "None.\n" : entries.map(entryText).join("\n");

/** Fields every entry holds unless the case states them. */
const incidental = {
  observedCost: "about 10s",
  uniqueProtection: "the journey it runs",
  alternativesAttempted: "none",
  date: "2026-11-01",
  evidence: "profile",
};

/**
 * An entry holding its section's `disposition` and the incidental fields,
 * each replaced by the fact the case states.
 * @param {string} slug
 * @param {string} locations
 * @param {string} disposition
 * @param {CandidateFacts} facts
 * @returns {CandidateEntry}
 */
const entryOf = (slug, locations, disposition, facts) => ({
  slug,
  locations,
  ...incidental,
  dispositionRationale: disposition,
  ...facts,
});

export class TestOptimizationCandidatesRecordBuilder {
  /** @type {CandidateEntry[]} */
  #pending = [];
  /** @type {CandidateEntry[]} */
  #accepted = [];

  /**
   * A pending candidate whose Locations / scope names `locations`, as the
   * record writes it, for example a backquoted repository path.
   * @param {string} slug
   * @param {string} locations
   * @param {CandidateFacts} [facts] the entry's other fields the case states
   */
  pending(slug, locations, facts = {}) {
    this.#pending.push(
      entryOf(slug, locations, "pending — a cheaper design is credible", facts),
    );
    return this;
  }

  /**
   * An accepted necessary cost whose Locations / scope names `locations`.
   * @param {string} slug
   * @param {string} locations
   * @param {CandidateFacts} [facts] the entry's other fields the case states
   */
  accepted(slug, locations, facts = {}) {
    this.#accepted.push(
      entryOf(
        slug,
        locations,
        "accepted necessary cost — the protection is unique. No skip/exclusion.",
        facts,
      ),
    );
    return this;
  }

  /** @returns {string} the record's published Markdown */
  please() {
    return `# Test Optimization Candidates

## Pending candidates

${sectionText(this.#pending)}
## Accepted necessary costs

${sectionText(this.#accepted)}
## Profile-only exclusions

None.

## Transferred obligations

None.
`;
  }
}
