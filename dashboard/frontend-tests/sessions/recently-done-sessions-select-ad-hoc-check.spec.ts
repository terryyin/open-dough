// Ad hoc completed-story association check, retry, and supersession against
// the controllable `/__agent-launch/completed-story` family. Real claim/
// completion store stays in e2e/sessions/recently-done-sessions-select-ad-hoc*.spec.ts
// and dashboard/backend-tests/sessions/completed-story-association*.spec.ts.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { expectProjectChoice } from "../../tests/projectChoice.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyTitle } from "../../tests/support/intentStoryPage.ts";
import { installFrontendCompletedStoryAssociation } from "../../tests/support/frontendServiceSubstitutes.ts";
import { putFrontendDonePublication } from "../../tests/support/frontendServiceState.ts";
import { showRecentlyDone } from "../../tests/recentlyDoneSessionsSidebarPage.ts";
import { describedRevisions } from "../../tests/describedRevisions.ts";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

const linkedTitle = "Ad hoc association check";
const otherTitle = "Other done session";
const linkedIdentity = "SEED-701#ad-hoc-association";

test("an unanswered ad hoc association is superseded by another row, and a failed one retries without moving the story", async ({
  page,
  frontendServices,
}) => {
  const association = await installFrontendCompletedStoryAssociation(page);
  frontendServices.listThreeProjects();
  const linkedRecord = makeMe.aDoneRecord
    .completed({
      identity: linkedIdentity,
      title: linkedTitle,
      completedAt: new Date().toISOString(),
    })
    .please();
  const { done } = describedRevisions(
    makeMe.aRepository
      .withRevision("done", { doneRecords: [linkedRecord] })
      .please(),
    { done: frontendServices.revision },
  );
  const fileName = doneRecordFileName(linkedIdentity);
  const catalog = done.files[".planning/done/.catalog.json"];
  const body = done.files[`.planning/done/${fileName}`];
  if (catalog === undefined || body === undefined) {
    throw new Error("Expected open-dough done catalog and record body.");
  }
  putFrontendDonePublication(frontendServices, "open-dough", {
    catalog,
    bodies: { [fileName]: body },
  });
  const linked = makeMe.aLaunchRecord
    .adHoc({ instruction: linkedTitle, title: linkedTitle })
    .inClaudeSession({ sessionId: "ad-hoc-linked" })
    .markedDoneAt(new Date(Date.now() - 60_000).toISOString())
    .please();
  const other = makeMe.aLaunchRecord
    .adHoc({ instruction: otherTitle, title: otherTitle })
    .markedDoneAt(new Date(Date.now() - 30_000).toISOString())
    .please();
  frontendServices.answerMachine(
    makeMe.aMachineAnswer.observingDone(linked, other).please(),
  );

  await pausePageClockAt(page, new Date());
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/?project=open-dough&perspective=intent");
  await expectProjectChoice(page, "Open Dough");
  const { intentChoice, intent } = parts(page);
  await expect(intent).toBeVisible();
  const shown = await showRecentlyDone(page);

  await test.step("while the association is held the row says checking; choosing another row abandons it", async () => {
    const held = association.holdNext(linked.session.sessionId);
    await shown.select(linkedTitle).click();
    await held.received;
    await expect(shown.choiceStatus(linkedTitle)).toHaveText(
      "Checking for its published done story…",
    );
    await shown.select(otherTitle).click();
    held.release();
    await expect(shown.select(otherTitle)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(shown.select(linkedTitle)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(shown.choiceStatus(linkedTitle)).toHaveCount(0);
    await expect(intent).not.toHaveAttribute("data-selected-story");
    await expectProjectChoice(page, "Open Dough");
    await expect(intentChoice).toBeChecked();
  });

  await test.step("a failed association says unknown apart from a miss; selecting again links", async () => {
    association.refuseNext(
      "GitHub could not be reached.",
      502,
      linked.session.sessionId,
    );
    await shown.select(linkedTitle).click();
    await expect(shown.choiceStatus(linkedTitle)).toContainText(
      "Its published done story could not be checked.",
    );
    await expect(shown.choiceStatus(linkedTitle)).toContainText(
      "Select again to check again.",
    );
    await expect(intent).not.toHaveAttribute("data-selected-story");

    association.answerNext(
      { kind: "linked", identity: linkedIdentity },
      linked.session.sessionId,
    );
    await shown.select(linkedTitle).click();
    await expect(intent).toHaveAttribute("data-selected-story", linkedIdentity);
    await expect(storyTitle(intent)).toHaveText(linkedTitle);
    await expect(shown.choiceStatus(linkedTitle)).toHaveCount(0);
  });
});
