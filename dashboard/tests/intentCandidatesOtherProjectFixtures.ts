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
import { makeMe } from "../../tests/support/makeMe.mjs";

export const pygardonGherkinOnlySettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation
      .at("frontend/src")
      .ofKind("typescript", [
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
      ])
      .please(),
  )
  .please();

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

export const pygardonCandidatesRecord = makeMe.aTestOptimizationCandidatesRecord
  .accepted(
    "real-h264-codec-roundtrip",
    `\`${pygardonClipPath}::${pygardonClipCase}\``,
    {
      observedCost: "about 45s codec roundtrip on the developer host",
      uniqueProtection: "real H264 reencode through clip segments",
      alternativesAttempted: "mocked codec path lost the unique protection",
      dispositionRationale:
        "accepted necessary cost — retain the real codec journey. No skip/exclusion.",
      date: "2026-10-28",
      evidence: "local codec timings",
    },
  )
  .please();

export const doughnutFeaturePath =
  "e2e_test/features/cli/cli_notebook_lfs.feature";

export const doughnutCandidatesRecord = makeMe.aTestOptimizationCandidatesRecord
  .pending(
    "frontend-browser-file-isolation",
    "browser file isolation across notebook tabs with no path named here",
    {
      observedCost: "about 20s across cold browser tabs",
      uniqueProtection: "tab isolation without a reusable cheaper substitute",
      alternativesAttempted: "none recorded",
      dispositionRationale: "pending — needs a named human decision on scope",
      date: "2026-10-27",
      evidence: "prose only",
    },
  )
  .pending(
    "e2e-batch-cold-start",
    "`cli_notebook_lfs.feature` cold start of the notebook LFS batch",
    {
      observedCost: "about 35s cold start",
      uniqueProtection: "cold notebook LFS batch reaches a usable shell",
      alternativesAttempted: "warm reuse lost the cold-start protection",
      dispositionRationale:
        "pending — measure warmer fixtures before accepting",
      date: "2026-10-27",
      evidence: "batch timing notes",
    },
  )
  .please();

export const doughnutFeatureSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation
      .at("e2e_test/features")
      .ofKind("gherkin", ["**/*.feature"])
      .please(),
  )
  .please();

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
