// The published tree, CI shards and opened Intent of the Summary CI proof
// journeys (../../e2e/intent/intent-summary-ci-proof.spec.ts and its siblings):
// raw runner reports as CI's collector reads them
// (./support/ciProofCollected.ts), trunk judged running with its completed
// ancestor's proof, and every source body read Intent makes of its
// locations.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { shortSha } from "../src/baseCiWording.ts";
import {
  chooseCiStatus,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "./intentCiStatusPage.ts";
import { artifactId, run } from "./intentCiProofPage.ts";
import {
  evidenceLabels,
  expectAttemptLinked,
  expectEvidenceLabels,
  expectLabelInFull,
} from "./ciEvidenceLabelsPage.ts";
import { openDough, openDoughSettings } from "./intentCodeBrowseFixtures.ts";
import { revealIntentLocation } from "./intentPerspectivePage.ts";
import { showIntentFiles, uncoverIntentReader } from "./intentModePage.ts";
import { summaryRegion } from "./intentScopeProofPage.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { OriginAnswer } from "./originAnswers.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import type { CiAnswerer, CiRunAnswer } from "./support/baseCiActions.ts";
import { runArtifactsAnswer } from "./support/ciProofArtifacts.ts";
import {
  collectedSummary,
  playwrightRecord,
  type Producer,
} from "./support/ciProofCollected.ts";
import { intentSettingsText } from "./support/intentSettingsFile.ts";

export const spec = (name: string) => `import { test } from "@playwright/test";
test("${name}", async () => {});
`;
// The published tree's test sources: dashboard/tests lists its specs at any
// depth, and tests only its root shell checks, so tests/support/check.sh is
// not listed.
export const summaryTreeSources = {
  "dashboard/tests/root.spec.ts": spec("root"),
  "dashboard/tests/added.spec.ts": spec("added"),
  "dashboard/tests/folder/a.spec.ts": spec("a"),
  "dashboard/tests/folder/b.spec.ts": spec("b"),
  "dashboard/tests/folder/nested/c.spec.ts": spec("nested c"),
  "tests/root.sh": "#!/usr/bin/env bash\n",
  "tests/support/check.sh": "#!/usr/bin/env bash\n",
};
const published = {
  ".planning/open-dough.json": intentSettingsText(openDoughSettings),
  ...summaryTreeSources,
};

// Two dashboard shards and the tests share, as CI reports them.
export const dashboardShards = (byFile: boolean): Producer[] => [
  {
    entries: ["dashboard/tests"],
    part: 1,
    of: 2,
    byFile,
    record: playwrightRecord([
      ["dashboard/tests/root.spec.ts", "expected", [1200]],
      // Finished without a recorded duration.
      ["dashboard/tests/root.spec.ts", "expected", []],
      ["dashboard/tests/folder/a.spec.ts", "expected", [300]],
      // Retried: both attempts' time, one test.
      ["dashboard/tests/folder/a.spec.ts", "flaky", [100, 150]],
    ]),
  },
  {
    entries: ["dashboard/tests"],
    part: 2,
    of: 2,
    byFile,
    record: playwrightRecord([
      ["dashboard/tests/folder/b.spec.ts", "expected", [0]],
      ["dashboard/tests/folder/nested/c.spec.ts", "expected", [40]],
      ["dashboard/tests/folder/nested/c.spec.ts", "skipped", [5]],
    ]),
  },
];
// Each shell check file's own outcome: test files.
export const testsShare = (byFile: boolean): Producer => ({
  entries: ["tests"],
  part: 1,
  of: 1,
  byFile,
  outcomes: "passed\ttests/root.sh\npassed\ttests/support/check.sh\n",
  times: "2.5\ttests/root.sh\n0.5\ttests/support/check.sh\n",
  unit: "file",
});

// Judged trunk: running at the published head, so the shown proof is its
// completed ancestor's, run 41 at the judged commit.
const ancestorRuns = (head: string): readonly CiRunAnswer[] => [
  makeMe.aCiRun
    .with({
      headSha: head,
      status: "in_progress",
      databaseId: 42,
      url: runUrl,
    })
    .please(),
  makeMe.aCiRun
    .with({
      headSha: judged,
      conclusion: "success",
      databaseId: run.runId,
      url: runUrl,
    })
    .please(),
];

// Intent opened on CI status for trunk publishing FILES (by default the
// tree above), its proof downloads answered by ARTIFACTS and ZIP.
export async function openIntent(
  page: Page,
  zip: () => OriginAnswer | Promise<OriginAnswer>,
  artifacts: () => OriginAnswer = () => runArtifactsAnswer(run, artifactId),
  files: Readonly<Record<string, string>> = published,
) {
  await page.setViewportSize({ width: 1280, height: 900 });
  const project = publishProject(page, openDough, files);
  const judgment = trunkCi(project.revision, () =>
    ancestorRuns(project.revision),
  );
  const ci: CiAnswerer = (call) => {
    const { request } = call;
    if (request.kind === "actions-run-artifacts") return artifacts();
    if (request.kind === "actions-artifact-zip") return zip();
    return judgment(call);
  };
  project.serveCi(ci);
  // Source body reads of Intent's locations: every authenticated read naming
  // a path inside one (the page's own planning reads are not Intent's).
  const bodyReads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    const path = url.searchParams.get("path") ?? "";
    if (
      url.pathname === authenticatedReadEndpoint &&
      /^(dashboard\/tests|tests)\//.test(path)
    )
      bodyReads.push(path);
  });
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const home = await chooseCiStatus(intent);
  return { project, ci, intent, home, bodyReads };
}

