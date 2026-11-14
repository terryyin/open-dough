// Published Test Optimization Candidates records for Intent journeys
// (`./intent/intent-test-optimization-candidates.spec.ts`), shaped like the real
// Open Dough, Doughnut, and Pygardon records summarised in SEED-192.

import { testOptimizationCandidatesPath } from "../src/testOptimizationCandidatesPath.ts";
import {
  browseSpec,
  openDough,
  openDoughSettings,
  publishIntentProject,
  shellCheck,
} from "./intentCodeBrowseFixtures.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

export { testOptimizationCandidatesPath };

export {
  doughnutFeaturePath,
  publishDoughnutWithCandidates,
  publishPygardonOutsideConfigured,
  pygardonClipPath,
} from "./intentCandidatesOtherProjectFixtures.ts";

export const evidenceDocPath = "docs/maintainer/dashboard-test-value-review.md";

export const evidenceDoc = `# Dashboard test value review

Section for candidates evidence.
`;

export const openDoughSpecPaths = {
  polesTerminal: "dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts",
  polesSecond: "dashboard/tests/agent-launch-second-server.spec.ts",
  attention: "dashboard/tests/agent-completion-attention.spec.ts",
  watcher: "dashboard/tests/production-watcher.spec.ts",
  watcherUpdates: "dashboard/tests/production-watcher-updates.spec.ts",
  watcherFailures: "dashboard/tests/production-watcher-failures.spec.ts",
  storyReview: "dashboard/tests/story-review-completed.spec.ts",
  storyReviewBoundary:
    "dashboard/tests/boundary/story-review-completed.spec.ts",
  gherkin: "dashboard/tests/intent-gherkin-browse.spec.ts",
  movedAway: "dashboard/tests/moved-away-after-record.spec.ts",
  caseLine: "dashboard/tests/case-position-line.spec.ts",
} as const;

/** Spec with a distinctive line far below the start for `path:line` proof. */
export const openDoughCaseLineSource = [
  'import { test } from "@playwright/test";',
  'test("browses", async () => {});',
  "",
  ...[...Array(40).keys()].map((index) => `// pad ${index}`),
  'test("line-anchored case", async () => {});',
  "",
].join("\n");

/** 1-based line of the line-anchored case in the fixture. */
export const openDoughCaseLineNumber = 44;

export const openDoughCaseLineRecord = makeMe.aTestOptimizationCandidatesRecord
  .pending(
    "path-line-case",
    `\`${openDoughSpecPaths.caseLine}:${openDoughCaseLineNumber}\``,
    {
      observedCost: "about 3s line-anchored case",
      uniqueProtection: "path:line positions Purpose",
      alternativesAttempted: "none",
      dispositionRationale: "pending — path:line proof",
      date: "2026-11-01",
      evidence: "fixture",
    },
  )
  .please();

