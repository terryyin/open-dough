// Markdown for one Test Optimization Candidates `###` entry, using the
// format's labelled fields as the shared record builder writes them
// (`../../tests/support/testOptimizationCandidatesTestData.mjs`).

import { candidateEntryText } from "../../tests/support/testOptimizationCandidatesTestData.mjs";

export function candidateRecordEntry(
  slug: string,
  {
    disposition,
    ...fields
  }: {
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
  return candidateEntryText({
    slug,
    ...fields,
    dispositionRationale: disposition,
  });
}
