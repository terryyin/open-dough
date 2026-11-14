import { comparisonReading } from "../../dashboard/tests/intentCiComparisonPage.ts";
// Unique connection: real completed Trunk acquisition and the timing panel
// reject an available later build. Fast selection/memory and production gap
// rendering own their rules independently; this one read joins those owners.
import { makeMe } from "../../tests/support/makeMe.mjs";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import {
  completedPublishedStory,
  advanceCompletedTrunk,
} from "../../dashboard/tests/support/completedPublishedStory.ts";
import { serveActionsFor } from "../../dashboard/tests/support/storyCiComparisonFixture.ts";
import { git } from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { selectDoneStoryForCiComparison } from "../../dashboard/tests/support/selectDoneStoryForCiComparison.ts";

test("a completed Trunk comparison shows No build without selecting the available later trunk build", async ({
  page,
  origin,
}) => {
  await completedPublishedStory(origin, "trunk");
  advanceCompletedTrunk(origin);
  const builtPastCompletion = git(origin.origin, "rev-parse", "main");
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: builtPastCompletion,
    repository: "terryyin/open-dough",
    follows: true,
    realHistory: true,
  });
  serveActionsFor(committed, {
    [builtPastCompletion]: [
      makeMe.aCiRun
        .with({
          headSha: builtPastCompletion,
          id: 299,
          attempt: 1,
          status: "completed",
          conclusion: "success",
        })
        .please(),
    ],
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  const identities = comparisonReading(panel).identities;
  await expect(identities.nth(1)).toHaveText(
    "Branch comparison is not applicable for a Trunk Mode story.",
  );
  await expect(identities.nth(2)).toContainText("No build");
  await expect(identities.nth(2)).not.toContainText(
    shortSha(builtPastCompletion),
  );
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("—");
});
