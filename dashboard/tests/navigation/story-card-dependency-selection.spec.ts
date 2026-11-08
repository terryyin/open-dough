// A card's Dependencies disclosure and its opened explanation text keep their
// own behavior: they neither change the selected story nor open detail. The
// story link opening its supplier's detail is in
// ../stories/story-card-inspection.spec.ts.

import { queuedReadyRepository } from "../../../tests/support/queued-repository.mjs";
import { expect } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  consumer,
  reason,
  test,
  twoDependencies,
} from "../storyDependencyFixture.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { pausePageClock } from "../autoRefreshJourney.ts";
import { expectSelected } from "../storyCardSelection.ts";

// Story A waits on Story B and needs a decision about Story C, and is not
// ready for an unrelated reason.
test.use({
  originRepository: queuedReadyRepository()
    .withRevision(
      "dependencies",
      twoDependencies({
        assessment: "not-ready",
        reasons: ["Unrelated consumer design decision remains."],
      }),
    )
    .please(),
});

test("a dependency disclosure and its explanation text do not change the selected story or open detail", async ({
  page,
  origin,
}) => {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
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
