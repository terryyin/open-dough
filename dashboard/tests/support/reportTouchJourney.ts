// Starting preconditions only: a wrapped saved identity, its native history,
// an unfinished completion already read, and a privately missing workspace.
import type { Page } from "@playwright/test";
import {
  finalReportParts,
  readFinalReportControl,
} from "../finalReportPages.ts";
import { keepOpen, markAsDone } from "./markDone.ts";
import { expect, stored } from "./codexLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { retained, report, save, keepFinalReport } from "./retainedReport.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionStateOf, storyCardSessions } from "../dashboardPage.ts";
import { notRefinedStory, type StoryColumnsJourney } from "../launchJourney.ts";
import { pageColumnProjectValue } from "../pageLayout.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";

export const title =
  "Read the saved unfinished report. Keep the intended work open until its remaining steps are complete.";
export const sessionId =
  "retained-native-session-identity-with-several-wrapped-lines-for-the-intended-report";
const questionWords =
  "This session reported unfinished work. Mark it done anyway?";

export async function openUnfinishedReport(
  page: Page,
  dashboard: DashboardServer,
  native: FakeCodex | undefined,
  journey: StoryColumnsJourney,
  text = report,
) {
  if (native === undefined) throw new Error("Missing protocol fixture");
  const protocol = native;
  protocol.threadId = sessionId;
  const { record, workspace } = await retained(dashboard, native);
  keepFinalReport(native, workspace, text);
  record.request.title = title;
  record.completion = makeMe.aCompletionReport
    .withOutcome("unfinished")
    .saying("Keep the remaining steps open.")
    .please();
  record.reportRead = record.completion.receipt;
  save(dashboard.home, [record]);
  const since = native.calls.length;
  const { card, settled } = await openStoryColumnsJourney(page, journey);
  await settled();
  const entry = storyCardSessions(card(notRefinedStory));
  await expect(entry).toContainText("saved workspace is missing");
  const open = readFinalReportControl(entry);
  await open.focus();
  await page.keyboard.press("Enter");
  const report = finalReportParts(page);
  const { panel, reportText } = report;
  await expect(reportText).toHaveText(text);
  const mark = markAsDone(panel.locator(".side-panel-header"));
  const question = panel.getByRole("group", {
    name: questionWords,
    exact: true,
  });
  // The question's answers: Mark as done anyway, or Keep open.
  const markAnyway = markAsDone(question);
  const keep = keepOpen(question);
  const state = () => {
    const current = stored(dashboard.home)[0];
    return {
      reportRead: current?.reportRead,
      doneAt: current?.doneAt,
      completion: current?.completion,
    };
  };
  // Native radios / details stay queryable via CSS while covering aria-hides the column.
  const underlying = async () => ({
    project: await pageColumnProjectValue(page),
    storyDetails: await page
      .locator(".page-column .board [role='region']")
      .evaluateAll(
        (regions) =>
          regions.filter((region) =>
            /^Detail for /.test(region.getAttribute("aria-label") ?? ""),
          ).length,
      ),
  });
  return {
    record,
    workspace,
    native,
    since,
    open,
    ...report,
    mark,
    question,
    markAnyway,
    keep,
    state,
    underlying,
    reading: sessionStateOf(page.locator(".page-column")),
  };
}
