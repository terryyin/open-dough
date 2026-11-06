// Doughnut- and Pygardon-shaped Test Optimization Candidates records for
// Intent journeys (`./intent/intent-test-optimization-candidates-open.spec.ts`).

import { testOptimizationCandidatesPath } from "../src/testOptimizationCandidatesPath.ts";
import {
  browseSpec,
  doughnut,
  publishIntentProject,
  pygardon,
  pygardonSettings,
} from "./intentCodeBrowseFixtures.ts";
import { candidateRecordEntry as entry } from "./intentCandidatesRecordEntry.ts";

export const pygardonGherkinOnlySettings = JSON.stringify(
  {
    intent: {
      locations: [
        {
          path: "frontend/src",
          kind: "typescript",
          include: [
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "**/*.test.ts",
            "**/*.test.tsx",
          ],
        },
      ],
    },
  },
  null,
  2,
);

export const pygardonClipPath = "tests/test_clip_core.py";

export const pygardonClipCase = "test_clip_segments_h264_reencodes_video";

/** Published clip-core source with the H264 case below the file start. */
export const pygardonClipSource = [
  "def test_example():",
  '    assert "ok"',
  "",
  ...[...Array(40).keys()].map((index) => `# pad ${index}`),
  `def ${pygardonClipCase}():`,
  "    assert True",
  "",
].join("\n");

/** 1-based line of `def test_clip_segments_h264_reencodes_video` in the fixture. */
export const pygardonClipCaseLine = 44;

export const pygardonCandidatesRecord = `# Test Optimization Candidates

## Pending candidates

None.

## Accepted necessary costs

${entry("real-h264-codec-roundtrip", {
  locations: `\`${pygardonClipPath}::${pygardonClipCase}\``,
  observedCost: "about 45s codec roundtrip on the developer host",
  uniqueProtection: "real H264 reencode through clip segments",
  alternativesAttempted: "mocked codec path lost the unique protection",
  disposition:
    "accepted necessary cost — retain the real codec journey. No skip/exclusion.",
  date: "2026-10-28",
  evidence: "local codec timings",
})}
## Profile-only exclusions

None.

## Transferred obligations

None.
`;

export const doughnutFeaturePath =
  "e2e_test/features/cli/cli_notebook_lfs.feature";

export const doughnutCandidatesRecord = `# Test Optimization Candidates

## Pending candidates

${entry("frontend-browser-file-isolation", {
  locations:
    "browser file isolation across notebook tabs with no path named here",
  observedCost: "about 20s across cold browser tabs",
  uniqueProtection: "tab isolation without a reusable cheaper substitute",
  alternativesAttempted: "none recorded",
  disposition: "pending — needs a named human decision on scope",
  date: "2026-10-27",
  evidence: "prose only",
})}
${entry("e2e-batch-cold-start", {
  locations: "`cli_notebook_lfs.feature` cold start of the notebook LFS batch",
  observedCost: "about 35s cold start",
  uniqueProtection: "cold notebook LFS batch reaches a usable shell",
  alternativesAttempted: "warm reuse lost the cold-start protection",
  disposition: "pending — measure warmer fixtures before accepting",
  date: "2026-10-27",
  evidence: "batch timing notes",
})}
## Accepted necessary costs

None.

## Profile-only exclusions

None.

## Transferred obligations

None.
`;

export const doughnutFeatureSettings = JSON.stringify(
  {
    intent: {
      locations: [
        {
          path: "e2e_test/features",
          kind: "gherkin",
          include: ["**/*.feature"],
        },
      ],
    },
  },
  null,
  2,
);

export function publishPygardonOutsideConfigured(
  page: Parameters<typeof publishIntentProject>[0],
) {
  return publishIntentProject(page, pygardon, pygardonGherkinOnlySettings, {
    [testOptimizationCandidatesPath]: pygardonCandidatesRecord,
    [pygardonClipPath]: pygardonClipSource,
    "frontend/src/devices.spec.ts": browseSpec,
  });
}

/** Example 4 configured variant: `tests/` is a python Intent location. */
export function publishPygardonConfiguredTests(
  page: Parameters<typeof publishIntentProject>[0],
) {
  return publishIntentProject(page, pygardon, pygardonSettings, {
    [testOptimizationCandidatesPath]: pygardonCandidatesRecord,
    [pygardonClipPath]: pygardonClipSource,
    "frontend/src/devices.spec.ts": browseSpec,
  });
}

export function publishDoughnutWithCandidates(
  page: Parameters<typeof publishIntentProject>[0],
) {
  return publishIntentProject(page, doughnut, doughnutFeatureSettings, {
    [testOptimizationCandidatesPath]: doughnutCandidatesRecord,
    [doughnutFeaturePath]: `Feature: notebook LFS
  Scenario: cold start
    Given a notebook
`,
  });
}
