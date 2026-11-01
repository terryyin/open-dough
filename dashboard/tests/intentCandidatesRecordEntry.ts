// Markdown for one Test Optimization Candidates `###` entry, using the
// format's labelled fields (`../src/testOptimizationCandidates.ts`).

import { candidateEntryFields } from "../src/testOptimizationCandidates.ts";

const fieldLabel = Object.fromEntries(
  candidateEntryFields.map((field) => [field.key, field.label]),
) as Record<(typeof candidateEntryFields)[number]["key"], string>;

export function candidateRecordEntry(
  slug: string,
  fields: {
    locations: string;
    observedCost: string;
    uniqueProtection: string;
    alternativesAttempted: string;
    disposition: string;
    date: string;
    evidence: string;
    humanDecisionNeeded?: string;
  },
): string {
  const human =
    fields.humanDecisionNeeded === undefined
      ? ""
      : `- **${fieldLabel.humanDecisionNeeded}:** ${fields.humanDecisionNeeded}\n`;
  return `### ${slug}

- **${fieldLabel.locations}:** ${fields.locations}
- **${fieldLabel.observedCost}:** ${fields.observedCost}
- **${fieldLabel.uniqueProtection}:** ${fields.uniqueProtection}
- **${fieldLabel.alternativesAttempted}:** ${fields.alternativesAttempted}
- **${fieldLabel.dispositionRationale}:** ${fields.disposition}
- **${fieldLabel.date}:** ${fields.date}
${human}- **${fieldLabel.evidence}:** ${fields.evidence}
`;
}
