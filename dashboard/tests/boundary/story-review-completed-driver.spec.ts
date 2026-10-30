import { expect, test } from "../support/preparationPage.ts";
import {
  getReview,
  completedReviewQuery,
} from "../support/completedReviewRequests.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { git, writeAt } from "../support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

for (const variant of [
  undefined,
  "unrelated-merge",
  "ambiguous-merge",
] as const) {
  test(`completed review reads printing merge drivers with ${variant ?? "clean merges"}`, async ({
    request,
    dashboard,
    origin,
  }) => {
    await completedPublishedStory(origin, "story-branch", variant);
    git(
      origin.project,
      "config",
      "merge.printing.driver",
      'printf \'driver says hello\\n\'; git merge-file "%A" "%O" "%B"',
    );
    writeAt(
      origin.project,
      ".git/info/attributes",
      "shared.txt merge=printing\nunrelated.txt merge=printing\n",
    );
    const response = await getReview(
      request,
      dashboard,
      storyReviewEndpoint,
      completedReviewQuery,
    );
    expect(response.status()).toBe(200);
    if (variant === "ambiguous-merge") {
      expect(await response.json()).toMatchObject({
        kind: "unavailable",
        explanation: expect.stringContaining(
          "merge resolutions whose story changes cannot be attributed safely",
        ),
      });
    } else {
      expect(await response.json()).toMatchObject({
        kind: "published",
        files: expect.arrayContaining([
          expect.objectContaining({ path: "shared.txt" }),
        ]),
      });
    }
  });
}
