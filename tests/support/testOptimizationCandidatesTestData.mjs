// @ts-check
// Domain data for a project's published Test Optimization Candidates record
// (`dashboard/src/testOptimizationCandidates.ts`), as the Markdown the project
// publishes: its four finding sections in order, each `None.` until entries
// are added, and every entry with each required labelled field. Only the
// facts a case states differ; the other fields are incidental.

import { candidateEntryFields } from "../../dashboard/src/testOptimizationCandidates.ts";

/** @typedef {import("../../dashboard/src/testOptimizationCandidates.ts").CandidateEntry} CandidateEntry */

/**
 * One `###` entry's Markdown: each field the entry holds, under the format's
 * label and in the format's order.
 * @param {CandidateEntry} entry
 */
export function candidateEntryText(entry) {
  const fields = candidateEntryFields
    .filter(({ key }) => entry[key] !== undefined)
    .map(({ key, label }) => `- **${label}:** ${entry[key] ?? ""}`)
    .join("\n");
  return `### ${entry.slug}\n\n${fields}\n`;
}

/** @param {readonly CandidateEntry[]} entries */
const sectionText = (entries) =>
  entries.length === 0 ? "None.\n" : entries.map(candidateEntryText).join("\n");

export class TestOptimizationCandidatesRecordBuilder {
  /** @type {CandidateEntry[]} */
  #pending = [];

  /**
   * A pending candidate whose Locations / scope names `locations`, as the
   * record writes it, for example a backquoted repository path.
   * @param {string} slug
   * @param {string} locations
   */
  pending(slug, locations) {
    this.#pending.push({
      slug,
      locations,
      observedCost: "about 10s",
      uniqueProtection: "the journey it runs",
      alternativesAttempted: "none",
      dispositionRationale: "pending — a cheaper design is credible",
      date: "2026-11-01",
      evidence: "profile",
    });
    return this;
  }

  /** @returns {string} the record's published Markdown */
  please() {
    return `# Test Optimization Candidates

## Pending candidates

${sectionText(this.#pending)}
## Accepted necessary costs

None.

## Profile-only exclusions

None.

## Transferred obligations

None.
`;
  }
}
