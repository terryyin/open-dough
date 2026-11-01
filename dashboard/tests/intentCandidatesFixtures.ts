// Published Test Optimization Candidates records for Intent journeys
// (`./intent-test-optimization-candidates.spec.ts`), shaped like the real
// Open Dough record summarised in SEED-192.

import { candidateEntryFields } from "../src/testOptimizationCandidates.ts";
import { testOptimizationCandidatesPath } from "../src/testOptimizationCandidatesPath.ts";
import {
  browseSpec,
  openDough,
  openDoughSettings,
  publishIntentProject,
  shellCheck,
} from "./intentCodeBrowseFixtures.ts";

export { testOptimizationCandidatesPath };

export const evidenceDocPath = "docs/maintainer/dashboard-test-value-review.md";

export const evidenceDoc = `# Dashboard test value review

Section for candidates evidence.
`;

const fieldLabel = Object.fromEntries(
  candidateEntryFields.map((field) => [field.key, field.label]),
) as Record<(typeof candidateEntryFields)[number]["key"], string>;

function entry(
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

// Open Dough-shaped record: one pending, three accepted, evidence Markdown
// link, and a `sha:path` reference kept as recorded text.
export const openDoughCandidatesRecord = `# Test Optimization Candidates

## Latest pass

- **Command / scope:** fixture pass for Intent candidates review
- **Revision:** ${openDough.revision}
- **Before / after:** unavailable
- **Outcome:** incomplete measurement
- **Limits:** fixture only
- **Evidence:** [value/cost assessment](../${evidenceDocPath})

## Pending candidates

${entry("launch-records-poll-waits", {
  locations:
    "`agent-completion-attention.spec.ts` waits and close/reopen races in `agent-launch-ad-hoc-terminal.spec.ts`",
  observedCost:
    "about 60 summed seconds waiting for the next launch-records read",
  uniqueProtection: "a delivered report reaches the open page without a reload",
  alternativesAttempted:
    "none. Existing page clock infrastructure is unused here",
  disposition:
    "pending — a cheaper design that reuses existing test infrastructure is credible",
  date: "2026-11-01",
  humanDecisionNeeded:
    "whether a page-clock redesign is worth the rewrite before optimizing",
  evidence:
    "SEED-208 Results in `40e1d2f9:.planning/slice-plans/432-reduce-dashboard-proof-cost/PLAN.md`",
})}
## Accepted necessary costs

${entry("story-review-completed-journey-landed-runs-tail", {
  locations: "`story-review-completed.spec.ts` trailing Landed runs radio",
  observedCost: "focused journey wall ≈9.69–10.00s (1 case)",
  uniqueProtection:
    "Published completion → Landed runs → Published completion round trip",
  alternativesAttempted: "end journey before Landed runs — no wall gain",
  disposition:
    "accepted necessary cost — retain the one integrated selection path. No skip/exclusion.",
  date: "2026-11-01",
  evidence: `[source comparison and ROI](../${evidenceDocPath})`,
})}
${entry("agent-launch-poles", {
  locations:
    "`dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts` and `dashboard/tests/agent-launch-second-server.spec.ts`",
  observedCost: "second-server case measured 52.5s / 51.2s after SEED-176",
  uniqueProtection: "dual-preview page protection through reload",
  alternativesAttempted:
    "cheaper server-only refusal already moved to boundary",
  disposition:
    "accepted necessary cost — preserve the unique multi-step journeys. Acceptance excludes nothing.",
  date: "2026-10-30",
  evidence: `[SEED-176 local measurements](../${evidenceDocPath})`,
})}
${entry("long-integrated-journeys", {
  locations:
    "`dashboard/tests/agent-completion-attention.spec.ts` and production-watcher chains",
  observedCost: "approximately 39.6s attention case on the SEED-177 baseline",
  uniqueProtection:
    "attention reporting remains durable through column changes",
  alternativesAttempted:
    "policy consolidation moved detailed proof to boundary",
  disposition:
    "accepted necessary cost — retain unique integrated protection. Acceptance grants no coverage reduction.",
  date: "2026-10-30",
  evidence: "accepted triage at `03424649`",
})}
## Profile-only exclusions

None.

## Transferred obligations

None.
`;

export const emptyCandidatesRecord = `# Test Optimization Candidates

## Latest pass

- **Command / scope:** empty finding pass
- **Revision:** fixture
- **Before / after:** unavailable
- **Outcome:** no demonstrated gain
- **Limits:** none
- **Evidence:** none

## Pending candidates

None.

## Accepted necessary costs

None.

## Profile-only exclusions

None.

## Transferred obligations

None.
`;

export const mismatchedCandidatesRecord = `# Not A Candidates Record

## Something else

Body that Intent must not partially show.
`;

export function publishOpenDoughWithCandidates(
  page: Parameters<typeof publishIntentProject>[0],
  record: string = openDoughCandidatesRecord,
) {
  return publishIntentProject(page, openDough, openDoughSettings, {
    [testOptimizationCandidatesPath]: record,
    [evidenceDocPath]: evidenceDoc,
    "dashboard/tests/intent-gherkin-browse.spec.ts": browseSpec,
    "dashboard/tests/agent-launch-second-server.spec.ts": browseSpec,
    "tests/compare-versions.sh": shellCheck,
  });
}
