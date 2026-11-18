// A refinement session entry on its story's card says which options were
// requested, "Options: --explore --borrow (requested)" beside its Model line,
// says nothing for a launch that selected none, and lists no Recently done
// duplicate; a reload reads the line again from the launch record. Synthetic
// machine answers only; that the boundary records a selection in the
// definition's order is ../../backend-tests/launches/agent-launch-options-boundary.spec.ts
// and the dialog sending it is ../../../e2e/launches/agent-launch-options.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { frontendStoryLaunch } from "../../test-support/support/frontendServiceState.ts";
import { parts, storyCardSessions } from "../../test-support/dashboardPage.ts";
import { backlogLaunchers } from "../../test-support/launchStoryCardPage.ts";
import { notRefinedStory } from "../../test-support/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const optionsWords = "Options: --explore --borrow (requested)";
const modelWords = "Model: Opus (requested)";

for (const [what, options, model] of [
  ["Explore and Borrow", ["--explore", "--borrow"], undefined],
  ["Explore, Borrow and Opus", ["--explore", "--borrow"], "opus"],
  ["no options", [], undefined],
  ["no options on Opus", [], "opus"],
] as const) {
  test(`a refinement launched with ${what} reads as requested on its card without a Recently done duplicate, through a reload`, async ({
    page,
    frontendServices,
  }) => {
    let record = frontendStoryLaunch("refining", notRefinedStory);
    if (options.length > 0) record = record.requestingOptions([...options]);
    if (model !== undefined) record = record.requestingModel(model);
    frontendServices.answerMachine(
      makeMe.aMachineAnswer.observingOpen(record.please()).please(),
    );
    const { recentlyDone } = parts(page);
    const expectWords = async () => {
      const entry = storyCardSessions(
        backlogLaunchers(page).card(notRefinedStory),
      );
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

    await openFrontendTakenBacklog(page);
    await expectWords();
    await page.reload();
    await expectWords();
  });
}
