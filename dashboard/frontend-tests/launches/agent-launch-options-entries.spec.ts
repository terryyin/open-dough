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
} from "../../tests/support/frontendApp.ts";
import { putFrontendMachine } from "../../tests/support/frontendServiceState.ts";
import { parts, storyCardSessions } from "../../tests/dashboardPage.ts";
import { backlogLaunchers } from "../../tests/launchStoryCardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
} from "../../tests/launchJourney.ts";
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
    let record = makeMe.aLaunchRecord.refining({
      identity: notRefinedIdentity,
      title: notRefinedStory,
    });
    if (options.length > 0) record = record.requestingOptions([...options]);
    if (model !== undefined) record = record.requestingModel(model);
    putFrontendMachine(
      frontendServices,
      makeMe.aMachineAnswer
        .observing(
          makeMe.anObservedLaunch
            .of(record.please())
            .withSessionState(makeMe.aSessionState.loaded("working").please())
            .please(),
        )
        .please(),
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
