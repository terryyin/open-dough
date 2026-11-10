// Unique connection: real completed Trunk acquisition and the timing panel
// reject an available later build. Fast selection/memory and production gap
// rendering own their rules independently; this one read joins those owners.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import {
  completedPublishedStory,
  advanceCompletedTrunk,
} from "../support/completedPublishedStory.ts";
import { serveActionsFor } from "../support/storyCiComparisonFixture.ts";
import { git } from "../support/storyReviewWorktree.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

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
  const identities = panel.locator(".intent-ci-comparison-identity");
  await expect(identities.nth(1)).toHaveText(
    "Branch comparison is not applicable for a Trunk Mode story.",
  );
  await expect(identities.nth(2)).toContainText("No build");
  await expect(identities.nth(2)).not.toContainText(
    shortSha(builtPastCompletion),
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "—",
  );
});
