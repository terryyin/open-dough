// Example 7: a card's Dependencies disclosure, its opened explanation text,
// and its story link keep their own behavior and do not change selection.

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

test("a dependency disclosure, its explanation text, and its link do not change the card's selection", async ({
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

  await test.step("clicking the opened explanation keeps a selected card selected with its detail", async () => {
    await card.getByRole("heading", { level: 3 }).click();
    await expectSelected(card, true);
    await expect(detail).toBeVisible();
    await expect(disclosure).toHaveAttribute("open", "");
    await explanation.click();
    await expectSelected(card, true);
    await expect(detail).toBeVisible();
    await card.getByRole("heading", { level: 3 }).click();
    await expectSelected(card, false);
  });

  await test.step("the supplier link selects the supplier, not the card", async () => {
    await card.getByRole("link", { name: "SEED-B#b", exact: true }).click();
    // Reveal-and-select opens the supplier; the consumer stays unselected.
    await expectSelected(card, false);
    const supplier = parts(page).backlog.getByRole("article", {
      name: "Story B",
      exact: true,
    });
    await expectSelected(supplier, true);
    await expect(
      supplier.getByRole("button", { name: "Hide detail" }),
    ).toBeVisible();
  });
});
