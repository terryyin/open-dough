// Inspection belongs to each card: Inspect story opens and closes only its
// card's detail, several details stay open together, and neither inspecting
// nor following a dependency's story reference (which reveals the supplier
// with its detail open) changes the selected story. The dependency disclosure
// and link do not select their card.

import { direction } from "../../../tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  roughStoryC,
  storyB,
} from "../../../tests/support/queued-repository.mjs";
import { expect } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  consumer,
  supplierB,
  test,
  twoDependencies,
} from "../storyDependencyFixture.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { pausePageClock } from "../autoRefreshJourney.ts";
import { detailToggle } from "../storyCardControls.ts";
import { expectInspected, expectSelected } from "../storyCardSelection.ts";

// Story A waits on Story B and needs a decision about Story C, the second
// supplier, queued as a third card; Story A is not ready for an unrelated
// reason.
test.use({
  originRepository: queuedReadyRepository()
    .withRevision("dependencies", {
      ...twoDependencies({
        assessment: "not-ready",
        reasons: ["Unrelated consumer design decision remains."],
      }),
      backlog: { direction, queued: [consumer, storyB, roughStoryC] },
    })
    .please(),
});

test("Inspect story and a dependency reference open details beside each other without changing the selected story", async ({
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
  const { backlog } = parts(page);
  const card = (name: string) =>
    backlog.getByRole("article", { name, exact: true });
  const [a, b, c] = [card(consumer.title), card("Story B"), card("Story C")];

  const expectNoneSelected = async () => {
    for (const each of [a, b, c]) await expectSelected(each, false);
  };

  await test.step("with no selected story, opening and closing detail selects none", async () => {
    await a.getByRole("button", { name: "Inspect story" }).click();
    await expectInspected(a, true);
    await expectNoneSelected();
    await b.getByRole("button", { name: "Inspect story" }).click();
    await b.getByRole("button", { name: "Hide detail" }).click();
    await expectInspected(b, false);
    await expectNoneSelected();
  });

  await test.step("with Story C selected, Story B's detail opens and closes and C stays selected", async () => {
    await c.getByRole("heading", { level: 3 }).click();
    await expectSelected(c, true);
    const inspectB = b.getByRole("button", { name: detailToggle });
    await inspectB.click();
    await expect(inspectB).toHaveAttribute("aria-expanded", "true");
    await expectSelected(c, true);
    await expectSelected(b, false);
    await inspectB.click();
    await expect(inspectB).toHaveAttribute("aria-expanded", "false");
    await expectSelected(c, true);
    await c.getByRole("button", { name: "Inspect story" }).click();
    await expectInspected(a, true);
    await expectInspected(c, true);
  });

  await test.step("Story A's reference to Story B opens B's detail, keeps A and C open, and leaves C selected", async () => {
    await a.locator(".story-dependencies summary").click();
    await expectSelected(a, false);
    await a
      .getByRole("link", { name: supplierB.identity, exact: true })
      .click();
    await expect(b).toBeFocused();
    for (const each of [a, b, c]) await expectInspected(each, true);
    await expectSelected(b, false);
    await expectSelected(a, false);
    await expectSelected(c, true);
  });
});
