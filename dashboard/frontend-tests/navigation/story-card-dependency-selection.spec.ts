// A card's Dependencies disclosure and its opened explanation text keep their
// own behavior: they neither change the selected story nor open detail. The
// story link opening its supplier's detail is in
// ../../../e2e/stories/story-card-inspection.spec.ts.

import { expect, test } from "../../tests/support/frontendApp.ts";
import { parts } from "../../tests/dashboardPage.ts";
import {
  consumer,
  reason,
  twoDependencies,
} from "../../tests/storyDependencyFixture.ts";
import { putFrontendDependencies } from "../../tests/support/frontendStoryDependencies.ts";
import {
  emptyArea,
  expectSelected,
  storyDetail,
} from "../../tests/storyCardSelection.ts";
import { storyCard } from "../../tests/storyCardControls.ts";
import {
  dependencyDisclosure,
  openDependencies,
} from "../../tests/storyReference.ts";

test("a dependency disclosure and its explanation text do not change the selected story or open detail", async ({
  page,
  frontendServices,
}) => {
  // Story A waits on Story B and needs a decision about Story C, and is not
  // ready for an unrelated reason.
  putFrontendDependencies(
    frontendServices,
    twoDependencies({
      assessment: "not-ready",
      reasons: ["Unrelated consumer design decision remains."],
    }),
  );
  await page.goto("/");
  const card = storyCard(parts(page).backlog, consumer.title);
  const disclosure = dependencyDisclosure(card);
  const explanation = disclosure.getByText(reason).first();

  await test.step("opening the disclosure and clicking its explanation leave an unselected card unselected", async () => {
    await openDependencies(card);
    await expectSelected(card, false);
    await explanation.click();
    await expectSelected(card, false);
    await expect(storyDetail(card)).toHaveCount(0);
    await expect(disclosure).toHaveAttribute("open", "");
  });

  await test.step("clicking the opened explanation keeps a selected card selected without opening detail", async () => {
    await emptyArea(card).click();
    await expectSelected(card, true);
    await expect(disclosure).toHaveAttribute("open", "");
    await explanation.click();
    await expectSelected(card, true);
    await expect(storyDetail(card)).toHaveCount(0);
    await emptyArea(card).click();
    await expectSelected(card, false);
  });
});
