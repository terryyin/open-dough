// One selected case's source survives a newer revision and an outstanding or
// failed file read. Each recovery alternative keeps its own causal protocol.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { testOptimizationCandidatesPath } from "../../src/testOptimizationCandidatesPath.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts, shortRevision } from "../../tests/dashboardParts.ts";
import { describedRevisions } from "../../tests/describedRevisions.ts";
import { holdAuthenticatedReadsWhere } from "../../tests/holdAuthenticatedReads.ts";
import {
  pygardon,
  pygardonSettings,
} from "../../tests/intentCodeBrowseFixtures.ts";
import {
  pygardonCandidatesRecord,
  pygardonClipCase,
  pygardonClipPath,
  pygardonClipSource,
} from "../../tests/intentCandidatesOtherProjectFixtures.ts";
import {
  expectSourceTargetLine,
  fileSource,
  sourceFile,
  sourceRevision,
} from "../../tests/intentCodeBrowsePage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
} from "../../tests/intentModePage.ts";
import {
  browserRevision,
  expectReadingOffset,
  intentReadingScroll,
  purposeRegion,
  revisionNotice,
} from "../../tests/intentPerspectivePage.ts";
import {
  readFailure,
  readRetry,
  showLatestRevision,
} from "../../tests/intentReadRecoveryPage.ts";
import { intentReads } from "../../tests/intentRevisionJourney.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../../tests/pageRequestNotes.ts";
import { preholdRevisionStreamSlots } from "../../tests/support/revisionStreamSlots.ts";
import { putFrontendIntentSources } from "../../tests/support/frontendIntentSources.ts";
import {
  pausePageClock,
  passTimeUntilChecked,
  passTimeUntilCheckedWhileReadsOutstanding,
  expectSteadyPace,
} from "../../tests/autoRefreshJourney.ts";
import { intentSettingsText } from "../../tests/support/intentSettingsFile.ts";

