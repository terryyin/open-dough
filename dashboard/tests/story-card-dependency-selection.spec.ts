// A card's Dependencies disclosure and its opened explanation text keep their
// own behavior: they neither change the selected story nor open detail. The
// story link opening its supplier's detail is in
// ./story-card-inspection.spec.ts.

import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  consumer,
  reason,
  test,
  twoDependencies,
} from "./storyDependencyFixture.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { pausePageClock } from "./autoRefreshJourney.ts";
import { expectSelected } from "./storyCardSelection.ts";

test("a dependency disclosure and its explanation text do not change the selected story or open detail", async ({
  page,
  origin,
}) => {
  const revision = await twoDependencies(origin, true);
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", {
    name: consumer.title,
    exact: true,
  });
  const disclosure = card.locator(".story-dependencies");
  const explanation = disclosure.getByText(reason).first();
  const detail = card.getByRole("region", {
    name: `Detail for ${consumer.title}`,
  });

  await test.step("opening the disclosure and clicking its explanation leave an unselected card unselected", async () => {
    await disclosure.locator("summary").click();
    await expect(disclosure).toHaveAttribute("open", "");
    await expectSelected(card, false);
    await explanation.click();
    await expectSelected(card, false);
    await expect(detail).toHaveCount(0);
    await expect(disclosure).toHaveAttribute("open", "");
  });

  await test.step("clicking the opened explanation keeps a selected card selected without opening detail", async () => {
    await card.getByRole("heading", { level: 3 }).click();
    await expectSelected(card, true);
    await expect(disclosure).toHaveAttribute("open", "");
    await explanation.click();
    await expectSelected(card, true);
    await expect(detail).toHaveCount(0);
    await card.getByRole("heading", { level: 3 }).click();
    await expectSelected(card, false);
  });
});
