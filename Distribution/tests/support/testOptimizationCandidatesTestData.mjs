// @ts-check
// Domain data for a project's published Test Optimization Candidates record
// (`dashboard/src/testOptimizationCandidatesRecord.ts`), as the Markdown the
// project publishes, in either version. The four-section record has its finding
// sections in order, each `None.` until entries are added, and every entry
// with each required labelled field. The live record, chosen with `live()`,
// has one Live candidates section of entries with the five live facts. A
// case states an entry's slug, its location and any other field it relies
// on; the remaining fields are incidental.
//
// makeMe registers this builder, and native journeys hash makeMe's runtime
// import closure as evidence identity (Distribution/tests/support/native-import-closure.mjs),
// so this module imports no dashboard code: the labels are written as the
// format reference publishes them
// (Distribution/src/skills/dough-test-optimization/references/candidate-record.md).

/** @typedef {import("../../../dashboard/src/testOptimizationCandidatesRecord.ts").FindingEntry} FindingEntry */
/** @typedef {import("../../../dashboard/src/testOptimizationCandidatesRecord.ts").LiveCandidateEntry} LiveCandidateEntry */
/** @typedef {Partial<Omit<FindingEntry, "slug" | "locations">>} FindingFacts */
/** @typedef {Partial<Omit<LiveCandidateEntry, "slug" | "locations">>} LiveCandidateFacts */

/** @type {readonly { label: string, key: Exclude<keyof FindingEntry, "slug"> }[]} */
const findingFields = [
  { label: "Locations / scope", key: "locations" },
  { label: "Observed cost", key: "observedCost" },
  { label: "Unique protection", key: "uniqueProtection" },
  { label: "Alternatives attempted", key: "alternativesAttempted" },
  { label: "Disposition / rationale", key: "dispositionRationale" },
  { label: "Date", key: "date" },
  { label: "Human decision needed", key: "humanDecisionNeeded" },
  { label: "Evidence / follow-up", key: "evidence" },
];

/** @type {readonly { label: string, key: Exclude<keyof LiveCandidateEntry, "slug"> }[]} */
const liveFields = [
  { label: "Affected test or fixture", key: "locations" },
  { label: "Observed cost and conditions", key: "observedCost" },
  { label: "Unique protection", key: "uniqueProtection" },
  { label: "Alternatives tried", key: "alternativesTried" },
  { label: "Decision or evidence needed", key: "decisionOrEvidenceNeeded" },
];

/**
 * One `###` entry's Markdown: each field the entry holds, under its
 * version's label and in that version's order.
 * @template {FindingEntry | LiveCandidateEntry} Entry
 * @param {Entry} entry
 * @param {readonly { label: string, key: Exclude<keyof Entry, "slug"> }[]} fields
 */
function entryText(entry, fields) {
  const lines = fields
    .filter(({ key }) => entry[key] !== undefined)
    .map(({ key, label }) => `- **${label}:** ${String(entry[key])}`)
    .join("\n");
  return `### ${entry.slug}\n\n${lines}\n`;
}

/**
 * @template {FindingEntry | LiveCandidateEntry} Entry
 * @param {readonly Entry[]} entries
 * @param {readonly { label: string, key: Exclude<keyof Entry, "slug"> }[]} fields
 */
const sectionText = (entries, fields) =>
  entries.length === 0
    ? "None.\n"
    : entries.map((entry) => entryText(entry, fields)).join("\n");

/** Fields every entry holds unless the case states them. */
const incidental = {
  observedCost: "about 10s",
  uniqueProtection: "the journey it runs",
  alternativesAttempted: "none",
  date: "2026-11-01",
  evidence: "profile",
};

/** Facts every live candidate holds unless the case states them. */
const incidentalLive = {
  observedCost: "about 10s in one CI attempt",
  uniqueProtection: "the journey it runs",
  alternativesTried: "none",
  decisionOrEvidenceNeeded: "whether a cheaper design keeps the protection",
};

/**
 * An entry holding its section's `disposition` and the incidental fields,
 * each replaced by the fact the case states.
 * @param {string} slug
 * @param {string} locations
 * @param {string} disposition
 * @param {FindingFacts} facts
 * @returns {FindingEntry}
 */
const entryOf = (slug, locations, disposition, facts) => ({
  slug,
  locations,
  ...incidental,
  dispositionRationale: disposition,
  ...facts,
});

export class TestOptimizationCandidatesRecordBuilder {
  /** @type {FindingEntry[]} */
  #pending = [];
  /** @type {FindingEntry[]} */
  #accepted = [];
  /** @type {FindingEntry[]} */
  #profileOnly = [];
  /** @type {string | undefined} */
  #profileOnlyMechanism;
  /** @type {LiveCandidateEntry[] | undefined} */
  #live;

  /**
   * A pending candidate whose Locations / scope names `locations`, as the
   * record writes it, for example a backquoted repository path.
   * @param {string} slug
   * @param {string} locations
   * @param {FindingFacts} [facts] the entry's other fields the case states
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
   * @param {FindingFacts} [facts] the entry's other fields the case states
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

  /**
   * A profile-only exclusion whose Locations / scope names `locations`.
   * @param {string} slug
   * @param {string} locations
   * @param {FindingFacts} [facts] the entry's other fields the case states
   */
  profileOnly(slug, locations, facts = {}) {
    this.#profileOnly.push(
      entryOf(
        slug,
        locations,
        "profile-only exclusion — normal verification and CI still run it.",
        facts,
      ),
    );
    return this;
  }

  /**
   * The note that names this project's profile-only mechanism, recorded
   * before the Profile-only exclusions entries.
   * @param {string} note
   */
  profileOnlyMechanism(note) {
    this.#profileOnlyMechanism = note;
    return this;
  }

  /** The live record, holding `None.` until candidates are added. */
  live() {
    this.#live ??= [];
    return this;
  }

  /**
   * A live candidate whose Affected test or fixture names `affected`, as the
   * record writes it, for example a backquoted repository path.
   * @param {string} slug
   * @param {string} affected
   * @param {LiveCandidateFacts} [facts] the candidate's other facts the case states
   */
  candidate(slug, affected, facts = {}) {
    (this.#live ??= []).push({
      slug,
      locations: affected,
      ...incidentalLive,
      ...facts,
    });
    return this;
  }

  /** @returns {string} the record's published Markdown */
  please() {
    const fourSection =
      this.#pending.length + this.#accepted.length + this.#profileOnly.length;
    if (this.#live !== undefined) {
      if (fourSection > 0 || this.#profileOnlyMechanism !== undefined) {
        throw new Error("A live record holds only live candidates.");
      }
      return `# Test Optimization Candidates

## Live candidates

${sectionText(this.#live, liveFields)}`;
    }
    return `# Test Optimization Candidates

## Pending candidates

${sectionText(this.#pending, findingFields)}
## Accepted necessary costs

${sectionText(this.#accepted, findingFields)}
## Profile-only exclusions

${this.#profileOnlyText()}
## Transferred obligations

None.
`;
  }

  #profileOnlyText() {
    const entries = sectionText(this.#profileOnly, findingFields);
    if (this.#profileOnlyMechanism === undefined) return entries;
    if (this.#profileOnly.length === 0) {
      throw new Error(
        "A profile-only mechanism note opens that section's entries.",
      );
    }
    return `${this.#profileOnlyMechanism}\n\n${entries}`;
  }
}
