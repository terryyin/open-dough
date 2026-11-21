// While a comparison other than the story's default is chosen, CI comparison,
// a file's Proof and Intent coverage each say they describe the whole story,
// and keep reading what the default comparison read
// (../../src/IntentStoryComparison.tsx). With the default chosen, none says so.
// The commit range is chosen as ./intent-story-compare-commits.spec.ts does; a
// Done story's landed run as ./intent-story-compare-done.spec.ts does.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { intentStory } from "../../test-support/support/intentStoryPage.ts";
import {
  putFrontendIntentStory,
  frontendIntentChanges,
} from "../../test-support/support/frontendIntentStory.ts";
import {
  frontendFileDiff,
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import type { FrontendServiceState } from "../../test-support/support/frontendServiceState.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { openStoryIntent } from "../../test-support/intentModePage.ts";
import { changed } from "../../test-support/support/intentStoryWorktree.ts";
import { proofRegion } from "../../test-support/intentPerspectivePage.ts";
import { chooseReadingTabInPlace } from "../../test-support/intentReadingPlacePage.ts";
import { prepareFrontendDoneIntent } from "../../test-support/support/frontendIntentDoneStory.ts";
import { selectDoneStoryForCiComparison } from "../../test-support/support/selectDoneStoryForCiComparison.ts";
import { comparisonReading } from "../../test-support/intentCiComparisonPage.ts";
import { comparisonLabels } from "../../test-support/ciEvidenceLabelsPage.ts";

const wholeStory = "Describes the whole story, not the chosen comparison.";

// Each view that describes the whole story; Proof reads the given Changes file.
function wholeStoryViews(intent: Locator, file: () => Locator) {
  const story = intentStory(intent);
  const tab = (name: "CI comparison" | "Intent coverage") => async () => {
    await story.chooseTab(name);
    return story.panel(name);
  };
  return {
    "CI comparison": tab("CI comparison"),
    "Intent coverage": tab("Intent coverage"),
    Proof: async () => {
      await story.chooseTab("Changes");
      await file().click();
      await chooseReadingTabInPlace(intent, "Proof");
      return proofRegion(intent);
    },
  };
}

const [first, second] = [
  makeMe.aReviewCommit.numbered(1, "first change").please(),
  makeMe.aReviewCommit.numbered(2, "second change").please(),
];

async function openStoryWithTwoCommits(
  page: Page,
  frontendServices: FrontendServiceState,
) {
  putFrontendIntentStory(frontendServices);
  const review = await installFrontendStoryReview(
    page,
    frontendReviewSnapshot({
      files: frontendIntentChanges,
      commits: [second, first],
    }),
  );
  review.answerFile(
    frontendFileDiff("dashboard/tests/a.spec.ts", ["+all changes"]),
    "dashboard/tests/a.spec.ts",
  );
  review.answerRange({
    kind: "comparison",
    from: first.fromTree,
    tree: first.tree,
    trunkIntegrated: false,
    files: [
      makeMe.aReviewedFile
        .with({ kind: "modified", path: "dashboard/tests/a.spec.ts" })
        .please(),
    ],
  });
  const { intent } = await openStoryIntent(page, "Story A");
  return intent;
}

test("CI comparison, Proof and Intent coverage say they describe the whole story only while a commit range is chosen, reading the same evidence either way", async ({
  page,
  frontendServices,
}) => {
  const intent = await openStoryWithTwoCommits(page, frontendServices);
  const story = intentStory(intent);
  const compare = story.compare();
  const views = wholeStoryViews(intent, () => story.file(changed.modified));
  const read: Record<string, string> = {};

  await test.step("with the default comparison chosen, no view says it describes the whole story", async () => {
    await story.chooseTab("Changes");
    await expect(compare.choice("All changes")).toBeChecked();
    for (const [name, open] of Object.entries(views)) {
      const view = await open();
      await expect(view).toBeVisible();
      await expect(story.wholeStoryNote(view), name).toHaveCount(0);
      read[name] = (await view.textContent()) ?? "";
    }
  });

  await test.step("choosing the first commit alone", async () => {
    await story.chooseTab("Changes");
    await compare.choose("Commits");
    await compare.chooseAlone("first change");
  });

  await test.step("each view says so and still reads the default comparison's evidence", async () => {
    await expect(compare.range).toContainText("first change");
    for (const [name, open] of Object.entries(views)) {
      const view = await open();
      await expect(story.wholeStoryNote(view), name).toHaveText(wholeStory);
      // Beside the note, the view reads as it did with the default chosen.
      await expect
        .poll(async () => (await view.textContent())?.replace(wholeStory, ""))
        .toBe(read[name]);
    }
  });
});

const landing = "dashboard/src/landing.ts";
const run = makeMe.aReviewRun
  .keyed("capture-run")
  .launchedAt("2026-01-01T10:00:00.000Z")
  .comparing("1".repeat(40), "2".repeat(40))
  .please();

// A Done story whose published completion modifies landing and whose one
// captured landed run adds it.
async function openDoneStoryWithLandedRun(
  page: Page,
  frontendServices: FrontendServiceState,
) {
  const setup = await prepareFrontendDoneIntent(
    page,
    frontendServices,
    undefined,
    {
      comparison: (done) =>
        done.withChanged(
          makeMe.aReviewedFile
            .with({ kind: "modified", path: landing })
            .please(),
        ),
    },
  );
  setup.review.answerHistoricalSnapshot(setup.identity, {
    ...setup.review.snapshot(),
    runs: [run],
  });
  setup.review.answerRunSnapshot(
    run.key,
    makeMe.aStoryReview.landed().adding(landing).onRun(run, [run]).please(),
  );
  setup.review.answerFile(frontendFileDiff(landing, ["+landing"]), landing);
  const { intent, panel } = await selectDoneStoryForCiComparison(page);
  return { intent, panel, identity: setup.identity };
}

test("with a Done story's landed run chosen, CI comparison, Proof and Intent coverage each name the build measured beside the whole-story note", async ({
  page,
  frontendServices,
}) => {
  const { intent, panel, identity } = await openDoneStoryWithLandedRun(
    page,
    frontendServices,
  );
  const story = intentStory(intent);
  const measured = comparisonReading(panel).identities.nth(2);
  const measuredText = (await measured.textContent()) ?? "";
  const proofLabels = comparisonLabels(proofRegion(intent), identity);
  const proofText: string[] = [];
  const viewsOf = (change: "Modified" | "Added") =>
    wholeStoryViews(intent, () => story.outsideFile(`${change} ${landing}`));
  // The landed run lists the same file as added.
  const views = viewsOf("Added");

  await test.step("with the published completion chosen, Proof has no note", async () => {
    await viewsOf("Modified").Proof();
    proofText.push(...(await proofLabels.allTextContents()));
    await expect(story.wholeStoryNote(proofRegion(intent))).toHaveCount(0);
  });

  await test.step("choosing Landed runs", async () => {
    await story.compare().choose("Landed runs");
    await expect(story.compare().run).toHaveValue(run.key);
  });

  await test.step("each view's note names the build the CI comparison measures", async () => {
    for (const [name, open] of Object.entries(views)) {
      const note = story.wholeStoryNote(await open());
      const build = await note.locator("code").textContent();
      expect(build, name).toMatch(/^[0-9a-f]{7}$/);
      expect(measuredText, name).toContain(build);
    }
  });

  await test.step("the CI comparison still measures the same build", async () => {
    await views["CI comparison"]();
    await expect(measured).toHaveText(measuredText);
  });

  await test.step("Proof still reads the same labels", async () => {
    await views.Proof();
    await expect(proofLabels).toHaveText(proofText);
  });
});