// Open Dough-shaped record: pending and accepted entries, evidence Markdown
// link (including one to a configured Intent file), and a `sha:path` kept as
// recorded text. Locations cover full paths, bare unique/ambiguous names,
// and a four-file family.
export const openDoughCandidatesRecord =
  makeMe.aTestOptimizationCandidatesRecord
    .pending(
      "launch-records-poll-waits",
      "`agent-completion-attention.spec.ts` waits and close/reopen races in `agent-launch-ad-hoc-terminal.spec.ts`",
      {
        observedCost:
          "about 60 summed seconds waiting for the next launch-records read",
        uniqueProtection:
          "a delivered report reaches the open page without a reload",
        alternativesAttempted:
          "none. Existing page clock infrastructure is unused here",
        dispositionRationale:
          "pending — a cheaper design that reuses existing test infrastructure is credible",
        date: "2026-11-01",
        humanDecisionNeeded:
          "whether a page-clock redesign is worth the rewrite before optimizing",
        evidence:
          "SEED-208 Results in `40e1d2f9:.planning/slice-plans/432-reduce-dashboard-proof-cost/PLAN.md`",
      },
    )
    .pending("moved-test-after-record", `\`${openDoughSpecPaths.movedAway}\``, {
      observedCost: "was about 12s before the file moved",
      uniqueProtection: "former integrated path no longer published",
      alternativesAttempted: "none",
      dispositionRationale: "pending — path must be rewritten after the move",
      date: "2026-11-01",
      evidence: "recorded before the move",
    })
    .accepted(
      "story-review-completed-journey-landed-runs-tail",
      "`story-review-completed.spec.ts` trailing Landed runs radio",
      {
        observedCost: "focused journey wall ≈9.69–10.00s (1 case)",
        uniqueProtection:
          "Published completion → Landed runs → Published completion round trip",
        alternativesAttempted: "end journey before Landed runs — no wall gain",
        dispositionRationale:
          "accepted necessary cost — retain the one integrated selection path. No skip/exclusion.",
        date: "2026-11-01",
        evidence: `[source comparison and ROI](../${evidenceDocPath})`,
      },
    )
    .accepted(
      "agent-launch-poles",
      `\`${openDoughSpecPaths.polesTerminal}\` and \`${openDoughSpecPaths.polesSecond}\``,
      {
        observedCost:
          "second-server case measured 52.5s / 51.2s after SEED-176",
        uniqueProtection: "dual-preview page protection through reload",
        alternativesAttempted:
          "cheaper server-only refusal already moved to boundary",
        dispositionRationale:
          "accepted necessary cost — preserve the unique multi-step journeys. Acceptance excludes nothing.",
        date: "2026-10-30",
        evidence: `[SEED-176 local measurements](../${evidenceDocPath}); Intent file [second-server journey](../${openDoughSpecPaths.polesSecond})`,
      },
    )
    .accepted(
      "long-integrated-journeys",
      `\`${openDoughSpecPaths.attention}\` and the production-watcher chains in \`${openDoughSpecPaths.watcher}\`, \`${openDoughSpecPaths.watcherUpdates}\`, and \`${openDoughSpecPaths.watcherFailures}\``,
      {
        observedCost:
          "approximately 39.6s attention case on the SEED-177 baseline",
        uniqueProtection:
          "attention reporting remains durable through column changes",
        alternativesAttempted:
          "policy consolidation moved detailed proof to boundary",
        dispositionRationale:
          "accepted necessary cost — retain unique integrated protection. Acceptance grants no coverage reduction.",
        date: "2026-10-30",
        evidence: "accepted triage at `03424649`",
      },
    )
    .please();

// Every finding section is `None.`.
export const emptyCandidatesRecord =
  makeMe.aTestOptimizationCandidatesRecord.please();

export const mismatchedCandidatesRecord = `# Not A Candidates Record

## Something else

Body that Intent must not partially show.
`;

// The Open Dough sources its candidates record is published with.
export const openDoughSources = {
  [testOptimizationCandidatesPath]: openDoughCandidatesRecord,
  [evidenceDocPath]: evidenceDoc,
  [openDoughSpecPaths.gherkin]: browseSpec,
  [openDoughSpecPaths.polesTerminal]: browseSpec,
  [openDoughSpecPaths.polesSecond]: browseSpec,
  [openDoughSpecPaths.attention]: browseSpec,
  [openDoughSpecPaths.watcher]: browseSpec,
  [openDoughSpecPaths.watcherUpdates]: browseSpec,
  [openDoughSpecPaths.watcherFailures]: browseSpec,
  [openDoughSpecPaths.storyReview]: browseSpec,
  [openDoughSpecPaths.storyReviewBoundary]: browseSpec,
  "tests/compare-versions.sh": shellCheck,
};

export function publishOpenDoughWithCandidates(
  page: Parameters<typeof publishIntentProject>[0],
  record: string = openDoughCandidatesRecord,
) {
  return publishIntentProject(page, openDough, openDoughSettings, {
    ...openDoughSources,
    [testOptimizationCandidatesPath]: record,
  });
}

/** Open Dough fixture whose Locations name a file by `path:line`. */
export function publishOpenDoughCaseLine(
  page: Parameters<typeof publishIntentProject>[0],
) {
  return publishIntentProject(page, openDough, openDoughSettings, {
    ...openDoughSources,
    [testOptimizationCandidatesPath]: openDoughCaseLineRecord,
    [openDoughSpecPaths.caseLine]: openDoughCaseLineSource,
  });
}
