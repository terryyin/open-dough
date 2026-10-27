// A session entry says which refinement options were requested, on the
// committed origin of ./agent-launch-story-card.spec.ts (./launchJourney.ts): on the
// story's card the entry reads "Options: --explore
// --borrow (requested)" beside its Model line, in definition order, and says
// nothing for a launch that selected none; a reload keeps the line, which is
// read from the launch record. How the dialog sends the selection is
// ./agent-launch-options.spec.ts. The synthetic `claude`
// (./fixtures/fake-claude) stands in for the real one.

import { expect, test } from "./dashboardTest.ts";
import { storyCardSessions, parts } from "./dashboardPage.ts";
import {
  installRefinementSkill,
  openTakenBacklog,
  showOptions,
} from "./launchStoryCardPage.ts";
import { notRefinedStory } from "./launchJourney.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

test.use({ projectFolders: ["open-dough"] });

const optionsWords = "Options: --explore --borrow (requested)";
const modelWords = "Model: Opus (requested)";

for (const [what, options, model] of [
  ["Explore and Borrow", ["Borrow", "Explore"], undefined],
  ["Explore, Borrow and Opus", ["Borrow", "Explore"], "Opus"],
  ["no options", [], undefined],
  ["no options on Opus", [], "Opus"],
] as const) {
  test(`a refinement launched with ${what} reads as requested on its card without a Recently done duplicate, through a reload`, async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    dashboard.claudeScenario("launched");
    installRefinementSkill(dashboard.home);
    const { card, refine, refinementDialog } = await openTakenBacklog(
      page,
      launchJourney,
    );
    const { recentlyDone } = parts(page);

    await refine(notRefinedStory).click();
    await showOptions(refinementDialog);
    // Selected out of definition order, recorded in it.
    for (const label of options) {
      await refinementDialog.getByRole("checkbox", { name: label }).check();
    }
    if (model !== undefined) {
      await refinementDialog
        .getByRole("combobox", { name: "Model" })
        .selectOption({ label: model });
    }
    await refinementDialog.getByRole("button", { name: "Start" }).click();
    await expect(refinementDialog).toBeHidden();

    const expectWords = async () => {
      const entry = storyCardSessions(card(notRefinedStory));
      await expect(entry).toHaveCount(1);
      await expect(entry).toContainText("Refinement");
      if (options.length === 0) {
        await expect(entry).not.toContainText("Options:");
      } else {
        await expect(entry).toContainText(optionsWords);
      }
      if (model === undefined) {
        await expect(entry).not.toContainText("Model:");
      } else {
        await expect(entry).toContainText(modelWords);
      }
      await expect(recentlyDone.getByRole("article")).toHaveCount(0);
    };

    await expectWords();
    await reloadUntilRead(page);
    await expect(storyCardSessions(card(notRefinedStory))).toHaveCount(1);
    await expectWords();
  });
}
