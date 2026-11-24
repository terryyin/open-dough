// An obsolete ad hoc association cannot warn a row whose context changed
// (legacy for SEED-426). A story row's pre-save review answer:
// ./recently-done-review-cue-mount.spec.ts.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import {
  linked,
  openFrontendSelectionPage,
} from "../../test-support/support/frontendRecentlyDoneSelection.ts";
import { expectSessionReviewCue } from "../../test-support/recentlyDoneSessionsSidebarPage.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { givePageItsTurns } from "../../test-support/pageRequestNotes.ts";
import { expectProjectChoice } from "../../test-support/projectChoice.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { installFrontendCompletedStoryAssociation } from "../../test-support/support/frontendServiceSubstitutes.ts";

for (const replacement of ["project", "association"] as const) {
  test(`an obsolete association cannot warn the row after its ${replacement} changes`, async ({
    page,
    frontendServices,
  }) => {
    await pausePageClockAt(page, new Date());
    const association = await installFrontendCompletedStoryAssociation(page);
    const held = association.holdNext("obsolete-association");
    association.answerNext(
      { kind: "linked", identity: linked.identity },
      "obsolete-association",
    );
    const { shown } = await openFrontendSelectionPage(page, frontendServices);
    const title = "Session whose association context changes";
    const record = (source: string, reference: string) =>
      makeMe.aLaunchRecord
        .adHoc({ source, title, instruction: title })
        .inClaudeSession({
          sessionId: "obsolete-association",
          shortId: "obsolete",
        })
        .reportingThrough({
          origin: "https://example.test",
          reference,
          command: "report",
        })
        .launchedAt(new Date(Date.now() - 60_000).toISOString())
        .markedDone()
        .please();
    frontendServices.answerMachine(
      makeMe.aMachineAnswer
        .observingDone(
          record("doughnut", "b0f19431-05f1-4dc1-b9a4-a492109bd064"),
        )
        .please(),
    );
    await page.clock.runFor(checkIntervalMs);
    await held.received;
    await expectSessionReviewCue(shown.row(title), false);
    association.answerNext({ kind: "absent" }, "obsolete-association");
    const source = replacement === "project" ? "pygardon" : "doughnut";
    frontendServices.answerMachine(
      makeMe.aMachineAnswer
        .observingDone(record(source, "0143a334-a46a-4faf-981b-a80c80f7cafe"))
        .please(),
    );
    await page.clock.runFor(checkIntervalMs);
    held.release();
    await givePageItsTurns(page);
    await expectSessionReviewCue(shown.row(title), false);
    await expect(shown.select(title)).toHaveAttribute(
      "title",
      replacement === "project" ? /Pygardon · Ad hoc/ : /Doughnut · Ad hoc/,
    );
    await expectProjectChoice(page, "Open Dough");
  });
}
