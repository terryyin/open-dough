import { fileSource, sourceFile } from "../intentCodeBrowsePage.ts";
// Intent reads a project's live Test Optimization Candidates record
// (../../src/IntentCandidatesRecord.tsx) on its Optimization Candidates tab:
// each live candidate under Live candidates with its five facts, its affected
// test opening in Purpose, and a live record holding `None.` as having no
// live candidates.

import { expect, test } from "../dashboardTest.ts";
import { chooseProject, parts } from "../dashboardPage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
} from "../intentModePage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  openDoughSpecPaths,
  publishOpenDoughWithCandidates,
  testOptimizationCandidatesPath,
} from "../intentCandidatesFixtures.ts";
import {
  openDough,
  publishIntentProject,
  pygardon,
  pygardonSettings,
  pythonTest,
} from "../intentCodeBrowseFixtures.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test("Intent shows each live candidate with its five facts, and a live record without candidates as having none", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishOpenDoughWithCandidates(
    page,
    makeMe.aTestOptimizationCandidatesRecord
      .live()
      .candidate(
        "production-watcher-failure-chains",
        `\`${openDoughSpecPaths.watcherFailures}\``,
        {
          observedCost: "115.3s for 10 cases in CI run 42550972063, 12 shards",
          uniqueProtection:
            "a failed production update reaches the watcher's report",
          alternativesTried:
            "boundary proof of each failure kind; the chain stays integrated",
          decisionOrEvidenceNeeded:
            "whether one dashboard per file keeps the isolation each case relies on",
        },
      )
      .candidate(
        "second-server-preview",
        `\`${openDoughSpecPaths.polesSecond}\``,
      )
      .please(),
  );
  await publishIntentProject(page, pygardon, pygardonSettings, {
    [testOptimizationCandidatesPath]: makeMe.aTestOptimizationCandidatesRecord
      .live()
      .please(),
    "tests/test_example.py": pythonTest,
  });

  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await chooseOptimizationCandidates(intent);
  await expectCandidatesRevision(intent, openDough.revision);
  const record = candidatesRecord(intent);

  await test.step("each live candidate shows its five facts, and its affected test opens in Purpose", async () => {
    await expect(record.getByRole("heading", { level: 3 })).toHaveText([
      "Test Optimization Candidates",
      "Live candidates",
    ]);
    const live = record.getByRole("region", { name: "Live candidates" });
    await expect(live.getByRole("heading", { level: 4 })).toHaveText([
      "production-watcher-failure-chains",
      "second-server-preview",
    ]);
    const candidate = live.getByRole("article", {
      name: "production-watcher-failure-chains",
    });
    await expect(candidate.getByRole("term")).toHaveText([
      "Affected test or fixture",
      "Observed cost and conditions",
      "Unique protection",
      "Alternatives tried",
      "Decision or evidence needed",
    ]);
    await expect(candidate.getByRole("definition")).toHaveText([
      openDoughSpecPaths.watcherFailures,
      "115.3s for 10 cases in CI run 42550972063, 12 shards",
      "a failed production update reaches the watcher's report",
      "boundary proof of each failure kind; the chain stays integrated",
      "whether one dashboard per file keeps the isolation each case relies on",
    ]);
    await expect(record).not.toContainText("This record has no");

    await sourceFile(candidate, openDoughSpecPaths.watcherFailures).click();
    await expect(
      fileSource(intent, openDoughSpecPaths.watcherFailures),
    ).toContainText('test("browses"');
  });

  await test.step("a live record holding None. has no live candidates", async () => {
    await chooseProject(page, "Pygardon");
    await chooseOptimizationCandidates(intent);
    await expectCandidatesRevision(intent, pygardon.revision);
    await expect(candidatesRecord(intent)).toContainText(
      "This record has no live candidates.",
    );
    await expect(
      candidatesRecord(intent).getByRole("region", {
        name: "Live candidates",
      }),
    ).toContainText("None.");
  });
});