for (const outcome of ["held then released", "failed then retried"] as const) {
  test(`a selected source case keeps line44 and reading while a new revision's file read is ${outcome}`, async ({
    page,
    frontendServices,
  }) => {
    const beforeRevision = pygardon.revision;
    const afterRevision = (
      outcome === "held then released" ? "f2" : "f3"
    ).repeat(20);
    const targetLine = 44;
    const beforeText =
      pygardonClipSource +
      [...Array(60).keys()].map((i) => `# after ${i}\n`).join("");
    const afterText = beforeText.replace("assert True", "assert 2 == 2");
    const revisions = describedRevisions(
      makeMe.aRepository
        .withRevision("before", {
          files: {
            ...pygardon.files,
            ".planning/open-dough.json": intentSettingsText(pygardonSettings),
            [testOptimizationCandidatesPath]: pygardonCandidatesRecord,
            [pygardonClipPath]: beforeText,
          },
        })
        .withRevision("after", { files: { [pygardonClipPath]: afterText } })
        .please(),
      { before: beforeRevision, after: afterRevision },
    );
    await page.setViewportSize({ width: 1280, height: 600 });
    await pausePageClock(page);
    await preholdRevisionStreamSlots(page);
    const location = makeMe.anIntentLocation
      .at("tests")
      .ofKind("python")
      .selecting(pygardonClipPath)
      .please();
    putFrontendIntentSources(
      frontendServices,
      pygardon,
      [location],
      revisions.before.files,
    );
    Object.assign(frontendServices, {
      candidates: {
        revision: beforeRevision,
        candidates: pygardonCandidatesRecord,
      },
    });
    const reads = intentReads(page, { sourceLocation: "tests/" });
    await openUntilRead(page, "/?project=pygardon&perspective=intent");
    const { intent } = parts(page);
    await chooseOptimizationCandidates(intent);
    await expectCandidatesRevision(intent, beforeRevision);
    const entry = candidatesRecord(intent).getByRole("article", {
      name: "real-h264-codec-roundtrip",
    });
    await sourceFile(entry, pygardonClipPath).click();
    const source = fileSource(intent, pygardonClipPath);
    const file = sourceFile(intent, pygardonClipPath);
    await expect(source).toContainText(`def ${pygardonClipCase}()`);
    await expectSourceTargetLine(source, targetLine);
    await source.evaluate((element) => {
      (element as HTMLElement).focus({ preventScroll: true });
    });
    await expect(source).toBeFocused();
    const offset = await intentReadingScroll(intent);
    expect(offset).toBeGreaterThan(0);
    await expect(sourceRevision(intent, pygardonClipPath)).toHaveText(
      `${pygardonClipPath} at revision ${shortRevision(beforeRevision)}`,
    );
    expect(reads).toEqual([
      `locations@${beforeRevision}`,
      `test-optimization-candidates@${beforeRevision}`,
      `${pygardonClipPath}@${beforeRevision}`,
    ]);

    putFrontendIntentSources(
      frontendServices,
      { ...pygardon, revision: afterRevision },
      [location],
      revisions.after.files,
    );
    Object.assign(frontendServices, {
      candidates: {
        revision: afterRevision,
        candidates: pygardonCandidatesRecord,
      },
    });
    await passTimeUntilChecked(page);
    await untilPageReadsAnswered(page);
    await expect(revisionNotice(intent)).toBeVisible();
    await expect(source).toBeFocused();
    await expectSourceTargetLine(source, targetLine);
    await expectReadingOffset(intent, offset);
    await expect(browserRevision(intent)).toContainText(
      shortRevision(beforeRevision),
    );

    const releases: (() => void)[] = [];
    try {
      const latest = await holdAuthenticatedReadsWhere(
        page,
        (params) =>
          params.get("path") === pygardonClipPath &&
          params.get("revision") === afterRevision,
        releases,
      );
      await showLatestRevision(revisionNotice(intent)).click();
      await expect.poll(latest.held).toBe(1);
      await expect(browserRevision(intent)).toContainText(
        shortRevision(afterRevision),
      );
      await expect(sourceRevision(intent, pygardonClipPath)).toHaveText(
        `${pygardonClipPath} at revision ${shortRevision(beforeRevision)}`,
      );
      await expect(source).toContainText("assert True");
      await expectSourceTargetLine(source, targetLine);
      await expectReadingOffset(intent, offset);
      await expect(file).toBeFocused();
      const problem = readFailure(purposeRegion(intent));
      if (outcome === "held then released") {
        await expect(problem).toHaveCount(0);
        // Keep the source read held across a revision check: the reading
        // stays pinned to its previous answer while the project is checked.
        expectSteadyPace(await passTimeUntilCheckedWhileReadsOutstanding(page));
        await expect(source).toContainText("assert True");
        await expect(sourceRevision(intent, pygardonClipPath)).toHaveText(
          `${pygardonClipPath} at revision ${shortRevision(beforeRevision)}`,
        );
        latest.release();
      } else {
        latest.fail();
        await expect(problem).toHaveText(
          `${pygardonClipPath} could not be read at revision ${shortRevision(afterRevision)}; showing ${shortRevision(beforeRevision)}. Retry`,
        );
        await expect(source).toContainText("assert True");
        await expectSourceTargetLine(source, targetLine);
        await expect(sourceRevision(intent, pygardonClipPath)).toHaveText(
          `${pygardonClipPath} at revision ${shortRevision(beforeRevision)}`,
        );
        await expect(file).toBeFocused();
        await expectReadingOffset(intent, offset);
        expect(reads).toHaveLength(6);
        await readRetry(problem).click();
      }
      await expect(source).toContainText("assert 2 == 2");
      await expectSourceTargetLine(source, targetLine);
      await expect(sourceRevision(intent, pygardonClipPath)).toHaveText(
        `${pygardonClipPath} at revision ${shortRevision(afterRevision)}`,
      );
      await expect(browserRevision(intent)).toContainText(
        shortRevision(afterRevision),
      );
      await expect(problem).toHaveCount(0);
      await expectReadingOffset(intent, offset);
      if (outcome === "held then released") await expect(file).toBeFocused();
      await untilPageReadsAnswered(page);
      expect(reads[3]).toBe(`locations@${afterRevision}`);
      // Both reads follow accepted locations; neither depends on the other.
      expect(reads.slice(4, 6).sort()).toEqual(
        [
          `test-optimization-candidates@${afterRevision}`,
          `${pygardonClipPath}@${afterRevision}`,
        ].sort(),
      );
      expect(reads.slice(6)).toEqual(
        outcome === "failed then retried"
          ? [`${pygardonClipPath}@${afterRevision}`]
          : [],
      );
    } finally {
      for (const release of releases) release();
    }
  });
}
