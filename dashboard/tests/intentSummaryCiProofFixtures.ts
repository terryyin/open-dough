// The published tree, CI shards and opened Intent of the Summary CI proof
// specs (./intent-summary-ci-proof.spec.ts and its -gaps, -table and -kept
// siblings): raw runner reports as CI's collector reads them
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
import { openDough, openDoughSettings } from "./intentCodeBrowseFixtures.ts";
import { intentLocationName } from "./intentPerspectivePage.ts";
import { summaryRegion } from "./intentScopeProofPage.ts";
import type { OriginAnswer } from "./originAnswers.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import type { CiAnswerer, CiRunAnswer } from "./support/baseCiActions.ts";
import { runArtifactsAnswer } from "./support/ciProofArtifacts.ts";
import {
  collectedSummary,
  playwrightRecord,
  type Producer,
} from "./support/ciProofCollected.ts";

const spec = (name: string) => `import { test } from "@playwright/test";
test("${name}", async () => {});
`;
// The published tree: dashboard/tests lists its specs at any depth, and tests
// only its root shell checks, so tests/support/check.sh is not listed.
const published = {
  ".planning/open-dough.json": `${openDoughSettings}\n`,
  "dashboard/tests/root.spec.ts": spec("root"),
  "dashboard/tests/added.spec.ts": spec("added"),
  "dashboard/tests/folder/a.spec.ts": spec("a"),
  "dashboard/tests/folder/b.spec.ts": spec("b"),
  "dashboard/tests/folder/nested/c.spec.ts": spec("nested c"),
  "tests/root.sh": "#!/usr/bin/env bash\n",
  "tests/support/check.sh": "#!/usr/bin/env bash\n",
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
export const testsShare = (byFile: boolean): Producer => ({
  entries: ["tests"],
  part: 1,
  of: 1,
  byFile,
  outcomes: "passed\ttests/root.sh\npassed\ttests/support/check.sh\n",
  times: "2.5\ttests/root.sh\n0.5\ttests/support/check.sh\n",
});

// Judged trunk: running at the published head, so the shown proof is its
// completed ancestor's, run 41 at the judged commit.
const ancestorRuns = (): readonly CiRunAnswer[] => [
  { headSha: openDough.revision, status: "in_progress", id: 42, url: runUrl },
  { headSha: judged, conclusion: "success", id: run.runId, url: runUrl },
];

export async function openIntent(
  page: Page,
  zip: () => OriginAnswer | Promise<OriginAnswer>,
  artifacts: () => OriginAnswer = () => runArtifactsAnswer(run, artifactId),
) {
  await page.setViewportSize({ width: 1280, height: 900 });
  const judgment = trunkCi(openDough.revision, ancestorRuns);
  const project = publishProject(page, openDough, published);
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

export async function openSummary(intent: Locator, location: string) {
  await intentLocationName(intent, location).click();
  const summary = summaryRegion(intent);
  await expect(summary.locator(".intent-summary-path")).toHaveText(location);
  return summary;
}

// The summary CI collects for both entries' shards, broken down by file or
// not.
export const bothEntriesSummary = (byFile: boolean) =>
  collectedSummary(
    run,
    [
      ["dashboard/tests", 2],
      ["tests", 1],
    ],
    [...dashboardShards(byFile), testsShare(byFile)],
  );

export const allParts = "2 of 2 parts present";

// How a Summary names the completed ancestor's proof.
export const ancestorEvidence = `CI evidence: Attempt 1 of run 41 at ${shortSha(judged)} on main, the completed ancestor of the running result.`;