// Files opens to press the location, which leaves a selected story's Home
// for its reading, and a drawer of it closes to uncover the Summary.
export async function openSummary(intent: Locator, location: string) {
  await showIntentFiles(intent);
  const name = await revealIntentLocation(intent, location);
  await name.click();
  const summary = summaryRegion(intent);
  await expect(summary.locator(".intent-summary-path")).toHaveText(location);
  await uncoverIntentReader(intent);
  return summary;
}

// The summary CI collects for both entries' shards, broken down by file or
// not.
export const bothEntriesSummary = (byFile: boolean) =>
  collectedSummary(
    run,
    [
      { entry: "dashboard/tests", parts: 2, unit: "case" },
      { entry: "tests", parts: 1, unit: "file" },
    ],
    [...dashboardShards(byFile), testsShare(byFile)],
  );

export const allParts = "2 of 2 parts present";

const treeGapAt = (revision: string) =>
  `Tree at ${shortSha(revision)} — newer files unproved here`;

export const ancestorEvidence = (revision: string) => [
  "Run 41 · attempt 1",
  `Revision ${shortSha(judged)}`,
  "Branch main",
  "Completed ancestor",
  treeGapAt(revision),
];

// A Summary names the completed ancestor's proof and the newer tree's pin.
export async function expectAncestorEvidence(
  summary: Locator,
  revision: string,
) {
  const tree = shortSha(revision);
  const treeGapInFull = `Evidence at ${shortSha(judged)}, tree at ${tree}: a file added or changed since has no CI result here, or an earlier one.`;
  await expectEvidenceLabels(
    evidenceLabels(summary),
    ancestorEvidence(revision),
  );
  await expectAttemptLinked(summary, "Run 41 · attempt 1", runUrl);
  await expectLabelInFull(summary, treeGapAt(revision), treeGapInFull);
  await expect(evidenceLabels(summary)).toMatchAriaSnapshot(`
    - list "CI evidence":
      - listitem:
        - link "Run 41 · attempt 1"
      - listitem:
        - text: Revision
        - code: ${JSON.stringify(shortSha(judged))}
      - listitem:
        - text: Branch
        - code: main
      - listitem: Completed ancestor , The completed ancestor of the running result
      - listitem:
        - text: Tree at
        - code: ${JSON.stringify(tree)}
        - text: "— newer files unproved here , ${treeGapInFull}"
  `);
}
