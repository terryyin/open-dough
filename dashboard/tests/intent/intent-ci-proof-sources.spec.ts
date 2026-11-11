// The CI proof for a location declared by source entries in Intent's CI
// status tab (../../src/IntentScopeProof.tsx): it keeps the same contract as
// a kind-declared location, the summary's results for its path and its
// files' paths. The ancestor evidence it reads:
// ./intent-ci-proof-ancestor.spec.ts.

import { test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { chooseCiStatus, runUrl } from "../intentCiStatusPage.ts";
import { chooseStoryTab } from "../support/intentStoryPage.ts";
import { intentLocationName } from "../intentPerspectivePage.ts";
import {
  childName,
  expectScopeRows,
  summaryRegion,
} from "../intentScopeProofPage.ts";
import { artifactId } from "../intentCiProofPage.ts";
import { running } from "../intentCiStoryBoard.ts";
import {
  mainRun,
  publishStoryCi,
  repository,
  signup,
  started,
  toggleOnDevelopment,
} from "../intentCiStoryRecords.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { runArtifactsAnswer } from "../support/ciProofArtifacts.ts";
import {
  collectedSummary,
  summaryTextZipAnswer,
} from "../support/ciProofCollected.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { intentSettingsText } from "../support/intentSettingsFile.ts";

test("a published CI summary for a sources location shows its group and file results at their paths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const ancestor = makeMe.aCiProofCollectorRun
    .with({ repository, runId: 12, attempt: 2, revision: signup })
    .please();
  const shellTest = "scripts/test/worktree_setup.sh.test";
  const nodeTest = "scripts/ci/ci-proof-outcomes.test.mjs";
  const settings = makeMe.intentSettings
    .withLocations(
      makeMe.anIntentLocation
        .at("scripts")
        .withSources(
          { include: ["**/*.test"], syntax: "shell" },
          { include: ["**/*.test.mjs"], syntax: "javascript" },
        )
        .please(),
    )
    .please();
  const ci = publishStoryCi(page, {
    ".planning/open-dough.json": intentSettingsText(settings),
    [shellTest]: "#!/usr/bin/env bash\n",
    [nodeTest]: "export {};\n",
  });
  ci.runs.main = [
    makeMe.aCiRun
      .with({
        headSha: signup,
        conclusion: "success",
        url: mainRun,
        databaseId: 12,
        attempt: 2,
      })
      .please(),
  ];
  ci.runs[running.branch] = [
    makeMe.aCiRun
      .with({
        headSha: started,
        status: "in_progress",
        url: runUrl,
        databaseId: 13,
      })
      .please(),
  ];
  const summary = collectedSummary(
    ancestor,
    [{ entry: "scripts", parts: 1 }],
    [
      {
        entries: ["scripts"],
        part: 1,
        of: 1,
        byFile: true,
        outcomes: `passed\t${shellTest}\npassed\t${nodeTest}\n`,
        times: `2.5\t${shellTest}\n0.5\t${nodeTest}\n`,
      },
    ],
  );
  ci.published.serveCi((call) => {
    const { kind } = call.request;
    if (kind === "actions-run-artifacts")
      return runArtifactsAnswer(ancestor, artifactId);
    if (kind === "actions-artifact-zip") return summaryTextZipAnswer(summary);
    return ci.answer(call);
  });
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  await chooseCiStatus(parts(page).intent);
  await toggleOnDevelopment(page, running.title);
  const intent = parts(page).intent;

  await test.step("the location's Summary counts both files, each under its folder", async () => {
    await chooseStoryTab(intent, "Changed tests");
    await intentLocationName(intent, "scripts").click();
    const scripts = summaryRegion(intent);
    await expectScopeRows(scripts, "scripts", [
      [
        "scripts",
        "2 passed legacy test results",
        "3.0 s",
        "1 of 1 part present",
      ],
      ["ci/", "1 passed legacy test result", "500 ms"],
      ["test/", "1 passed legacy test result", "2.5 s"],
    ]);
  });

  await test.step("each file's results sit at its own path", async () => {
    await childName(summaryRegion(intent), "test/").click();
    await expectScopeRows(summaryRegion(intent), "scripts/test", [
      [
        "scripts/test",
        "1 passed legacy test result",
        "2.5 s",
        "1 of 1 part present",
      ],
      ["worktree_setup.sh.test", "1 passed legacy test result", "2.5 s"],
    ]);
  });
});
