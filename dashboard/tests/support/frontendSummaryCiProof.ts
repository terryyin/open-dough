// A run's Summary CI proof for frontend-only journeys: the published tree
// Intent lists (dashboard/tests at any depth, tests only its root shell
// checks) and run 41's proof answer (./frontendCiRunProofAnswers.ts), its
// entries as the Backend reads them from CI's collected summary
// (../../backend-tests/intent/ci-proof-extraction.spec.ts; the journey:
// ../../../e2e/intent/intent-summary-ci-proof.spec.ts).

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CiProof, CiProofEntry } from "../../src/ciProof.ts";
import { summaryTreeSources } from "../intentSummaryCiProofFixtures.ts";
import { parts } from "../dashboardPage.ts";
import { openFrontendRunProof } from "./frontendCiRunProofAnswers.ts";
import { answerEmptyScopeHistory } from "./frontendIntentCi.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";

const dashboardSpecs = Object.keys(summaryTreeSources).filter((path) =>
  path.startsWith("dashboard/tests/"),
);

// Publishes the tree: Intent lists every dashboard spec and tests/root.sh,
// not tests/support/check.sh.
function putSummaryTree(services: FrontendServiceState): void {
  Object.assign(services, {
    locations: {
      revision: services.revision,
      locations: [
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting(...dashboardSpecs)
          .please(),
        makeMe.anIntentLocation
          .at("tests")
          .ofKind("shell", ["*.sh"])
          .selecting("tests/root.sh")
          .please(),
      ],
      recovery: undefined,
    },
    files: { ...services.files, ...summaryTreeSources },
  });
}

// Intent opened on CI status, Passed by run 41 whose proof holds `entries`
// (or the unavailable `proof` given instead), over the published tree, no
// scope having landed history.
export async function openSummaryCiProof(
  page: Page,
  services: FrontendServiceState,
  entries: readonly CiProofEntry[],
  proof?: CiProof,
) {
  await page.setViewportSize({ width: 1280, height: 900 });
  putSummaryTree(services);
  await answerEmptyScopeHistory(page, services.revision);
  const opened = await openFrontendRunProof(
    page,
    entries,
    {},
    proof === undefined ? {} : { proof },
  );
  return { ...opened, intent: parts(page).intent };
}

// dashboard/tests in two parts, each broken down by file or not: root.spec.ts
// 2 passed (1 untimed, 1.2 s), folder/a.spec.ts 1 passed and 1 failed
// (550 ms), folder/b.spec.ts 1 passed (0 ms) and folder/nested/c.spec.ts
// 1 passed and 1 other (45 ms).
function dashboardEntry(byFile: boolean): CiProofEntry {
  const evidence = makeMe.aCiProofEvidence.inUnit("case").inParts(2);
  if (byFile)
    evidence
      .withFile("dashboard/tests/root.spec.ts", {
        passed: 2,
        durationMs: 1200,
        untimed: 1,
      })
      .withFile("dashboard/tests/folder/a.spec.ts", {
        passed: 1,
        failed: 1,
        durationMs: 550,
      })
      .withFile("dashboard/tests/folder/b.spec.ts", {
        passed: 1,
        durationMs: 0,
      })
      .withFile("dashboard/tests/folder/nested/c.spec.ts", {
        passed: 1,
        other: 1,
        durationMs: 45,
      });
  else evidence.counting(5, 1, 1).timed(1795).withUntimed(1);
  return makeMe.aCiProofEntry
    .at("dashboard/tests")
    .holding(evidence.please())
    .please();
}

// tests in one part: 2 passed test files in 3.0 s, root.sh's and
// support/check.sh's when broken down by file.
function testsEntry(byFile: boolean): CiProofEntry {
  const evidence = makeMe.aCiProofEvidence.inUnit("file");
  if (byFile)
    evidence
      .withFile("tests/root.sh", { passed: 1, durationMs: 2500 })
      .withFile("tests/support/check.sh", { passed: 1, durationMs: 500 });
  else evidence.counting(2).timed(3000);
  return makeMe.aCiProofEntry.at("tests").holding(evidence.please()).please();
}

export const bothEntries = (byFile: boolean) => [
  dashboardEntry(byFile),
  testsEntry(byFile),
];
